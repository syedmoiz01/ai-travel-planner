"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const TRAVEL_STYLES = [
  "Luxury",
  "Budget",
  "Backpacking",
  "Adventure",
  "Family",
  "Business",
  "Couple",
  "Beach",
  "Mountains",
  "Historical",
  "Food",
  "Nightlife",
];

export function TripSearchForm() {
  const router = useRouter();
  const [destination, setDestination] = useState("");
  const [days, setDays] = useState(5);
  const [travelers, setTravelers] = useState(2);
  const [budget, setBudget] = useState(2000);
  const [styles, setStyles] = useState<string[]>([]);

  function toggleStyle(style: string) {
    setStyles((prev) =>
      prev.includes(style)
        ? prev.filter((s) => s !== style)
        : [...prev, style]
    );
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!destination.trim()) return;

    const params = new URLSearchParams({
      destination: destination.trim(),
      days: String(days),
      travelers: String(travelers),
      budget_usd: String(budget),
      travel_style: styles.length ? styles.join(" + ") : "General sightseeing",
    });
    router.push(`/plan?${params.toString()}`);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-3xl mx-auto rounded-2xl border bg-card text-card-foreground shadow-lg p-6 sm:p-8 space-y-6"
    >
      <div className="grid gap-2">
        <Label htmlFor="destination">Where do you want to go?</Label>
        <Input
          id="destination"
          placeholder="e.g. Tokyo, Japan"
          value={destination}
          onChange={(e) => setDestination(e.target.value)}
          required
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="days">Days</Label>
          <Input
            id="days"
            type="number"
            min={1}
            max={30}
            value={days}
            onChange={(e) => setDays(Number(e.target.value))}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="travelers">Travelers</Label>
          <Input
            id="travelers"
            type="number"
            min={1}
            value={travelers}
            onChange={(e) => setTravelers(Number(e.target.value))}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="budget">Budget (USD)</Label>
          <Input
            id="budget"
            type="number"
            min={1}
            value={budget}
            onChange={(e) => setBudget(Number(e.target.value))}
          />
        </div>
      </div>

      <div className="grid gap-2">
        <Label>Travel style</Label>
        <div className="flex flex-wrap gap-2">
          {TRAVEL_STYLES.map((style) => {
            const selected = styles.includes(style);
            return (
              <button
                type="button"
                key={style}
                onClick={() => toggleStyle(style)}
                className={`rounded-full border px-3 py-1 text-sm transition-colors ${
                  selected
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-transparent text-foreground border-border hover:bg-accent"
                }`}
              >
                {style}
              </button>
            );
          })}
        </div>
      </div>

      <Button type="submit" size="lg" className="w-full">
        Generate My Trip
      </Button>
    </form>
  );
}
