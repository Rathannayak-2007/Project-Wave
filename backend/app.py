import os
from flask import Flask, jsonify, send_from_directory
from flask_cors import CORS
from dotenv import load_dotenv

load_dotenv()

from routes.risk_routes import risk_bp
from routes.sms_routes import sms_bp
from routes.admin_routes import admin_bp
from routes.ai_routes import ai_bp
from routes.community_routes import community_bp
from routes.search_routes import search_bp

# Connect frontend by serving it as static files from the backend
frontend_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'frontend')
app = Flask(__name__, static_folder=frontend_dir, static_url_path='')
CORS(app)
app.register_blueprint(risk_bp)
app.register_blueprint(sms_bp)
app.register_blueprint(admin_bp)
app.register_blueprint(ai_bp)
app.register_blueprint(community_bp)
app.register_blueprint(search_bp)


@app.route("/")
def index():
    return app.send_static_file('index.html')


# ---------------------------------------------------------------------------
#  Background scheduler: check risk data and send SMS alerts automatically
# ---------------------------------------------------------------------------
def _scheduled_alert_check():
    """Runs inside app context to check all locations and send SMS alerts."""
    with app.app_context():
        from routes.risk_routes import _get_all_risk_data, _build_alerts
        print("[Scheduler] Running automatic alert check...")
        locations_data = _get_all_risk_data()
        alerts = _build_alerts(locations_data)
        print(f"[Scheduler] Found {len(alerts)} alert(s)")


def _start_scheduler():
    """Start APScheduler to run alert checks at a regular interval."""
    try:
        from apscheduler.schedulers.background import BackgroundScheduler
        interval_minutes = int(os.environ.get("SMS_CHECK_INTERVAL_MINUTES", 10))
        scheduler = BackgroundScheduler(daemon=True)
        scheduler.add_job(
            _scheduled_alert_check,
            "interval",
            minutes=interval_minutes,
            id="sms_alert_check",
            replace_existing=True,
        )
        scheduler.start()
        print(f"[Scheduler] Alert check will run every {interval_minutes} minutes")
    except ImportError:
        print("[Scheduler] APScheduler not installed - automatic alerts disabled.")
        print("[Scheduler] Install with: pip install APScheduler")


if __name__ == "__main__":
    _start_scheduler()
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=True, use_reloader=False)