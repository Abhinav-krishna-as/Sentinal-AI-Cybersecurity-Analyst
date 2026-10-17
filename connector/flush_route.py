"""Flush route for the Sentinal Connector (FastAPI). UNTESTED sketch.

Adjust the three marked spots to match connector/api.py, then include it:
    from flush_route import router as flush_router
    app.include_router(flush_router)
"""
import json
import os
import tempfile
from typing import Optional

from fastapi import APIRouter, Header, HTTPException

router = APIRouter()

# 1) Where the Connector stores its data. Change to your real file paths.
EVENTS_FILE = "data/events.json"
APPLICATIONS_FILE = "data/applications.json"


# 2) Replace with your real admin-key check (the UI sends X-Sentinal-Admin-Key).
def _admin_ok(key: Optional[str]) -> bool:
    return bool(key) and key == os.environ.get("SENTINAL_ADMIN_KEY")


def _atomic_write(path: str, value) -> None:
    folder = os.path.dirname(path) or "."
    os.makedirs(folder, exist_ok=True)
    fd, tmp = tempfile.mkstemp(dir=folder)
    with os.fdopen(fd, "w", encoding="utf-8") as handle:
        json.dump(value, handle)
    os.replace(tmp, path)


def _flush(path: str, key: str) -> int:
    """Empty one JSON file, keeping its shape. Returns how many items were removed."""
    try:
        with open(path, encoding="utf-8") as handle:
            data = json.load(handle)
    except (FileNotFoundError, json.JSONDecodeError):
        return 0

    if isinstance(data, list):
        removed, data = len(data), []
    elif isinstance(data, dict) and isinstance(data.get(key), list):
        removed, data[key] = len(data[key]), []
    else:
        raise HTTPException(500, f"Unexpected JSON structure in {path}")

    _atomic_write(path, data)
    return removed


@router.post("/api/v1/maintenance/flush")
def flush_all(body: dict, x_sentinal_admin_key: Optional[str] = Header(default=None)):
    if not _admin_ok(x_sentinal_admin_key):
        raise HTTPException(403, "Invalid admin key")

    result = {"flushed": True, "events_removed": 0, "applications_removed": 0}

    if body.get("events", True):
        result["events_removed"] = _flush(EVENTS_FILE, "events")

    if body.get("applications", True):
        result["applications_removed"] = _flush(APPLICATIONS_FILE, "applications")

    # 3) If the Connector also keeps events/applications in memory (lists or
    #    dicts loaded at startup), clear those variables here too, or the
    #    dashboard will keep serving the old data until a restart.

    return result
