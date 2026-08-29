from utils.formulas import heat_index_celsius, wbgt_outdoor, utci_approx, composite_risk_score, risk_category, mortality_risk_label
from services.weather_service import fetch_weather
from services.prediction_engine import run_prediction
from services.heat_action_plan import get_heat_action_plan

def compute_location_risk(location: dict, peak_hour: str = "15:00", forecast_days: int = 5):
    weather = fetch_weather(location["lat"], location["lon"])

    elderly = location.get("elderly_pct", 10.0)
    workers = location.get("outdoor_worker_pct", 20.0)
    density = location.get("population_density", 15000)

    # Current conditions metrics
    temp_c = weather["temp_c"]
    hum_pct = weather["humidity_pct"]
    wind_kmh = weather["wind_kmh"]
    solar_rad = weather["solar_radiation"]

    hi_c = heat_index_celsius(temp_c, hum_pct)
    wbgt_c = wbgt_outdoor(temp_c, hum_pct, wind_kmh, solar_rad)
    utci_c = utci_approx(temp_c, hum_pct, wind_kmh, solar_rad)

    score = composite_risk_score(hi_c, wbgt_c, utci_c, elderly, workers, density)
    category, color = risk_category(score)
    mortality_note = mortality_risk_label(score)
    hap = get_heat_action_plan(score)

    # Hourly forecast for prediction engine
    forecast_hourly = []
    
    # Peak daily forecast for dashboard display
    forecast_daily = []
    seen_dates = set()

    # The weather service returns arrays of the same length
    num_hours = len(weather["hourly_times"])
    for i in range(num_hours):
        t = weather["hourly_times"][i]
        if "T" not in t:
            continue
            
        date_part, time_part = t.split("T")
        
        f_temp = weather["hourly_temps"][i]
        f_hum = weather["hourly_humidity"][i]
        f_wind = weather["hourly_wind"][i]
        f_solar = weather["hourly_solar"][i]

        f_hi = heat_index_celsius(f_temp, f_hum)
        f_wbgt = wbgt_outdoor(f_temp, f_hum, f_wind, f_solar)
        f_utci = utci_approx(f_temp, f_hum, f_wind, f_solar)

        forecast_hourly.append({
            "date": date_part,
            "time": time_part,
            "temp_c": f_temp,
            "hi": f_hi,
            "wbgt": f_wbgt,
            "utci": f_utci
        })

        if time_part == peak_hour and date_part not in seen_dates:
            f_score = composite_risk_score(f_hi, f_wbgt, f_utci, elderly, workers, density)
            f_category, _ = risk_category(f_score)
            forecast_daily.append({
                "date": date_part,
                "time": t,
                "heat_index_c": f_hi,
                "wbgt_c": f_wbgt,
                "utci_c": f_utci,
                "risk_category": f_category,
            })
            seen_dates.add(date_part)
            
        if len(forecast_daily) >= forecast_days and i == num_hours - 1:
            pass # Keep collecting hourly for prediction even if daily is full

    predictions = run_prediction(forecast_hourly, density)
    # Truncate predictions to forecast_days
    predictions = predictions[:forecast_days]

    return {
        "id": location["id"],
        "name": location["name"],
        "lat": location["lat"],
        "lon": location["lon"],
        "current": {
            "temp_c": temp_c,
            "humidity_pct": hum_pct,
            "wind_kmh": wind_kmh,
            "wind_direction": weather.get("wind_direction", 0),
            "precipitation": weather.get("precipitation", 0),
            "solar_radiation": solar_rad,
            "dewpoint_c": weather.get("dewpoint_c"),
            "wet_bulb_c": weather.get("wet_bulb_c"),
            "heat_index_c": hi_c,
            "wbgt_c": wbgt_c,
            "utci_c": utci_c,
        },
        "demographics": {
            "elderly_pct": elderly,
            "outdoor_worker_pct": workers,
            "population_density": density
        },
        "risk": {
            "score": score, # now a composite score
            "category": category,
            "category_color": color,
            "mortality_risk": mortality_note,
        },
        "prediction": predictions,
        "heat_action_plan": hap,
        "forecast": forecast_daily,
    }
