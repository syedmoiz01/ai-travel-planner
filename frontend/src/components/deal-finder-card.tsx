"use client";

import { useEffect, useState } from "react";

import { fetchDealInfo, type DealInfo } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

function Sparkline({ values }: { values: number[] }) {
  const width = 320;
  const height = 80;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const points = values
    .map((v, i) => {
      const x = (i / (values.length - 1)) * width;
      const y = height - ((v - min) / range) * height;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-20">
      <polyline
        points={points}
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        className="text-primary"
      />
    </svg>
  );
}

export function DealFinderCard({ destination }: { destination: string }) {
  const [deal, setDeal] = useState<DealInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetchDealInfo(destination)
      .then((res) => {
        if (!cancelled) setDeal(res);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [destination]);

  if (loading) {
    return <Skeleton className="h-48 w-full" />;
  }

  if (!deal) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Deal finder
          {deal.is_mock_data && (
            <Badge variant="outline" className="text-xs font-normal">
              Illustrative data — live pricing not yet connected
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Sparkline values={deal.price_history.map((p) => p.flight_price_usd)} />
        <div className="grid sm:grid-cols-3 gap-3 text-sm">
          <div>
            <p className="text-muted-foreground">Current flight price</p>
            <p className="font-medium">${deal.current_flight_price_usd}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Current hotel price / night</p>
            <p className="font-medium">${deal.current_hotel_price_usd}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Cheapest day to fly</p>
            <p className="font-medium">{deal.cheapest_day_to_fly}</p>
          </div>
        </div>
        <p className="text-sm font-medium">{deal.recommendation}</p>
      </CardContent>
    </Card>
  );
}
