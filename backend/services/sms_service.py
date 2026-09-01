import os
import time
import requests

TELEGRAM_BOT_TOKEN = os.environ.get("TELEGRAM_BOT_TOKEN")
TELEGRAM_CHAT_ID = os.environ.get("TELEGRAM_CHAT_ID")
TELEGRAM_ENABLED = os.environ.get("ENABLE_TELEGRAM_ALERTS", "false").lower() == "true"
COOLDOWN_SECONDS = 3600  

_last_sent = {}


def build_alert_message(location_data: dict) -> str:
    """
    Build a rich, human-friendly Telegram message body.
    """
    name = location_data["name"]
    cur = location_data["current"]
    risk = location_data["risk"]
    hap = location_data.get("heat_action_plan", {})
    tier = hap.get("tier", risk["category"])
    
    advice = hap.get("sms_template", "")
    if not advice:
        advice = {
            "Low": "Standard precautions. Stay hydrated and wear light clothing.",
            "Moderate": "Limit prolonged outdoor exposure. Drink water every 30 min.",
            "High": "Avoid outdoor activity 12-4 PM. Drink water frequently.",
            "Extreme": "STAY INDOORS. Avoid all non-essential outdoor activity. Open cooling centres."
        }.get(risk["category"], "Stay safe.")

    # Check predictions
    pred_str = ""
    preds = location_data.get("prediction", [])
    if preds:
        worst_pred = max(preds, key=lambda p: {"baseline": 1, "elevated": 2, "spike_likely": 3, "surge_expected": 4}.get(p["impact_level"], 0))
        if worst_pred["impact_level"] in ["spike_likely", "surge_expected"]:
            pred_str = f"\n\n⚠️ *PREDICTION:* Surge expected around {worst_pred['date']}."

    msg = (
        f"🚨 *CSAH Heat Alert - {name}* 🚨\n\n"
        f"🔴 *Tier:* {tier} | *Score:* {risk['score']}\n"
        f"🌡 *WBGT:* {cur['wbgt_c']}°C | *UTCI:* {cur['utci_c']}°C\n"
        f"🌡 *Temp:* {cur['temp_c']}°C | 💧 *Humidity:* {cur['humidity_pct']}%\n"
        f"{pred_str}\n\n"
        f"ℹ️ _{advice}_"
    )
    return msg

def build_admin_alert(location_data: dict) -> str:
    """
    Build a simple manual admin trigger alert.
    """
    name = location_data["name"]
    risk = location_data["risk"]
    hap = location_data.get("heat_action_plan", {})
    tier = hap.get("tier", risk["category"])
    
    return f"👨‍⚖️ *MANUAL ADMIN TRIGGER* 👨‍⚖️\n\nHAP Alert triggered for *{name}*.\nCurrent Tier: {tier} (Score: {risk['score']})\n\nPlease check the dashboard immediately."

def send_alert_sms(location_name: str, message: str, severity: str, recipients: list = None) -> bool:
    """
    Send a Telegram alert. (Kept function name send_alert_sms so we don't have to rename it everywhere).
    """
    now = time.time()
    if now - _last_sent.get(location_name, 0) < COOLDOWN_SECONDS:
        return False

    chat_ids = []
    if TELEGRAM_CHAT_ID:
        chat_ids = [cid.strip() for cid in TELEGRAM_CHAT_ID.split(",") if cid.strip()]

    if not TELEGRAM_ENABLED or not TELEGRAM_BOT_TOKEN or not chat_ids:
        print("=" * 60)
        print("[Telegram DRY-RUN] Would send:")
        print(message)
        print("=" * 60)
        _last_sent[location_name] = now
        return True  

    sent_any = False
    for chat_id in chat_ids:
        url = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/sendMessage"
        payload = {
            "chat_id": chat_id,
            "text": message,
            "parse_mode": "Markdown"
        }

        try:
            response = requests.post(url, json=payload)
            data = response.json()
            if data.get("ok"):
                print(f"[Telegram] Successfully sent alert for {location_name} to {chat_id}")
                sent_any = True
            else:
                print(f"[Telegram] Failed to send to {chat_id}: {data.get('description')}")
        except Exception as e:
            print(f"[Telegram] Request failed for {chat_id}: {e}")
            
    if sent_any:
        _last_sent[location_name] = now
    return sent_any
