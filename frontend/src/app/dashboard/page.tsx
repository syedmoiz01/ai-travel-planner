"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/lib/auth-context";
import { deleteTrip, fetchTrips, type SavedTrip } from "@/lib/auth-api";

export default function DashboardPage() {
  const { user, token, loading: authLoading } = useAuth();
  const router = useRouter();
  const [trips, setTrips] = useState<SavedTrip[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!token) {
      router.push("/login");
      return;
    }
    fetchTrips(token)
      .then(setTrips)
      .finally(() => setLoading(false));
  }, [authLoading, token, router]);

  async function handleDelete(id: number) {
    if (!token) return;
    await deleteTrip(token, id);
    setTrips((prev) => prev.filter((t) => t.id !== id));
  }

  return (
    <div className="flex-1 flex flex-col">
      <SiteHeader />
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-10 space-y-6">
        <div>
          <h1 className="text-2xl font-heading font-bold">My trips</h1>
          {user && (
            <p className="text-muted-foreground text-sm">{user.email}</p>
          )}
        </div>

        {loading && (
          <div className="space-y-4">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        )}

        {!loading && trips.length === 0 && (
          <p className="text-muted-foreground">
            No saved trips yet.{" "}
            <Link href="/" className="underline">
              Plan one
            </Link>
            .
          </p>
        )}

        <div className="grid sm:grid-cols-2 gap-4">
          {trips.map((trip) => (
            <Card key={trip.id}>
              <CardHeader>
                <CardTitle className="text-base">{trip.destination}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {trip.itinerary.summary}
                </p>
                <p className="text-sm font-medium">
                  ${trip.itinerary.total_estimated_cost_usd.toLocaleString()}{" "}
                  · {trip.itinerary.days.length} days
                </p>
                <p className="text-xs text-muted-foreground">
                  Saved {new Date(trip.created_at).toLocaleDateString()}
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete(trip.id)}
                >
                  Remove
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}
