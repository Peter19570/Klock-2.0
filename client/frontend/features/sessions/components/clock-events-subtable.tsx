"use client";

import { cn } from "@/lib/utils";
import type { components } from "@/lib/api/generated/schema";

type ClockEvent = NonNullable<
  components["schemas"]["SessionResponse"]["clockEvents"]
>[number];

interface ClockEventsSubTableProps {
  events: ClockEvent[];
}

const CLOCK_OUT_LABELS: Record<string, string> = {
  MANUAL: "Manual",
  AUTOMATIC: "Automatic",
  SERVER: "Server",
  ADMIN_FORCE: "Admin forced",
};

function formatTime(dateStr?: string) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function ClockEventsSubTable({ events }: ClockEventsSubTableProps) {
  if (events.length === 0) {
    return (
      <p className="py-4 text-center text-sm text-muted-foreground">
        No clock events recorded for this session.
      </p>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-border/60 bg-muted/20">
      <div
        className="grid items-center gap-3 border-b border-border/40 bg-muted/40 px-4 py-2 text-xs font-medium uppercase tracking-wide text-muted-foreground"
        style={{ gridTemplateColumns: "1.4fr 1fr 1fr 1fr 0.8fr 1fr" }}
      >
        <div>Branch</div>
        <div>In</div>
        <div>Out</div>
        <div>Type</div>
        <div>Early</div>
        <div>Distance</div>
      </div>
      {events.map((event, i) => (
        <div
          key={event.id}
          className={cn(
            "grid items-center gap-3 px-4 py-2.5 text-sm",
            i < events.length - 1 && "border-b border-border/30",
          )}
          style={{ gridTemplateColumns: "1.4fr 1fr 1fr 1fr 0.8fr 1fr" }}
        >
          <div className="truncate font-medium text-foreground">
            {event.branchName ?? "—"}
          </div>
          <div className="text-muted-foreground">
            {formatTime(event.clockInTime)}
          </div>
          <div className="text-muted-foreground">
            {formatTime(event.clockOutTime)}
          </div>
          <div className="text-muted-foreground">
            {event.clockOutType ? CLOCK_OUT_LABELS[event.clockOutType] : "—"}
          </div>
          <div>
            {event.departedEarly ? (
              <span className="rounded-lg border border-destructive/30 bg-destructive/10 px-2 py-0.5 text-xs font-medium text-destructive">
                Yes
              </span>
            ) : (
              <span className="text-xs text-muted-foreground">No</span>
            )}
          </div>
          <div className="text-muted-foreground">
            {event.clockInOutDistance != null
              ? `${event.clockInOutDistance.toFixed(0)} m`
              : "—"}
          </div>
        </div>
      ))}
    </div>
  );
}