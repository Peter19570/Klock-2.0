"use client";

import { useState } from "react";
import { ClockButton } from "./clock-button";

export function ClockCard() {
  const [isClockedIn, setIsClockedIn] = useState(false);

  return (
    <div className="flex h-[280px] w-full max-w-[360px] flex-col items-center justify-center gap-4 rounded-2xl border border-border bg-card p-6 text-center shadow-sm">
      <div>
        <p className="text-sm font-medium text-muted-foreground">
          {isClockedIn ? "You're clocked in" : "You're clocked out"}
        </p>
        <p className="mt-1 text-2xl font-semibold tabular-nums text-foreground">
          {new Date().toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })}
        </p>
      </div>
      <ClockButton isClockedIn={isClockedIn} onToggle={() => setIsClockedIn((v) => !v)} className="max-w-xs" />
    </div>
  );
}