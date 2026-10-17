import json
import ipaddress
import time
import os
from dotenv import load_dotenv

load_dotenv()

CARTO_API_KEY = os.getenv("cb1_4k7q_1_9f8dddb7f40095cf9b93dc31")
from urllib.request import Request as URLRequest, urlopen
from urllib.error import URLError

from fastapi import FastAPI, Request, HTTPException
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates

from cybersecurity.server_monitor import get_system_info
from cybersecurity.phishing_analyzer import analyze_url
from cybersecurity.risk_engine import assess_event

from Agent.Cybi import run_Cybi

from dashboard.application_monitor import ApplicationMonitor


# ============================================================
# SENTINAL AI DASHBOARD
# ============================================================

app = FastAPI(
    title="Sentinal AI Dashboard",
    description="AI-powered Cybersecurity Analysis Dashboard",
    version="1.0"
)


# ============================================================
# FRONTEND
# ============================================================

app.mount(
    "/static",
    StaticFiles(directory="dashboard/static"),
    name="static"
)

templates = Jinja2Templates(
    directory="dashboard/templates"
)


@app.get("/", response_class=HTMLResponse)
async def dashboard(request: Request):

    return templates.TemplateResponse(
        request=request,
        name="index.html"
    )


# ============================================================
# CONNECTOR AUTO-DISCOVERY
# ============================================================

import os
import socket
from threading import Lock
from urllib.parse import urlparse

# Optional explicit override. Otherwise the dashboard probes common local
# Connector ports and remembers the first valid Sentinal Connector it finds.
CONNECTOR_URL = os.getenv("SENTINAL_CONNECTOR_URL", "").strip().rstrip("/")
_CONNECTOR_LOCK = Lock()
_CONNECTOR_CACHE = {"url": CONNECTOR_URL, "checked_at": 0.0}
_CONNECTOR_CACHE_TTL = 10.0


def _connector_candidates():
    candidates = []
    configured = os.getenv("SENTINAL_CONNECTOR_URL", "").strip().rstrip("/")
    if configured:
        candidates.append(configured)

    # Local Connector defaults, including the user's current port 9001.
    for host in ("127.0.0.1", "localhost"):
        for port in (9001, 9000, 9002, 9100):
            candidates.append(f"http://{host}:{port}")

    # Also try the machine's primary LAN address in case the Connector is
    # bound to that interface rather than loopback.
    try:
        sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        try:
            sock.connect(("192.0.2.1", 80))
            lan_ip = sock.getsockname()[0]
            if lan_ip and not lan_ip.startswith("127."):
                for port in (9001, 9000, 9002, 9100):
                    candidates.append(f"http://{lan_ip}:{port}")
        finally:
            sock.close()
    except OSError:
        pass

    # Preserve order while removing duplicates.
    return list(dict.fromkeys(candidates))


def _is_sentinal_connector(base_url):
    """Identify the Connector by its OpenAPI title; URL-info is optional."""
    try:
        parsed = urlparse(base_url)
        if parsed.scheme not in ("http", "https") or not parsed.hostname:
            return False

        req = URLRequest(
            base_url.rstrip("/") + "/openapi.json",
            headers={"User-Agent": "Sentinal-Dashboard-Discovery/1.0", "Accept": "application/json"},
        )
        with urlopen(req, timeout=2.0) as response:
            # Read the full OpenAPI document; a fixed-size partial read can
            # truncate JSON and incorrectly make a live Connector look offline.
            spec = json.loads(response.read().decode("utf-8", errors="replace"))

        title = str(spec.get("info", {}).get("title", "")).lower()
        if "sentinal" not in title or "connector" not in title:
            return False

        # This endpoint is a convenience, not a requirement for discovery.
        # Older Connector versions may not have it, or it may fail because of
        # proxy/host configuration. In that case, use the reachable candidate.
        try:
            info_req = URLRequest(
                base_url.rstrip("/") + "/api/v1/connection-info",
                headers={"User-Agent": "Sentinal-Dashboard-Discovery/1.0", "Accept": "application/json"},
            )
            with urlopen(info_req, timeout=1.5) as info_response:
                info = json.loads(info_response.read().decode("utf-8", errors="replace"))
            reported_url = str(info.get("connector_url", "")).strip().rstrip("/")
            reported = urlparse(reported_url)
            if reported.scheme in ("http", "https") and reported.hostname:
                _CONNECTOR_CACHE["reported_url"] = reported_url
        except Exception as info_error:
            print(f"[DASHBOARD] Connector found at {base_url}; connection-info unavailable: {info_error}")

        return True
    except Exception:
        return False


def discover_connector_url(force=False):
    """Find a reachable Sentinal Connector; refresh the cached result periodically."""
    now = __import__("time").monotonic()
    with _CONNECTOR_LOCK:
        cached = _CONNECTOR_CACHE.get("url", "")
        if not force and cached and now - _CONNECTOR_CACHE.get("checked_at", 0.0) < _CONNECTOR_CACHE_TTL:
            return cached

        for candidate in _connector_candidates():
            if _is_sentinal_connector(candidate):
                # Prefer the canonical URL advertised by the connected API.
                reported = str(_CONNECTOR_CACHE.pop("reported_url", "")).rstrip("/")
                active_url = reported or candidate.rstrip("/")
                # Ensure the advertised URL actually responds as Sentinal.
                if reported and not reported.startswith(("http://", "https://")):
                    active_url = candidate.rstrip("/")
                _CONNECTOR_CACHE.update(url=active_url, checked_at=now)
                print(f"[DASHBOARD] Sentinal Connector discovered: {active_url}")
                return active_url

        _CONNECTOR_CACHE.update(url="", checked_at=now)
        print("[DASHBOARD] Sentinal Connector not found. Checked configured URL and common local ports.")
        return ""


def get_connector_data(endpoint):
    # Rediscover when the current address stops responding, and periodically
    # refresh discovery so a changed Connector port/IP can be picked up.
    base_url = discover_connector_url()
    if not base_url:
        return {"error": "Sentinal Connector not found. Start it or set SENTINAL_CONNECTOR_URL."}

    try:
        with urlopen(base_url + endpoint, timeout=2) as response:
            data = response.read()
        return json.loads(data.decode("utf-8"))
    except (URLError, TimeoutError, ValueError, OSError) as error:
        print(f"[DASHBOARD] Connector at {base_url} failed: {error}; rediscovering...")
        discover_connector_url(force=True)
        return {"error": "Unable to connect to Sentinal Connector"}


# ============================================================
# GET REAL APPLICATION EVENTS
# ============================================================

def get_real_application_events():
    """Read telemetry from the Connector, with a fallback to its monitor API."""
    for endpoint in ("/api/v1/events", "/api/v1/application/events"):
        data = get_connector_data(endpoint)
        if isinstance(data, dict):
            events = data.get("events", [])
            if isinstance(events, list) and events:
                return events
            if isinstance(events, list) and not events:
                # Try the alternate endpoint before concluding that storage is empty.
                continue
        elif isinstance(data, dict) and data.get("error"):
            print(f"[DASHBOARD] Event fetch failed at {endpoint}: {data['error']}")
    print("[DASHBOARD] Connector is reachable, but both event endpoints returned no telemetry.")
    return []


def get_registered_applications():
    """Use the Connector's persisted registry, not only event-derived sources."""
    data = get_connector_data("/api/v1/applications")
    if not isinstance(data, dict):
        print(f"[DASHBOARD] Invalid applications response: {data!r}")
        return []
    applications = data.get("applications", [])
    if not isinstance(applications, list):
        print("[DASHBOARD] Connector applications field was not a list.")
        return []
    return applications


def get_real_incidents():
    """Read detections from the active Connector, never a stale backup module."""
    data = get_connector_data("/api/v1/incidents")
    if not isinstance(data, dict) or data.get("error"):
        return []
    incidents = data.get("incidents", [])
    return incidents if isinstance(incidents, list) else []


def _incident_value(item, *keys, default=None):
    for key in keys:
        value = item.get(key)
        if value is not None and value != "":
            return value
    return default


# ============================================================
# BUILD APPLICATION ANALYTICS
# ============================================================

def build_application_dashboard():

    events = get_real_application_events()

    monitor = ApplicationMonitor()

    for event in events:

        monitor.add_event(event)

    return monitor.dashboard_data()


# ============================================================
# GLOBAL STATUS
# ============================================================

@app.get("/api/status")
def sentinal_status():

    # Get real connector events instead of using
    # the dashboard process' separate in-memory list.

    events = get_real_application_events()

    return {

        "sentinal":
            "online",

        "cybi":
            "ready",

        "connector":
            "online",

        "events_received":
            len(events),

        "active_incidents":
            len(get_real_incidents())
    }


# ============================================================
# HEALTH
# ============================================================

@app.get("/api/health")
def health_check():

    connector = get_connector_data(
        "/health"
    )

    connector_online = (
        isinstance(connector, dict)
        and connector.get("status") is not None
    )

    return {

        "status":
            "healthy",

        "service":
            "Sentinal AI",

        "dashboard":
            "online",

        "cybi":
            "connected",

        "connector":
            "online"
            if connector_online
            else "offline"
    }


# ============================================================
# PAGE 1 — SYSTEM
# ============================================================

@app.get("/api/system")
def system_api():

    data = get_system_info()

    return {

        "timestamp":
            data["timestamp"],

        "cpu":
            data["cpu_usage"],

        "ram":
            data["ram_usage"],

        "ram_used_gb":
            data["ram_used_gb"],

        "ram_available_gb":
            data["ram_available_gb"],

        "ram_total_gb":
            data["ram_total_gb"],

        "disk":
            data["disk_usage"],

        "disk_used_gb":
            data["disk_used_gb"],

        "disk_free_gb":
            data["disk_free_gb"],

        "disk_total_gb":
            data["disk_total_gb"],

        "disk_read_mb_s":
            data["disk_read_mb_s"],

        "disk_write_mb_s":
            data["disk_write_mb_s"],

        "network_sent":
            data["network_sent"],

        "network_received":
            data["network_received"],

        "network_packets_sent":
            data["network_packets_sent"],

        "network_packets_received":
            data["network_packets_received"]
    }


# ============================================================
# PAGE 2 — APPLICATION MONITOR
# ============================================================

@app.get("/api/application")
def application_status():
    """Return real Connector telemetry plus its registered applications."""
    data = build_application_dashboard()
    data["applications"] = get_registered_applications()
    data["total_events"] = len(get_real_application_events())
    data["connector_url"] = discover_connector_url()
    return data


# ============================================================
# RAW APPLICATION EVENTS
# ============================================================

@app.get("/api/application/events")
def application_events():
    events = get_real_application_events()
    return {
        "total": len(events),
        "events": events,
        "connector_url": discover_connector_url(),
        "status": "ok" if events else "waiting_for_telemetry",
    }


# ============================================================
# APPLICATION LOGINS
# ============================================================

@app.get("/api/application/logins")
def application_logins():

    data = build_application_dashboard()

    return data.get(
        "authentication",
        {}
    )


# ============================================================
# APPLICATION REQUESTS
# ============================================================

@app.get("/api/application/requests")
def application_requests():

    data = build_application_dashboard()

    return data.get(
        "requests",
        {}
    )


# ============================================================
# APPLICATION SESSIONS
# ============================================================

@app.get("/api/application/sessions")
def application_sessions():

    data = build_application_dashboard()

    return data.get(
        "sessions",
        {}
    )


# ============================================================
# APPLICATION ERRORS
# ============================================================

@app.get("/api/application/errors")
def application_errors():

    data = build_application_dashboard()

    return data.get(
        "errors",
        {}
    )


# ============================================================
# SOURCE IP ANALYSIS
# ============================================================

@app.get("/api/application/source-ips")
def application_source_ips():

    data = build_application_dashboard()

    return data.get(
        "source_ips",
        {}
    )




# ============================================================
# REAL SOURCE-IP GEOLOCATION FOR APPLICATION MAP
# ============================================================

_GEO_CACHE = {}
_GEO_CACHE_TTL = 24 * 60 * 60
_GEO_NEGATIVE_CACHE_TTL = 10 * 60
_GEO_MAX_IPS_PER_REFRESH = 20


def _event_source_ip(event):
    """Extract a valid IP address from real application telemetry."""
    for key in (
        "source_ip",
        "client_ip",
        "remote_ip",
        "remote_addr",
        "ip",
    ):
        value = event.get(key)

        if not isinstance(value, str) or not value.strip():
            continue

        candidate = value.split(",")[0].strip()

        try:
            return str(ipaddress.ip_address(candidate))
        except ValueError:
            continue

    return None


def _is_public_ip(value):
    """Return True only for globally routable IP addresses."""
    try:
        return ipaddress.ip_address(value).is_global
    except ValueError:
        return False


def _geo_provider_ipwho(ip):
    """Look up approximate city-level location using ipwho.is."""
    request = URLRequest(
        f"https://ipwho.is/{ip}",
        headers={
            "User-Agent": "Sentinal-AI-Dashboard/1.0",
            "Accept": "application/json",
        },
    )

    with urlopen(request, timeout=3) as response:
        payload = json.loads(
            response.read().decode("utf-8", errors="replace")
        )

    if not payload.get("success", False):
        return None

    location = payload.get("latitude")
    longitude = payload.get("longitude")

    if location is None or longitude is None:
        return None

    return {
        "source_ip": ip,
        "ip": ip,
        "lat": float(location),
        "lon": float(longitude),
        "latitude": float(location),
        "longitude": float(longitude),
        "city": payload.get("city"),
        "region": payload.get("region"),
        "country": payload.get("country"),
        "country_code": payload.get("country_code"),
        "org": (
            payload.get("connection", {}).get("isp")
            if isinstance(payload.get("connection"), dict)
            else None
        ),
        "provider": "ipwho.is",
        "approximate": True,
    }


def _geo_provider_ipapi(ip):
    """Fallback city-level lookup using ipapi.co."""
    request = URLRequest(
        f"https://ipapi.co/{ip}/json/",
        headers={
            "User-Agent": "Sentinal-AI-Dashboard/1.0",
            "Accept": "application/json",
        },
    )

    with urlopen(request, timeout=3) as response:
        payload = json.loads(
            response.read().decode("utf-8", errors="replace")
        )

    latitude = payload.get("latitude")
    longitude = payload.get("longitude")

    if payload.get("error") or latitude is None or longitude is None:
        return None

    return {
        "source_ip": ip,
        "ip": ip,
        "lat": float(latitude),
        "lon": float(longitude),
        "latitude": float(latitude),
        "longitude": float(longitude),
        "city": payload.get("city"),
        "region": payload.get("region"),
        "country": payload.get("country_name"),
        "country_code": payload.get("country_code"),
        "org": payload.get("org"),
        "provider": "ipapi.co",
        "approximate": True,
    }


def _lookup_public_ip_geo(ip):
    """
    Resolve a public IP using two providers.

    Successful lookups are cached for 24 hours.
    Failed lookups are cached for 10 minutes.
    """
    now = time.time()

    cached = _GEO_CACHE.get(ip)

    if cached and now - cached["cached_at"] < cached["ttl"]:
        return cached["data"]

    if not _is_public_ip(ip):
        return None

    result = None

    providers = (
        ("ipwho.is", _geo_provider_ipwho),
        ("ipapi.co", _geo_provider_ipapi),
    )

    for provider_name, lookup_function in providers:
        try:
            result = lookup_function(ip)

            if result:
                print(
                    f"[GEO] Resolved {ip}: "
                    f"{result.get('city') or 'Unknown city'}, "
                    f"{result.get('region') or 'Unknown region'}, "
                    f"{result.get('country') or 'Unknown country'} "
                    f"({provider_name})"
                )
                break

        except Exception as error:
            print(
                f"[GEO] {provider_name} lookup failed for "
                f"{ip}: {error}"
            )

    ttl = (
        _GEO_CACHE_TTL
        if result
        else _GEO_NEGATIVE_CACHE_TTL
    )

    _GEO_CACHE[ip] = {
        "data": result,
        "cached_at": now,
        "ttl": ttl,
    }

    return result


@app.get("/api/application/geo")
def application_geo():
    """
    Return approximate geographic locations for public source IPs
    observed in real Connector telemetry.
    """
    events = get_real_application_events()
    grouped = {}

    for event in events:
        if not isinstance(event, dict):
            continue

        source_ip = _event_source_ip(event)

        if not source_ip:
            continue

        row = grouped.setdefault(
            source_ip,
            {
                "source_ip": source_ip,
                "ip": source_ip,
                "count": 0,
                "failed_count": 0,
                "last_seen": None,
            },
        )

        row["count"] += 1

        event_name = str(
            event.get("event_type")
            or event.get("event")
            or event.get("type")
            or ""
        ).lower()

        if any(
            word in event_name
            for word in (
                "fail",
                "error",
                "blocked",
                "suspicious",
            )
        ):
            row["failed_count"] += 1

        row["last_seen"] = (
            event.get("received_at")
            or event.get("timestamp")
            or row["last_seen"]
        )

    candidates = sorted(
        grouped.values(),
        key=lambda item: item["count"],
        reverse=True,
    )

    locations = []
    unresolved = []

    for row in candidates[:_GEO_MAX_IPS_PER_REFRESH]:

        if not _is_public_ip(row["source_ip"]):
            unresolved.append(
                {
                    **row,
                    "reason": (
                        "Private/local IP has no public "
                        "geographic location"
                    ),
                }
            )
            continue

        geo = _lookup_public_ip_geo(row["source_ip"])

        if geo:
            locations.append({**row, **geo})
        else:
            unresolved.append(
                {
                    **row,
                    "reason": (
                        "Both geolocation providers failed "
                        "or could not determine a location"
                    ),
                }
            )

    return {
        "status": (
            "ok"
            if locations
            else "no_geolocated_public_ips"
        ),
        "provider": "ipwho.is with ipapi.co fallback",
        "approximate_locations": True,
        "total_source_ips": len(grouped),
        "mapped_source_ips": len(locations),
        "sources": locations,
        "locations": locations,
        "geo": locations,
        "unresolved": unresolved,
    }


# ============================================================
# USERNAME ANALYSIS
# ============================================================

@app.get("/api/application/usernames")
def application_usernames():

    data = build_application_dashboard()

    return data.get(
        "usernames",
        {}
    )


# ============================================================
# HTTP STATUS DISTRIBUTION
# ============================================================

@app.get("/api/application/distribution")
def application_distribution():

    data = build_application_dashboard()

    return data.get(
        "status_distribution",
        {}
    )


# ============================================================
# APPLICATION ANALYTICS
# ============================================================

@app.get("/api/application/analytics")
def application_analytics():

    return build_application_dashboard()


# ============================================================
# AUTHENTICATION GRAPH DATA
# ============================================================

@app.get("/api/application/authentication-series")
def authentication_series():

    data = build_application_dashboard()

    return {

        "series":
            data.get(
                "authentication_series",
                []
            )
    }


# ============================================================
# REQUEST GRAPH DATA
# ============================================================

@app.get("/api/application/request-series")
def request_series():

    data = build_application_dashboard()

    return {

        "series":
            data.get(
                "request_series",
                []
            )
    }


# ============================================================
# SESSION GRAPH DATA
# ============================================================

@app.get("/api/application/session-series")
def session_series():

    data = build_application_dashboard()

    return {

        "series":
            data.get(
                "session_series",
                []
            )
    }


# ============================================================
# RESPONSE TIME GRAPH DATA
# ============================================================

@app.get("/api/application/response-time")
def response_time_series():

    data = build_application_dashboard()

    return {

        "series":
            data.get(
                "response_time_series",
                []
            )
    }


# ============================================================
# EVENT TIMELINE
# ============================================================

@app.get("/api/application/timeline")
def application_timeline():

    data = build_application_dashboard()

    return {

        "events":
            data.get(
                "event_timeline",
                []
            )
    }


# ============================================================
# APPLICATION HEALTH
# ============================================================

@app.get("/api/application/health-series")
def application_health_series():

    data = build_application_dashboard()

    return {

        "series":
            data.get(
                "health_series",
                []
            )
    }


# ============================================================
# CONNECTED APPLICATIONS
# ============================================================

@app.get("/api/application/apps")
def connected_applications():
    # Registered applications must remain visible even before the next event.
    applications = get_registered_applications()
    events = get_real_application_events()
    last_event_by_app = {}
    for event in events:
        app_id = event.get("application_id")
        if app_id:
            last_event_by_app[app_id] = event.get("received_at") or event.get("timestamp")
    for application in applications:
        app_id = application.get("application_id")
        if app_id in last_event_by_app:
            application["dashboard_last_event"] = last_event_by_app[app_id]
    return {"applications": applications, "total": len(applications)}


# ============================================================
# PAGE 3 — SECURITY
# ============================================================

@app.get("/api/security")
def security_analysis():

    incidents = get_real_incidents()[-100:]

    high = 0
    medium = 0
    low = 0

    brute_force = 0
    traffic_anomaly = 0
    phishing = 0
    suspicious = 0

    for incident in incidents:

        level = str(incident.get(
            "risk_level") or incident.get("severity") or "LOW"
        ).upper()

        threat = incident.get(
            "threat",
            ""
        ).lower()

        # ----------------------------------------------------
        # Risk levels
        # ----------------------------------------------------

        if level == "HIGH":

            high += 1

        elif level == "MEDIUM":

            medium += 1

        else:

            low += 1

        # ----------------------------------------------------
        # Threat categories
        # ----------------------------------------------------

        if "brute" in threat:

            brute_force += 1

        elif "traffic" in threat:

            traffic_anomaly += 1

        elif "phishing" in threat:

            phishing += 1

        elif "suspicious" in threat:

            suspicious += 1

    real_events = get_real_application_events()

    return {

        "total_events":
            len(real_events),

        "active_incidents":
            len(get_real_incidents()),

        "risk": {

            "high":
                high,

            "medium":
                medium,

            "low":
                low
        },

        "threats": {

            "brute_force":
                brute_force,

            "traffic_anomaly":
                traffic_anomaly,

            "phishing":
                phishing,

            "suspicious_activity":
                suspicious
        },

        "incidents":
            incidents
    }


# ============================================================
# INCIDENTS
# ============================================================

@app.get("/api/incidents")
def get_incidents():
    incidents = get_real_incidents()
    return {"total": len(incidents), "incidents": incidents[-100:], "source": "live_connector"}


@app.get("/api/incidents/{incident_index}")
def get_incident(
    incident_index: int
):

    incidents = get_real_incidents()

    if (
        incident_index < 0
        or incident_index >= len(incidents)
    ):

        raise HTTPException(
            status_code=404,
            detail="Incident not found"
        )

    return incidents[
        incident_index
    ]


# ============================================================
# PAGE 3 — PHISHING ANALYZER
# ============================================================

@app.post("/api/phishing")
async def phishing_analysis(
    request: Request
):

    try:

        body = await request.json()

        url = body.get(
            "url",
            ""
        ).strip()

        if not url:

            return {

                "url":
                    "",

                "risk_score":
                    0,

                "risk_level":
                    "LOW",

                "classification":
                    "INVALID",

                "evidence": [

                    "Please enter a URL to analyze."
                ],

                "cybi_analysis":
                    ""
            }

                # ----------------------------------------------------
        # URL ANALYZER
        # ----------------------------------------------------

        print("\n[PHISHING] URL received:", url)

        result = analyze_url(url)

        print("[PHISHING] Analyzer result:", result)

        # ----------------------------------------------------
        # RISK ENGINE
        # ----------------------------------------------------

        security_event = assess_event(
            result
        )

        risk_score = security_event.get(
            "risk_score",
            0
        )

        risk_level = security_event.get(
            "risk_level",
            "LOW"
        )

        classification = security_event.get(
            "classification",
            "UNKNOWN"
        )

        evidence = security_event.get(
            "evidence",
            []
        )

        # ----------------------------------------------------
        # CYBI ANALYSIS
        # ----------------------------------------------------

        question = f"""
You are Cybi, the AI cybersecurity analyst
of Sentinal AI.

Perform a full security analysis of this
phishing URL investigation.

URL:
{url}

Risk Score:
{risk_score}/100

Risk Level:
{risk_level}

Classification:
{classification}

Evidence:
{evidence}

Analyze the incident using:

1. OBSERVATION
2. EVIDENCE
3. ASSESSMENT
4. THREAT TYPE
5. RISK
6. CONFIDENCE
7. POTENTIAL IMPACT
8. RECOMMENDATION
9. DECISION

Explain why the URL received this risk score.

Do not claim that an action was executed
unless Sentinal AI actually executed it.
"""

        try:

            cybi_analysis = run_Cybi(
                question,
                "sentinal_phishing_analysis"
            )

        except Exception as error:

            cybi_analysis = (
                "Cybi analysis failed: "
                + str(error)
            )

        return {

            "url":
                url,

            "risk_score":
                risk_score,

            "risk_level":
                risk_level,

            "classification":
                classification,

            "evidence":
                evidence,

            "cybi_analysis":
                cybi_analysis
        }

    except Exception as error:

        print("=" * 60)
        print("PHISHING ANALYSIS ERROR")
        print("=" * 60)
        print(error)
        print("=" * 60)

        return {

            "url":
                "",

            "risk_score":
                0,

            "risk_level":
                "ERROR",

            "classification":
                "ERROR",

            "evidence": [

                f"Analyzer error: {str(error)}"
            ],

            "cybi_analysis":
                ""
        }


# ============================================================
# PAGE 4 — CYBI AI ANALYST
# ============================================================

@app.get("/api/cybi")
def cybi_status():

    return {

        "name":
            "Cybi",

        "role":
            "AI Cybersecurity Analyst",

        "status":
            "ready" if any(os.getenv(key) for key in ("GROQ_API_KEY", "OPENAI_API_KEY", "OPENROUTER_API_KEY")) else "telemetry_only",

        "provider":
            "configured" if any(os.getenv(key) for key in ("GROQ_API_KEY", "OPENAI_API_KEY", "OPENROUTER_API_KEY")) else "not_configured",

        "analyzed_incidents":
            len(get_real_incidents()),

        "capabilities": [

            "Login analysis",

            "Brute-force analysis",

            "Traffic anomaly analysis",

            "Phishing analysis",

            "Threat correlation",

            "Risk assessment",

            "Incident investigation",

            "Response recommendation",

            "Report generation"
        ]
    }


# ============================================================
# CYBI — ANALYZE INCIDENT
# ============================================================

@app.post("/api/cybi/analyze")
async def cybi_analyze(request: Request):
    """Analyze a selected real incident or summarize current real telemetry."""
    try:
        body = await request.json()
        incident = body.get("incident")
        question = str(body.get("question") or "").strip()

        if not incident:
            current_incidents = get_real_incidents()
            incident = current_incidents[-1] if current_incidents else None

        events = get_real_application_events()
        if not incident and not events:
            return {
                "status": "error",
                "analyst": "Cybi",
                "message": "No live Connector events or recorded incidents are available yet.",
                "analysis": "I cannot analyse live activity because the Connector has not returned any telemetry. Check the Hanu connector and Sentinal Connector event endpoint."
            }

        if incident:
            context = {
                "incident_id": _incident_value(incident, "incident_id", "id", default="Not recorded"),
                "threat": _incident_value(incident, "threat", "type", "title", default="Unclassified"),
                "application": _incident_value(incident, "application_name", "application", "source", default="Unknown"),
                "source_ip": _incident_value(incident, "source_ip", default="Not recorded"),
                "username": _incident_value(incident, "username", default="Not recorded"),
                "target": _incident_value(incident, "target", "path", default="Not recorded"),
                "risk_score": _incident_value(incident, "risk_score", default=None),
                "risk_level": _incident_value(incident, "risk_level", "severity", default="Not recorded"),
                "evidence": _incident_value(incident, "evidence", "details", default=[]),
                "attempt_count": _incident_value(incident, "attempt_count", "failed_attempts", default="Not recorded"),
                "detected_at": _incident_value(incident, "detected_at", "timestamp", "created_at", default="Not recorded"),
            }
            context_text = json.dumps(context, ensure_ascii=False, default=str)
        else:
            context_text = json.dumps({
                "mode": "live_telemetry_summary",
                "total_events_available": len(events),
                "recent_events": events[-30:],
                "note": "No confirmed incident object was returned. Do not invent a threat or risk score."
            }, ensure_ascii=False, default=str)

        prompt = f"""
You are Cybi, the cybersecurity analyst of Sentinal AI.
Use only the live telemetry / incident context below. Separate observed facts from inference.
Never invent source IPs, usernames, timestamps, event counts, risk scores, or completed response actions.
If a field is missing, say it was not recorded. If there is no confirmed incident, say so clearly.
Recommend defensive actions only; do not claim an action was executed.

LIVE SENTINAL CONTEXT:
{context_text}

USER QUESTION:
{question or "Analyse the latest live telemetry and provide observations, evidence, risk (only if recorded), uncertainty, and safe recommendations."}

Return:
1. Observed facts
2. Evidence and correlation
3. Assessment and confidence (clearly label inference)
4. Risk (only if a score exists in the context)
5. Potential impact
6. Safe recommended next steps
7. What additional telemetry would help
"""
        answer = run_Cybi(prompt, "sentinal_cybi_live_investigation")
        return {"status": "success", "analyst": "Cybi", "analysis": answer, "source": "live_connector"}
    except Exception as error:
        return {"status": "error", "analyst": "Cybi", "analysis": "Cybi analysis failed: " + str(error)}


@app.get("/api/cybi/investigation")
def cybi_investigation():
    incidents = get_real_incidents()
    return {
        "active": bool(incidents),
        "incident": incidents[-1] if incidents else None,
        "source": "live_connector"
    }


@app.get("/api/cybi/live-context")
def cybi_live_context():
    events = get_real_application_events()
    incidents = get_real_incidents()
    analytics = build_application_dashboard()
    from datetime import datetime, timezone
    return {
        "source": "live_connector",
        "connector_url": discover_connector_url(),
        "total_events": len(events),
        "event_count": len(events),
        "incidents": incidents[-100:],
        "incident_count": len(incidents),
        "latest_event": events[-1] if events else None,
        "events": events[-100:],
        "overview": analytics.get("overview", {}),
        "updated_at": datetime.now(timezone.utc).isoformat()
    }


# ============================================================
# EVENT TIMELINE
# ============================================================

@app.get("/api/security/timeline")
def security_timeline():

    events = get_real_application_events()

    return {

        "events":
            events[-100:],

        "total":
            len(events)
    }