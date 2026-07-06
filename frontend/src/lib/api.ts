const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";

export type TripRequest = {
  destination: string;
  days: number;
  budget_usd: number;
  travel_style: string;
  travelers: number;
};

export type Activity = {
  title: string;
  description: string;
  estimated_cost_usd: number;
};

export type DayPlan = {
  day: number;
  morning: Activity;
  afternoon: Activity;
  evening: Activity;
  night: Activity;
  recommended_restaurants: string[];
  estimated_day_cost_usd: number;
};

export type Itinerary = {
  destination: string;
  summary: string;
  total_estimated_cost_usd: number;
  days: DayPlan[];
  packing_tips: string[];
};

export type Hotel = {
  name: string;
  rating: number;
  price_per_night_usd: number;
  amenities: string[];
  distance_from_center_km: number;
};

export type WeatherDay = {
  date: string;
  condition: string;
  high_c: number;
  low_c: number;
};

export type Attraction = {
  name: string;
  description: string;
  ticket_price_usd: number;
  time_required_hours: number;
  google_rating: number;
};

export type MockDestinationInfo = {
  destination: string;
  overview: string;
  currency: string;
  timezone: string;
  safety_score: number;
  hotels: Hotel[];
  weather_forecast: WeatherDay[];
  attractions: Attraction[];
};

export type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

export type PricePoint = {
  date: string;
  flight_price_usd: number;
  hotel_price_usd: number;
};

export type DealInfo = {
  destination: string;
  price_history: PricePoint[];
  current_flight_price_usd: number;
  current_hotel_price_usd: number;
  cheapest_day_to_fly: string;
  recommendation: string;
  is_mock_data: boolean;
};

async function parseErrorDetail(res: Response): Promise<string> {
  try {
    const body = await res.json();
    return body.detail ?? res.statusText;
  } catch {
    return res.statusText;
  }
}

export async function fetchItinerary(trip: TripRequest): Promise<Itinerary> {
  const res = await fetch(`${API_BASE_URL}/api/itinerary`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(trip),
  });
  if (!res.ok) {
    throw new Error(await parseErrorDetail(res));
  }
  return res.json();
}

export async function fetchDestinationInfo(
  name: string
): Promise<MockDestinationInfo> {
  const res = await fetch(
    `${API_BASE_URL}/api/destinations/${encodeURIComponent(name)}`
  );
  if (!res.ok) {
    throw new Error(await parseErrorDetail(res));
  }
  return res.json();
}

export async function sendChatMessage(
  messages: ChatMessage[]
): Promise<string> {
  const res = await fetch(`${API_BASE_URL}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages }),
  });
  if (!res.ok) {
    throw new Error(await parseErrorDetail(res));
  }
  const data = await res.json();
  return data.reply;
}

export async function fetchDealInfo(destination: string): Promise<DealInfo> {
  const res = await fetch(
    `${API_BASE_URL}/api/deals/${encodeURIComponent(destination)}`
  );
  if (!res.ok) {
    throw new Error(await parseErrorDetail(res));
  }
  return res.json();
}
