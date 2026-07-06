import os
from collections import defaultdict
from datetime import datetime

import httpx

from app.models import WeatherDay

GEOCODE_URL = "https://api.openweathermap.org/geo/1.0/direct"
FORECAST_URL = "https://api.openweathermap.org/data/2.5/forecast"


def is_configured() -> bool:
    return bool(os.environ.get("OPENWEATHER_API_KEY"))


def fetch_weather_forecast(destination: str) -> list[WeatherDay]:
    """Real 5-day forecast from OpenWeather. Raises on any failure; caller falls back to mock data."""
    api_key = os.environ["OPENWEATHER_API_KEY"]

    with httpx.Client(timeout=10.0) as client:
        geo_res = client.get(
            GEOCODE_URL, params={"q": destination, "limit": 1, "appid": api_key}
        )
        geo_res.raise_for_status()
        geo_data = geo_res.json()
        if not geo_data:
            raise ValueError(f"No coordinates found for destination: {destination}")
        lat, lon = geo_data[0]["lat"], geo_data[0]["lon"]

        forecast_res = client.get(
            FORECAST_URL,
            params={"lat": lat, "lon": lon, "appid": api_key, "units": "metric"},
        )
        forecast_res.raise_for_status()
        forecast_data = forecast_res.json()

    by_day: dict[str, list[dict]] = defaultdict(list)
    for entry in forecast_data["list"]:
        day = datetime.fromtimestamp(entry["dt"]).date().isoformat()
        by_day[day].append(entry)

    days: list[WeatherDay] = []
    for day, entries in list(by_day.items())[:7]:
        temps = [e["main"]["temp"] for e in entries]
        midday = min(entries, key=lambda e: abs(datetime.fromtimestamp(e["dt"]).hour - 12))
        days.append(
            WeatherDay(
                date=day,
                condition=midday["weather"][0]["main"],
                high_c=round(max(temps), 1),
                low_c=round(min(temps), 1),
            )
        )
    return days
