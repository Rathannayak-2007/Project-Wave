from flask import Blueprint, jsonify, request
from services.risk_engine import compute_location_risk
from services.sms_service import build_admin_alert, send_alert_sms, build_alert_message
from services.subscriber_service import get_subscribers_for_location
import json
import os

admin_bp = Blueprint("admin", __name__)
LOCATIONS_PATH = os.path.join(os.path.dirname(__file__), "..", "data", "locations.json")

def _load_locations():
    with open(LOCATIONS_PATH, "r") as f:
        return json.load(f)

@admin_bp.route("/api/admin/trigger-hap", methods=["POST"])
def trigger_hap():
    data = request.json
    location_id = data.get("location_id")
    
    if not location_id:
        return jsonify({"error": "location_id is required"}), 400
        
    locations = _load_locations()
    loc = next((l for l in locations if l["id"] == location_id), None)
    if not loc:
        return jsonify({"error": "Location not found"}), 404
        
    # Recompute risk to get the HAP plan
    loc_risk = compute_location_risk(loc)
    
    # Send admin alert
    msg = build_admin_alert(loc_risk)
    sent = send_alert_sms(loc["name"], msg, loc_risk["risk"]["category"], recipients=None) # Uses TWILIO_TO
    
    return jsonify({
        "success": True, 
        "message": "Admin HAP triggered successfully.",
        "sms_sent": sent
    })

@admin_bp.route("/api/admin/prediction-summary", methods=["GET"])
def prediction_summary():
    locations = _load_locations()
    summary = []
    
    for loc in locations:
        loc_risk = compute_location_risk(loc)
        preds = loc_risk.get("prediction", [])
        
        # Only include locations with an elevated risk in the next 5 days
        worst = None
        for p in preds:
            if p["impact_level"] in ["spike_likely", "surge_expected"]:
                if not worst or p["peak_wbgt"] > worst["peak_wbgt"]:
                    worst = p
                    
        if worst:
            summary.append({
                "location_name": loc["name"],
                "worst_prediction_date": worst["date"],
                "impact_level": worst["impact_level"],
                "peak_wbgt": worst["peak_wbgt"]
            })
            
    return jsonify({"prediction_summary": summary})

@admin_bp.route("/api/admin/notify", methods=["POST"])
def notify_all():
    data = request.json
    location_id = data.get("location_id")
    
    if not location_id:
        return jsonify({"error": "location_id is required"}), 400
        
    locations = _load_locations()
    loc = next((l for l in locations if l["id"] == location_id), None)
    if not loc:
        return jsonify({"error": "Location not found"}), 404
        
    loc_risk = compute_location_risk(loc)
    msg = build_alert_message(loc_risk)
    
    subs = get_subscribers_for_location(location_id)
    phones = [s["phone"] for s in subs]
    
    sent = False
    if phones:
        sent = send_alert_sms(loc["name"], msg, loc_risk["risk"]["category"], recipients=phones)
        
    return jsonify({
        "success": True,
        "subscribers_notified": len(phones),
        "sms_sent": sent
    })
