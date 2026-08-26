import os
import requests

OPEN_METEO_BASE_URL = os.environ.get("OPEN_METEO_BASE_URL", "https://api.open-meteo.com/v1/forecast")


def fetch_weather(lat: float, lon: float):
    """Fetches current + hourly forecast weather from Open-Meteo. No API key required."""
    params = {
        "latitude": lat,
        "longitude": lon,
        "current": "temperature_2m,relative_humidity_2m,wind_speed_10m,shortwave_radiation",
        "hourly": "temperature_2m,relative_humidity_2m",
        "forecast_days": 2,
        "timezone": "auto",
    }
    response = requests.get(OPEN_METEO_BASE_URL, params=params, timeout=10)
    response.raise_for_status()
    data = response.json()

    current = data.get("current", {})
    hourly = data.get("hourly", {})

    return {
        "temp_c": current.get("temperature_2m"),
        "humidity_pct": current.get("relative_humidity_2m"),
        "wind_kmh": current.get("wind_speed_10m"),
        "solar_radiation": current.get("shortwave_radiation", 0),
        "hourly_times": hourly.get("time", []),
        "hourly_temps": hourly.get("temperature_2m", []),
        "hourly_humidity": hourly.get("relative_humidity_2m", []),
    }
