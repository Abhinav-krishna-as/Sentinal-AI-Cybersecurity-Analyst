import time
import psutil


_previous_disk = None
_previous_disk_time = None


def get_system_info():
    global _previous_disk
    global _previous_disk_time

    # -----------------------------
    # CPU
    # -----------------------------
    cpu_usage = psutil.cpu_percent(interval=0.2)

    # -----------------------------
    # RAM
    # -----------------------------
    memory = psutil.virtual_memory()

    ram_usage = memory.percent
    ram_used_gb = memory.used / (1024 ** 3)
    ram_available_gb = memory.available / (1024 ** 3)
    ram_total_gb = memory.total / (1024 ** 3)

    # -----------------------------
    # DISK
    # -----------------------------
    disk = psutil.disk_usage("/")

    disk_usage = disk.percent
    disk_used_gb = disk.used / (1024 ** 3)
    disk_free_gb = disk.free / (1024 ** 3)
    disk_total_gb = disk.total / (1024 ** 3)

    # -----------------------------
    # DISK I/O
    # -----------------------------
    disk_io = psutil.disk_io_counters()

    now = time.time()

    read_mb_s = 0.0
    write_mb_s = 0.0

    if disk_io is not None:

        current_read = disk_io.read_bytes
        current_write = disk_io.write_bytes

        if _previous_disk is not None:

            elapsed = max(
                now - _previous_disk_time,
                0.001
            )

            read_mb_s = max(
                0,
                current_read - _previous_disk["read"]
            ) / elapsed / (1024 ** 2)

            write_mb_s = max(
                0,
                current_write - _previous_disk["write"]
            ) / elapsed / (1024 ** 2)

        _previous_disk = {
            "read": current_read,
            "write": current_write
        }

        _previous_disk_time = now

    # -----------------------------
    # NETWORK
    # -----------------------------
    network = psutil.net_io_counters()

    # -----------------------------
    # TIME
    # -----------------------------
    timestamp = time.strftime(
        "%H:%M:%S"
    )

    return {
        "timestamp": timestamp,

        "cpu_usage": round(cpu_usage, 2),

        "ram_usage": round(ram_usage, 2),
        "ram_used_gb": round(ram_used_gb, 2),
        "ram_available_gb": round(ram_available_gb, 2),
        "ram_total_gb": round(ram_total_gb, 2),

        "disk_usage": round(disk_usage, 2),
        "disk_used_gb": round(disk_used_gb, 2),
        "disk_free_gb": round(disk_free_gb, 2),
        "disk_total_gb": round(disk_total_gb, 2),

        "disk_read_mb_s": round(read_mb_s, 2),
        "disk_write_mb_s": round(write_mb_s, 2),

        "network_sent": network.bytes_sent,
        "network_received": network.bytes_recv,

        "network_packets_sent": network.packets_sent,
        "network_packets_received": network.packets_recv
    }


if __name__ == "__main__":

    info = get_system_info()

    print("=====================================")
    print("SENTINAL AI SYSTEM MONITOR")
    print("=====================================")

    print(
        f"CPU: {info['cpu_usage']}%"
    )

    print(
        f"RAM: {info['ram_usage']}%"
    )

    print(
        f"RAM Used: {info['ram_used_gb']} GB"
    )

    print(
        f"RAM Available: {info['ram_available_gb']} GB"
    )

    print(
        f"RAM Total: {info['ram_total_gb']} GB"
    )

    print(
        f"Disk: {info['disk_usage']}%"
    )

    print(
        f"Disk Used: {info['disk_used_gb']} GB"
    )

    print(
        f"Disk Free: {info['disk_free_gb']} GB"
    )

    print(
        f"Disk Total: {info['disk_total_gb']} GB"
    )

    print(
        f"Disk Read: {info['disk_read_mb_s']} MB/s"
    )

    print(
        f"Disk Write: {info['disk_write_mb_s']} MB/s"
    )

    print(
        f"Network Sent: {info['network_sent']}"
    )

    print(
        f"Network Received: {info['network_received']}"
    )

    print("=====================================")