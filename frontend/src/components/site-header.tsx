"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { useAuth } from "@/lib/auth-context";

function LogoMark() {
  return (
    <svg
      viewBox="0 0 48 48"
      className="size-10 text-foreground"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      aria-hidden="true"
    >
      <path d="M24 6 L42 42 L6 42 Z" />
      <path d="M24 14 L33 32 L15 32 Z" />
    </svg>
  );
}

export function SiteHeader() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();

  function handleLogout() {
    logout();
    router.push("/");
  }

  return (
    <header className="sticky top-0 z-40 bg-background border-b border-border/60">
      <div className="flex items-center justify-between px-6 sm:px-10 py-4 max-w-7xl mx-auto w-full">
        <Link href="/" className="flex items-center gap-3">
          <LogoMark />
          <span className="font-heading text-xl font-bold tracking-wide">
            AI Travel Planner
          </span>
        </Link>
        <nav className="flex items-center gap-1 sm:gap-2 text-sm">
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
                Log In
              </Button>
              <Button
                variant="outline"
                nativeButton={false}
                render={<Link href="/register" />}
              >
                Sign Up
              </Button>
            </>
          )}
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}
