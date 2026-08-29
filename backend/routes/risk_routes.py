import json
import os
from datetime import datetime, timezone
from flask import Blueprint, jsonify

from services.risk_engine import compute_location_risk
from services import cache
from services.sms_service import build_alert_message, send_alert_sms
from services.subscriber_service import get_subscribers_for_location

risk_bp = Blueprint("risk", __name__)

LOCATIONS_PATH = os.path.join(os.path.dirname(__file__), "..", "data", "locations.json")
ALERT_THRESHOLD = int(os.environ.get("RISK_ALERT_THRESHOLD", 70))
SMS_THRESHOLD = int(os.environ.get("SMS_ALERT_THRESHOLD", 80))
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
        hap_tier = loc.get("heat_action_plan", {}).get("tier", "GREEN")
        is_high_risk = hap_tier in ["ORANGE", "RED"]

        if is_high_risk or loc["risk"]["score"] >= ALERT_THRESHOLD:
            message = (f"{hap_tier} heat risk - {loc['risk']['mortality_risk']}")
            alerts.append({
                "location_id": loc["id"],
                "message": message,
                "issued_at": datetime.now(timezone.utc).isoformat(),
                "severity": hap_tier,
            })

            # Send rich SMS when tier is ORANGE or RED
            if is_high_risk:
                rich_message = build_alert_message(loc)

                # Gather subscribers for this location
                subscribers = get_subscribers_for_location(loc["id"])
                subscriber_phones = [s["phone"] for s in subscribers]

                # send_alert_sms handles fallback to .env numbers if no subscribers
                send_alert_sms(
                    location_name=loc["name"],
                    message=rich_message,
                    severity=hap_tier,
                    recipients=subscriber_phones if subscriber_phones else None,
                )

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
