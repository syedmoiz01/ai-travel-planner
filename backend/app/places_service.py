import math
import os

import httpx

from app.models import Attraction, Hotel

GEOCODE_URL = "https://maps.googleapis.com/maps/api/geocode/json"
TEXT_SEARCH_URL = "https://maps.googleapis.com/maps/api/place/textsearch/json"

PRICE_LEVEL_USD = {0: 40, 1: 70, 2: 120, 3: 200, 4: 350}


def is_configured() -> bool:
    return bool(os.environ.get("GOOGLE_MAPS_API_KEY"))


def _haversine_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    r = 6371.0
    p1, p2 = math.radians(lat1), math.radians(lat2)
    dp = math.radians(lat2 - lat1)
    dl = math.radians(lon2 - lon1)
    a = math.sin(dp / 2) ** 2 + math.cos(p1) * math.cos(p2) * math.sin(dl / 2) ** 2
    return round(r * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a)), 1)


def _geocode_center(client: httpx.Client, destination: str, api_key: str) -> tuple[float, float]:
    res = client.get(GEOCODE_URL, params={"address": destination, "key": api_key})
    res.raise_for_status()
    data = res.json()
    if not data.get("results"):
        raise ValueError(f"No coordinates found for destination: {destination}")
    loc = data["results"][0]["geometry"]["location"]
    return loc["lat"], loc["lng"]


def _text_search(client: httpx.Client, query: str, api_key: str) -> list[dict]:
    res = client.get(TEXT_SEARCH_URL, params={"query": query, "key": api_key})
    res.raise_for_status()
    data = res.json()
    return data.get("results", [])[:6]


def fetch_hotels(destination: str) -> list[Hotel]:
    """Real hotel data from Google Places. Raises on failure; caller falls back to mock data."""
    api_key = os.environ["GOOGLE_MAPS_API_KEY"]
    with httpx.Client(timeout=10.0) as client:
        center_lat, center_lon = _geocode_center(client, destination, api_key)
        results = _text_search(client, f"hotels in {destination}", api_key)

    hotels = []
    for r in results:
        loc = r["geometry"]["location"]
        hotels.append(
            Hotel(
                name=r["name"],
                rating=r.get("rating", 4.0),
                price_per_night_usd=PRICE_LEVEL_USD.get(r.get("price_level", 2), 120),
                amenities=["Free WiFi"],
                distance_from_center_km=_haversine_km(
                    center_lat, center_lon, loc["lat"], loc["lng"]
                ),
            )
        )
    if not hotels:
        raise ValueError(f"No hotels found for destination: {destination}")
    return hotels


def fetch_attractions(destination: str) -> list[Attraction]:
    """Real attraction data from Google Places. Raises on failure; caller falls back to mock data."""
    api_key = os.environ["GOOGLE_MAPS_API_KEY"]
    with httpx.Client(timeout=10.0) as client:
        results = _text_search(client, f"tourist attractions in {destination}", api_key)

    attractions = [
        Attraction(
            name=r["name"],
            description=r.get("formatted_address", ""),
            ticket_price_usd=PRICE_LEVEL_USD.get(r.get("price_level", 0), 0) if "price_level" in r else 0,
            time_required_hours=1.5,
            google_rating=r.get("rating", 4.0),
        )
        for r in results
    ]
    if not attractions:
        raise ValueError(f"No attractions found for destination: {destination}")
    return attractions
