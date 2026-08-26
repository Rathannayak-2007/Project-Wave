import json
import os
from datetime import datetime, timezone
from flask import Blueprint, jsonify

from services.risk_engine import compute_location_risk
from services import cache

risk_bp = Blueprint("risk", __name__)

LOCATIONS_PATH = os.path.join(os.path.dirname(__file__), "..", "data", "locations.json")
ALERT_THRESHOLD = int(os.environ.get("RISK_ALERT_THRESHOLD", 70))
CACHE_TTL = int(os.environ.get("CACHE_TTL_SECONDS", 600))


def _load_locations():
    with open(LOCATIONS_PATH, "r") as f:
        return json.load(f)


def _get_all_risk_data():
    cached = cache.get("risk_data", ttl_seconds=CACHE_TTL)
    if cached:
        return cached

    locations = _load_locations()
    results = []
    for loc in locations:
        try:
            results.append(compute_location_risk(loc))
        except Exception as e:
            print(f"Failed to compute risk for {loc.get('name')}: {e}")

    cache.set("risk_data", results)
    return results


def _build_alerts(locations_data):
    alerts = []
    for loc in locations_data:
        if loc["risk"]["score"] >= ALERT_THRESHOLD:
            alerts.append({
                "location_id": loc["id"],
                "message": f"{loc['risk']['category']} heat risk in {loc['name']} - "
                           f"vulnerable groups should avoid outdoor exposure during peak hours",
                "issued_at": datetime.now(timezone.utc).isoformat(),
                "severity": loc["risk"]["category"],
            })
    return alerts


@risk_bp.route("/api/risk", methods=["GET"])
def get_risk():
    locations_data = _get_all_risk_data()
    return jsonify({
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "locations": locations_data,
        "alerts": _build_alerts(locations_data),
    })


@risk_bp.route("/api/risk/<location_id>", methods=["GET"])
def get_risk_for_location(location_id):
    locations_data = _get_all_risk_data()
    match = next((l for l in locations_data if l["id"] == location_id), None)
    if not match:
        return jsonify({"error": "Location not found"}), 404
    return jsonify(match)


@risk_bp.route("/api/alerts", methods=["GET"])
def get_alerts():
    locations_data = _get_all_risk_data()
    return jsonify({"alerts": _build_alerts(locations_data)})
