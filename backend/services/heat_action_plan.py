HEAT_ACTION_TIERS = {
    "GREEN": {
        "tier": "GREEN",
        "public_advisory": "Standard conditions. Stay hydrated and wear light clothing if outdoors.",
        "admin_actions": [
            "Monitor vulnerable populations (elderly, outdoor workers) if temperatures rise.",
            "Ensure regular water supply in high-density areas."
        ],
        "hospital_alert": False,
        "sms_template": "Heat level is GREEN. Standard precautions apply. Stay hydrated."
    },
    "YELLOW": {
        "tier": "YELLOW",
        "public_advisory": "Elevated heat risk. Limit prolonged outdoor exposure. Drink water every 30 min. Check on elderly neighbours.",
        "admin_actions": [
            "Issue public hydration advisories.",
            "Verify readiness of public cooling centers.",
            "Provide shading at major transit stops."
        ],
        "hospital_alert": False,
        "sms_template": "Heat level is YELLOW (Elevated). Limit outdoor exposure and stay hydrated."
    },
    "ORANGE": {
        "tier": "ORANGE",
        "public_advisory": "High heat risk. Avoid outdoor activity 12-4 PM. Drink water frequently. Use cooling towels.",
        "admin_actions": [
            "Open public cooling centers in vulnerable wards.",
            "Mandate frequent rest breaks for outdoor workers.",
            "Alert local hospitals to prepare for heat-stress cases."
        ],
        "hospital_alert": True,
        "sms_template": "Heat level is ORANGE (High). Avoid outdoor activity between 12-4 PM. Check on vulnerable neighbors."
    },
    "RED": {
        "tier": "RED",
        "public_advisory": "EXTREME heat risk. STAY INDOORS. Avoid all non-essential outdoor activity. Drink water every 15-20 min. Open cooling centres. Check on elderly and vulnerable neighbours immediately.",
        "admin_actions": [
            "Activate full Heat Action Plan (HAP).",
            "Halt non-essential outdoor construction/labor from 11 AM to 4 PM.",
            "Ensure uninterrupted power to hospitals and cooling centers.",
            "Mobilize emergency response teams for heatstroke cases."
        ],
        "hospital_alert": True,
        "sms_template": "EMERGENCY: Heat level is RED (Extreme). Stay indoors. Halt outdoor work immediately."
    }
}

def get_heat_action_plan(composite_score: float) -> dict:
    if composite_score < 40:
        return HEAT_ACTION_TIERS["GREEN"]
    elif composite_score < 60:
        return HEAT_ACTION_TIERS["YELLOW"]
    elif composite_score < 80:
        return HEAT_ACTION_TIERS["ORANGE"]
    else:
        return HEAT_ACTION_TIERS["RED"]
