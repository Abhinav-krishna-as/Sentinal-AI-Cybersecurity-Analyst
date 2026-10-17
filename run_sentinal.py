import os
import sys
import time
import socket
import subprocess
from pathlib import Path
from urllib.request import urlopen
from urllib.error import URLError

# ============================================================
# SENTINAL AI — CENTRAL SERVICE RUNNER
# ============================================================

ROOT = Path(__file__).resolve().parent
DJANGO_DIR = ROOT / "django_web"

HOST = "127.0.0.1"

DJANGO_PORT = 7001
DASHBOARD_PORT = 8001

# Preserve the existing Connector port setting when configured.
CONNECTOR_PORT = int(
    os.environ.get("SENTINAL_CONNECTOR_PORT", "9001")
)

DJANGO_URL = f"http://{HOST}:{DJANGO_PORT}"
DASHBOARD_URL = f"http://{HOST}:{DASHBOARD_PORT}"
CONNECTOR_URL = f"http://{HOST}:{CONNECTOR_PORT}"

processes = []


# ============================================================
# UTILITIES
# ============================================================

def port_is_open(port):
    """Return True if something is listening on the port."""
    try:
        with socket.create_connection(
            (HOST, port), timeout=0.5
        ):
            return True
    except OSError:
        return False


def wait_for_port(process, name, port, timeout=30):
    """Wait for a service to begin listening."""

    deadline = time.time() + timeout

    while time.time() < deadline:
        if process.poll() is not None:
            raise RuntimeError(
                f"{name} exited with code {process.returncode}."
            )

        if port_is_open(port):
            print(f"[OK] {name} is listening on port {port}.")
            return

        time.sleep(0.5)

    raise RuntimeError(
        f"{name} did not start on port {port} within {timeout}s."
    )


def start_service(name, command, cwd, port, env):
    """Start a service, or reuse an existing listener."""

    if port_is_open(port):
        print(
            f"[INFO] Port {port} is already occupied. "
            f"Reusing the existing listener for {name}; "
            "its identity has not been verified."
        )
        return None

    print(f"[START] {name}")

    process = subprocess.Popen(
        command,
        cwd=str(cwd),
        env=env,
    )

    processes.append(process)

    wait_for_port(process, name, port)
    return process


def stop_services():
    """Stop only processes started by this script."""

    for process in reversed(processes):
        if process.poll() is None:
            print(f"[STOP] PID {process.pid}")
            process.terminate()

            try:
                process.wait(timeout=5)
            except subprocess.TimeoutExpired:
                process.kill()


# ============================================================
# START SENTINAL AI
# ============================================================

def main():
    python = sys.executable

    print("\n" + "=" * 60)
    print("              SENTINAL AI")
    print("           CENTRAL SERVICE RUNNER")
    print("=" * 60)

    required_paths = [
        DJANGO_DIR / "manage.py",
        ROOT / "dashboard" / "app.py",
        ROOT / "connector" / "api.py",
    ]

    for path in required_paths:
        if not path.exists():
            raise FileNotFoundError(
                f"Required project file not found: {path}"
            )

    # --------------------------------------------------------
    # 1. CONNECTOR
    # --------------------------------------------------------

    connector_env = os.environ.copy()
    connector_env["SENTINAL_CONNECTOR_PORT"] = str(
        CONNECTOR_PORT
    )

    start_service(
        name="Sentinal Connector",
        command=[
            python,
            "-m",
            "uvicorn",
            "connector.api:app",
            "--host",
            HOST,
            "--port",
            str(CONNECTOR_PORT),
        ],
        cwd=ROOT,
        port=CONNECTOR_PORT,
        env=connector_env,
    )

    # --------------------------------------------------------
    # 2. DASHBOARD
    # --------------------------------------------------------

    dashboard_env = os.environ.copy()
    dashboard_env["SENTINAL_CONNECTOR_URL"] = CONNECTOR_URL

    start_service(
        name="Sentinal Dashboard",
        command=[
            python,
            "-m",
            "uvicorn",
            "dashboard.app:app",
            "--host",
            HOST,
            "--port",
            str(DASHBOARD_PORT),
        ],
        cwd=ROOT,
        port=DASHBOARD_PORT,
        env=dashboard_env,
    )

    # --------------------------------------------------------
    # 3. DJANGO — MAIN BROWSER ENTRY POINT
    # --------------------------------------------------------

    django_env = os.environ.copy()
    django_env["DJANGO_SETTINGS_MODULE"] = "config.settings"
    django_env["SENTINAL_CONNECTOR_URL"] = CONNECTOR_URL
    django_env["SENTINAL_DASHBOARD_URL"] = DASHBOARD_URL

    start_service(
        name="Sentinal Django",
        command=[
            python,
            "manage.py",
            "runserver",
            f"{HOST}:{DJANGO_PORT}",
        ],
        cwd=DJANGO_DIR,
        port=DJANGO_PORT,
        env=django_env,
    )

    print("\n" + "=" * 60)
    print("          SENTINAL AI IS RUNNING")
    print("=" * 60)
    print(f"Login:     {DJANGO_URL}/")
    print(f"Dashboard: {DJANGO_URL}/dashboard/")
    print(f"Connector: {DJANGO_URL}/connector/")
    print()
    print("Browser-facing port: 7001")
    print("Press CTRL+C to stop services.")
    print("=" * 60)

    try:
        while True:
            for process in processes:
                if process.poll() is not None:
                    raise RuntimeError(
                        f"Service process {process.pid} stopped."
                    )

            time.sleep(1)

    finally:
        stop_services()



# ============================================================
# TERMINAL UI LAYER  (added)
# Everything above and below this section is the original code,
# unchanged. This section only rebinds names at runtime so the
# existing functions render through a professional console.
# ============================================================

import re
import types
import platform
import threading
import textwrap
from datetime import datetime

# ----------------------------------------------------------------------------
# Terminal capabilities
# ----------------------------------------------------------------------------

try:
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
except Exception:
    pass

TTY = sys.stdout.isatty()
COLOR = TTY and not os.environ.get("NO_COLOR")
if COLOR and os.name == "nt":
    os.system("")  # enables ANSI escape processing on Windows 10+

UNICODE = "utf" in (getattr(sys.stdout, "encoding", "") or "").lower()

CYAN = (99, 230, 242)
MINT = (111, 217, 176)
CORAL = (240, 138, 106)
AMBER = (227, 184, 104)
BLUE = (110, 150, 240)
GREY = (122, 140, 150)
WHITE = (225, 236, 240)

RESET = "\x1b[0m"
ANSI_RE = re.compile(r"\x1b\[[0-9;?]*[A-Za-z]")


def fg(rgb, text, bold=False):
    if not COLOR:
        return text
    return f"\x1b[{'1;' if bold else ''}38;2;{rgb[0]};{rgb[1]};{rgb[2]}m{text}{RESET}"


def dim(text):
    return fg(GREY, text)


def bold(text):
    return f"\x1b[1m{text}{RESET}" if COLOR else text


def vlen(s):
    return len(ANSI_RE.sub("", s))


def pad(s, n):
    return s + " " * max(0, n - vlen(s))


def clip(s, n):
    out, cnt, i = [], 0, 0
    while i < len(s):
        m = ANSI_RE.match(s, i)
        if m:
            out.append(m.group())
            i = m.end()
            continue
        if cnt >= n:
            break
        out.append(s[i])
        cnt += 1
        i += 1
    return "".join(out) + (RESET if COLOR else "")


if UNICODE:
    S_OK, S_WARN, S_FAIL, S_DOT, S_STOP, S_ARROW = "✔", "▲", "✘", "●", "■", "›"
    H, V, TL, TR, BL, BR = "─", "│", "╭", "╮", "╰", "╯"
    LOGO = "◈"
    SPIN = "⠋⠙⠹⠸⠼⠴⠦⠧⠇⠏"
else:
    S_OK, S_WARN, S_FAIL, S_DOT, S_STOP, S_ARROW = "+", "!", "x", "*", "#", ">"
    H, V, TL, TR, BL, BR = "-", "|", "+", "+", "+", "+"
    LOGO = "#"
    SPIN = "|/-\\"

WIDTH = 78


def term_width():
    try:
        w = os.get_terminal_size().columns
    except OSError:
        w = WIDTH
    return max(60, min(w - 1, 100))


# ----------------------------------------------------------------------------
# Console: thread-safe output with a live status line pinned to the bottom
# ----------------------------------------------------------------------------

class Console:
    def __init__(self):
        self.lock = threading.RLock()
        self.status_fn = None
        self._shown = False
        self._stop = threading.Event()
        if TTY:
            threading.Thread(target=self._ticker, daemon=True).start()

    def _w(self, s):
        sys.stdout.write(s)
        sys.stdout.flush()

    def _clear(self):
        if self._shown:
            self._w("\r\x1b[2K")
            self._shown = False

    def _draw(self):
        if self.status_fn and TTY:
            self._w(clip(self.status_fn(), term_width()))
            self._shown = True

    def line(self, text=""):
        with self.lock:
            self._clear()
            self._w(text + "\n")
            self._draw()

    def set_status(self, fn):
        with self.lock:
            self._clear()
            self.status_fn = fn
            self._draw()

    def _ticker(self):
        while not self._stop.wait(0.1):
            with self.lock:
                if self.status_fn:
                    self._clear()
                    self._draw()

    def close(self):
        with self.lock:
            self._clear()
            self.status_fn = None
        self._stop.set()


ui = Console()

# ----------------------------------------------------------------------------
# Layout helpers
# ----------------------------------------------------------------------------

def rule(title):
    w = term_width()
    left = f"{H}{H} "
    label = fg(CYAN, title, bold=True)
    fill = H * max(2, w - vlen(left) - vlen(label) - 1)
    ui.line()
    ui.line(dim(left) + label + " " + dim(fill))


def box(title, rows, color=CYAN):
    w = min(term_width(), 76)
    inner = w - 2
    used = 1 + 1 + len(title) + 1  # leading rule, space, title, space
    ui.line(fg(color, TL) + fg(color, H) + " " + fg(color, title, bold=True) + " "
            + fg(color, H * max(1, inner - used)) + fg(color, TR))
    for r in rows:
        ui.line(fg(color, V) + " " + pad(clip(r, inner - 2), inner - 2) + " " + fg(color, V))
    ui.line(fg(color, BL + H * inner + BR))


def kv(label, value, width=11):
    return pad(dim(label), width) + value


def stamp():
    return dim(datetime.now().strftime("%H:%M:%S"))


def fmt_dur(sec):
    sec = int(sec)
    return f"{sec // 3600:02d}:{sec % 3600 // 60:02d}:{sec % 60:02d}"


# ----------------------------------------------------------------------------
# State
# ----------------------------------------------------------------------------

T0 = time.time()
services = []          # dicts: name, port, pid, reused, proc
pid_names = {}
readers = []
_current = {"name": None}
_state = {"running": False, "stopping": False, "ready_at": None}
TAG_COLORS = [AMBER, BLUE, MINT, CYAN]


def short(name):
    return name.replace("Sentinal ", "").lower()


def tag_for(name):
    names = [s["name"] for s in services] or [name]
    idx = names.index(name) if name in names else 0
    return fg(TAG_COLORS[idx % len(TAG_COLORS)], pad(short(name), 9))


# ----------------------------------------------------------------------------
# Header
# ----------------------------------------------------------------------------

def header():
    w = min(term_width(), 76)
    inner = w - 2
    title = f"  {fg(CYAN, LOGO, bold=True)} {fg(WHITE, 'SENTINAL', bold=True)} {fg(CYAN, 'AI', bold=True)}   {dim('CYBER GUARD')}"
    sub = f"  {dim('Central Service Runner')}"
    ui.line()
    ui.line(fg(CYAN, TL + H * inner + TR))
    ui.line(fg(CYAN, V) + pad(title, inner) + fg(CYAN, V))
    ui.line(fg(CYAN, V) + pad(sub, inner) + fg(CYAN, V))
    ui.line(fg(CYAN, BL + H * inner + BR))
    ui.line()
    ui.line("  " + kv("Started", datetime.now().strftime("%Y-%m-%d %H:%M:%S"), 9)
            + "   " + kv("Python", platform.python_version(), 8)
            + "   " + kv("System", f"{platform.system()} {platform.machine()}", 8))
    ui.line("  " + kv("Root", str(ROOT), 9))


def preflight():
    rule("PRE-FLIGHT")
    checks = [
        ("Django project", DJANGO_DIR / "manage.py"),
        ("Dashboard app", ROOT / "dashboard" / "app.py"),
        ("Connector API", ROOT / "connector" / "api.py"),
    ]
    for label, path in checks:
        ok = path.exists()
        try:
            rel = path.relative_to(ROOT)
        except ValueError:
            rel = path
        mark = fg(MINT, S_OK, bold=True) if ok else fg(CORAL, S_FAIL, bold=True)
        ui.line(f"  {mark}  {pad(label, 16)} {dim(str(rel))}")
    rule("STARTING SERVICES")


# ----------------------------------------------------------------------------
# Intercept run_sentinal's print()
# ----------------------------------------------------------------------------

SWALLOW = (
    re.compile(r"^=+$"),
    re.compile(r"^SENTINAL AI$"),
    re.compile(r"^CENTRAL SERVICE RUNNER$"),
    re.compile(r"^(Login|Dashboard|Connector):"),
    re.compile(r"^Browser-facing port"),
    re.compile(r"^Press CTRL\+C"),
    re.compile(r"^\[START\]"),
    re.compile(r"^\[OK\]"),
    re.compile(r"^\[INFO\] Port \d+ is already occupied"),
    re.compile(r"^\[INFO\] Shutting down"),
)


def hooked_print(*args, **kwargs):
    text = kwargs.get("sep", " ").join(str(a) for a in args)
    for raw in text.splitlines():
        line = raw.strip()
        if not line or any(p.search(line) for p in SWALLOW):
            continue
        if line == "SENTINAL AI IS RUNNING":
            show_running()
        elif line.startswith("[STOP]"):
            m = re.search(r"PID (\d+)", line)
            pid = int(m.group(1)) if m else None
            name = pid_names.get(pid, "service")
            ui.line(f"  {fg(AMBER, S_STOP)}  Stopping {pad(name, 18)} {dim(f'PID {pid}')}")
        elif line.startswith("[ERROR]"):
            for t in readers:
                t.join(timeout=1)
            ui.line()
            box("ERROR", [fg(CORAL, l) for l in textwrap.wrap(explain(line[7:].strip()), 70)], color=CORAL)
        else:
            ui.line("  " + dim(line))


# ----------------------------------------------------------------------------
# Service wrappers (start_service / stop_services / subprocess.Popen)
# ----------------------------------------------------------------------------

ANSI_STRIP = ANSI_RE
HTTP_RE = re.compile(r'(".*?"\s+)(\d{3})\b')


def color_log(msg):
    low = msg.lower()
    if "traceback" in low or "error" in low or "exception" in low or "critical" in low:
        return fg(CORAL, msg)
    if "warning" in low:
        return fg(AMBER, msg)

    def repl(m):
        code = int(m.group(2))
        c = MINT if code < 300 else CYAN if code < 400 else AMBER if code < 500 else CORAL
        return m.group(1) + fg(c, m.group(2), bold=True)

    out = HTTP_RE.sub(repl, msg)
    return out if out != msg else dim(msg) if low.startswith(("info", "debug")) else msg


def reader(name, stream):
    prefix = re.compile(r"^(INFO|DEBUG|WARNING|ERROR|CRITICAL):\s+")
    djts = re.compile(r"^\[\d{1,2}/\w{3}/\d{4} \d{2}:\d{2}:\d{2}\]\s*")
    for raw in iter(stream.readline, ""):
        line = ANSI_STRIP.sub("", raw.rstrip())
        if not line.strip():
            continue
        level = prefix.match(line)
        if level and level.group(1) in ("WARNING", "ERROR", "CRITICAL"):
            line = line[level.end():]
            line = ("WARNING " if level.group(1) == "WARNING" else "ERROR ") + line
        elif level:
            line = line[level.end():]
        line = djts.sub("", line)
        ui.line(f"  {stamp()} {dim(V)} {tag_for(name)} {dim(V)} {color_log(line)}")


_sp = subprocess  # real module, kept for the wrapper below
_real_popen = subprocess.Popen


def popen(command, cwd=None, env=None, **kwargs):
    env = dict(env if env is not None else os.environ)
    env["PYTHONUNBUFFERED"] = "1"
    env.setdefault("PYTHONIOENCODING", "utf-8")
    proc = _real_popen(
        command, cwd=cwd, env=env,
        stdout=_sp.PIPE, stderr=_sp.STDOUT,
        text=True, encoding="utf-8", errors="replace", bufsize=1,
    )
    name = _current["name"] or "service"
    pid_names[proc.pid] = name
    t = threading.Thread(target=reader, args=(name, proc.stdout), daemon=True)
    t.start()
    readers.append(t)
    return proc


subprocess = types.SimpleNamespace(
    Popen=popen, TimeoutExpired=_sp.TimeoutExpired,
)

_orig_start = start_service


def start_service(name, command, cwd, port, env):
    _current["name"] = name
    entry = {"name": name, "port": port, "pid": None, "reused": False, "proc": None}
    services.append(entry)
    label = pad(name, 20)

    if port_is_open(port):
        entry["reused"] = True
        ui.line(f"  {fg(AMBER, S_WARN, bold=True)}  {label} {pad(':' + str(port), 6)} "
                f"{fg(AMBER, 'port already in use - reusing existing listener')}")
        ui.line(f"     {dim('identity of the existing listener is not verified')}")
        _orig_start(name, command, cwd, port, env)
        return None

    t0 = time.time()
    frames = {"i": 0}

    def spinner():
        frames["i"] += 1
        ch = SPIN[frames["i"] % len(SPIN)]
        return (f"  {fg(CYAN, ch)}  {label} {pad(':' + str(port), 6)} "
                f"{dim('starting... ' + format(time.time() - t0, '.1f') + 's')}")

    ui.set_status(spinner)
    try:
        proc = _orig_start(name, command, cwd, port, env)
    except Exception as exc:
        ui.set_status(None)
        time.sleep(0.3)  # let the service's own error output drain first
        ui.line(f"  {fg(CORAL, S_FAIL, bold=True)}  {label} {pad(':' + str(port), 6)} "
                f"{fg(CORAL, str(exc))}")
        raise
    ui.set_status(None)
    if proc is not None:
        entry["pid"], entry["proc"] = proc.pid, proc
    ui.line(f"  {fg(MINT, S_OK, bold=True)}  {label} {pad(':' + str(port), 6)} "
            f"{fg(MINT, 'ready')} {dim('in ' + format(time.time() - t0, '.1f') + 's')}"
            f"   {dim('PID ' + str(entry['pid']))}")
    return proc



_orig_stop = stop_services


def stop_services():
    if not _state["stopping"] and any(p.poll() is None for p in processes):
        _state["stopping"] = True
        ui.set_status(None)
        rule("SHUTTING DOWN")
        _orig_stop()
        ui.line(f"  {fg(MINT, S_OK, bold=True)}  All services stopped "
                f"{dim('(uptime ' + fmt_dur(time.time() - T0) + ')')}")
    else:
        _orig_stop()


print = hooked_print  # route run_sentinal's own print() calls into the console


# ----------------------------------------------------------------------------
# Running state: endpoint panel + live status bar
# ----------------------------------------------------------------------------

_cache = {"t": 0, "up": 0}


def services_up():
    now = time.time()
    if now - _cache["t"] > 1.5:
        up = 0
        for s in services:
            if s["proc"] is not None:
                up += 1 if s["proc"].poll() is None else 0
            else:
                up += 1 if port_is_open(s["port"]) else 0
        _cache.update(t=now, up=up)
    return _cache["up"]


def status_bar():
    up, total = services_up(), len(services)
    ok = up == total
    dot = fg(MINT if ok else CORAL, S_DOT, bold=True)
    return (f"  {dot} {fg(MINT if ok else CORAL, f'{up}/{total} services up', bold=True)}"
            f"  {dim(V)}  {dim('uptime')} {fmt_dur(time.time() - _state['ready_at'])}"
            f"  {dim(V)}  {dim('Ctrl+C to stop')}")


def show_running():
    _state["ready_at"] = time.time()
    _state["running"] = True
    ui.line()
    rows = [
        kv("Login", fg(CYAN, f"{DJANGO_URL}/", bold=True)),
        kv("Dashboard", fg(CYAN, f"{DJANGO_URL}/dashboard/")),
        kv("Connector", fg(CYAN, f"{DJANGO_URL}/connector/")),
        "",
        dim("Internal services"),
    ]
    for s in services:
        pid = "existing" if s["reused"] else f"PID {s['pid']}"
        rows.append(f"{pad(s['name'], 20)} {pad(':' + str(s['port']), 6)} {dim(pid)}")
    box(f"SENTINAL AI IS RUNNING   ready in {time.time() - T0:.1f}s", rows, color=MINT)
    rule("LIVE LOG")
    ui.set_status(status_bar)


def explain(exc):
    msg = str(exc)
    m = re.match(r"Service process (\d+) stopped", msg)
    if m:
        name = pid_names.get(int(m.group(1)), "A service")
        return f"{name} (PID {m.group(1)}) stopped unexpectedly. See the log above."
    return msg


_orig_main = main


def main():
    header()
    preflight()
    _orig_main()


# ============================================================
# ENTRY POINT
# ============================================================

if __name__ == "__main__":
    try:
        main()

    except KeyboardInterrupt:
        print("\n[INFO] Shutting down Sentinal AI...")

    except Exception as exc:
        print(f"\n[ERROR] {exc}")

    finally:
        stop_services()


if __name__ == "__main__":
    ui.line()
    ui.close()
