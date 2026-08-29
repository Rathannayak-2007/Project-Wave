from flask import Blueprint, request, jsonify
from services.risk_engine import compute_location_risk
import uuid

search_bp = Blueprint("search", __name__)

@search_bp.route("/api/search", methods=["GET"])
def search_location():
    """
    Computes climate risk for an arbitrary, user-searched location.
    Requires lat, lon, and name query parameters.
    """
    lat = request.args.get('lat')
    lon = request.args.get('lon')
    name = request.args.get('name')

    if not lat or not lon or not name:
        return jsonify({"error": "Missing lat, lon, or name parameters"}), 400

    try:
        lat = float(lat)
        lon = float(lon)
    except ValueError:
        return jsonify({"error": "Invalid lat/lon format"}), 400

    # Create a dynamic location object
    # We use default demographic averages since we don't have census data for arbitrary searches
    dynamic_location = {
        "id": f"search_{uuid.uuid4().hex[:8]}",
        "name": name,
        "lat": lat,
        "lon": lon,
        "elderly_pct": 12.0, 
        "outdoor_worker_pct": 25.0,
        "population_density": 10000
    }

    try:
        # Run through the core risk engine on the fly!
        risk_data = compute_location_risk(dynamic_location)
        return jsonify({"status": "success", "data": risk_data}), 200
    except Exception as e:
        print(f"Error computing dynamic risk for {name}: {e}")
        return jsonify({"error": "Failed to compute weather data for this location."}), 500
