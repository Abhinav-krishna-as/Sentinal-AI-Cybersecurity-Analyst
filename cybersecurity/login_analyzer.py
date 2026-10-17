from collections import defaultdict
from datetime import datetime, timedelta


# Store failed login attempts
failed_attempts = defaultdict(list)


def analyze_login(
    username: str,
    source_ip: str,
    success: bool
) -> dict:
    """
    Analyze login activity.

    Prototype rules:
    - Successful login → normal activity
    - 1–3 failures → low risk
    - 4–7 failures → medium risk
    - 8+ failures → high risk / possible brute force
    """

    now = datetime.now()

    # -------------------------------------------------
    # SUCCESSFUL LOGIN
    # -------------------------------------------------

    if success:

        return {
            "event": "login_success",
            "username": username,
            "source_ip": source_ip,
            "risk_score": 0,
            "risk_level": "LOW",
            "threat": "none",
            "evidence": [
                "Successful login detected"
            ]
        }

    # -------------------------------------------------
    # FAILED LOGIN
    # -------------------------------------------------

    key = (username, source_ip)

    # Keep only attempts from the last 5 minutes
    failed_attempts[key] = [
        attempt
        for attempt in failed_attempts[key]
        if now - attempt < timedelta(minutes=5)
    ]

    # Add current failed attempt
    failed_attempts[key].append(now)

    attempt_count = len(
        failed_attempts[key]
    )

    # -------------------------------------------------
    # RISK CALCULATION
    # -------------------------------------------------

    if attempt_count >= 8:

        risk_score = 90
        risk_level = "HIGH"
        threat = "possible brute-force attack"

    elif attempt_count >= 4:

        risk_score = 60
        risk_level = "MEDIUM"
        threat = "suspicious login activity"

    else:

        risk_score = 20
        risk_level = "LOW"
        threat = "login failure"

    # -------------------------------------------------
    # EVIDENCE
    # -------------------------------------------------

    evidence = [
        f"{attempt_count} failed login attempt(s) detected",
        f"Username: {username}",
        f"Source IP: {source_ip}",
        "Time window: 5 minutes"
    ]

    # Add stronger evidence for brute force
    if attempt_count >= 8:

        evidence.append(
            "Repeated authentication failures indicate possible brute-force behavior"
        )

    # -------------------------------------------------
    # RESULT
    # -------------------------------------------------

    return {

        "event": "login_failed",

        "username": username,

        "source_ip": source_ip,

        "attempt_count": attempt_count,

        "risk_score": risk_score,

        "risk_level": risk_level,

        "threat": threat,

        "evidence": evidence
    }


# -----------------------------------------------------
# TEST
# -----------------------------------------------------

if __name__ == "__main__":

    print("========== LOGIN ANALYZER ==========")

    username = input(
        "Username: "
    )

    source_ip = input(
        "Source IP: "
    )

    print(
        "\nSimulating failed login attempts..."
    )

    for i in range(8):

        result = analyze_login(
            username,
            source_ip,
            success=False
        )

        print(
            f"\nAttempt {i + 1}"
        )

        print(
            f"Risk: {result['risk_level']}"
        )

        print(
            f"Score: {result['risk_score']}/100"
        )

        print(
            f"Threat: {result['threat']}"
        )

    print(
        "\n===================================="
    )