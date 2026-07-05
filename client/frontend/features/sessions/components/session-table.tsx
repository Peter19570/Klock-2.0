"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Eye } from "lucide-react";
import { cn } from "@/lib/utils";
import { ClockEventsModal } from "./clock-events-modal";
import type { components } from "@/lib/api/generated/schema";

type SessionResponse = components["schemas"]["SessionResponse"];

interface SessionTableProps {
  sessions: SessionResponse[];
  showUserColumn?: boolean;
  className?: string;
}

const ARRIVAL_STYLES: Record<string, string> = {
  EARLY: "bg-emerald-500/10 border-emerald-500/30 text-emerald-500",
  ON_TIME: "bg-primary/10 border-primary/30 text-primary",
  LATE: "bg-destructive/10 border-destructive/30 text-destructive",
};

const STATUS_STYLES: Record<string, string> = {
  ACTIVE: "bg-primary/10 border-primary/30 text-primary",
  COMPLETED: "bg-muted border-border text-muted-foreground",
};

function formatDate(dateStr?: string) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

function formatDistance(meters?: number) {
  if (meters === undefined || meters === null) return "—";
  return meters >= 1000
    ? `${(meters / 1000).toFixed(2)} km`
    : `${meters.toFixed(0)} m`;
}

const gridCols = (showUserColumn: boolean) =>
  showUserColumn
    ? "180px minmax(140px,1fr) 110px 110px 110px 100px"
    : "180px 110px 110px 110px 100px";

export function SessionTable({
  sessions,
  showUserColumn = false,
  className,
}: SessionTableProps) {
  const [activeSession, setActiveSession] = useState<SessionResponse | null>(
    null,
  );

  if (sessions.length === 0) {
    return (
      <div
        className={cn(
          "rounded-2xl border border-border bg-card p-8 text-center text-sm text-muted-foreground",
          className,
        )}
      >
        No sessions found.
      </div>
    );
  }

  return (
    <>
      <div
        className={cn(
          "w-full overflow-hidden rounded-2xl border border-border bg-card",
          className,
        )}
      >
        <div className="overflow-x-auto">
          <div className="min-w-[720px]">
            <div
              className="grid items-center gap-3 border-b border-border/60 bg-muted/40 px-5 py-3 text-xs font-medium uppercase tracking-wide text-muted-foreground"
              style={{ gridTemplateColumns: gridCols(showUserColumn) }}
            >
              <div>Date</div>
              {showUserColumn && <div>Employee</div>}
              <div>Arrival</div>
              <div>Status</div>
              <div>Distance</div>
              <div className="pr-2 text-right">Events</div>
            </div>

            <motion.div
              initial="hidden"
              animate="visible"
              variants={{ visible: { transition: { staggerChildren: 0.03 } } }}
            >
              {sessions.map((session, i) => (
                <motion.div
                  key={session.id}
                  variants={{
                    hidden: { opacity: 0, y: 8 },
                    visible: { opacity: 1, y: 0 },
                  }}
                  className={cn(
                    "grid items-center gap-3 px-5 py-3.5 text-sm transition-colors hover:bg-muted/30",
                    i < sessions.length - 1 && "border-b border-border/40",
                  )}
                  style={{ gridTemplateColumns: gridCols(showUserColumn) }}
                >
                  <div className="font-medium text-foreground">
                    {formatDate(session.workDate)}
                  </div>
                  {showUserColumn && (
                    <div className="truncate text-muted-foreground">
                      {session.sessionUser ?? "—"}
                    </div>
                  )}
                  <div>
                    {session.arrivalStatus && (
                      <span
                        className={cn(
                          "rounded-lg border px-2 py-1 text-xs font-medium",
                          ARRIVAL_STYLES[session.arrivalStatus],
                        )}
                      >
                        {session.arrivalStatus.replace("_", " ")}
                      </span>
                    )}
                  </div>
                  <div>
                    {session.status && (
                      <span
                        className={cn(
                          "inline-flex items-center gap-1.5 rounded-lg border px-2 py-1 text-xs font-medium",
                          STATUS_STYLES[session.status],
                        )}
                      >
                        {session.status === "ACTIVE" && (
                          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
                        )}
                        {session.status}
                      </span>
                    )}
                  </div>
                  <div className="text-muted-foreground">
                    {formatDistance(session.totalDistanceCovered)}
                  </div>
                  <div className="text-right">
                    <button
                      type="button"
                      onClick={() => setActiveSession(session)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-border px-2.5 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-accent"
                    >
                      <Eye className="h-3.5 w-3.5" /> View
                    </button>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </div>

      <ClockEventsModal
        session={activeSession}
        onClose={() => setActiveSession(null)}
      />
    </>
  );
}
