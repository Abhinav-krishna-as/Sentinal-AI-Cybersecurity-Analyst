import hashlib
import json
import re
import secrets

from datetime import timedelta
from pathlib import Path
from urllib.error import HTTPError, URLError
from urllib.parse import urlsplit
from urllib.request import Request, urlopen

from django.conf import settings
from django.contrib import messages
from django.http import HttpResponse
from django.shortcuts import render, redirect
from django.utils import timezone
from django.views.decorators.cache import never_cache
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods

from .models import ActiveApplicationSession


# ============================================================
# CONFIGURATION
# ============================================================

SENTINAL_ROOT = Path(__file__).resolve().parents[2]

APPLICATIONS_FILE = (
    SENTINAL_ROOT / "connector" / "applications.json"
)

CONNECTOR_URL = getattr(
    settings,
    "SENTINAL_CONNECTOR_URL",
    "http://127.0.0.1:9001",
).rstrip("/")

DASHBOARD_URL = getattr(
    settings,
    "SENTINAL_DASHBOARD_URL",
    "http://127.0.0.1:8001",
).rstrip("/")

PROXY_TIMEOUT = 30

TAB_IDLE_MINUTES = 30
TAB_CLOSE_GRACE_SECONDS = 120

TAB_TOKEN_HEADER = "X-Sentinal-Tab-Token"


# ============================================================
# PER-TAB AUTHENTICATION SCRIPT
# ============================================================

# This script is injected into the dashboard HTML by the proxy.
# It obtains the token from the URL fragment, stores it in
# sessionStorage, and attaches it to protected API requests.

TAB_AUTH_SCRIPT = r"""
<script>
(function () {
    'use strict';

    var STORAGE_KEY = 'sentinal_tab_token';

    var match = location.hash.match(
        /(?:^#|&)sentinal_token=([^&]+)/
    );

    if (match) {
        try {
            sessionStorage.setItem(
                STORAGE_KEY,
                decodeURIComponent(match[1])
            );
        } catch (_) {}

        // Remove the token from the address bar and history.
        history.replaceState(
            null,
            document.title,
            location.pathname + location.search
        );
    }

    function getToken() {
        try {
            return sessionStorage.getItem(STORAGE_KEY) || '';
        } catch (_) {
            return '';
        }
    }

    var nativeFetch = window.fetch.bind(window);

    window.fetch = function (input, init) {
        init = init || {};

        var rawUrl =
            typeof input === 'string' || input instanceof URL
                ? String(input)
                : input.url;

        var url;

        try {
            url = new URL(rawUrl, location.href);
        } catch (_) {
            return nativeFetch(input, init);
        }

        var protectedPath =
            url.origin === location.origin &&
            (
                url.pathname.indexOf('/api/') === 0 ||
                url.pathname === '/session-status/' ||
                url.pathname === '/logout/' ||
                url.pathname === '/tab-close/'
            );

        if (protectedPath) {
            var headers = new Headers(
                init.headers ||
                (
                    input instanceof Request
                        ? input.headers
                        : undefined
                )
            );

            var token = getToken();

            if (token) {
                headers.set(
                    'X-Sentinal-Tab-Token',
                    token
                );
            }

            init = Object.assign({}, init, {
                headers: headers,
                credentials: 'same-origin'
            });
        }

        return nativeFetch(input, init).then(function (response) {
            if (
                protectedPath &&
                response.status === 401
            ) {
                try {
                    sessionStorage.removeItem(STORAGE_KEY);
                } catch (_) {}

                if (
                    url.pathname.indexOf('/api/') === 0 ||
                    url.pathname === '/session-status/'
                ) {
                    location.replace('/');
                }
            }

            return response;
        });
    };


    // Handle existing logout links.
    document.addEventListener('click', function (event) {
        var link = event.target.closest &&
            event.target.closest('a[href]');

        if (!link) {
            return;
        }

        var target;

        try {
            target = new URL(link.href, location.href);
        } catch (_) {
            return;
        }

        if (
            target.origin !== location.origin ||
            target.pathname !== '/logout/'
        ) {
            return;
        }

        event.preventDefault();

        nativeFetch('/logout/', {
            method: 'POST',
            credentials: 'same-origin',
            headers: {
                'X-Sentinal-Tab-Token': getToken()
            }
        })
        .catch(function () {})
        .finally(function () {
            try {
                sessionStorage.removeItem(STORAGE_KEY);
            } catch (_) {}

            location.replace('/');
        });
    }, true);


    // Notify the server when the tab is hidden or closed.
    // A grace period is used because pagehide also occurs
    // during refreshes and navigation.
    window.addEventListener('pagehide', function () {
        var token = getToken();

        if (!token) {
            return;
        }

        try {
            nativeFetch('/tab-close/', {
                method: 'POST',
                keepalive: true,
                credentials: 'same-origin',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Sentinal-Tab-Token': token
                },
                body: JSON.stringify({
                    token: token
                })
            }).catch(function () {});
        } catch (_) {}
    });


    // Prevent a dashboard shell from remaining open without
    // a token. The server independently protects every API.
    if (
        !getToken() &&
        location.pathname.indexOf('/dashboard/') === 0
    ) {
        location.replace('/');
    }

})();
</script>
"""


# ============================================================
# APPLICATION REGISTRY VALIDATION
# ============================================================

def validate_application(application_name, application_id):
    """
    Validate the supplied application name and ID against
    the registered application registry.
    """

    if not APPLICATIONS_FILE.is_file():
        raise FileNotFoundError(
            "Application registry not found."
        )

    with APPLICATIONS_FILE.open(
        "r",
        encoding="utf-8",
    ) as file:
        applications = json.load(file)

    records = (
        applications.values()
        if isinstance(applications, dict)
        else applications
    )

    for record in records:
        registered_name = str(
            record.get("application_name", "")
        ).strip()

        registered_id = str(
            record.get("application_id", "")
        ).strip()

        status = str(
            record.get("status", "")
        ).strip().upper()

        if (
            registered_name.casefold()
            == application_name.strip().casefold()
            and registered_id == application_id.strip()
        ):
            if status not in {"REGISTERED", "CONNECTED"}:
                return False, "disconnected", None

            return True, status.lower(), record

    return False, "invalid", None


# ============================================================
# TOKEN HELPERS
# ============================================================

def _token_hash(raw_token):
    """Return the SHA-256 hash of a tab token."""

    return hashlib.sha256(
        raw_token.encode("utf-8")
    ).hexdigest()


def _authenticate_tab(request, touch=True):
    """
    Authenticate a request using its independent tab token.

    Returns the active session record or None.
    """

    raw_token = request.headers.get(
        TAB_TOKEN_HEADER,
        "",
    ).strip()

    if not raw_token or len(raw_token) > 200:
        return None

    now = timezone.now()

    try:
        tab_session = ActiveApplicationSession.objects.get(
            tab_token_hash=_token_hash(raw_token),
            expires_at__gt=now,
        )

    except ActiveApplicationSession.DoesNotExist:
        return None

    if touch:
        tab_session.expires_at = (
            now + timedelta(minutes=TAB_IDLE_MINUTES)
        )

        tab_session.save(
            update_fields=[
                "expires_at",
                "updated_at",
            ]
        )

    return tab_session


# ============================================================
# LOGIN
# ============================================================

@never_cache
@require_http_methods(["GET", "POST"])
def login_view(request):

    if request.method == "GET":
        return render(request, "login.html")

    application_name = (
        request.POST.get("app_name")
        or request.POST.get("application_name", "")
    ).strip()

    application_id = (
        request.POST.get("app_id")
        or request.POST.get("application_id", "")
    ).strip()

    if not application_name or not application_id:
        messages.error(
            request,
            "Enter both the application name and application ID.",
        )

        return render(
            request,
            "login.html",
            status=400,
        )

    try:
        valid, result, record = validate_application(
            application_name,
            application_id,
        )

    except (
        OSError,
        json.JSONDecodeError,
        AttributeError,
        TypeError,
    ):
        messages.error(
            request,
            "Unable to verify registered applications. "
            "Check the Connector configuration.",
        )

        return render(
            request,
            "login.html",
            status=503,
        )

    if not valid:
        if result == "disconnected":
            messages.error(
                request,
                "Application disconnected. "
                "Please reconnect and try again.",
            )

            return render(
                request,
                "login.html",
                status=403,
            )

        messages.error(
            request,
            "Invalid application name or application ID. "
            "Please try again.",
        )

        return render(
            request,
            "login.html",
            status=401,
        )

    # Django's session is used for normal middleware and CSRF.
    # It is not the individual tab's authorization identity.
    if not request.session.session_key:
        request.session.save()

    session_key = request.session.session_key or ""

    # Generate a separate high-entropy token for this login.
    raw_token = secrets.token_urlsafe(32)

    ActiveApplicationSession.objects.create(
        application_id=str(
            record["application_id"]
        ),
        session_key=session_key,
        tab_token_hash=_token_hash(raw_token),
        expires_at=(
            timezone.now()
            + timedelta(minutes=TAB_IDLE_MINUTES)
        ),
    )

    # The fragment is not included in the HTTP request.
    response = redirect(
        "/dashboard/#sentinal_token=" + raw_token
    )

    response["Cache-Control"] = (
        "no-store, no-cache, must-revalidate, max-age=0"
    )

    response["Pragma"] = "no-cache"

    return response


# ============================================================
# PROXY HELPERS
# ============================================================

HOP_BY_HOP_HEADERS = {
    "connection",
    "keep-alive",
    "proxy-authenticate",
    "proxy-authorization",
    "te",
    "trailer",
    "transfer-encoding",
    "upgrade",
    "host",
    "content-length",
}


def proxy_request(request, upstream_base, subpath=""):
    """
    Forward a request to a fixed internal Sentinal service.
    """

    upstream_base = upstream_base.rstrip("/")

    target_url = (
        f"{upstream_base}/{subpath.lstrip('/')}"
    )

    if request.META.get("QUERY_STRING"):
        target_url += (
            "?" + request.META["QUERY_STRING"]
        )

    headers = {}

    for key, value in request.headers.items():
        if (
            key.lower() not in HOP_BY_HOP_HEADERS
            and key.lower() != "accept-encoding"
        ):
            headers[key] = value

    # Do not forward the browser's cookies to internal services.
    headers.pop("Cookie", None)
    headers.pop("cookie", None)

    body = (
        request.body
        if request.method not in ("GET", "HEAD")
        else None
    )

    upstream_request = Request(
        target_url,
        data=body,
        headers=headers,
        method=request.method,
    )

    try:
        response = urlopen(
            upstream_request,
            timeout=PROXY_TIMEOUT,
        )

    except HTTPError as error:
        response = error

    except (
        URLError,
        TimeoutError,
        OSError,
    ):
        return HttpResponse(
            "Sentinal upstream service is unavailable.",
            status=502,
            content_type="text/plain",
        )

    try:
        response_body = (
            b""
            if request.method == "HEAD"
            else response.read()
        )

        content_type = response.headers.get(
            "Content-Type",
            "",
        )

        # Inject the tab-auth script before the dashboard's
        # JavaScript so fetch interception is installed first.
        if (
            "text/html" in content_type.lower()
            and response.status < 400
            and response_body
        ):
            try:
                charset = (
                    response.headers.get_content_charset()
                    or "utf-8"
                )

                html = response_body.decode(charset)

                if "TAB_AUTH_SCRIPT_MARKER" not in html:
                    injected = TAB_AUTH_SCRIPT.replace(
                        "<script>",
                        "<script>/* TAB_AUTH_SCRIPT_MARKER */",
                        1,
                    )

                    if re.search(
                        r"</head\s*>",
                        html,
                        flags=re.I,
                    ):
                        html = re.sub(
                            r"</head\s*>",
                            injected + "</head>",
                            html,
                            count=1,
                            flags=re.I,
                        )
                    else:
                        html = injected + html

                    response_body = html.encode(charset)

            except (
                UnicodeDecodeError,
                LookupError,
            ):
                pass

        result = HttpResponse(
            response_body,
            status=response.status,
        )

        for key, value in response.headers.items():
            if (
                key.lower() not in HOP_BY_HOP_HEADERS
                and key.lower() in {
                    "content-type",
                    "cache-control",
                    "etag",
                    "last-modified",
                }
            ):
                result[key] = value

        # Keep redirects inside Django's public proxy routes.
        location = response.headers.get("Location")

        if location:
            parsed_location = urlsplit(location)
            upstream_parsed = urlsplit(upstream_base)

            if (
                parsed_location.scheme
                and parsed_location.netloc
                == upstream_parsed.netloc
            ):
                prefix = (
                    "/connector/"
                    if upstream_base == CONNECTOR_URL
                    else "/dashboard/"
                )

                result["Location"] = (
                    prefix
                    + parsed_location.path.lstrip("/")
                )

        result["Cache-Control"] = (
            "no-store, no-cache, must-revalidate, max-age=0"
        )

        return result

    finally:
        response.close()


# ============================================================
# DASHBOARD
# ============================================================

@never_cache
def dashboard_view(request):
    return redirect("dashboard")


@never_cache
def dashboard_proxy(request, subpath=""):
    """
    Serve the dashboard shell.

    Sensitive dashboard data must be loaded through protected APIs.
    """

    return proxy_request(
        request,
        DASHBOARD_URL,
        subpath,
    )


# ============================================================
# CONNECTOR
# ============================================================

@csrf_exempt
@require_http_methods([
    "GET",
    "POST",
    "PUT",
    "PATCH",
    "DELETE",
    "HEAD",
    "OPTIONS",
])
def connector_proxy(request, subpath=""):
    """
    Keep Connector API-key authentication enforced by the Connector.
    """

    return proxy_request(
        request,
        CONNECTOR_URL,
        subpath,
    )


# ============================================================
# DASHBOARD API — TAB TOKEN REQUIRED
# ============================================================

@csrf_exempt
@never_cache
@require_http_methods([
    "GET",
    "POST",
    "PUT",
    "PATCH",
    "DELETE",
    "HEAD",
    "OPTIONS",
])
def dashboard_api_proxy(request, subpath=""):

    tab_session = _authenticate_tab(request)

    if tab_session is None:
        return HttpResponse(
            "Authentication required or tab session expired. "
            "Please sign in again.",
            status=401,
            content_type="text/plain",
        )

    return proxy_request(
        request,
        DASHBOARD_URL,
        "api/" + subpath.lstrip("/"),
    )


# ============================================================
# TAB CLOSE
# ============================================================

@csrf_exempt
@never_cache
@require_http_methods(["POST"])
def tab_close(request):

    raw_token = request.headers.get(
        TAB_TOKEN_HEADER,
        "",
    ).strip()

    if not raw_token:
        try:
            payload = json.loads(
                request.body.decode("utf-8") or "{}"
            )

            raw_token = str(
                payload.get("token", "")
            ).strip()

        except (
            ValueError,
            UnicodeDecodeError,
            AttributeError,
        ):
            raw_token = ""

    if not raw_token or len(raw_token) > 200:
        return HttpResponse(status=204)

    try:
        tab_session = ActiveApplicationSession.objects.get(
            tab_token_hash=_token_hash(raw_token)
        )

    except ActiveApplicationSession.DoesNotExist:
        return HttpResponse(status=204)

    # Delay expiration instead of immediate deletion because pagehide
    # can fire during a refresh or navigation.
    tab_session.expires_at = (
        timezone.now()
        + timedelta(seconds=TAB_CLOSE_GRACE_SECONDS)
    )

    tab_session.save(
        update_fields=[
            "expires_at",
            "updated_at",
        ]
    )

    return HttpResponse(status=204)


# ============================================================
# LOGOUT
# ============================================================

@csrf_exempt
@never_cache
@require_http_methods(["POST"])
def logout_view(request):

    tab_session = _authenticate_tab(
        request,
        touch=False,
    )

    if tab_session is not None:
        tab_session.delete()

    return redirect("login")


# ============================================================
# SESSION STATUS
# ============================================================

@never_cache
@require_http_methods(["GET"])
def session_status(request):

    tab_session = _authenticate_tab(request)

    if tab_session is None:
        return HttpResponse(
            '{"authenticated": false}',
            status=401,
            content_type="application/json",
        )

    return HttpResponse(
        '{"authenticated": true}',
        content_type="application/json",
    )