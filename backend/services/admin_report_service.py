"""
Admin Weather Report Service

Detects significant weather changes by comparing current readings against
previous snapshots, then builds structured reports for weather department
administrators.
"""

import json
import os
import time
from datetime import datetime, timezone

from services.risk_engine import compute_location_risk
from services.sms_service import send_alert_sms

# ── Config ──
ADMIN_REPORT_COOLDOWN = 3600          # Don't send the same location's report more than once per hour
TEMP_CHANGE_THRESHOLD = 3.0           # °C change to trigger a report
WBGT_DANGER_THRESHOLD = float(os.environ.get("WBGT_DANGER_THRESHOLD", 30.0))
UTCI_STRESS_THRESHOLD = float(os.environ.get("UTCI_STRONG_STRESS_THRESHOLD", 32.0))
ADMIN_TEMP_ALERT_THRESHOLD = 45.0     # °C — absolute temperature to always report

# ── State ──
_previous_readings_path = os.path.join(os.path.dirname(__file__), "..", "data", "previous_readings.json")
_admin_report_cooldown = {}           # location_id -> last report timestamp


def _load_previous_readings():
    """Load the previous weather snapshot from disk."""
    if os.path.exists(_previous_readings_path):
        try:
            with open(_previous_readings_path, "r") as f:
                return json.load(f)
        except (json.JSONDecodeError, IOError):
            pass
    return {}


def _save_previous_readings(readings):
    """Persist the current weather snapshot for future comparison."""
    try:
        with open(_previous_readings_path, "w") as f:
            json.dump(readings, f, indent=2)
    except IOError as e:
        print(f"[AdminReport] Failed to save readings: {e}")


def detect_significant_changes(location_risk_data):
    """
    Compare current weather for a location against the last snapshot.
    Returns a dict describing the change, or None if no significant change.
    """
    loc_id = location_risk_data["id"]
    current = location_risk_data["current"]
    previous_all = _load_previous_readings()
    previous = previous_all.get(loc_id, {})

    changes = {}
    is_significant = False

    # Temperature change
    cur_temp = current.get("temp_c", 0) or 0
    prev_temp = previous.get("temp_c", 0) or 0
    temp_delta = cur_temp - prev_temp

    if abs(temp_delta) >= TEMP_CHANGE_THRESHOLD:
        changes["temperature"] = {
            "previous": prev_temp,
            "current": cur_temp,
            "delta": round(temp_delta, 1),
            "direction": "RISING" if temp_delta > 0 else "FALLING",
        }
        is_significant = True

    # Absolute temperature threshold
    if cur_temp >= ADMIN_TEMP_ALERT_THRESHOLD:
        changes["extreme_temp"] = {
            "current": cur_temp,
            "threshold": ADMIN_TEMP_ALERT_THRESHOLD,
            "exceeded_by": round(cur_temp - ADMIN_TEMP_ALERT_THRESHOLD, 1),
        }
        is_significant = True

    # WBGT crossed danger threshold
    cur_wbgt = current.get("wbgt_c", 0) or 0
    prev_wbgt = previous.get("wbgt_c", 0) or 0
    if cur_wbgt >= WBGT_DANGER_THRESHOLD and prev_wbgt < WBGT_DANGER_THRESHOLD:
        changes["wbgt_crossed"] = {
            "previous": prev_wbgt,
            "current": cur_wbgt,
            "threshold": WBGT_DANGER_THRESHOLD,
        }
        is_significant = True

    # UTCI crossed stress threshold
    cur_utci = current.get("utci_c", 0) or 0
    prev_utci = previous.get("utci_c", 0) or 0
    if cur_utci >= UTCI_STRESS_THRESHOLD and prev_utci < UTCI_STRESS_THRESHOLD:
        changes["utci_crossed"] = {
            "previous": prev_utci,
            "current": cur_utci,
            "threshold": UTCI_STRESS_THRESHOLD,
        }
        is_significant = True

    # Save current as the new "previous" for next comparison
    previous_all[loc_id] = {
        "temp_c": cur_temp,
        "wbgt_c": cur_wbgt,
        "utci_c": cur_utci,
        "humidity_pct": current.get("humidity_pct", 0),
        "wind_kmh": current.get("wind_kmh", 0),
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }
    _save_previous_readings(previous_all)

    if is_significant:
        return changes
    return None


def build_admin_weather_report(location_risk_data, changes):
    """
    Build a structured report for weather department administrators.
    
    Args:
        location_risk_data: Full risk data dict from compute_location_risk()
        changes: Dict of detected changes from detect_significant_changes()
    
    Returns:
        A dict with the report content and a formatted text version.
    """
    name = location_risk_data["name"]
    current = location_risk_data["current"]
    risk = location_risk_data["risk"]
    hap = location_risk_data.get("heat_action_plan", {})
    predictions = location_risk_data.get("prediction", [])
    demographics = location_risk_data.get("demographics", {})

    # Build change summary lines
    change_lines = []
    if "temperature" in changes:
        tc = changes["temperature"]
        change_lines.append(
            f"  Temperature {tc['direction']}: {tc['previous']}°C → {tc['current']}°C "
            f"(Δ {'+' if tc['delta'] > 0 else ''}{tc['delta']}°C)"
        )
    if "extreme_temp" in changes:
        et = changes["extreme_temp"]
        change_lines.append(
            f"  ⚠ EXTREME TEMP: {et['current']}°C "
            f"(exceeds {et['threshold']}°C threshold by {et['exceeded_by']}°C)"
        )
    if "wbgt_crossed" in changes:
        wc = changes["wbgt_crossed"]
        change_lines.append(
            f"  WBGT crossed DANGER: {wc['previous']}°C → {wc['current']}°C "
            f"(threshold: {wc['threshold']}°C)"
        )
    if "utci_crossed" in changes:
        uc = changes["utci_crossed"]
        change_lines.append(
            f"  UTCI crossed STRESS: {uc['previous']}°C → {uc['current']}°C "
            f"(threshold: {uc['threshold']}°C)"
        )

    # Prediction summary
    pred_lines = []
    for p in predictions[:5]:
        icon = "🔴" if p["impact_level"] in ["spike_likely", "surge_expected"] else "🟡" if p["impact_level"] == "elevated" else "🟢"
        pred_lines.append(
            f"  {icon} {p['date']}: WBGT {p['peak_wbgt']}°C | "
            f"Impact: {p['impact_level'].replace('_', ' ').title()}"
        )

    # Recommended actions
    admin_actions = hap.get("admin_actions", ["Standard monitoring"])
    action_lines = [f"  • {a}" for a in admin_actions]

    # Format the text report
    timestamp = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M UTC")
    text_report = "\n".join([
        "=" * 50,
        f"CSAH ADMIN WEATHER REPORT — {name}",
        f"Generated: {timestamp}",
        "=" * 50,
        "",
        "DETECTED CHANGES:",
        *change_lines,
        "",
        "CURRENT CONDITIONS:",
        f"  Temp: {current['temp_c']}°C | Humidity: {current['humidity_pct']}%",
        f"  WBGT: {current['wbgt_c']}°C | UTCI: {current['utci_c']}°C | HI: {current['heat_index_c']}°C",
        f"  Wind: {current['wind_kmh']} km/h | Solar: {current['solar_radiation']} W/m²",
        "",
        f"RISK ASSESSMENT:",
        f"  Score: {risk['score']}/100 | Category: {risk['category']}",
        f"  HAP Tier: {hap.get('tier', 'N/A')}",
        f"  Mortality: {risk['mortality_risk']}",
        "",
        "5-DAY PREDICTION:",
        *(pred_lines if pred_lines else ["  No elevated risk predicted."]),
        "",
        "VULNERABILITY:",
        f"  Elderly: {demographics.get('elderly_pct', 0)}% | Outdoor Workers: {demographics.get('outdoor_worker_pct', 0)}%",
        f"  Pop Density: {demographics.get('population_density', 0)}/km²",
        "",
        "RECOMMENDED ACTIONS:",
        *action_lines,
        "",
        "=" * 50,
    ])

    # Structured report for API response
    report = {
        "location_id": location_risk_data["id"],
        "location_name": name,
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "changes": changes,
        "current_conditions": {
            "temp_c": current["temp_c"],
            "humidity_pct": current["humidity_pct"],
            "wbgt_c": current["wbgt_c"],
            "utci_c": current["utci_c"],
            "heat_index_c": current["heat_index_c"],
            "wind_kmh": current["wind_kmh"],
            "solar_radiation": current["solar_radiation"],
        },
        "risk": risk,
        "hap_tier": hap.get("tier", "N/A"),
        "predictions": predictions[:5],
        "demographics": demographics,
        "admin_actions": admin_actions,
        "text_report": text_report,
    }

    return report


def send_admin_report(location_risk_data, changes):
    """
    Build and send an admin report for the given location.
    Respects cooldown to avoid spam.
    
    Returns:
        The report dict if sent, or None if skipped (cooldown / no changes).
    """
    loc_id = location_risk_data["id"]
    
    # Cooldown check
    now = time.time()
    if now - _admin_report_cooldown.get(loc_id, 0) < ADMIN_REPORT_COOLDOWN:
        return None

    report = build_admin_weather_report(location_risk_data, changes)

    # Log the report
    print(report["text_report"])

    # Send via SMS (will dry-run if Vonage is not configured)
    sms_body = "\n".join([
        f"CSAH ADMIN REPORT: {report['location_name']}",
        f"HAP: {report['hap_tier']} | Score: {report['risk']['score']}",
        f"Temp: {report['current_conditions']['temp_c']}°C | WBGT: {report['current_conditions']['wbgt_c']}°C",
        "",
        "Changes: " + ", ".join(
            f"{k}: {v.get('direction', 'TRIGGERED')}" 
            for k, v in changes.items()
        ),
        "",
        "Actions: " + " | ".join(report["admin_actions"][:2]),
    ])

    send_alert_sms(
        location_name=f"ADMIN_{report['location_name']}",
        message=sms_body,
        severity=report["hap_tier"],
        recipients=None,  # Falls back to .env configured numbers
    )

    _admin_report_cooldown[loc_id] = now
    return report


def check_all_locations_for_admin_reports(locations_data):
    """
    Called by the scheduler. Checks all locations for significant weather changes
    and sends admin reports where needed.
    
    Args:
        locations_data: List of location risk data dicts from _get_all_risk_data()
    
    Returns:
        List of generated reports.
    """
    reports = []
    for loc_data in locations_data:
        try:
            changes = detect_significant_changes(loc_data)
            if changes:
                report = send_admin_report(loc_data, changes)
                if report:
                    reports.append(report)
        except Exception as e:
            print(f"[AdminReport] Error processing {loc_data.get('name', '?')}: {e}")
    
    return reports
