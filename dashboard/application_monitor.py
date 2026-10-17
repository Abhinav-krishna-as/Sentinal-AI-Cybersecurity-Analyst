from collections import Counter
from datetime import datetime, timezone


class ApplicationMonitor:

    def __init__(self, max_events=1000):
        self.max_events = max_events
        self.events = []

    # =========================================================
    # EVENT INGESTION
    # =========================================================

    def add_event(self, event):
        """
        Store a real telemetry event received from
        an external application.
        """

        if not isinstance(event, dict):
            return

        self.events.append(event)

        if len(self.events) > self.max_events:
            self.events = self.events[-self.max_events:]

    # =========================================================
    # GET RAW EVENTS
    # =========================================================

    def get_events(self):
        return list(self.events)

    # =========================================================
    # TIMESTAMP
    # =========================================================

    def _event_time(self, event):

        details = self._details(event)
        timestamp = (
            event.get("received_at")
            or event.get("timestamp")
            or event.get("event_time")
            or event.get("created_at")
            or details.get("timestamp")
            or details.get("received_at")
        )

        if not timestamp:
            return None

        try:

            timestamp = timestamp.replace("Z", "+00:00")

            dt = datetime.fromisoformat(timestamp)

            if dt.tzinfo is None:
                dt = dt.replace(tzinfo=timezone.utc)

            return dt

        except Exception:
            return None

    def _is_http_request(self, event):
        """Recognize both legacy `request` and SDK `http_request` telemetry."""
        return event.get("event") in ("request", "http_request")

    def _details(self, event):
        details = event.get("details")
        return details if isinstance(details, dict) else {}

    def _first_value(self, event, *keys):
        """Find a non-empty telemetry field at top-level or inside details."""
        details = self._details(event)
        for key in keys:
            value = event.get(key)
            if value is None or value == "":
                value = details.get(key)
            if value is not None and value != "":
                return value
        return None

    def _username(self, event):
        return self._first_value(
            event, "username", "user_name", "user", "account", "email"
        )

    def _session_key(self, event):
        return self._first_value(
            event, "session_id", "session", "session_key", "sid"
        )

    def _status_code(self, event):
        value = self._details(event).get("status_code")
        try:
            return int(value) if value is not None else None
        except (TypeError, ValueError):
            return None

    def _response_time_ms(self, event):
        details = self._details(event)
        value = details.get("duration_ms")
        if value is None:
            value = details.get("response_time")
        try:
            return float(value) if value is not None else None
        except (TypeError, ValueError):
            return None

    # =========================================================
    # APPLICATIONS
    # =========================================================

    def connected_applications(self):

        applications = {}

        for event in self.events:

            source = event.get("source")

            if not source:
                continue

            details = event.get("details") or {}

            application = (
                details.get("application")
                or source
            )

            application_id = (
                details.get("application_id")
                or "UNKNOWN"
            )

            if application not in applications:

                applications[application] = {
                    "application": application,
                    "application_id": application_id,
                    "events": 0,
                    "last_event": None
                }

            applications[application]["events"] += 1

            event_time = self._event_time(event)

            if event_time:

                current_last = applications[
                    application
                ]["last_event"]

                if (
                    current_last is None
                    or event_time.isoformat()
                    > current_last
                ):

                    applications[
                        application
                    ]["last_event"] = event_time.isoformat()

        return list(applications.values())

    # =========================================================
    # AUTHENTICATION ANALYSIS
    # =========================================================

    def login_analysis(self):
        successful = 0
        failed = 0

        for event in self.events:
            event_type = str(event.get("event") or "").lower()
            if event_type == "login_success":
                successful += 1
                continue
            if event_type == "login_failed":
                failed += 1
                continue

            # Hanu currently emits HTTP request telemetry rather than explicit
            # login_success/login_failed events. Infer login outcomes only for
            # POST /login responses and keep the distinction in the UI/docs.
            if self._is_http_request(event):
                details = self._details(event)
                path = str(event.get("path") or "")
                method = str(details.get("method") or "").upper()
                status = self._status_code(event)
                if path.rstrip("/").lower() == "/login" and method == "POST" and status is not None:
                    if status >= 400:
                        failed += 1
                    elif 200 <= status < 400:
                        successful += 1

        total = successful + failed
        return {
            "successful": successful,
            "failed": failed,
            "total": total,
            "success_rate": round((successful / total) * 100, 2) if total else 0,
            "source": "explicit login events plus inferred POST /login HTTP status outcomes"
        }

    # =========================================================
    # REQUEST ANALYSIS
    # =========================================================

    def request_analysis(self):

        total = 0
        errors = 0

        methods = Counter()
        status_codes = Counter()

        response_times = []

        for event in self.events:

            if not self._is_http_request(event):
                continue

            total += 1

            details = self._details(event)

            method = details.get("method")

            if method:
                methods[str(method).upper()] += 1

            status = details.get("status_code")

            if status is not None:

                try:

                    status = int(status)

                    status_codes[str(status)] += 1

                    if status >= 400:
                        errors += 1

                except (TypeError, ValueError):
                    pass

            response_time = self._response_time_ms(event)

            if response_time is not None:

                try:
                    response_times.append(
                        float(response_time)
                    )

                except (TypeError, ValueError):
                    pass

        average_response_time = (
            round(
                sum(response_times)
                / len(response_times),
                2
            )
            if response_times
            else 0
        )

        return {

            "total": total,

            "errors": errors,

            "successful": max(
                total - errors,
                0
            ),

            "methods": dict(methods),

            "status_codes": dict(status_codes),

            "average_response_time":
                average_response_time
        }

    # =========================================================
    # SESSION ANALYSIS
    # =========================================================

    def session_analysis(self):

        started = 0
        ended = 0
        explicit_session_events = 0
        observed_session_keys = set()

        for event in self.events:
            event_type = str(event.get("event") or "").lower()

            if event_type == "session_started":
                started += 1
                explicit_session_events += 1
            elif event_type == "session_ended":
                ended += 1
                explicit_session_events += 1

            # Count only actual session identifiers as session identities.
            session_key = self._session_key(event)
            if session_key:
                observed_session_keys.add(str(session_key))

        active = max(started - ended, 0)
        lifecycle_available = explicit_session_events > 0
        return {
            "started": started,
            "ended": ended,
            "active": active,
            "explicit_session_events": explicit_session_events,
            "identified_sessions": len(observed_session_keys),
            "lifecycle_available": lifecycle_available,
            "source": (
                "explicit session telemetry; identified sessions are based on session IDs"
                if lifecycle_available else
                "request activity only; no session lifecycle telemetry"
            )
        }

    # =========================================================
    # ERROR ANALYSIS
    # =========================================================

    def error_analysis(self):

        errors = []

        for event in self.events:

            if event.get("event") != "error":
                continue

            errors.append(event)

        return {

            "total": len(errors),

            "events": errors[-100:]
        }

    # =========================================================
    # SECURITY ANALYSIS
    # =========================================================

    def security_analysis(self):

        security_events = []

        suspicious_events = []

        for event in self.events:

            event_type = event.get("event")

            if event_type == "security_event":

                security_events.append(event)

            elif event_type == "suspicious_activity":

                suspicious_events.append(event)

        return {

            "security_events":
                len(security_events),

            "suspicious_activity":
                len(suspicious_events),

            "events":
                (
                    security_events
                    + suspicious_events
                )[-100:]
        }

    # =========================================================
    # SOURCE IP ANALYSIS
    # =========================================================

    def source_ip_analysis(self):

        counter = Counter()

        for event in self.events:

            ip = event.get("source_ip")

            if ip:
                counter[ip] += 1

        return dict(counter)

    # =========================================================
    # USERNAME ANALYSIS
    # =========================================================

    def username_analysis(self):

        counter = Counter()

        for event in self.events:

            username = self._username(event)

            if username:
                counter[str(username)] += 1

        return dict(counter)

    # =========================================================
    # STATUS CODE DISTRIBUTION
    # =========================================================

    def status_distribution(self):

        distribution = Counter()

        for event in self.events:

            if not self._is_http_request(event):
                continue

            details = self._details(event)

            status = details.get("status_code")

            if status is None:
                continue

            try:

                status = int(status)

                if 200 <= status < 300:
                    category = "2xx"

                elif 300 <= status < 400:
                    category = "3xx"

                elif 400 <= status < 500:
                    category = "4xx"

                elif 500 <= status < 600:
                    category = "5xx"

                else:
                    category = "other"

                distribution[category] += 1

            except (TypeError, ValueError):
                pass

        return dict(distribution)

    # =========================================================
    # RESPONSE TIME SERIES
    # =========================================================

    def response_time_series(self):
        series = []

        for event in self.events:

            if not self._is_http_request(event):
                continue

            details = self._details(event)

            response_time = self._response_time_ms(event)

            if response_time is None:
                continue

            event_time = self._event_time(event)

            if not event_time:
                continue

            try:

                response_time = float(
                    response_time
                )

            except (TypeError, ValueError):

                continue

            series.append({

                "time":
                    event_time.isoformat(),

                "response_time":
                    response_time,

                "path":
                    event.get("path"),

                "status_code":
                    details.get("status_code")
            })
        return series[-200:]

    # =========================================================
    # AUTHENTICATION TIME SERIES
    # =========================================================

    def authentication_series(self):
        series = []
        for event in self.events:
            event_type = str(event.get("event") or "").lower()
            successful = event_type == "login_success"
            failed = event_type == "login_failed"

            if not (successful or failed) and self._is_http_request(event):
                details = self._details(event)
                path = str(event.get("path") or "")
                method = str(details.get("method") or "").upper()
                status = self._status_code(event)
                if path.rstrip("/").lower() == "/login" and method == "POST" and status is not None:
                    failed = status >= 400
                    successful = 200 <= status < 400

            if not (successful or failed):
                continue
            event_time = self._event_time(event)
            if not event_time:
                continue
            series.append({
                "time": event_time.isoformat(),
                "successful": 1 if successful else 0,
                "failed": 1 if failed else 0
            })
        return series[-200:]

    # =========================================================
    # REQUEST TIME SERIES
    # =========================================================

    def request_series(self):
        series = []

        for event in self.events:

            if not self._is_http_request(event):
                continue

            event_time = self._event_time(event)

            if not event_time:
                continue

            details = self._details(event)

            status_code = details.get(
                "status_code"
            )

            try:
                status_code = int(status_code)
            except (TypeError, ValueError):
                status_code = None

            is_error = (
                status_code is not None
                and status_code >= 400
            )

            series.append({

                "time":
                    event_time.isoformat(),

                "requests": 1,

                "errors":
                    1 if is_error else 0,

                "status_code":
                    status_code,

                "path":
                    event.get("path")
            })
        return series[-200:]

    # =========================================================
    # SESSION TIME SERIES
    # =========================================================

    def session_series(self):

        series = []
        active = 0
        has_explicit_session_events = any(
            str(event.get("event") or "").lower()
            in ("session_started", "session_ended")
            for event in self.events
        )

        for event in self.events:
            event_type = str(event.get("event") or "").lower()
            event_time = self._event_time(event)
            if not event_time:
                continue

            if event_type == "session_started":
                active += 1
                series.append({
                    "time": event_time.isoformat(),
                    "started": 1,
                    "ended": 0,
                    "active": active,
                    "source": "session_telemetry"
                })
            elif event_type == "session_ended":
                active = max(active - 1, 0)
                series.append({
                    "time": event_time.isoformat(),
                    "started": 0,
                    "ended": 1,
                    "active": active,
                    "source": "session_telemetry"
                })

        # If the SDK has not emitted session lifecycle events, show a clearly
        # labelled observed-request activity line rather than leaving the panel
        # blank or falsely claiming session starts/ends.
        if not has_explicit_session_events:
            requests = [
                event for event in self.events
                if self._is_http_request(event) and self._event_time(event)
            ]
            buckets = {}
            for event in requests[-200:]:
                event_time = self._event_time(event)
                bucket_time = event_time.replace(second=0, microsecond=0)
                key = bucket_time.isoformat()
                if key not in buckets:
                    buckets[key] = {
                        "time": key,
                        "started": 0,
                        "ended": 0,
                        "active": 0,
                        "requests": 0,
                        "source": "request_activity_proxy"
                    }
                buckets[key]["requests"] += 1
            for point in buckets.values():
                series.append(point)

        series.sort(key=lambda item: item["time"])
        return series[-200:]

    # =========================================================
    # EVENT TIMELINE
    # =========================================================

    def event_timeline(self):

        timeline = []

        for event in self.events:

            event_time = self._event_time(event)

            if not event_time:
                continue

            timeline.append({

                "time":
                    event_time.isoformat(),

                "event":
                    event.get("event"),

                "source":
                    event.get("source"),

                "username":
                    event.get("username"),

                "source_ip":
                    event.get("source_ip"),

                "path":
                    event.get("path")
            })

        return timeline[-200:]

    # =========================================================
    # HEALTH SERIES
    # =========================================================

    def health_series(self):

        series = []

        for event in self.events:

            event_time = self._event_time(event)

            if not event_time:
                continue

            event_type = event.get("event")

            details = event.get("details") or {}

            status_code = details.get(
                "status_code"
            )

            health = "healthy"

            if event_type in (
                "error",
                "security_event",
                "suspicious_activity"
            ):

                health = "warning"

            elif status_code is not None:

                try:

                    if int(status_code) >= 500:
                        health = "critical"

                    elif int(status_code) >= 400:
                        health = "warning"

                except (TypeError, ValueError):
                    pass

            series.append({

                "time":
                    event_time.isoformat(),

                "health":
                    health
            })

        return series[-200:]

    # =========================================================
    # LAST EVENT
    # =========================================================

    def last_event(self):

        if not self.events:
            return None

        return self.events[-1]

    # =========================================================
    # OVERVIEW
    # =========================================================

    def overview(self):

        login = self.login_analysis()

        requests = self.request_analysis()

        sessions = self.session_analysis()

        errors = self.error_analysis()

        security = self.security_analysis()

        applications = (
            self.connected_applications()
        )

        return {

            "total_events":
                len(self.events),

            "applications":
                len(applications),

            "application_list":
                applications,

            "logins":
                login,

            "requests":
                requests,

            "sessions":
                sessions,

            "errors":
                errors["total"],

            "security_events":
                security["security_events"],

            "suspicious_activity":
                security[
                    "suspicious_activity"
                ],

            "last_event":
                self.last_event()
        }

    # =========================================================
    # COMPLETE DASHBOARD DATA
    # =========================================================

    def dashboard_data(self):

        return {

            "overview":
                self.overview(),

            "authentication":
                self.login_analysis(),

            "requests":
                self.request_analysis(),

            "sessions":
                self.session_analysis(),

            "errors":
                self.error_analysis(),

            "security":
                self.security_analysis(),

            "source_ips":
                self.source_ip_analysis(),

            "usernames":
                self.username_analysis(),

            "status_distribution":
                self.status_distribution(),

            "authentication_series":
                self.authentication_series(),

            "request_series":
                self.request_series(),

            "session_series":
                self.session_series(),

            "response_time_series":
                self.response_time_series(),

            "event_timeline":
                self.event_timeline(),

            "health_series":
                self.health_series(),

            "applications":
                self.connected_applications()
        }


# =============================================================
# GLOBAL MONITOR
# =============================================================

application_monitor = ApplicationMonitor()
