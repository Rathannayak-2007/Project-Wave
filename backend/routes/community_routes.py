from flask import Blueprint, request, jsonify
from datetime import datetime
import uuid

community_bp = Blueprint('community_routes', __name__, url_prefix='/api/community')

# In-memory store for hackathon purposes. 
# In production, use SQLite/PostgreSQL with PostGIS for spatial queries.
MOCK_REPORTS = [
    {
        "id": "123e4567-e89b-12d3-a456-426614174000",
        "lat": 12.9716, # Bangalore center ish
        "lon": 77.5946,
        "type": "water",
        "message": "Free drinking water station here",
        "timestamp": datetime.now().isoformat()
    },
    {
        "id": "223e4567-e89b-12d3-a456-426614174001",
        "lat": 12.9780,
        "lon": 77.5850,
        "type": "danger",
        "message": "Feeling dizzy, intense heat island",
        "timestamp": datetime.now().isoformat()
    }
]

@community_bp.route('/reports', methods=['GET'])
def get_reports():
    """Get all active community reports for the map."""
    return jsonify({
        "status": "success",
        "reports": MOCK_REPORTS
    }), 200

@community_bp.route('/reports', methods=['POST'])
def add_report():
    """Submit a new community report from the frontend."""
    data = request.json
    
    if not data or 'lat' not in data or 'lon' not in data or 'type' not in data:
        return jsonify({"status": "error", "message": "Missing required fields: lat, lon, type"}), 400
        
    new_report = {
        "id": str(uuid.uuid4()),
        "lat": float(data['lat']),
        "lon": float(data['lon']),
        "type": data['type'], # e.g., 'water', 'cooling', 'danger'
        "message": data.get('message', ''),
        "timestamp": datetime.now().isoformat()
    }
    
    MOCK_REPORTS.append(new_report)
    
    return jsonify({
        "status": "success",
        "message": "Report added successfully",
        "report": new_report
    }), 201
