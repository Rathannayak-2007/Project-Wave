"""
Notification routes — API endpoints for alert status and admin reports.
"""

import json
import os
from datetime import datetime, timezone
from flask import Blueprint, jsonify, request

from services.risk_engine import compute_location_risk
from services.admin_report_service import (
    detect_significant_changes,
    build_admin_weather_report,
    send_admin_report,
)

notification_bp = Blueprint("notifications", __name__)

LOCATIONS_PATH = os.path.join(os.path.dirname(__file__), "..", "data", "locations.json")


def _load_locations():
    with open(LOCATIONS_PATH, "r") as f:
        return json.load(f)


@notification_bp.route("/api/notifications/status", methods=["GET"])
def notification_status():
    """
    Returns current alert status for all monitored locations.
    The frontend can poll this to show which locations have active alerts.
    """
    locations = _load_locations()
    statuses = []

    for loc in locations:
        try:
            loc_risk = compute_location_risk(loc)
            hap = loc_risk.get("heat_action_plan", {})
            tier = hap.get("tier", "GREEN")
            current = loc_risk["current"]

            statuses.append({
                "location_id": loc["id"],
                "location_name": loc["name"],
                "temp_c": current["temp_c"],
                "wbgt_c": current["wbgt_c"],
                "utci_c": current["utci_c"],
                "risk_score": loc_risk["risk"]["score"],
                "risk_category": loc_risk["risk"]["category"],
                "hap_tier": tier,
                "alert_active": tier in ["ORANGE", "RED"],
                "mortality_risk": loc_risk["risk"]["mortality_risk"],
            })
        except Exception as e:
            print(f"[Notifications] Failed to get status for {loc.get('name')}: {e}")

    return jsonify({
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "locations": statuses,
        "active_alerts": [s for s in statuses if s["alert_active"]],
        "total_alerts": sum(1 for s in statuses if s["alert_active"]),
    })


@notification_bp.route("/api/notifications/admin-report", methods=["POST"])
def trigger_admin_report():
    """
    Manually trigger an admin weather report for a specific location.
    
    Request body:
        { "location_id": "loc_01" }
    
    The report compares current weather against the last snapshot and
    sends it to admin contacts via SMS (or dry-run log).
    """
    data = request.get_json(silent=True)
    if not data or not data.get("location_id"):
        return jsonify({"error": "location_id is required"}), 400

    location_id = data["location_id"]
    locations = _load_locations()
    loc = next((l for l in locations if l["id"] == location_id), None)

    if not loc:
        return jsonify({"error": "Location not found"}), 404

    # Compute fresh risk data
    loc_risk = compute_location_risk(loc)

    # Detect changes
    changes = detect_significant_changes(loc_risk)

    if not changes:
        # Even if no change is detected, allow manual trigger to still generate a report
        changes = {
            "manual_trigger": {
                "triggered_by": "admin",
                "current_temp": loc_risk["current"]["temp_c"],
            }
        }

    # Build and send the report
    report = send_admin_report(loc_risk, changes)

    if report:
        return jsonify({
            "success": True,
            "message": f"Admin report generated for {loc['name']}",
            "report": {
                "location_name": report["location_name"],
                "generated_at": report["generated_at"],
                "hap_tier": report["hap_tier"],
                "risk_score": report["risk"]["score"],
                "changes_detected": list(report["changes"].keys()),
                "text_report": report["text_report"],
            },
        })
    else:
        return jsonify({
            "success": False,
            "message": "Report skipped (cooldown active). Try again later.",
        }), 429


@notification_bp.route("/api/notifications/admin-report/all", methods=["POST"])
def trigger_all_admin_reports():
    """
    Trigger admin reports for ALL locations that have significant weather changes.
    This is what the scheduler calls automatically.
    """
    from services.admin_report_service import check_all_locations_for_admin_reports
    from routes.risk_routes import _get_all_risk_data

    locations_data = _get_all_risk_data()
    reports = check_all_locations_for_admin_reports(locations_data)

    return jsonify({
        "success": True,
        "reports_generated": len(reports),
        "locations_reported": [r["location_name"] for r in reports],
    })
