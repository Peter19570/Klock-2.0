"use client";

import { cn } from "@/lib/utils";

export type ClockPillState = "in" | "out" | "away" | "checking";

const STYLES: Record<ClockPillState, string> = {
  in: "bg-emerald-500/10 border-emerald-500/30 text-emerald-500",
  out: "bg-red-500/10 border-red-500/30 text-red-500",
  away: "bg-amber-500/10 border-amber-500/30 text-amber-500",
  checking: "bg-muted border-border text-muted-foreground",
};

const LABELS: Record<ClockPillState, string> = {
  in: "Clocked in",
  out: "Clocked out",
  away: "Clocked in",
  checking: "Checking...",
};

const DOT: Record<ClockPillState, string> = {
  in: "bg-emerald-500",
  out: "bg-red-500",
  away: "animate-pulse bg-amber-500",
  checking: "animate-pulse bg-muted-foreground",
};

export function StatusPill({ state }: { state: ClockPillState }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium",
        STYLES[state],
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", DOT[state])} />
      {LABELS[state]}
    </span>
  );
}