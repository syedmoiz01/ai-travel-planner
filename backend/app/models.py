from pydantic import BaseModel, ConfigDict, Field


class TripRequest(BaseModel):
    destination: str
    days: int = Field(gt=0, le=30)
    budget_usd: float = Field(gt=0)
    travel_style: str
    travelers: int = Field(default=1, gt=0)


class Activity(BaseModel):
    model_config = ConfigDict(extra="forbid")

    title: str
    description: str
    estimated_cost_usd: float


class DayPlan(BaseModel):
    model_config = ConfigDict(extra="forbid")

    day: int
    morning: Activity
    afternoon: Activity
    evening: Activity
    night: Activity
    recommended_restaurants: list[str]
    estimated_day_cost_usd: float


class Itinerary(BaseModel):
    model_config = ConfigDict(extra="forbid")

    destination: str
    summary: str
    total_estimated_cost_usd: float
    days: list[DayPlan]
    packing_tips: list[str]


class Hotel(BaseModel):
    name: str
    rating: float
    price_per_night_usd: float
    amenities: list[str]
    distance_from_center_km: float


class WeatherDay(BaseModel):
    date: str
    condition: str
    high_c: float
    low_c: float


class Attraction(BaseModel):
    name: str
    description: str
    ticket_price_usd: float
    time_required_hours: float
    google_rating: float


class MockDestinationInfo(BaseModel):
    destination: str
    overview: str
    currency: str
    timezone: str
    safety_score: int
    hotels: list[Hotel]
    weather_forecast: list[WeatherDay]
    attractions: list[Attraction]


class ChatMessage(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    messages: list[ChatMessage]


class ChatResponse(BaseModel):
    reply: str


class PricePoint(BaseModel):
    date: str
    flight_price_usd: float
    hotel_price_usd: float


class DealInfo(BaseModel):
    destination: str
    price_history: list[PricePoint]
    current_flight_price_usd: float
    current_hotel_price_usd: float
    cheapest_day_to_fly: str
    recommendation: str
    is_mock_data: bool
