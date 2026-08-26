from utils.formulas import heat_index_celsius, risk_score, risk_category
from services.weather_service import fetch_weather


def compute_location_risk(location: dict, forecast_hours: int = 12):
    weather = fetch_weather(location["lat"], location["lon"])

    hi_c = heat_index_celsius(weather["temp_c"], weather["humidity_pct"])
    score = risk_score(hi_c, location["elderly_pct"], location["outdoor_worker_pct"])
    category, color = risk_category(score)

    forecast = []
    times = weather["hourly_times"][:forecast_hours]
    temps = weather["hourly_temps"][:forecast_hours]
    hums = weather["hourly_humidity"][:forecast_hours]

    for t, temp, hum in zip(times, temps, hums):
        f_hi = heat_index_celsius(temp, hum)
        f_score = risk_score(f_hi, location["elderly_pct"], location["outdoor_worker_pct"])
        f_category, _ = risk_category(f_score)
        forecast.append({"time": t, "heat_index_c": f_hi, "risk_category": f_category})

    return {
        "id": location["id"],
        "name": location["name"],
        "lat": location["lat"],
        "lon": location["lon"],
        "current": {
            "temp_c": weather["temp_c"],
            "humidity_pct": weather["humidity_pct"],
            "wind_kmh": weather["wind_kmh"],
            "solar_radiation": weather["solar_radiation"],
            "heat_index_c": hi_c,
        },
        "demographics": {
            "elderly_pct": location["elderly_pct"],
            "outdoor_worker_pct": location["outdoor_worker_pct"],
        },
        "risk": {"score": score, "category": category, "category_color": color},
        "forecast": forecast,
    }
