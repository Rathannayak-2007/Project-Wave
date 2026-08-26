import os
from flask import Flask, jsonify
from flask_cors import CORS
from dotenv import load_dotenv

load_dotenv()

from routes.risk_routes import risk_bp

app = Flask(__name__)
CORS(app)
app.register_blueprint(risk_bp)


@app.route("/")
def index():
    return jsonify({
        "status": "ok",
        "service": "Climate Stress Analytics Hub (CSAH) API",
        "endpoints": ["/api/risk", "/api/risk/<location_id>", "/api/alerts"],
    })


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
app.run(host="0.0.0.0", port=port, debug=True, use_reloader=False)