import json
import os
from typing import Optional

from openai import OpenAI

from app.models import ChatMessage, Itinerary, TripRequest

_client: Optional[OpenAI] = None


def get_client() -> OpenAI:
    global _client
    if _client is None:
        _client = OpenAI(
            api_key=os.environ["LLM_API_KEY"],
            base_url=os.environ.get("LLM_BASE_URL", "https://api.openai.com/v1"),
        )
    return _client


SYSTEM_PROMPT = """You are an expert travel planner. Given a trip request, produce a complete \
day-by-day itinerary as a single JSON object. Respond with ONLY valid JSON matching this exact \
shape, no markdown fences, no commentary:

{
  "destination": string,
  "summary": string,
  "total_estimated_cost_usd": number,
  "days": [
    {
      "day": integer starting at 1,
      "morning": {"title": string, "description": string, "estimated_cost_usd": number},
      "afternoon": {"title": string, "description": string, "estimated_cost_usd": number},
      "evening": {"title": string, "description": string, "estimated_cost_usd": number},
      "night": {"title": string, "description": string, "estimated_cost_usd": number},
      "recommended_restaurants": [string, ...],
      "estimated_day_cost_usd": number
    },
    ...
  ],
  "packing_tips": [string, ...]
}

Produce exactly the requested number of days. Keep total_estimated_cost_usd realistic relative \
to the traveler's stated budget. Tailor activities to the requested travel style.
"""


def generate_itinerary(trip: TripRequest) -> Itinerary:
    client = get_client()
    model = os.environ.get("LLM_MODEL", "gpt-4o-mini")

    user_prompt = (
        f"Destination: {trip.destination}\n"
        f"Days: {trip.days}\n"
        f"Budget: ${trip.budget_usd}\n"
        f"Travel style: {trip.travel_style}\n"
        f"Travelers: {trip.travelers}\n"
    )

    response = client.chat.completions.create(
        model=model,
        response_format={"type": "json_object"},
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": user_prompt},
        ],
    )

    content = response.choices[0].message.content
    data = json.loads(content)
    return Itinerary.model_validate(data)


CHAT_SYSTEM_PROMPT = """You are a friendly, knowledgeable AI travel assistant embedded in a \
travel planning website. Answer questions about destinations, itineraries, budgets, weather, \
and travel logistics concisely and helpfully. Keep responses focused and conversational \
(a few sentences to a short paragraph, not a full itinerary dump unless asked)."""


def chat_reply(messages: list[ChatMessage]) -> str:
    client = get_client()
    model = os.environ.get("LLM_MODEL", "gpt-4o-mini")

    response = client.chat.completions.create(
        model=model,
        messages=[{"role": "system", "content": CHAT_SYSTEM_PROMPT}]
        + [{"role": m.role, "content": m.content} for m in messages],
    )
    return response.choices[0].message.content
