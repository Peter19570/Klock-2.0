"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { ClockEventsSubTable } from "./clock-events-subtable";
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
    ? "1.2fr 1.4fr 1fr 1fr 1fr 100px"
    : "1.2fr 1fr 1fr 1fr 100px";

export function SessionTable({
  sessions,
  showUserColumn = false,
  className,
}: SessionTableProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

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
    <div
      className={cn(
        "w-full overflow-hidden rounded-2xl border border-border bg-card shadow-sm",
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
            {sessions.map((session, i) => {
              const isExpanded = expandedId === session.id;
              return (
                <motion.div
                  key={session.id}
                  variants={{
                    hidden: { opacity: 0, y: 8 },
                    visible: { opacity: 1, y: 0 },
                  }}
                  className={cn(
                    i < sessions.length - 1 && "border-b border-border/40",
                  )}
                >
                  <div
                    className="grid items-center gap-3 px-5 py-3.5 text-sm transition-colors hover:bg-muted/30"
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
                        onClick={() =>
                          setExpandedId(isExpanded ? null : session.id ?? null)
                        }
                        className="inline-flex items-center gap-1.5 rounded-lg border border-border px-2.5 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-accent"
                      >
                        <ChevronDown
                          className={cn(
                            "h-3.5 w-3.5 transition-transform",
                            isExpanded && "rotate-180",
                          )}
                        />
                        {isExpanded ? "Hide" : "View"}
                      </button>
                    </div>
                  </div>

                  <AnimatePresence initial={false}>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2, ease: "easeInOut" }}
                        className="overflow-hidden"
                      >
                        <div className="px-5 pb-4">
                          <ClockEventsSubTable
                            events={session.clockEvents ?? []}
                          />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </div>
    </div>
  );
}