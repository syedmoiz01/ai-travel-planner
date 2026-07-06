"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

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
    <form onSubmit={handleSubmit} className="w-full space-y-8">
      <div className="grid gap-2">
        <Label htmlFor="destination" className="tracking-wide">
          Where do you want to go?
        </Label>
        <Input
          id="destination"
          placeholder="e.g. Tokyo, Japan"
          value={destination}
          onChange={(e) => setDestination(e.target.value)}
          required
          className="bg-background border-foreground/40 h-11"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="grid gap-2">
          <Label htmlFor="days" className="tracking-wide">
            Days
          </Label>
          <Input
            id="days"
            type="number"
            min={1}
            max={30}
            value={days}
            onChange={(e) => setDays(Number(e.target.value))}
            className="bg-background border-foreground/40 h-11"
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="travelers" className="tracking-wide">
            Travelers
          </Label>
          <Input
            id="travelers"
            type="number"
            min={1}
            value={travelers}
            onChange={(e) => setTravelers(Number(e.target.value))}
            className="bg-background border-foreground/40 h-11"
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="budget" className="tracking-wide">
            Budget (USD)
          </Label>
          <Input
            id="budget"
            type="number"
            min={1}
            value={budget}
            onChange={(e) => setBudget(Number(e.target.value))}
            className="bg-background border-foreground/40 h-11"
          />
        </div>
      </div>

      <div className="grid gap-3">
        <Label className="tracking-wide">Travel style</Label>
        <div className="flex flex-wrap gap-2">
          {TRAVEL_STYLES.map((style) => {
            const selected = styles.includes(style);
            return (
              <button
                type="button"
                key={style}
                onClick={() => toggleStyle(style)}
                className={`border px-4 py-1.5 text-sm tracking-wide transition-colors ${
                  selected
                    ? "bg-foreground text-background border-foreground"
                    : "bg-transparent text-foreground border-foreground/40 hover:border-foreground"
                }`}
              >
                {style}
              </button>
            );
          })}
        </div>
      </div>

      <button
        type="submit"
        className="w-full bg-foreground text-background py-3.5 text-sm tracking-widest uppercase hover:opacity-85 transition-opacity"
      >
        Generate My Trip
      </button>
    </form>
  );
}
