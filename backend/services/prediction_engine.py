import os

CONSECUTIVE_HOT_DAYS_MULTIPLIER = float(os.environ.get("CONSECUTIVE_HOT_DAYS_MULTIPLIER", 1.15))
NIGHT_TEMP_RECOVERY_THRESHOLD = float(os.environ.get("NIGHT_TEMP_RECOVERY_THRESHOLD", 25.0))
WBGT_DANGER_THRESHOLD = float(os.environ.get("WBGT_DANGER_THRESHOLD", 30.0))

def run_prediction(forecast_hourly: list, pop_density: float) -> list:
    """
    Predicts heat-induced mortality and hospitalization spikes.
    Expects forecast_hourly to be a list of daily data.
    Actually we get hourly data from weather service, so let's process it.
    """
    # Group by date
    daily_data = {}
    for hour in forecast_hourly:
        date = hour["date"]
        if date not in daily_data:
            daily_data[date] = {
                "date": date,
                "wbgt_list": [],
                "utci_list": [],
                "hi_list": [],
                "temp_list": []
            }
        daily_data[date]["wbgt_list"].append(hour["wbgt"])
        daily_data[date]["utci_list"].append(hour["utci"])
        daily_data[date]["hi_list"].append(hour["hi"])
        daily_data[date]["temp_list"].append(hour["temp_c"])

    predictions = []
    consecutive_hot_days = 0

    sorted_dates = sorted(daily_data.keys())
    for date in sorted_dates:
        data = daily_data[date]
        
        peak_wbgt = max(data["wbgt_list"])
        peak_utci = max(data["utci_list"])
        peak_hi = max(data["hi_list"])
        night_temp = min(data["temp_list"]) # Rough proxy for night temp

        # Heat accumulation
        if peak_wbgt >= WBGT_DANGER_THRESHOLD:
            consecutive_hot_days += 1
        else:
            consecutive_hot_days = 0

        # Assess impact
        if peak_wbgt < 28:
            impact_level = "baseline"
        elif peak_wbgt < 30:
            if night_temp > NIGHT_TEMP_RECOVERY_THRESHOLD:
                impact_level = "spike_likely"
            else:
                impact_level = "elevated"
        else:
            if consecutive_hot_days >= 3 or night_temp > NIGHT_TEMP_RECOVERY_THRESHOLD:
                impact_level = "surge_expected"
            else:
                impact_level = "spike_likely"

        # Pop density amplifies risk in urban heat islands
        if pop_density > 20000 and impact_level == "spike_likely":
            impact_level = "surge_expected"

        predictions.append({
            "date": date,
            "peak_wbgt": peak_wbgt,
            "peak_utci": peak_utci,
            "peak_hi": peak_hi,
            "night_temp": night_temp,
            "consecutive_hot_days": consecutive_hot_days,
            "impact_level": impact_level
        })

    return predictions
