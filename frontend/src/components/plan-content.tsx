"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import {
  fetchDestinationInfo,
  fetchItinerary,
  type Itinerary,
  type MockDestinationInfo,
} from "@/lib/api";
import { saveTrip } from "@/lib/auth-api";
import { useAuth } from "@/lib/auth-context";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DealFinderCard } from "@/components/deal-finder-card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

const SLOTS = ["morning", "afternoon", "evening", "night"] as const;

export function PlanContent() {
  const { token } = useAuth();
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error">(
    "idle"
  );
  const params = useSearchParams();
  const destination = params.get("destination") ?? "";
  const days = Number(params.get("days") ?? 3);
  const travelers = Number(params.get("travelers") ?? 1);
  const budgetUsd = Number(params.get("budget_usd") ?? 1000);
  const travelStyle = params.get("travel_style") ?? "General sightseeing";

  const [itinerary, setItinerary] = useState<Itinerary | null>(null);
  const [destinationInfo, setDestinationInfo] =
    useState<MockDestinationInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!destination) return;
    let cancelled = false;
    // Resetting fetch state for a new set of search params, not derivable from render.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    setError(null);

    Promise.all([
      fetchItinerary({
        destination,
        days,
        budget_usd: budgetUsd,
        travel_style: travelStyle,
        travelers,
      }),
      fetchDestinationInfo(destination),
    ])
      .then(([itineraryRes, infoRes]) => {
        if (cancelled) return;
        setItinerary(itineraryRes);
        setDestinationInfo(infoRes);
      })
      .catch((err: Error) => {
        if (cancelled) return;
        setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [destination, days, travelers, budgetUsd, travelStyle]);

  async function handleSave() {
    if (!token || !itinerary) return;
    setSaveState("saving");
    try {
      await saveTrip(token, itinerary.destination, itinerary);
      setSaveState("saved");
    } catch {
      setSaveState("error");
    }
  }

  if (!destination) {
    return (
      <p className="text-muted-foreground">
        No destination provided. Go back and search for a trip.
      </p>
    );
  }

  if (loading) {
    return (
      <div className="space-y-4 w-full max-w-3xl">
        <Skeleton className="h-8 w-1/2" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <Card className="w-full max-w-2xl border-destructive">
        <CardHeader>
          <CardTitle>Couldn&apos;t generate itinerary</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          {error}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full max-w-4xl space-y-10">
      {itinerary && (
        <section className="space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-heading font-bold">
                {itinerary.destination}
              </h1>
              <p className="text-muted-foreground mt-1">{itinerary.summary}</p>
              <p className="mt-2 font-medium">
                Estimated total cost: $
                {itinerary.total_estimated_cost_usd.toLocaleString()}
              </p>
            </div>
            {token && (
              <Button
                variant="outline"
                onClick={handleSave}
                disabled={saveState === "saving" || saveState === "saved"}
              >
                {saveState === "saved"
                  ? "Saved"
                  : saveState === "saving"
                    ? "Saving..."
                    : "Save trip"}
              </Button>
            )}
          </div>

          <DealFinderCard destination={itinerary.destination} />

          <div className="space-y-6">
            {itinerary.days.map((day) => (
              <Card key={day.day}>
                <CardHeader>
                  <CardTitle>
                    Day {day.day} · ${day.estimated_day_cost_usd.toLocaleString()}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    {SLOTS.map((slot) => {
                      const activity = day[slot];
                      return (
                        <div key={slot} className="space-y-1">
                          <Badge variant="secondary" className="capitalize">
                            {slot}
                          </Badge>
                          <p className="font-medium">{activity.title}</p>
                          <p className="text-sm text-muted-foreground">
                            {activity.description}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Est. ${activity.estimated_cost_usd.toLocaleString()}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                  <Separator />
                  <div>
                    <p className="text-sm font-medium mb-1">
                      Recommended restaurants
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {day.recommended_restaurants.map((r) => (
                        <Badge key={r} variant="outline">
                          {r}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Packing tips</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                {itinerary.packing_tips.map((tip) => (
                  <li key={tip}>{tip}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </section>
      )}

      {destinationInfo && (
        <section className="space-y-6">
          <Separator />
          <div>
            <h2 className="text-2xl font-heading font-bold">
              About {destinationInfo.destination}
            </h2>
            <p className="text-muted-foreground mt-1">
              {destinationInfo.overview}
            </p>
            <div className="flex flex-wrap gap-2 mt-3 text-sm">
              <Badge variant="outline">
                Currency: {destinationInfo.currency}
              </Badge>
              <Badge variant="outline">
                Timezone: {destinationInfo.timezone}
              </Badge>
              <Badge variant="outline">
                Safety score: {destinationInfo.safety_score}/10
              </Badge>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-3">Hotels</h3>
            <div className="grid sm:grid-cols-3 gap-4">
              {destinationInfo.hotels.map((hotel) => (
                <Card key={hotel.name}>
                  <CardHeader>
                    <CardTitle className="text-base">{hotel.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm space-y-1">
                    <p>Rating: {hotel.rating} / 5</p>
                    <p>${hotel.price_per_night_usd} / night</p>
                    <p className="text-muted-foreground">
                      {hotel.distance_from_center_km} km from center
                    </p>
                    <div className="flex flex-wrap gap-1 pt-1">
                      {hotel.amenities.map((a) => (
                        <Badge key={a} variant="secondary" className="text-xs">
                          {a}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-3">Attractions</h3>
            <div className="grid sm:grid-cols-3 gap-4">
              {destinationInfo.attractions.map((attraction) => (
                <Card key={attraction.name}>
                  <CardHeader>
                    <CardTitle className="text-base">
                      {attraction.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm space-y-1">
                    <p className="text-muted-foreground">
                      {attraction.description}
                    </p>
                    <p>
                      ${attraction.ticket_price_usd} ·{" "}
                      {attraction.time_required_hours}h · ★
                      {attraction.google_rating}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-3">7-day forecast</h3>
            <div className="flex gap-3 overflow-x-auto pb-2">
              {destinationInfo.weather_forecast.map((day) => (
                <Card key={day.date} className="min-w-[110px] flex-shrink-0">
                  <CardContent className="text-center text-sm pt-4 space-y-1">
                    <p className="text-muted-foreground text-xs">
                      {day.date}
                    </p>
                    <p>{day.condition}</p>
                    <p>
                      {day.high_c}° / {day.low_c}°
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
