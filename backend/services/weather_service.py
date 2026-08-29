import os
import requests

OPEN_METEO_BASE_URL = os.environ.get("OPEN_METEO_BASE_URL", "https://api.open-meteo.com/v1/forecast")


def fetch_weather(lat: float, lon: float):
    """Fetches current + 5-day hourly forecast from Open-Meteo. No API key required."""
    params = {
        "latitude": lat,
        "longitude": lon,
        "current": "temperature_2m,relative_humidity_2m,wind_speed_10m,wind_direction_10m,precipitation,shortwave_radiation,dew_point_2m,wet_bulb_temperature_2m,wind_gusts_10m",
        "hourly": "temperature_2m,relative_humidity_2m,dew_point_2m,wind_speed_10m,wind_direction_10m,precipitation,shortwave_radiation,wet_bulb_temperature_2m",
        "forecast_days": 5,
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
        "wind_direction": current.get("wind_direction_10m"),
        "precipitation": current.get("precipitation"),
        "wind_gusts_kmh": current.get("wind_gusts_10m"),
        "solar_radiation": current.get("shortwave_radiation", 0),
        "dewpoint_c": current.get("dew_point_2m"),
        "wet_bulb_c": current.get("wet_bulb_temperature_2m"),
        "hourly_times": hourly.get("time", []),
        "hourly_temps": hourly.get("temperature_2m", []),
        "hourly_humidity": hourly.get("relative_humidity_2m", []),
        "hourly_wind": hourly.get("wind_speed_10m", []),
        "hourly_wind_dir": hourly.get("wind_direction_10m", []),
        "hourly_precip": hourly.get("precipitation", []),
        "hourly_solar": hourly.get("shortwave_radiation", []),
        "hourly_dewpoint": hourly.get("dew_point_2m", []),
        "hourly_wetbulb": hourly.get("wet_bulb_temperature_2m", []),
    }

