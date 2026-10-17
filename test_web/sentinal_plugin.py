import json
import urllib.request
import urllib.error


# =====================================================
# SENTINAL CONFIGURATION
# =====================================================

SENTINAL_URL = "http://127.0.0.1:9000"

SENTINAL_API_KEY = "sentinal-demo-key"


# =====================================================
# SEND SECURITY EVENT TO SENTINAL
# =====================================================

def send_security_event(
    event,
    username=None,
    source_ip=None,
    path=None,
    details=None
):

    data = {

        "source": "test_web",

        "event": event,

        "username": username,

        "source_ip": source_ip,

        "path": path,

        "details": details or {}
    }


    # Convert Python dictionary → JSON

    json_data = json.dumps(data).encode("utf-8")


    # Sentinal API endpoint

    url = f"{SENTINAL_URL}/api/v1/events"


    # HTTP request

    request = urllib.request.Request(

        url,

        data=json_data,

        headers={
            "Content-Type": "application/json",
            "X-Sentinal-API-Key": SENTINAL_API_KEY
        },

        method="POST"
    )


    try:

        with urllib.request.urlopen(
            request,
            timeout=10
        ) as response:

            response_data = response.read().decode(
                "utf-8"
            )

            return json.loads(response_data)


    except urllib.error.HTTPError as error:

        print(
            f"Sentinal HTTP Error: {error.code}"
        )

        return None


    except urllib.error.URLError as error:

        print(
            f"Could not connect to Sentinal: {error}"
        )

        return None


# =====================================================
# LOGIN FAILED EVENT
# =====================================================

def login_failed(
    username,
    source_ip
):

    return send_security_event(

        event="login_failed",

        username=username,

        source_ip=source_ip,

        path="/login"
    )


# =====================================================
# LOGIN SUCCESS EVENT
# =====================================================

def login_success(
    username,
    source_ip
):

    return send_security_event(

        event="login_success",

        username=username,

        source_ip=source_ip,

        path="/login"
    )


# =====================================================
# SUSPICIOUS ACTIVITY EVENT
# =====================================================

def suspicious_activity(
    username=None,
    source_ip=None,
    path=None,
    details=None
):

    return send_security_event(

        event="suspicious_activity",

        username=username,

        source_ip=source_ip,

        path=path,

        details=details
    )