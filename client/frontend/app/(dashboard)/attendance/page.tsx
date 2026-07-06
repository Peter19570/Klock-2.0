"use client";

import { GreetingHero } from "@/features/attendance/components/greeting-hero";
import { ClockCard } from "@/features/attendance/components/clock-card";
import { LocationMap } from "@/features/attendance/components/location-map";
import { RecentSessions } from "@/features/sessions/components/recent-sessions";
import { useGeolocation, formatCoordinates } from "@/hooks/use-geolocation";

export default function AttendancePage() {
  const geo = useGeolocation();

  return (
    <div className="pb-16">
      <GreetingHero />
      <section className="grid grid-cols-1 items-stretch justify-items-center gap-6 md:grid-cols-[1.3fr_1fr] md:items-center md:gap-4">
        <ClockCard />
        <div className="w-full max-w-[360px]">
          <LocationMap
            location={
              geo.status === "ready"
                ? geo.label
                : geo.status === "error"
                  ? geo.errorMessage
                  : null
            }
            coordinates={
              geo.latitude && geo.longitude
                ? formatCoordinates(geo.latitude, geo.longitude)
                : null
            }
          />
        </div>
      </section>
      <RecentSessions />
    </div>
  );
}
