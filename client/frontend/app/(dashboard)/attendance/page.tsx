import { GreetingHero } from "@/features/attendance/components/greeting-hero";
import { ClockCard } from "@/features/attendance/components/clock-card";
import { LocationMap } from "@/features/attendance/components/location-map";

export default function AttendancePage() {
  return (
    <div className="pb-16">
      <GreetingHero />
      <section className="grid grid-cols-1 items-center justify-items-center gap-10 md:grid-cols-2">
        <ClockCard />
        <div className="flex h-[280px] w-full max-w-[360px] items-center justify-center">
          <LocationMap />
        </div>
      </section>
    </div>
  );
}