"""Tiny in-memory cache with TTL. No database needed for a 24h build."""
import time

_store = {}


def get(key, ttl_seconds=600):
    entry = _store.get(key)
    if not entry:
        return None
    value, timestamp = entry
    if time.time() - timestamp > ttl_seconds:
        return None
    return value


def set(key, value):
    _store[key] = (value, time.time())


def clear():
    _store.clear()
