from urllib.parse import urlparse
import ipaddress
import re


def analyze_url(url: str) -> dict:
    """
    Analyze a URL using simple phishing indicators.

    This is a prototype analyzer. It does not visit or attack the website.
    """

    url = url.strip()

    if not url:
        return {
            "status": "error",
            "message": "URL is required"
        }

    # Add scheme if user doesn't provide one
    if not re.match(r"^https?://", url, re.IGNORECASE):
        url = "https://" + url

    parsed = urlparse(url)

    hostname = parsed.hostname or ""

    evidence = []
    risk_score = 0

    # -------------------------------------------------
    # 1. HTTPS CHECK
    # -------------------------------------------------

    if parsed.scheme != "https":
        risk_score += 15
        evidence.append("Website does not use HTTPS")

    # -------------------------------------------------
    # 2. IP ADDRESS CHECK
    # -------------------------------------------------

    try:
        ipaddress.ip_address(hostname)

        risk_score += 25
        evidence.append(
            "Website uses an IP address instead of a domain name"
        )

    except ValueError:
        pass

    # -------------------------------------------------
    # 3. @ SYMBOL CHECK
    # -------------------------------------------------

    if "@" in url:
        risk_score += 20
        evidence.append(
            "URL contains an @ symbol"
        )

    # -------------------------------------------------
    # 4. VERY LONG URL
    # -------------------------------------------------

    if len(url) > 100:
        risk_score += 10
        evidence.append(
            "URL is unusually long"
        )

    # -------------------------------------------------
    # 5. SUSPICIOUS WORDS
    # -------------------------------------------------

    suspicious_words = [
        "login",
        "signin",
        "verify",
        "verification",
        "secure",
        "account",
        "update",
        "password",
        "bank",
        "confirm"
    ]

    found_words = []

    for word in suspicious_words:

        if word in url.lower():
            found_words.append(word)

    if found_words:

        risk_score += min(
            20,
            len(found_words) * 5
        )

        evidence.append(
            "Security-related keywords found: "
            + ", ".join(found_words)
        )

    # -------------------------------------------------
    # 6. TOO MANY SUBDOMAINS
    # -------------------------------------------------

    if hostname.count(".") >= 3:

        risk_score += 10

        evidence.append(
            "Domain contains multiple subdomain levels"
        )

    # -------------------------------------------------
    # LIMIT SCORE
    # -------------------------------------------------

    risk_score = min(
        risk_score,
        100
    )

    # -------------------------------------------------
    # CLASSIFICATION
    # -------------------------------------------------

    if risk_score >= 70:

        classification = "PHISHING"

    elif risk_score >= 40:

        classification = "SUSPICIOUS"

    else:

        classification = "LOW RISK"

    # -------------------------------------------------
    # NO STRONG EVIDENCE
    # -------------------------------------------------

    if not evidence:

        evidence.append(
            "No strong phishing indicators detected"
        )

    # -------------------------------------------------
    # RETURN RESULT
    # -------------------------------------------------

    return {

        "analyzer": "Phishing Analyzer",

        "url": url,

        "risk_score": risk_score,

        "classification": classification,

        "evidence": evidence
    }


# -----------------------------------------------------
# TEST
# -----------------------------------------------------

if __name__ == "__main__":

    test_url = input(
        "Enter URL to analyze: "
    )

    result = analyze_url(test_url)

    print("\n========== PHISHING ANALYSIS ==========")

    print(
        f"URL            : {result['url']}"
    )

    print(
        f"Risk Score     : {result['risk_score']}/100"
    )

    print(
        f"Classification  : {result['classification']}"
    )

    print("\nEvidence:")

    for item in result["evidence"]:

        print(
            f" - {item}"
        )

    print(
        "======================================="
    )