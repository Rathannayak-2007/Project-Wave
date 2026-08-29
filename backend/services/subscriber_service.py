import os
import json
import re
from datetime import datetime, timezone

SUBSCRIBERS_PATH = os.path.join(os.path.dirname(__file__), "..", "data", "subscribers.json")

# Basic E.164 phone number validation (e.g. +919876543210)
PHONE_REGEX = re.compile(r"^\+[1-9]\d{6,14}$")


def _load_subscribers() -> list:
    """Load subscribers from the JSON file."""
    if not os.path.exists(SUBSCRIBERS_PATH):
        return []
    try:
        with open(SUBSCRIBERS_PATH, "r") as f:
            return json.load(f)
    except (json.JSONDecodeError, IOError):
        return []


def _save_subscribers(subscribers: list):
    """Persist subscribers list to the JSON file."""
    os.makedirs(os.path.dirname(SUBSCRIBERS_PATH), exist_ok=True)
    with open(SUBSCRIBERS_PATH, "w") as f:
        json.dump(subscribers, f, indent=2)


def validate_phone(phone: str) -> bool:
    """Check if a phone number looks like a valid E.164 number."""
    return bool(PHONE_REGEX.match(phone))


def add_subscriber(phone: str, location_id: str) -> dict:
    """
    Subscribe a phone number to alerts for a specific location.
    Returns the subscriber entry on success, or raises ValueError.
    """
    phone = phone.strip()
    if not validate_phone(phone):
        raise ValueError(f"Invalid phone number format: {phone}. Use E.164 format like +919876543210")

    subscribers = _load_subscribers()

    # Check for duplicate
    existing = next(
        (s for s in subscribers if s["phone"] == phone and s["location_id"] == location_id),
        None,
    )
    if existing:
        raise ValueError(f"{phone} is already subscribed to {location_id}")

    entry = {
        "phone": phone,
        "location_id": location_id,
        "subscribed_at": datetime.now(timezone.utc).isoformat(),
    }
    subscribers.append(entry)
    _save_subscribers(subscribers)
    return entry


def remove_subscriber(phone: str, location_id: str = None) -> bool:
    """
    Unsubscribe a phone number. If location_id is given, only remove that
    specific subscription; otherwise remove all subscriptions for the phone.
    Returns True if any were removed.
    """
    phone = phone.strip()
    subscribers = _load_subscribers()
    original_len = len(subscribers)

    if location_id:
        subscribers = [
            s for s in subscribers
            if not (s["phone"] == phone and s["location_id"] == location_id)
        ]
    else:
        subscribers = [s for s in subscribers if s["phone"] != phone]

    if len(subscribers) == original_len:
        return False

    _save_subscribers(subscribers)
    return True


def get_subscribers() -> list:
    """Return all subscribers."""
    return _load_subscribers()


def get_subscribers_for_location(location_id: str) -> list:
    """Return all subscribers for a specific location."""
    return [s for s in _load_subscribers() if s["location_id"] == location_id]
