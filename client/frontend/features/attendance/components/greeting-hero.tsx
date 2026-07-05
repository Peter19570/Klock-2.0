"use client";

import { useAuthStore } from "@/store/auth-store";

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

export function GreetingHero() {
  const user = useAuthStore((s) => s.user);

  return (
    <section className="py-8 text-center sm:py-12 sm:text-left">
      <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
        {getGreeting()}, {user?.firstName ?? "there"}.
      </h1>
      <p className="mt-1.5 text-sm text-muted-foreground sm:text-base">
        {new Date().toLocaleDateString(undefined, { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
      </p>
    </section>
  );
}