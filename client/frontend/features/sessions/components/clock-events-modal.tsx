"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import type { components } from "@/lib/api/generated/schema";

type SessionResponse = components["schemas"]["SessionResponse"];

interface ClockEventsModalProps {
  session: SessionResponse | null;
  onClose: () => void;
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

export function ClockEventsModal({ session, onClose }: ClockEventsModalProps) {
  const events = session?.clockEvents ?? [];

  return (
    <Dialog open={!!session} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Clock events</DialogTitle>
        </DialogHeader>

        {events.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            No clock events recorded for this session.
          </p>
        ) : (
          <div className="overflow-hidden rounded-xl border border-border">
            <div className="overflow-x-auto">
              <div className="min-w-[560px]">
                <div
                  className="grid items-center gap-3 border-b border-border/60 bg-muted/40 px-4 py-2.5 text-xs font-medium uppercase tracking-wide text-muted-foreground"
                  style={{
                    gridTemplateColumns:
                      "minmax(120px,1fr) 90px 90px 110px 90px 110px",
                  }}
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
                      "grid items-center gap-3 px-4 py-3 text-sm",
                      i < events.length - 1 && "border-b border-border/40",
                    )}
                    style={{
                      gridTemplateColumns:
                        "minmax(120px,1fr) 90px 90px 110px 90px 110px",
                    }}
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
                      {event.clockOutType
                        ? CLOCK_OUT_LABELS[event.clockOutType]
                        : "—"}
                    </div>
                    <div>
                      {event.departedEarly ? (
                        <span className="rounded-lg border border-destructive/30 bg-destructive/10 px-2 py-0.5 text-xs font-medium text-destructive">
                          Yes
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground">
                          No
                        </span>
                      )}
                    </div>
                    <div className="text-muted-foreground">
                      {event.clockInOutDistance !== undefined
                        ? `${event.clockInOutDistance.toFixed(0)} m`
                        : "—"}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
