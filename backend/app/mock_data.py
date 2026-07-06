"""Mock destination data shaped like the real APIs it will eventually be swapped for
(Google Places, OpenWeather, Amadeus). Swapping later is a data-source change only,
since the response shape (MockDestinationInfo) stays the same.
"""

from datetime import date, timedelta

from app.models import Attraction, Hotel, MockDestinationInfo, WeatherDay

_CONDITIONS = ["Sunny", "Partly Cloudy", "Rainy", "Clear"]


def mock_weather_forecast(days: int = 7) -> list[WeatherDay]:
    today = date.today()
    return [
        WeatherDay(
            date=(today + timedelta(days=i)).isoformat(),
            condition=_CONDITIONS[i % len(_CONDITIONS)],
            high_c=22 + (i % 5),
            low_c=14 + (i % 4),
        )
        for i in range(days)
    ]


def mock_hotels(destination: str) -> list[Hotel]:
    return [
        Hotel(
            name=f"{destination} Central Hotel",
            rating=4.3,
            price_per_night_usd=120,
            amenities=["Free WiFi", "Breakfast included", "Pool"],
            distance_from_center_km=0.8,
        ),
        Hotel(
            name=f"{destination} Boutique Stay",
            rating=4.6,
            price_per_night_usd=210,
            amenities=["Free WiFi", "Gym", "Rooftop bar"],
            distance_from_center_km=1.5,
        ),
        Hotel(
            name=f"Budget Inn {destination}",
            rating=3.8,
            price_per_night_usd=55,
            amenities=["Free WiFi", "24h reception"],
            distance_from_center_km=3.2,
        ),
    ]


def mock_attractions(destination: str) -> list[Attraction]:
    return [
        Attraction(
            name=f"{destination} Old Town",
            description="Historic center with local architecture and markets.",
            ticket_price_usd=0,
            time_required_hours=2.5,
            google_rating=4.6,
        ),
        Attraction(
            name=f"{destination} National Museum",
            description="Leading museum covering local history and art.",
            ticket_price_usd=15,
            time_required_hours=2,
            google_rating=4.4,
        ),
        Attraction(
            name=f"{destination} Viewpoint",
            description="Best panoramic view of the city skyline.",
            ticket_price_usd=8,
            time_required_hours=1,
            google_rating=4.7,
        ),
    ]


def get_mock_destination_info(destination: str) -> MockDestinationInfo:
    pretty_name = destination.strip().title()
    return MockDestinationInfo(
        destination=pretty_name,
        overview=f"{pretty_name} is a popular travel destination with a mix of culture, "
        "food, and attractions for every kind of traveler.",
        currency="USD",
        timezone="UTC+0",
        safety_score=8,
        hotels=mock_hotels(pretty_name),
        weather_forecast=mock_weather_forecast(),
        attractions=mock_attractions(pretty_name),
    )
