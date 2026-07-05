"use client";

import { useState } from "react";
import { Building2 } from "lucide-react";
import { useAuthStore } from "@/store/auth-store";
import { ClockButton } from "./clock-button";

export function ClockCard() {
  const [isClockedIn, setIsClockedIn] = useState(false);
  const assignedBranch = useAuthStore((s) => s.user?.assignedBranch);

  return (
    <div className="flex h-[220px] w-full max-w-[360px] flex-col items-center justify-center gap-4 rounded-2xl border border-border bg-card p-6 text-center shadow-sm sm:h-[280px]">
      <div>
        <p className="text-sm font-medium text-muted-foreground">
          {isClockedIn ? "You're clocked in" : "You're clocked out"}
        </p>
        <p className="mt-1 text-2xl font-semibold tabular-nums text-foreground">
          {new Date().toLocaleTimeString(undefined, {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
      </div>

      <ClockButton
        isClockedIn={isClockedIn}
        onToggle={() => setIsClockedIn((v) => !v)}
        className="max-w-xs"
      />

      {/* home branch for now — becomes "clocked in at [branch]" once clock-in wiring lands */}
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Building2 className="h-3.5 w-3.5" />
        <span>{assignedBranch ?? "No branch assigned"}</span>
      </div>
    </div>
  );
}
