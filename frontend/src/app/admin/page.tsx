"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { SiteHeader } from "@/components/site-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/lib/auth-context";
import {
  deleteAdminUser,
  fetchAdminStats,
  fetchAdminTrips,
  fetchAdminUsers,
  type AdminStats,
  type AdminTrip,
  type AdminUser,
} from "@/lib/auth-api";

export default function AdminPage() {
  const { user, token, loading: authLoading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [trips, setTrips] = useState<AdminTrip[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!token) {
      router.push("/login");
      return;
    }
    if (!user?.is_admin) {
      // Not an admin, nothing external to fetch; stop showing the loading skeleton.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLoading(false);
      return;
    }
    Promise.all([
      fetchAdminStats(token),
      fetchAdminUsers(token),
      fetchAdminTrips(token),
    ])
      .then(([statsRes, usersRes, tripsRes]) => {
        setStats(statsRes);
        setUsers(usersRes);
        setTrips(tripsRes);
      })
      .finally(() => setLoading(false));
  }, [authLoading, token, user, router]);

  async function handleDeleteUser(id: number) {
    if (!token) return;
    await deleteAdminUser(token, id);
    setUsers((prev) => prev.filter((u) => u.id !== id));
  }

  if (!authLoading && token && !user?.is_admin) {
    return (
      <div className="flex-1 flex flex-col">
        <SiteHeader />
        <main className="flex-1 flex items-center justify-center px-4">
          <p className="text-muted-foreground">
            You don&apos;t have access to the admin dashboard.
          </p>
        </main>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col">
      <SiteHeader />
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-10 space-y-8">
        <h1 className="text-2xl font-heading font-bold">Admin dashboard</h1>

        {loading ? (
          <Skeleton className="h-64 w-full" />
        ) : (
          <>
            <div className="grid sm:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Total users</CardTitle>
                </CardHeader>
                <CardContent className="text-3xl font-bold">
                  {stats?.total_users}
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Total saved trips</CardTitle>
                </CardHeader>
                <CardContent className="text-3xl font-bold">
                  {stats?.total_trips}
                </CardContent>
              </Card>
            </div>

            <div>
              <h2 className="text-lg font-semibold mb-3">Users</h2>
              <div className="space-y-2">
                {users.map((u) => (
                  <div
                    key={u.id}
                    className="flex items-center justify-between border rounded-lg px-4 py-3"
                  >
                    <div>
                      <p className="font-medium">
                        {u.email}{" "}
                        {u.is_admin && (
                          <Badge variant="secondary" className="ml-1">
                            Admin
                          </Badge>
                        )}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {u.trip_count} saved trips ·{" "}
                        {new Date(u.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    {!u.is_admin && (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteUser(u.id)}
                      >
                        Delete
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h2 className="text-lg font-semibold mb-3">All saved trips</h2>
              <div className="space-y-2">
                {trips.map((t) => (
                  <div
                    key={t.id}
                    className="flex items-center justify-between gap-4 border rounded-lg px-4 py-3 text-sm"
                  >
                    <span className="font-medium">{t.destination}</span>
                    <span className="text-muted-foreground">{t.user_email}</span>
                    <span className="text-muted-foreground shrink-0">
                      {new Date(t.created_at).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
