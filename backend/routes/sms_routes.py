from flask import Blueprint, jsonify, request
from services.subscriber_service import (
    add_subscriber,
    remove_subscriber,
    get_subscribers,
)

sms_bp = Blueprint("sms", __name__)


@sms_bp.route("/api/subscribe", methods=["POST"])
def subscribe():
    """Subscribe a phone number to receive SMS alerts for a location."""
    data = request.get_json(silent=True)
    if not data:
        return jsonify({"error": "Request body must be JSON"}), 400

    phone = data.get("phone", "").strip()
    location_id = data.get("location_id", "").strip()

    if not phone or not location_id:
        return jsonify({"error": "Both 'phone' and 'location_id' are required"}), 400

    try:
        entry = add_subscriber(phone, location_id)
        return jsonify({"message": "Subscribed successfully", "subscriber": entry}), 201
    except ValueError as e:
        return jsonify({"error": str(e)}), 400


@sms_bp.route("/api/subscribe", methods=["DELETE"])
def unsubscribe():
    """Unsubscribe a phone number from alerts."""
    data = request.get_json(silent=True)
    if not data:
        return jsonify({"error": "Request body must be JSON"}), 400

    phone = data.get("phone", "").strip()
    location_id = data.get("location_id")  # optional

    if not phone:
        return jsonify({"error": "'phone' is required"}), 400

    removed = remove_subscriber(phone, location_id)
    if removed:
        return jsonify({"message": "Unsubscribed successfully"})
    else:
        return jsonify({"error": "Subscription not found"}), 404


@sms_bp.route("/api/subscribers", methods=["GET"])
def list_subscribers():
    """List all current subscribers (admin/debug endpoint)."""
    return jsonify({"subscribers": get_subscribers()})
