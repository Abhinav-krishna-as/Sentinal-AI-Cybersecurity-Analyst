from datetime import datetime


def execute_action(
    action: str,
    target: str | None = None,
    dry_run: bool = True
) -> dict:
    """
    Execute a controlled security response.

    Prototype mode:
    dry_run=True means the action is only simulated.
    Nothing is actually blocked, deleted, or disabled.
    """

    timestamp = datetime.now().isoformat()

    # -------------------------------------------------
    # AVAILABLE PROTOTYPE ACTIONS
    # -------------------------------------------------

    allowed_actions = [
        "block_ip",
        "force_logout",
        "disable_account",
        "rate_limit",
        "create_alert"
    ]

    # -------------------------------------------------
    # CHECK ACTION
    # -------------------------------------------------

    if action not in allowed_actions:

        return {
            "status": "REJECTED",
            "action": action,
            "target": target,
            "message": "Action is not allowed",
            "timestamp": timestamp
        }

    # -------------------------------------------------
    # DRY RUN
    # -------------------------------------------------

    if dry_run:

        return {
            "status": "SIMULATED",
            "action": action,
            "target": target,
            "message": (
                f"Prototype action '{action}' "
                f"would be executed on '{target}'"
            ),
            "timestamp": timestamp
        }

    # -------------------------------------------------
    # REAL ACTION PLACEHOLDER
    # -------------------------------------------------

    # IMPORTANT:
    # We are NOT performing real network/system changes
    # in this prototype yet.

    return {
        "status": "PENDING",
        "action": action,
        "target": target,
        "message": (
            "Action approved but real execution "
            "is not enabled in the prototype"
        ),
        "timestamp": timestamp
    }


# -----------------------------------------------------
# TEST
# -----------------------------------------------------

if __name__ == "__main__":

    print("========== SENTINAL RESPONSE ENGINE ==========")

    result = execute_action(
        action="block_ip",
        target="192.168.1.50",
        dry_run=True
    )

    print(f"Status : {result['status']}")
    print(f"Action : {result['action']}")
    print(f"Target : {result['target']}")
    print(f"Message: {result['message']}")

    print("==============================================")