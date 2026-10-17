def calculate_risk(score: int) -> dict:
    """
    Convert a numerical risk score into a risk level.
    """

    # Make sure score stays between 0 and 100
    score = max(0, min(score, 100))

    if score >= 80:
        level = "HIGH"

    elif score >= 50:
        level = "MEDIUM"

    else:
        level = "LOW"

    return {
        "risk_score": score,
        "risk_level": level
    }


def assess_event(event: dict) -> dict:
    """
    Add a standardized risk assessment to a security event.
    """

    score = event.get("risk_score", 0)

    risk = calculate_risk(score)

    result = event.copy()

    result["risk_score"] = risk["risk_score"]
    result["risk_level"] = risk["risk_level"]

    return result


# -----------------------------------------------------
# TEST
# -----------------------------------------------------

if __name__ == "__main__":

    print("========== RISK ENGINE ==========")

    test_scores = [
        10,
        35,
        55,
        75,
        90
    ]

    for score in test_scores:

        result = calculate_risk(score)

        print(
            f"Score: {result['risk_score']}/100 "
            f"→ {result['risk_level']}"
        )

    print("=================================")