"""Mocked price history and deal recommendations. No flight/hotel pricing API (Amadeus,
Skyscanner, booking partner APIs) is wired up yet -- this always returns deterministic
mock data, clearly flagged via `is_mock_data`, shaped so a real integration can drop in
without changing the response contract.
"""

import hashlib
from datetime import date, timedelta

from app.models import DealInfo, PricePoint

WEEKDAY_NAMES = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]


def _seeded_random(destination: str, day_index: int) -> float:
    """Deterministic pseudo-random float in [0, 1), stable per destination+day."""
    digest = hashlib.sha256(f"{destination.lower()}-{day_index}".encode()).hexdigest()
    return int(digest[:8], 16) / 0xFFFFFFFF


def get_deal_info(destination: str, days: int = 30) -> DealInfo:
    today = date.today()
    base_flight = 300 + int(_seeded_random(destination, 0) * 400)
    base_hotel = 80 + int(_seeded_random(destination, 1) * 150)

    history: list[PricePoint] = []
    weekday_flight_totals = [0.0] * 7
    weekday_counts = [0] * 7

    for i in range(days):
        day = today - timedelta(days=days - i)
        noise = _seeded_random(destination, i + 2)
        weekday = day.weekday()
        weekend_bump = 1.15 if weekday >= 5 else 1.0
        flight_price = round(base_flight * weekend_bump * (0.85 + noise * 0.3), 2)
        hotel_price = round(base_hotel * weekend_bump * (0.85 + _seeded_random(destination, i + 100) * 0.3), 2)
        history.append(
            PricePoint(date=day.isoformat(), flight_price_usd=flight_price, hotel_price_usd=hotel_price)
        )
        weekday_flight_totals[weekday] += flight_price
        weekday_counts[weekday] += 1

    current_flight_price = history[-1].flight_price_usd
    current_hotel_price = history[-1].hotel_price_usd
    avg_flight_price = sum(p.flight_price_usd for p in history) / len(history)

    weekday_avgs = [
        weekday_flight_totals[d] / weekday_counts[d] if weekday_counts[d] else float("inf")
        for d in range(7)
    ]
    cheapest_weekday = WEEKDAY_NAMES[weekday_avgs.index(min(weekday_avgs))]

    if current_flight_price <= avg_flight_price * 0.92:
        recommendation = "Book now — prices are below the 30-day average."
    elif current_flight_price >= avg_flight_price * 1.08:
        recommendation = "Prices are elevated; consider waiting a few days."
    else:
        recommendation = "Prices are near average — book whenever suits your plans."

    return DealInfo(
        destination=destination.strip().title(),
        price_history=history,
        current_flight_price_usd=current_flight_price,
        current_hotel_price_usd=current_hotel_price,
        cheapest_day_to_fly=cheapest_weekday,
        recommendation=recommendation,
        is_mock_data=True,
    )
