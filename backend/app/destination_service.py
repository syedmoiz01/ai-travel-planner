import logging

from app import mock_data, places_service, weather_service
from app.models import MockDestinationInfo

logger = logging.getLogger(__name__)


def get_destination_info(destination: str) -> MockDestinationInfo:
    """Real data where an API key is configured, mock data as a per-field fallback
    (on missing key or a failed call, so one flaky integration doesn't break the page).
    """
    pretty_name = destination.strip().title()
    fallback = mock_data.get_mock_destination_info(destination)

    weather = fallback.weather_forecast
    if weather_service.is_configured():
        try:
            weather = weather_service.fetch_weather_forecast(destination)
        except Exception:
            logger.warning("Weather fetch failed for %s, using mock data", destination, exc_info=True)

    hotels = fallback.hotels
    attractions = fallback.attractions
    if places_service.is_configured():
        try:
            hotels = places_service.fetch_hotels(destination)
        except Exception:
            logger.warning("Hotel fetch failed for %s, using mock data", destination, exc_info=True)
        try:
            attractions = places_service.fetch_attractions(destination)
        except Exception:
            logger.warning("Attraction fetch failed for %s, using mock data", destination, exc_info=True)

    return MockDestinationInfo(
        destination=pretty_name,
        overview=fallback.overview,
        currency=fallback.currency,
        timezone=fallback.timezone,
        safety_score=fallback.safety_score,
        hotels=hotels,
        weather_forecast=weather,
        attractions=attractions,
    )
