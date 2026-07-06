"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { useAuth } from "@/lib/auth-context";

export function SiteHeader() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();

  function handleLogout() {
    logout();
    router.push("/");
  }

  return (
    <header className="flex items-center justify-between px-6 py-4 max-w-6xl mx-auto w-full">
      <Link href="/" className="font-heading text-lg font-semibold">
        AI Travel Planner
      </Link>
      <div className="flex items-center gap-3">
        {!loading && user && (
          <>
            <Button
              variant="ghost"
              nativeButton={false}
              render={<Link href="/dashboard" />}
            >
              My trips
            </Button>
            {user.is_admin && (
              <Button
                variant="ghost"
                nativeButton={false}
                render={<Link href="/admin" />}
              >
                Admin
              </Button>
            )}
            <Button variant="ghost" onClick={handleLogout}>
              Log out
            </Button>
          </>
        )}
        {!loading && !user && (
          <>
            <Button
              variant="ghost"
              nativeButton={false}
              render={<Link href="/login" />}
            >
              Log in
            </Button>
            <Button
              variant="outline"
              nativeButton={false}
              render={<Link href="/register" />}
            >
              Sign up
            </Button>
          </>
        )}
        <ThemeToggle />
      </div>
    </header>
  );
}
