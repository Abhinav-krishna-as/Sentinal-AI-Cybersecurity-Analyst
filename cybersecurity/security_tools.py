from .server_monitor import get_system_info


def system_status():
    """
    Get the current CPU, memory and disk usage.
    """

    return get_system_info()