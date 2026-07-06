import type { Itinerary } from "@/lib/api";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";

export type AuthUser = {
  id: number;
  email: string;
  is_admin: boolean;
};

export type AuthResponse = {
  access_token: string;
  token_type: string;
  user: AuthUser;
};

export type SavedTrip = {
  id: number;
  destination: string;
  itinerary: Itinerary;
  created_at: string;
};

async function parseErrorDetail(res: Response): Promise<string> {
  try {
    const body = await res.json();
    return body.detail ?? res.statusText;
  } catch {
    return res.statusText;
  }
}

export async function register(
  email: string,
  password: string
): Promise<AuthResponse> {
  const res = await fetch(`${API_BASE_URL}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) throw new Error(await parseErrorDetail(res));
  return res.json();
}

export async function login(
  email: string,
  password: string
): Promise<AuthResponse> {
  const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) throw new Error(await parseErrorDetail(res));
  return res.json();
}

export async function fetchMe(token: string): Promise<AuthUser> {
  const res = await fetch(`${API_BASE_URL}/api/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(await parseErrorDetail(res));
  return res.json();
}

export async function saveTrip(
  token: string,
  destination: string,
  itinerary: Itinerary
): Promise<SavedTrip> {
  const res = await fetch(`${API_BASE_URL}/api/trips`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ destination, itinerary }),
  });
  if (!res.ok) throw new Error(await parseErrorDetail(res));
  return res.json();
}

export async function fetchTrips(token: string): Promise<SavedTrip[]> {
  const res = await fetch(`${API_BASE_URL}/api/trips`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(await parseErrorDetail(res));
  return res.json();
}

export async function deleteTrip(token: string, tripId: number): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/api/trips/${tripId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(await parseErrorDetail(res));
}

export type AdminStats = {
  total_users: number;
  total_trips: number;
};

export type AdminUser = {
  id: number;
  email: string;
  is_admin: boolean;
  created_at: string;
  trip_count: number;
};

export type AdminTrip = {
  id: number;
  user_email: string;
  destination: string;
  created_at: string;
};

export async function fetchAdminStats(token: string): Promise<AdminStats> {
  const res = await fetch(`${API_BASE_URL}/api/admin/stats`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(await parseErrorDetail(res));
  return res.json();
}

export async function fetchAdminUsers(token: string): Promise<AdminUser[]> {
  const res = await fetch(`${API_BASE_URL}/api/admin/users`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(await parseErrorDetail(res));
  return res.json();
}

export async function fetchAdminTrips(token: string): Promise<AdminTrip[]> {
  const res = await fetch(`${API_BASE_URL}/api/admin/trips`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(await parseErrorDetail(res));
  return res.json();
}

export async function deleteAdminUser(token: string, userId: number): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/api/admin/users/${userId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(await parseErrorDetail(res));
}
