# ============================================================
# SENTINAL AI CONNECTOR
# Complete FastAPI Connector Backend
# ============================================================
import json
import secrets
from threading import Lock

from dashboard.application_monitor import application_monitor

from pathlib import Path
from datetime import datetime, timezone
from time import time
import os
import io
import zipfile
import socket
import ipaddress
from urllib.request import Request, urlopen
from urllib.error import HTTPError

from fastapi import (
    FastAPI,
    Header,
    HTTPException,
    Query,
    Request as FastAPIRequest
)

from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

from pydantic import BaseModel, Field

# ============================================================
# SENTINAL AI SECURITY MODULES
# ============================================================

from cybersecurity.login_analyzer import analyze_login
from cybersecurity.risk_engine import assess_event
from Agent.Cybi import run_Cybi




# ============================================================
# TRUSTED CLIENT-IP EXTRACTION
# ============================================================
# The Connector can only observe the direct network peer. For the original
# end-user IP, Hanu must send the IP it captured at its own request boundary.
# Forwarded headers are trusted ONLY when the direct peer is explicitly
# configured in SENTINAL_TRUSTED_PROXIES (comma-separated IPs/CIDRs).

def _trusted_proxy_networks():
    networks = []
    for raw in os.getenv("SENTINAL_TRUSTED_PROXIES", "").split(","):
        raw = raw.strip()
        if not raw:
            continue
        try:
            networks.append(ipaddress.ip_network(raw, strict=False))
        except ValueError:
            try:
                address = ipaddress.ip_address(raw)
                networks.append(ipaddress.ip_network(
                    f"{address}/{32 if address.version == 4 else 128}",
                    strict=False,
                ))
            except ValueError:
                print(f"[CONNECTOR] Ignoring invalid SENTINAL_TRUSTED_PROXIES entry: {raw!r}")
    return networks


def _valid_ip(value):
    if not value:
        return None
    try:
        return str(ipaddress.ip_address(str(value).strip()))
    except ValueError:
        return None


def _peer_is_trusted(peer_ip):
    parsed = _valid_ip(peer_ip)
    if not parsed:
        return False
    address = ipaddress.ip_address(parsed)
    return any(
        address.version == network.version and address in network
        for network in _trusted_proxy_networks()
    )


def _observed_peer_ip(request: FastAPIRequest):
    """Return the socket peer IP, or a forwarded IP from an explicitly trusted proxy."""
    peer = None
    if request.client:
        peer = _valid_ip(request.client.host)

    if _peer_is_trusted(peer):
        forwarded = request.headers.get("x-forwarded-for", "")
        for candidate in forwarded.split(","):
            parsed = _valid_ip(candidate)
            if parsed:
                return parsed
        real_ip = _valid_ip(request.headers.get("x-real-ip"))
        if real_ip:
            return real_ip

    return peer


# ============================================================
# PATHS
# ============================================================

BASE_DIR = Path(__file__).resolve().parent

HTML_FILE = BASE_DIR / "connector.html"

STATIC_DIR = BASE_DIR / "static"


# ============================================================
# FASTAPI APPLICATION
# ============================================================

app = FastAPI(
    title="Sentinal AI Connector",
    description="Security telemetry connector for Sentinal AI",
    version="1.0.0"
)


# ============================================================
# CORS
# ============================================================

app.add_middleware(
    CORSMiddleware,

    allow_origins=[
        "http://127.0.0.1:7000",
        "http://localhost:7000",
        "http://127.0.0.1:9000",
        "http://localhost:9000"
    ],

    allow_credentials=True,

    allow_methods=[
        "GET",
        "POST",
        "PUT",
        "OPTIONS"
    ],

    allow_headers=["*"]
)


# ============================================================
# STATIC FILES
# ============================================================

if STATIC_DIR.exists():

    app.mount(
        "/static",
        StaticFiles(
            directory=str(STATIC_DIR)
        ),
        name="static"
    )


# ============================================================
# EVENT STORAGE (memory cache + JSON persistence)
# ============================================================

# Keep recent telemetry across Connector restarts. The registry already
# persists applications; this file persists the actual events too.
EVENTS_FILE = BASE_DIR / "events.json"
EVENTS_LOCK = Lock()
MAX_STORED_EVENTS = 1000


def load_security_events():
    try:
        if EVENTS_FILE.exists():
            data = json.loads(EVENTS_FILE.read_text(encoding="utf-8"))
            if isinstance(data, list):
                return data[-MAX_STORED_EVENTS:]
    except (OSError, json.JSONDecodeError) as error:
        print(f"[CONNECTOR] Could not load persisted events: {error}")
    return []


def save_security_events():
    temporary_file = EVENTS_FILE.with_suffix(".tmp")
    try:
        temporary_file.write_text(
            json.dumps(security_events[-MAX_STORED_EVENTS:], ensure_ascii=False, indent=2),
            encoding="utf-8",
        )
        temporary_file.replace(EVENTS_FILE)
    except OSError as error:
        print(f"[CONNECTOR] ERROR: could not persist telemetry: {error}")


security_events = load_security_events()
security_incidents = []
connector_logs = []

# Rehydrate the ApplicationMonitor from persisted events on startup.
for _stored_event in security_events:
    try:
        application_monitor.add_event(_stored_event)
    except Exception as _restore_error:
        print(f"[CONNECTOR] Could not restore event into application monitor: {_restore_error}")

# ============================================================
# APPLICATION REGISTRY
# ============================================================

REGISTRY_FILE = BASE_DIR / "applications.json"

registry_lock = Lock()


def load_applications():
    if not REGISTRY_FILE.exists():
        return {}

    try:
        with REGISTRY_FILE.open("r", encoding="utf-8") as file:
            return json.load(file)
    except (json.JSONDecodeError, OSError):
        return {}


def save_applications(applications):
    temporary_file = REGISTRY_FILE.with_suffix(".tmp")

    with temporary_file.open("w", encoding="utf-8") as file:
        json.dump(applications, file, indent=2)

    temporary_file.replace(REGISTRY_FILE)


registered_applications = load_applications()
# ============================================================
# CONNECTOR RUNTIME
# ============================================================

START_TIME = time()


# ============================================================
# SETTINGS
# ============================================================

connector_settings = {

    "connector_name":
        "Sentinal Connector",

    "connector_port":
        9000,

    "endpoint":
        "/api/v1/events",

    "host_binding":
        "127.0.0.1",

    "event_retention":
        "1,000 events (in-memory circular buffer)",

    "heartbeat":
        30,

    "connection_timeout":
        "3 seconds",

    "gzip":
        True,

    "api_authentication":
        True,

    "rate_limiting":
        True,

    "https_mtls":
        False,

    "ip_whitelist":
        "192.168.1.0/24\n"
        "10.0.4.0/24\n"
        "127.0.0.1",

    "logging_level":
        "INFO",

    "forward_to_soc":
        True,

    "audit_persistence":
        True
}


# ============================================================
# SECURITY EVENT MODEL
# ============================================================

class SecurityEvent(BaseModel):
    """Framework-neutral telemetry envelope; extra fields are retained."""
    model_config = {"extra": "allow"}
    source: str = "website"
    event: str
    username: str | None = None
    source_ip: str | None = None
    path: str | None = None
    details: dict = Field(default_factory=dict)

# ============================================================
# APPLICATION REGISTRATION MODEL
# ============================================================

class ApplicationRegistration(BaseModel):
    application_name: str = Field(min_length=1, max_length=120)
    application_url: str = Field(min_length=8, max_length=2048)
    application_id: str | None = None
    # If omitted, Connector creates a key and returns it once in the registration response.
    api_key: str | None = None
    framework: str | None = None


# ============================================================
# APPLICATION REGISTRATION
# ============================================================

class IntegrationCheckRequest(BaseModel):
    application_name: str
    application_url: str
    api_key: str | None = None
    framework: str | None = None


def _safe_base_url(value: str):
    from urllib.parse import urlparse
    parsed = urlparse(value.strip())
    if (parsed.scheme not in ("https", "http") or not parsed.hostname
            or parsed.username or parsed.password or parsed.query or parsed.fragment):
        raise HTTPException(status_code=400, detail="Enter a valid base URL using http:// or https://, without credentials, query, or fragment.")
    host = parsed.hostname.lower()
    if host in {"localhost", "localhost.localdomain"} or host.endswith(".local"):
        raise HTTPException(status_code=400, detail="Localhost and .local addresses cannot be tested from the Connector.")
    try:
        addresses = {item[4][0] for item in socket.getaddrinfo(host, parsed.port or (443 if parsed.scheme == "https" else 80), type=socket.SOCK_STREAM)}
        for address in addresses:
            if not ipaddress.ip_address(address.split("%", 1)[0]).is_global:
                raise HTTPException(status_code=400, detail="Private and loopback targets are blocked for safety.")
    except HTTPException:
        raise
    except Exception:
        pass
    return parsed


def _analyze_url(base_url: str):
    from urllib.parse import urljoin
    result = {"reachable": False, "api_description_found": False, "api_type": "Unknown", "status_code": None, "endpoints": [], "notes": []}
    _safe_base_url(base_url)
    try:
        req = Request(base_url.rstrip("/") + "/", headers={"User-Agent": "Sentinal-Integration-Analyzer/1.0"}, method="GET")
        with urlopen(req, timeout=4) as response:
            result["reachable"] = True
            result["status_code"] = response.status
    except HTTPError as exc:
        result["reachable"] = True
        result["status_code"] = exc.code
    except Exception as exc:
        result["notes"].append("Could not reach application from Connector: " + type(exc).__name__)
        return result
    for path in ("/openapi.json", "/swagger/v1/swagger.json", "/api/openapi.json"):
        try:
            req = Request(urljoin(base_url.rstrip("/") + "/", path), headers={"User-Agent": "Sentinal-Integration-Analyzer/1.0", "Accept": "application/json"}, method="GET")
            with urlopen(req, timeout=4) as response:
                if response.status == 200:
                    data = json.loads(response.read(1000000).decode("utf-8", errors="replace"))
                    if isinstance(data, dict) and ("paths" in data or "openapi" in data or "swagger" in data):
                        result["api_description_found"] = True
                        result["api_type"] = "REST API (OpenAPI/Swagger)"
                        result["endpoints"] = list(data.get("paths", {}).keys())[:100]
                        break
        except Exception:
            continue
    if not result["api_description_found"]:
        result["notes"].append("No standard OpenAPI/Swagger document found; an application-specific adapter may be required.")
    result["notes"].append("API key is not automatically verified: applications use different authentication endpoints. No key was sent during discovery.")
    return result


def get_connector_public_url(request: FastAPIRequest) -> str:
    """Resolve the Connector's externally usable URL.

    SENTINAL_PUBLIC_URL is an optional explicit override. Otherwise use the
    request URL, honoring forwarded headers only when the deployment's reverse
    proxy is configured to overwrite them. For production, configure a trusted
    proxy or set SENTINAL_PUBLIC_URL to avoid host-header/proxy ambiguity.
    """
    configured = os.getenv("SENTINAL_PUBLIC_URL", "").strip().rstrip("/")
    if configured:
        candidate = configured
    else:
        forwarded_host = request.headers.get("x-forwarded-host", "").split(",")[0].strip()
        forwarded_proto = request.headers.get("x-forwarded-proto", "").split(",")[0].strip().lower()
        host = forwarded_host or request.headers.get("host", "").strip()
        scheme = forwarded_proto if forwarded_proto in {"http", "https"} else request.url.scheme
        if not host or any(c in host for c in "\r\n/@"):
            host = request.url.netloc
        candidate = f"{scheme}://{host}".rstrip("/")

    from urllib.parse import urlparse
    parsed = urlparse(candidate)
    if parsed.scheme not in {"http", "https"} or not parsed.hostname or parsed.username or parsed.password or parsed.query or parsed.fragment:
        raise HTTPException(status_code=500, detail="Could not determine a valid Connector URL. Set SENTINAL_PUBLIC_URL to a public base URL.")
    return candidate


@app.post("/api/v1/connections/verify")
def verify_application_connection(data: IntegrationCheckRequest):
    result = _analyze_url(data.application_url.strip().rstrip("/"))
    return {"success": True, "application_name": data.application_name.strip(), "url_valid": True,
            "url_reachable": result["reachable"], "api_description_found": result["api_description_found"],
            "api_type": result["api_type"], "http_status": result["status_code"],
            "api_key_verified": False, "notes": result["notes"]}


@app.post("/api/v1/connections/analyze")
def analyze_application_integration(data: IntegrationCheckRequest):
    result = _analyze_url(data.application_url.strip().rstrip("/"))
    promising = result["reachable"] and result["api_description_found"]
    return {"success": True, "application_name": data.application_name.strip(),
            "api_type": result["api_type"], "reachable": result["reachable"],
            "api_description_found": result["api_description_found"],
            "discovered_endpoint_count": len(result["endpoints"]), "discovered_endpoints": result["endpoints"],
            "capabilities": {"login_telemetry": "Requires application-specific adapter", "session_telemetry": "Requires application-specific adapter", "security_events": "Requires application-specific adapter"},
            "compatibility": "PROMISING - adapter and event test required" if promising else "NOT CONFIRMED - additional API details required",
            "api_key_verified": False, "notes": result["notes"]}


@app.post("/api/v1/connections/install-package")
def download_integration_package(data: IntegrationCheckRequest, request: FastAPIRequest):
    """Download a starter SDK package; it does not remotely install code."""
    from fastapi.responses import StreamingResponse
    name = data.application_name.strip() or "External Application"
    slug = "".join(c.lower() if c.isalnum() else "_" for c in name).strip("_") or "external_app"
    connector_url = get_connector_public_url(request)
    plugin = '''"""Framework-neutral Sentinal telemetry sender. Call from real app hooks."""
import os
from datetime import datetime, timezone
from urllib.parse import urlparse
import requests
SENTINAL_CONNECTOR_URL = os.getenv("SENTINAL_CONNECTOR_URL", "CONNECTOR_PLACEHOLDER").rstrip("/")
SENTINAL_API_KEY = os.getenv("SENTINAL_API_KEY", "")
SENTINAL_APPLICATION_ID = os.getenv("SENTINAL_APPLICATION_ID", "APP_ID_PLACEHOLDER")
def send_event(event, username=None, source_ip=None, path=None, details=None, **extra):
    if not SENTINAL_API_KEY:
        raise RuntimeError("Set SENTINAL_API_KEY in the server environment")
    payload = {"source": SENTINAL_APPLICATION_ID, "event": str(event), "username": username,
               "source_ip": source_ip, "path": path,
               "timestamp": datetime.now(timezone.utc).isoformat(), "details": details or {}, **extra}
    response = requests.post(SENTINAL_CONNECTOR_URL + "/api/v1/events", json=payload,
        headers={"X-Sentinal-API-Key": SENTINAL_API_KEY}, timeout=5)
    response.raise_for_status()
    return response.json()
'''.replace("CONNECTOR_PLACEHOLDER", connector_url).replace("APP_ID_PLACEHOLDER", slug)
    readme = ("SENTINAL AI INTEGRATION STARTER\nApplication: " + name + "\n\n"
              "This is a starter client, not a remote auto-installer. Install it only in an application you own/administer.\n\n"
              "1. Install: pip install requests\n2. Set SENTINAL_CONNECTOR_URL=" + connector_url + "\n"
              "3. Set SENTINAL_API_KEY to the key returned by successful Connector registration.\n"
              "4. Set SENTINAL_APPLICATION_ID to the registered application ID.\n"
              "5. Import send_event from sentinal_plugin and call it from real login/session/security event hooks.\n"
              "5. Use a publicly reachable HTTPS Connector URL for hosted applications; 127.0.0.1 only works on the same machine.\n\n"
              "The generic analyzer cannot verify arbitrary application API keys. Verify via the target app's documented auth endpoint.\n")
    buffer = io.BytesIO()
    with zipfile.ZipFile(buffer, "w", zipfile.ZIP_DEFLATED) as archive:
        archive.writestr(slug + "/sentinal_plugin.py", plugin)
        archive.writestr(slug + "/README.txt", readme)
        archive.writestr(slug + "/requirements.txt", "requests>=2.31.0\n")
        archive.writestr(slug + "/.env.example", "SENTINAL_CONNECTOR_URL=" + connector_url + "\nSENTINAL_API_KEY=insert_key_from_registration_response\nSENTINAL_APPLICATION_ID=insert_registered_application_id\n")
    buffer.seek(0)
    return StreamingResponse(buffer, media_type="application/zip", headers={"Content-Disposition": 'attachment; filename="sentinal_' + slug + '_integration.zip"'})



@app.post("/api/v1/connections/register")
def register_application(
    data: ApplicationRegistration,
    request: FastAPIRequest,
    x_sentinal_admin_key: str | None = Header(default=None)
):
    """
    Register the single active application for this prototype.

    Configure SENTINAL_ADMIN_KEY on the Connector and send it in
    X-Sentinal-Admin-Key. Registration is disabled if no admin key exists.
    """
    from urllib.parse import urlparse

    admin_key = os.getenv("SENTINAL_ADMIN_KEY", "")
    if not admin_key:
        raise HTTPException(
            status_code=503,
            detail="Application registration is disabled: configure SENTINAL_ADMIN_KEY."
        )
    if not x_sentinal_admin_key or not secrets.compare_digest(
        x_sentinal_admin_key, admin_key
    ):
        raise HTTPException(
            status_code=401,
            detail="Administrator key is required to register an application."
        )

    name = data.application_name.strip()
    app_id = (data.application_id or ("APP-" + secrets.token_hex(6).upper())).strip()
    api_key = (data.api_key or "").strip()
    if not api_key:
        api_key = "snl_" + secrets.token_urlsafe(36)
    url = data.application_url.strip()

    if not name or not app_id:
        raise HTTPException(status_code=400, detail="Application name and ID are required.")

    parsed = urlparse(url)
    if (
        parsed.scheme not in ("https", "http")
        or not parsed.hostname
        or parsed.username
        or parsed.password
        or parsed.query
        or parsed.fragment
    ):
        raise HTTPException(
            status_code=400,
            detail="Enter a valid application base URL without credentials, query, or fragment."
        )

    if len(api_key) < 32 or any(char.isspace() for char in api_key):
        raise HTTPException(
            status_code=400,
            detail="The application API key must be at least 32 characters and contain no spaces."
        )

    public_url = get_connector_public_url(request)

    record = {
        "application_id": app_id,
        "application_name": name,
        "application_url": url.rstrip("/"),
        "framework": (data.framework or "unknown").strip()[:80],
        "api_key": api_key,
        "status": "REGISTERED",
        "created_at": utc_now(),
        "last_communication": None,
        "events_received": 0
    }

    with registry_lock:
        # Multi-application registry: preserve other registered websites.
        if app_id in registered_applications:
            raise HTTPException(status_code=409, detail="Application ID already exists. Use a new application ID.")
        new_registry = dict(registered_applications)
        new_registry[app_id] = record
        save_applications(new_registry)
        registered_applications.clear()
        registered_applications.update(new_registry)

    add_log(
        level="INFO",
        module="registration",
        message=f"Registered application {app_id} ({name})."
    )

    return {
        "success": True,
        "application_id": app_id,
        "application_name": name,
        "application_url": url.rstrip("/"),
        "framework": record["framework"],
        "connector_url": public_url,
        "connector_event_url": f"{public_url}/api/v1/events",
        "verify_url": f"{public_url}/api/v1/auth/verify",
        "api_key": api_key,
        "message": "Application registered. Store this key securely; it is shown only in this registration response. Send a test event to verify telemetry delivery."
    }


# ============================================================
# HELPER — UTC TIMESTAMP
# ============================================================

def utc_now():

    return datetime.now(
        timezone.utc
    ).isoformat()


# ============================================================
# API KEY
# ============================================================

def get_expected_api_key():

    return os.getenv(
        "SENTINAL_API_KEY"
    )


# ============================================================
# API KEY VERIFICATION
# ============================================================

def verify_api_key(
    api_key: str | None
):
    import secrets

    # No key supplied
    if not api_key:
        raise HTTPException(
            status_code=401,
            detail="Sentinal API key is required"
        )

    # Find the registered application
    with registry_lock:
        applications = list(registered_applications.values())

    for application in applications:
        registered_key = application.get("api_key", "")

        if registered_key and secrets.compare_digest(
            api_key,
            registered_key
        ):
            return application

    # Key does not belong to a registered application
    raise HTTPException(
        status_code=401,
        detail="Invalid or unregistered application API key"
    )



# ============================================================
# REVOKE APPLICATION CONNECTION
# ============================================================

@app.post("/api/v1/auth/revoke")
def revoke_application_connection(
    x_sentinal_api_key: str | None = Header(default=None)
):
    """
    Revoke the application identified by its current API key.
    The key is invalidated server-side and that application's stored
    telemetry is removed from the Connector and ApplicationMonitor.
    """
    if not x_sentinal_api_key:
        raise HTTPException(status_code=401, detail="Sentinal API key is required.")

    # Match and revoke while holding the registry lock so the same key
    # cannot be used to authenticate another request after revocation.
    with registry_lock:
        target = None
        for application in registered_applications.values():
            stored_key = application.get("api_key", "")
            if stored_key and secrets.compare_digest(
                x_sentinal_api_key, stored_key
            ):
                target = application
                break

        if target is None:
            raise HTTPException(
                status_code=401,
                detail="Invalid or already revoked application API key."
            )

        application_id = str(target.get("application_id", ""))
        application_name = str(target.get("application_name", ""))

        # Invalidate the credential first; the old key cannot be reused.
        target["api_key"] = ""
        target["status"] = "REVOKED"
        target["last_communication"] = None
        target["events_received"] = 0

        try:
            save_applications(registered_applications)
        except OSError as error:
            # Keep the in-memory key revoked if persistence fails (fail closed).
            add_log(
                level="ERROR",
                module="revocation",
                message=f"Could not persist revocation for {application_id}: {type(error).__name__}."
            )
            raise HTTPException(
                status_code=500,
                detail="The key was blocked in memory, but revocation could not be saved. Check Connector storage permissions."
            )

    # Remove only events attributed to the revoked application.
    def belongs_to_target(item):
        if not isinstance(item, dict):
            return False
        item_id = str(item.get("application_id", ""))
        item_name = str(item.get("application_name", ""))
        # Name fallback handles older events that predate application_id tagging.
        return (
            (application_id and item_id == application_id)
            or (
                not item_id
                and application_name
                and (
                    item_name == application_name
                    or str(item.get("source", "")) == application_name
                )
            )
        )

    with EVENTS_LOCK:
        previous_events = list(security_events)
        security_events[:] = [
            item for item in security_events if not belongs_to_target(item)
        ]
        removed_events = len(previous_events) - len(security_events)

        # Persist the cleaned event list atomically. If this fails, restore the
        # in-memory event list and report failure rather than claiming success.
        try:
            temporary_file = EVENTS_FILE.with_suffix(".revoke.tmp")
            temporary_file.write_text(
                json.dumps(
                    security_events[-MAX_STORED_EVENTS:],
                    ensure_ascii=False,
                    indent=2
                ),
                encoding="utf-8"
            )
            temporary_file.replace(EVENTS_FILE)
        except OSError as error:
            security_events[:] = previous_events
            add_log(
                level="ERROR",
                module="revocation",
                message=f"Revocation saved for {application_id}, but telemetry cleanup failed: {type(error).__name__}."
            )
            raise HTTPException(
                status_code=500,
                detail="The API key was revoked, but telemetry cleanup could not be saved. Check Connector storage permissions."
            )

    # ApplicationMonitor is the live source for the dashboard analytics.
    monitor_events = application_monitor.get_events()
    application_monitor.events = [
        item for item in monitor_events if not belongs_to_target(item)
    ]

    # Incidents are held in memory. Remove this application's incidents only.
    previous_incident_count = len(security_incidents)
    security_incidents[:] = [
        item for item in security_incidents
        if not belongs_to_target(item)
        and not (
            application_name
            and str(item.get("source", "")) == application_name
        )
    ]
    removed_incidents = previous_incident_count - len(security_incidents)

    add_log(
        level="WARNING",
        module="revocation",
        message=(
            f"Revoked application {application_id} ({application_name}); "
            f"removed {removed_events} telemetry event(s) and "
            f"{removed_incidents} incident(s)."
        )
    )

    return {
        "revoked": True,
        "application_id": application_id,
        "application_name": application_name,
        "events_removed": removed_events,
        "incidents_removed": removed_incidents,
        "message": "Connection revoked. The API key is invalid and this application's telemetry was cleared."
    }


# ============================================================
# LOG CREATOR
# ============================================================

def add_log(
    level: str,
    module: str,
    message: str,
    source_ip: str | None = None
):

    log = {

        "timestamp":
            utc_now(),

        "level":
            level.upper(),

        "module":
            module,

        "message":
            message,

        "source_ip":
            source_ip
    }

    connector_logs.append(
        log
    )

    # Keep memory under control
    if len(connector_logs) > 1000:

        del connector_logs[:-1000]

    return log


# ============================================================
# ROOT — SERVE CONNECTOR UI
# ============================================================

@app.get("/")
def connector_page():

    if not HTML_FILE.exists():

        raise HTTPException(
            status_code=500,
            detail=(
                "connector.html not found. "
                f"Expected: {HTML_FILE}"
            )
        )

    return FileResponse(
        HTML_FILE
    )


# ============================================================
# HEALTH CHECK
# ============================================================

@app.get("/health")
def health():

    return {

        "service":
            "Sentinal AI Connector",

        "status":
            "ONLINE",

        "version":
            "1.0.0",

        "port":
            9000
    }


# ============================================================
# CONNECTOR STATUS
# ============================================================

@app.get("/security/status")
def connector_status():

    uptime_seconds = (
        time() - START_TIME
    )

    # Discover applications from real telemetry
    application_sources = set()

    for event in application_monitor.get_events():


        source = event.get(
            "source"
        )

        if source:

            application_sources.add(
                str(source)
            )

    return {

        "connected":
            len(application_sources) > 0,

        "status":
            "ONLINE",

        "application":
            (
                next(iter(application_sources))
                if application_sources
                else None
            ),

        "applications":
            len(application_sources),

        "events_received":
            len(security_events),

        "active_incidents":
            len(security_incidents),

        "uptime_seconds":
            round(
                uptime_seconds,
                2
            ),

        "uptime":
            format_uptime(
                uptime_seconds
            )
    }


# ============================================================
# API KEY AUTH VERIFICATION
# ============================================================

@app.post("/api/v1/auth/verify")
def verify_connection_key(
    x_sentinal_api_key: str | None = Header(default=None)
):
    """
    Verify an application-specific key registered in applications.json.
    """
    application = verify_api_key(x_sentinal_api_key)

    add_log(
        level="INFO",
        module="authentication",
        message=f"Application key verified for {application.get('application_id', 'unknown')}."
    )

    return {
        "valid": True,
        "authenticated": True,
        "application_id": application.get("application_id"),
        "application_name": application.get("application_name"),
        "application_url": application.get("application_url"),
        "message": "Application API key verified successfully.",
        "service": "Sentinal AI Connector"
    }


# ============================================================
# RECEIVE SECURITY EVENT
# ============================================================

@app.post("/api/v1/events")
def receive_event(
    event: SecurityEvent,
    request: FastAPIRequest,
    x_sentinal_api_key: str | None = Header(default=None),
):

    # --------------------------------------------------------
    # 1. VERIFY API KEY
    # --------------------------------------------------------

    authenticated_application = verify_api_key(
        x_sentinal_api_key
    )


    # --------------------------------------------------------
    # 2. CONVERT EVENT
    # --------------------------------------------------------

    event_data = event.model_dump()

    # This is the peer that connected to the Connector, not necessarily the
    # original end user. Preserve Hanu's source_ip when it supplied one.
    observed_peer_ip = _observed_peer_ip(request)
    event_data["connector_peer_ip"] = observed_peer_ip
    event_data["source_ip_origin"] = (
        "application_telemetry" if event_data.get("source_ip")
        else "connector_peer"
    )
    if not event_data.get("source_ip"):
        event_data["source_ip"] = observed_peer_ip

    event_data["received_at"] = utc_now()


    # --------------------------------------------------------
    # 3. SEND EVENT TO APPLICATION MONITOR
    # --------------------------------------------------------

    # Attribute the event to the registered application rather than
    # trusting a caller-supplied event.source value.
    event_data["application_id"] = authenticated_application.get("application_id")
    event_data["application_name"] = authenticated_application.get("application_name")
    event_data["source"] = authenticated_application.get("application_name", event_data.get("source", "application"))

    application_monitor.add_event(
        event_data
    )

    with registry_lock:
        current = registered_applications.get(
            authenticated_application.get("application_id")
        )
        if current:
            current["status"] = "CONNECTED"
            current["last_communication"] = event_data["received_at"]
            current["events_received"] = int(current.get("events_received", 0)) + 1
            save_applications(registered_applications)


    # --------------------------------------------------------
    # 4. STORE EVENT
    # --------------------------------------------------------

    with EVENTS_LOCK:
        security_events.append(event_data)

        # Keep the same bounded window in memory and on disk.
        if len(security_events) > MAX_STORED_EVENTS:
            del security_events[:-MAX_STORED_EVENTS]

        save_security_events()


    # --------------------------------------------------------
    # 5. CREATE LOG
    # --------------------------------------------------------

    event_type = (
        event.event.lower()
    )

    if event_type == "login_failed":

        log_level = "WARNING"

    elif event_type in [
        "security_event",
        "suspicious_activity"
    ]:

        log_level = "WARNING"

    elif event_type == "error":

        log_level = "ERROR"

    else:

        log_level = "INFO"


    add_log(

        level=log_level,

        module=event.source or "application",

        message=(
            f"Event received: "
            f"{event.event}"
        ),

        source_ip=event.source_ip

    )


    # --------------------------------------------------------
    # 6. DEFAULT ANALYSIS
    # --------------------------------------------------------

    analysis = {

        "risk_score":
            0,

        "risk_level":
            "LOW",

        "threat":
            "Normal activity",

        "evidence":
            [
                "Event received by Sentinal AI Connector"
            ]
    }


    # ========================================================
    # LOGIN FAILED
    # ========================================================

    if event_type == "login_failed":

        try:

            login_result = analyze_login(

                username=(
                    event.username
                    or "unknown"
                ),

                source_ip=(
                    event.source_ip
                    or "unknown"
                ),

                success=False
            )


            analysis = assess_event(
                login_result
            )


            # ------------------------------------------------
            # STORE SUSPICIOUS INCIDENT
            # ------------------------------------------------

            if (
                analysis.get(
                    "risk_score",
                    0
                ) >= 40
            ):

                incident = {

                    **analysis,

                    "incident_id":
                        f"INC-{len(security_incidents)+1:04d}",

                    "detected_at":
                        utc_now(),

                    "source":
                        event_data.get("source", event.source),

                    "application_id":
                        event_data.get("application_id"),

                    "application_name":
                        event_data.get("application_name"),

                    "event":
                        event.event,

                    "status":
                        "DETECTED"
                }


                security_incidents.append(
                    incident
                )


                # ------------------------------------------------
                # CYBI ANALYSIS
                # ------------------------------------------------

                security_prompt = f"""
You are Cybi, the cybersecurity analyst
of Sentinal AI.

Analyze this security incident.

Threat:
{analysis.get("threat")}

Risk Level:
{analysis.get("risk_level")}

Risk Score:
{analysis.get("risk_score")}/100

Username:
{analysis.get("username")}

Source IP:
{analysis.get("source_ip")}

Failed Attempts:
{analysis.get("attempt_count")}

Evidence:
{analysis.get("evidence")}

Provide:

1. What happened
2. Why it is suspicious
3. Risk assessment
4. Recommended defensive action
5. Whether immediate attention is required

Do not claim that any action was executed.

Only provide analysis and recommendation.
"""


                try:

                    cybi_answer = run_Cybi(

                        security_prompt,

                        thread_id=(
                            "sentinal_security"
                        )

                    )


                    analysis[
                        "cybi_analysis"
                    ] = cybi_answer


                    incident[
                        "cybi_analysis"
                    ] = cybi_answer


                except Exception as error:

                    analysis[
                        "cybi_analysis"
                    ] = (
                        "Cybi analysis failed: "
                        + str(error)
                    )


        except Exception as error:

            analysis = {

                "risk_score":
                    0,

                "risk_level":
                    "UNKNOWN",

                "threat":
                    "Login analysis error",

                "evidence":
                    [
                        str(error)
                    ]
            }


    # ========================================================
    # LOGIN SUCCESS
    # ========================================================

    elif event_type == "login_success":

        try:

            login_result = analyze_login(

                username=(
                    event.username
                    or "unknown"
                ),

                source_ip=(
                    event.source_ip
                    or "unknown"
                ),

                success=True
            )


            analysis = assess_event(
                login_result
            )


        except Exception as error:

            analysis = {

                "risk_score":
                    0,

                "risk_level":
                    "LOW",

                "threat":
                    "Successful login",

                "evidence":
                    [
                        "Login event received"
                    ],

                "analysis_error":
                    str(error)
            }


    # ========================================================
    # SUSPICIOUS ACTIVITY
    # ========================================================

    elif event_type == "suspicious_activity":

        analysis = {

            "risk_score":
                60,

            "risk_level":
                "MEDIUM",

            "threat":
                "Suspicious activity",

            "evidence":
                [
                    "Application reported suspicious activity"
                ]
        }


    # ========================================================
    # SECURITY EVENT
    # ========================================================

    elif event_type == "security_event":

        analysis = {

            "risk_score":
                50,

            "risk_level":
                "MEDIUM",

            "threat":
                "Security event",

            "evidence":
                [
                    "Application reported a security event"
                ]
        }


    # ========================================================
    # ERROR
    # ========================================================

    elif event_type == "error":

        analysis = {

            "risk_score":
                40,

            "risk_level":
                "MEDIUM",

            "threat":
                "Application error",

            "evidence":
                [
                    "Application reported an error"
                ]
        }


    # ========================================================
    # REQUEST
    # ========================================================

    elif event_type == "request":

        analysis = {

            "risk_score":
                0,

            "risk_level":
                "LOW",

            "threat":
                "Web request",

            "evidence":
                [
                    "Request telemetry received"
                ]
        }


    # ========================================================
    # SESSION EVENTS
    # ========================================================

    elif event_type in [

        "session_started",

        "session_ended"

    ]:

        analysis = {

            "risk_score":
                0,

            "risk_level":
                "LOW",

            "threat":
                "Session activity",

            "evidence":
                [
                    f"{event.event} received"
                ]
        }


    # ========================================================
    # UNKNOWN EVENT
    # ========================================================

    else:

        analysis = {

            "risk_score":
                0,

            "risk_level":
                "LOW",

            "threat":
                "Telemetry event",

            "evidence":
                [
                    "Event received but no "
                    "specialized analyzer is configured"
                ]
        }


    # ========================================================
    # RETURN RESULT
    # ========================================================

    return {

        "status":
            "accepted",

        "message":
            "Security event received by Sentinal AI",

        "event":
            event_data,

        "analysis":
            analysis
    }


# ============================================================
# APPLICATION MONITOR API
# ============================================================

@app.get("/api/v1/application/overview")
def application_overview():

    return application_monitor.overview()


# ============================================================
# ALL APPLICATION EVENTS
# ============================================================

@app.get("/api/v1/application/events")
def application_monitor_events():

    return {

        "events":
            application_monitor.get_events(
            )
    }


# ============================================================
# LOGIN ANALYSIS
# ============================================================

@app.get("/api/v1/application/logins")
def application_monitor_logins():

    return application_monitor.login_analysis()


# ============================================================
# AUTHENTICATION TIMELINE
# ============================================================

@app.get("/api/v1/application/authentication")
def application_authentication():

    return {

        "authentication":
            application_monitor.authentication_timeline()
    }


# ============================================================
# REQUEST ANALYSIS
# ============================================================

@app.get("/api/v1/application/requests")
def application_monitor_requests():

    return application_monitor.request_analysis()


# ============================================================
# REQUEST TRAFFIC TIMELINE
# ============================================================

@app.get("/api/v1/application/request-timeline")
def application_request_timeline():

    return {

        "requests":
            application_monitor.request_timeline()
    }


# ============================================================
# HTTP STATUS DISTRIBUTION
# ============================================================

@app.get("/api/v1/application/http-status")
def application_http_status():

    return {

        "status_distribution":
            application_monitor.http_status_distribution()
    }


# ============================================================
# RESPONSE TIME TIMELINE
# ============================================================

@app.get("/api/v1/application/response-time")
def application_response_time():

    return {

        "response_time":
            application_monitor.response_time_timeline()
    }


# ============================================================
# SESSION ANALYSIS
# ============================================================

@app.get("/api/v1/application/sessions")
def application_monitor_sessions():

    return application_monitor.session_analysis()


# ============================================================
# SESSION TIMELINE
# ============================================================

@app.get("/api/v1/application/session-timeline")
def application_session_timeline():

    return {

        "sessions":
            application_monitor.session_timeline()
    }


# ============================================================
# ERROR ANALYSIS
# ============================================================

@app.get("/api/v1/application/errors")
def application_monitor_errors():

    return application_monitor.error_analysis()


# ============================================================
# APPLICATION HEALTH
# ============================================================

@app.get("/api/v1/application/health")
def application_health():

    return application_monitor.application_health()


# ============================================================
# SOURCE IP ANALYSIS
# ============================================================

@app.get("/api/v1/application/source-ips")
def application_monitor_source_ips():

    return {

        "source_ips":
            application_monitor.source_ip_analysis()
    }


# ============================================================
# USERNAME ANALYSIS
# ============================================================

@app.get("/api/v1/application/usernames")
def application_monitor_usernames():

    return {

        "usernames":
            application_monitor.username_analysis()
    }


# ============================================================
# EVENT DISTRIBUTION
# ============================================================

@app.get("/api/v1/application/distribution")
def application_monitor_distribution():

    return {

        "distribution":
            application_monitor.event_distribution()
    }


# ============================================================
# LIVE EVENT TIMELINE
# ============================================================

@app.get("/api/v1/application/live-events")
def application_live_events():

    return {

        "events":
            application_monitor.live_event_timeline(
                limit=100
            )
    }


# ============================================================
# COMPLETE APPLICATION ANALYTICS
# ============================================================

@app.get("/api/v1/application/analytics")
def application_analytics():

    return application_monitor.overview()


# ============================================================
# GET EVENTS
# ============================================================

@app.get("/api/v1/events")
def get_events(

    limit: int = Query(
        default=100,
        ge=1,
        le=1000
    )

):

    with EVENTS_LOCK:
        events = list(security_events[-limit:])

    return {
        "total": len(events),
        "events": events,
    }


# ============================================================
# GET INCIDENTS
# ============================================================

@app.get("/api/v1/incidents")
def get_incidents():

    return {

        "total":
            len(security_incidents),

        "incidents":
            security_incidents[-50:]

    }


# ============================================================
# GET CONNECTOR LOGS
# ============================================================

@app.get("/api/v1/logs")
def get_logs(

    limit: int = Query(
        default=500,
        ge=1,
        le=1000
    )

):

    return {

        "total":
            len(connector_logs),

        "logs":
            connector_logs[-limit:]

    }


# ============================================================
# FLUSH ALL APPLICATIONS AND TELEMETRY (ADMIN ONLY)
# ============================================================

@app.post("/api/v1/maintenance/flush")
def flush_all_data(
    payload: dict,
    x_sentinal_admin_key: str | None = Header(default=None),
):
    """
    Destructively clear registered applications and telemetry.
    Requires SENTINAL_ADMIN_KEY; the request body must explicitly enable
    both events and applications, matching the Connector UI.
    """
    admin_key = os.getenv("SENTINAL_ADMIN_KEY", "")
    if not admin_key:
        raise HTTPException(
            status_code=503,
            detail="Flush is disabled: configure SENTINAL_ADMIN_KEY.",
        )
    if not x_sentinal_admin_key or not secrets.compare_digest(
        x_sentinal_admin_key, admin_key
    ):
        raise HTTPException(
            status_code=401,
            detail="Valid Connector administrator key is required.",
        )

    if not isinstance(payload, dict) or payload.get("events") is not True or payload.get("applications") is not True:
        raise HTTPException(
            status_code=400,
            detail="Confirm both events=true and applications=true to flush all data.",
        )

    # Snapshot in-memory state so a storage failure can restore it.
    with registry_lock:
        with EVENTS_LOCK:
            old_registry = dict(registered_applications)
            old_events = list(security_events)
            old_monitor_events = application_monitor.get_events()
            old_incidents = list(security_incidents)

            app_original = REGISTRY_FILE.read_bytes() if REGISTRY_FILE.exists() else None
            events_original = EVENTS_FILE.read_bytes() if EVENTS_FILE.exists() else None
            app_tmp = REGISTRY_FILE.with_suffix(".flush.tmp")
            event_tmp = EVENTS_FILE.with_suffix(".flush.tmp")
            try:
                # Prepare both files first, then replace the persisted stores.
                app_tmp.write_text("{}", encoding="utf-8")
                event_tmp.write_text("[]", encoding="utf-8")
                app_tmp.replace(REGISTRY_FILE)
                event_tmp.replace(EVENTS_FILE)
            except OSError as error:
                # Best-effort rollback if either replace fails after the other
                # file has already been replaced.
                for path, original in (
                    (REGISTRY_FILE, app_original),
                    (EVENTS_FILE, events_original),
                ):
                    try:
                        if original is None:
                            path.unlink(missing_ok=True)
                        else:
                            restore_tmp = path.with_suffix(".restore.tmp")
                            restore_tmp.write_bytes(original)
                            restore_tmp.replace(path)
                    except OSError:
                        pass
                for temporary in (app_tmp, event_tmp):
                    try:
                        temporary.unlink(missing_ok=True)
                    except OSError:
                        pass
                raise HTTPException(
                    status_code=500,
                    detail=f"Flush failed while writing Connector storage: {type(error).__name__}.",
                )

            registered_applications.clear()
            security_events.clear()
            application_monitor.events = []
            security_incidents.clear()

    add_log(
        level="WARNING",
        module="maintenance",
        message=(
            f"Administrator flushed all data: {len(old_events)} event(s), "
            f"{len(old_registry)} application(s), and {len(old_incidents)} incident(s) removed."
        ),
    )
    return {
        "flushed": True,
        "events_removed": len(old_events),
        "applications_removed": len(old_registry),
        "incidents_removed": len(old_incidents),
        "message": "All registered applications, telemetry, and incidents were cleared.",
    }


# ============================================================
# FLUSH CONNECTOR LOGS
# ============================================================

@app.post("/api/v1/logs/flush")
def flush_logs():

    count = len(
        connector_logs
    )

    connector_logs.clear()

    add_log(

        level="INFO",

        module="connector",

        message=(
            f"Log buffer flushed. "
            f"{count} entries removed."
        )

    )

    return {

        "status":
            "success",

        "message":
            f"Log buffer flushed. "
            f"{count} entries removed.",

        "remaining":
            len(connector_logs)

    }


# ============================================================
# APPLICATIONS
# ============================================================

@app.get("/api/v1/applications")
def get_applications():
    """
    Return registered applications. API keys are never exposed.
    """
    with registry_lock:
        applications = []
        for record in registered_applications.values():
            item = {
                key: value
                for key, value in record.items()
                if key != "api_key"
            }
            applications.append(item)

    return {
        "total": len(applications),
        "applications": applications
    }


# ============================================================
# GET SETTINGS
# ============================================================

@app.get("/api/v1/connection-info")
def connection_info(request: FastAPIRequest):
    """Return the Connector's own base URL so connected clients can read it."""
    base_url = get_connector_public_url(request)
    return {
        "success": True,
        "service": "Sentinal AI Connector",
        "connector_url": base_url,
        "health_url": f"{base_url}/health",
        "events_url": f"{base_url}/api/v1/events",
        "applications_url": f"{base_url}/api/v1/applications",
    }


@app.get("/api/v1/settings")
def get_settings():

    return {

        "status":
            "success",

        "settings":
            connector_settings

    }


# ============================================================
# UPDATE SETTINGS
# ============================================================

@app.put("/api/v1/settings")
def update_settings(
    settings: dict
):

    allowed_keys = set(
        connector_settings.keys()
    )

    updated = {}


    for key, value in settings.items():

        if key not in allowed_keys:
            continue

        connector_settings[
            key
        ] = value

        updated[key] = value


    add_log(

        level="INFO",

        module="settings",

        message=(
            "Connector configuration "
            "updated."
        )

    )


    return {

        "status":
            "success",

        "message":
            "Connector settings updated.",

        "settings":
            connector_settings,

        "updated":
            updated

    }


# ============================================================
# TEST CONNECTION
# ============================================================

@app.post("/api/v1/test-connection")
def test_connection():

    add_log(

        level="INFO",

        module="diagnostics",

        message=
            "Connector gateway test requested."

    )


    return {

        "status":
            "success",

        "connected":
            True,

        "message":
            "Sentinal AI Connector is reachable.",

        "host":
            connector_settings[
                "host_binding"
            ],

        "port":
            9000,

        "endpoint":
            connector_settings[
                "endpoint"
            ]

    }


# ============================================================
# DIAGNOSTICS
# ============================================================

@app.get("/api/v1/diagnostics")
def diagnostics():

    uptime_seconds = (
        time() - START_TIME
    )


    # Dynamic application count

    application_sources = set()

    for event in application_monitor.get_events():

        source = event.get(
            "source"
        )

        if source:

            application_sources.add(
                str(source)
            )


    return {

        "status":
            "HEALTHY",

        "connector": {

            "name":
                connector_settings[
                    "connector_name"
                ],

            "host":
                connector_settings[
                    "host_binding"
                ],

            "port":
                9000

        },

        "uptime_seconds":
            round(
                uptime_seconds,
                2
            ),

        "uptime":
            format_uptime(
                uptime_seconds
            ),

        "events_received":
            len(security_events),

        "active_incidents":
            len(security_incidents),

        "logs":
            len(connector_logs),

        "applications":
            len(application_sources)

    }


# ============================================================
# FORMAT UPTIME
# ============================================================

def format_uptime(
    seconds
):

    seconds = int(
        seconds
    )

    days = (
        seconds // 86400
    )

    hours = (
        seconds % 86400
    ) // 3600

    minutes = (
        seconds % 3600
    ) // 60

    secs = (
        seconds % 60
    )


    if days > 0:

        return (
            f"{days}d "
            f"{hours}h "
            f"{minutes}m"
        )


    if hours > 0:

        return (
            f"{hours}h "
            f"{minutes}m "
            f"{secs}s"
        )


    if minutes > 0:

        return (
            f"{minutes}m "
            f"{secs}s"
        )


    return f"{secs}s"


# ============================================================
# STARTUP LOG
# ============================================================

@app.on_event("startup")
def startup_event():

    add_log(

        level="INFO",

        module="connector",

        message=(
            "Sentinal AI Connector started "
            "on port 9000."
        )

    )

    print()
    print("=" * 55)
    print(" SENTINAL AI CONNECTOR")
    print("=" * 55)
    print(" Status      : ONLINE")
    print(" Host        : 127.0.0.1")
    print(" Port        : 9000")
    print(" UI          : http://127.0.0.1:9000/")
    print(" API Docs    : http://127.0.0.1:9000/docs")
    print(" Events      : /api/v1/events")
    print(" Logs        : /api/v1/logs")
    print(" Auth        : /api/v1/auth/verify")
    print("=" * 55)
    print()
    # ============================================================
# APPLICATION MONITOR DATA
# ============================================================

@app.get("/api/v1/application/dashboard")
def application_dashboard():

    return application_monitor.dashboard_data()