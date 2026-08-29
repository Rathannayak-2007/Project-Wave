import os
import time

try:
    import vonage
    _vonage_available = True
except ImportError:
    _vonage_available = False
    print("[SMS] Vonage library not installed. SMS will run in dry-run mode.")
    print("[SMS] Install with: pip install vonage")

VONAGE_API_KEY = os.environ.get("VONAGE_API_KEY")
VONAGE_API_SECRET = os.environ.get("VONAGE_API_SECRET")
VONAGE_FROM = os.environ.get("VONAGE_FROM_NAME", "CSAH_Alerts")
VONAGE_TO = os.environ.get("VONAGE_TO_NUMBERS", "")
SMS_ENABLED = os.environ.get("ENABLE_SMS_ALERTS", "false").lower() == "true"
COOLDOWN_SECONDS = 3600  # only resend the same zones alert once per hour, prevents spam

_client = None
_sms = None
if _vonage_available and SMS_ENABLED and VONAGE_API_KEY and VONAGE_API_SECRET:
    _client = vonage.Client(key=VONAGE_API_KEY, secret=VONAGE_API_SECRET)
    _sms = vonage.Sms(_client)

_last_sent = {}


# ---------------------------------------------------------------------------
#  Safety advice per risk category
# ---------------------------------------------------------------------------
SAFETY_ADVICE = {
    "Low": (
        "Standard precautions. Stay hydrated and wear light clothing if outdoors."
    ),
    "Moderate": (
        "Limit prolonged outdoor exposure. Drink water every 30 min. "
        "Check on elderly neighbours."
    ),
    "High": (
        "Avoid outdoor activity 12-4 PM. Drink water frequently. "
        "Use cooling towels. Hospitals should prepare for heat-stress cases."
    ),
    "Extreme": (
        "STAY INDOORS. Avoid all non-essential outdoor activity. "
        "Drink water every 15-20 min. Open cooling centres. "
        "Check on elderly and vulnerable neighbours immediately."
    ),
}


def build_alert_message(location_data: dict) -> str:
    """
    Build a rich, human-friendly SMS body from the full location risk dict.
    Includes WBGT, UTCI, prediction, and HAP tier.
    """
    name = location_data["name"]
    cur = location_data["current"]
    risk = location_data["risk"]
    hap = location_data.get("heat_action_plan", {})
    tier = hap.get("tier", risk["category"])
    sms_template = hap.get("sms_template", "")

    # Get worst prediction if available
    pred_str = ""
    preds = location_data.get("prediction", [])
    if preds:
        worst_pred = max(preds, key=lambda p: {"baseline": 1, "elevated": 2, "spike_likely": 3, "surge_expected": 4}.get(p["impact_level"], 0))
        if worst_pred["impact_level"] in ["spike_likely", "surge_expected"]:
            pred_date = worst_pred["date"]
            pred_str = f"| PREDICTION: Impact expected around {pred_date} "
            
    lines = [
        f"CSAH Heat Alert - {name}",
        "",
        f"Tier: {tier} | Score: {risk['score']}",
        f"WBGT: {cur['wbgt_c']}C | UTCI: {cur['utci_c']}C | HI: {cur['heat_index_c']}C",
        f"Temp: {cur['temp_c']}C | Hum: {cur['humidity_pct']}%",
        pred_str,
        "",
        sms_template or SAFETY_ADVICE.get(risk["category"], "Stay safe and follow local advisories."),
    ]
    # Remove empty lines that might result from pred_str being empty
    return "\n".join(l for l in lines if l.strip() or l == "")

def build_admin_alert(location_data: dict) -> str:
    """
    Build an SMS body for city administration with specific action items.
    """
    name = location_data["name"]
    risk = location_data["risk"]
    hap = location_data.get("heat_action_plan", {})
    tier = hap.get("tier", risk["category"])
    
    actions = hap.get("admin_actions", [])
    action_str = "\n- ".join([""] + actions) if actions else "\n- Standard operations"

    lines = [
        f"CSAH ADMIN ALERT: {name}",
        f"HAP TIER: {tier} (Score: {risk['score']})",
        "",
        "REQUIRED ACTIONS:" + action_str,
        "",
        f"Hospital Alert Active: {'YES' if hap.get('hospital_alert') else 'NO'}"
    ]
    return "\n".join(lines)


def send_alert_sms(location_name: str, message: str, severity: str,
                    recipients: list = None) -> bool:
    """
    Send an SMS alert.

    Args:
        location_name: Human-readable location name (used for cooldown key).
        message: The full SMS body text.
        severity: Risk category string (for logging).
        recipients: Optional list of phone numbers to send to.
                    Falls back to TWILIO_TO_NUMBERS from .env if not provided.
    Returns:
        True if at least one SMS was sent (or logged in dry-run mode).
    """
    # --- Cooldown check ---
    now = time.time()
    if now - _last_sent.get(location_name, 0) < COOLDOWN_SECONDS:
        return False

    # --- Resolve recipients ---
    if not recipients:
        recipients = [n.strip() for n in VONAGE_TO.split(",") if n.strip()]

    if not recipients:
        print(f"[SMS] No recipients configured for {location_name}")
        return False

    # --- Dry-run mode (Vonage disabled) ---
    if not SMS_ENABLED or not _sms:
        print("=" * 60)
        print(f"[SMS DRY-RUN] Would send to {', '.join(recipients)}:")
        print("-" * 60)
        print(message)
        print("=" * 60)
        _last_sent[location_name] = now
        return True  # counts as "sent" for dry-run

    # --- Actually send via Vonage ---
    sent_any = False
    for number in recipients:
        try:
            clean_number = number.replace("+", "") # Vonage often expects numbers without the + symbol
            response = _sms.send_message({
                "from": VONAGE_FROM,
                "to": clean_number,
                "text": message
            })
            
            if response["messages"][0]["status"] == "0":
                print(f"[SMS] Sent alert to {number} for {location_name}")
                sent_any = True
            else:
                error_txt = response["messages"][0].get("error-text", "Unknown Error")
                print(f"[SMS] Failed to send to {number}: {error_txt}")
        except Exception as e:
            print(f"[SMS] Failed to send to {number}: {e}")

    if sent_any:
        _last_sent[location_name] = now
    return sent_any
