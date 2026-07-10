"use client";

import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCountUp } from "@/hooks/use-count-up";

interface StatCardProps {
  label: string;
  value: number;
  icon: LucideIcon;
  accent?: string;
  hint?: string;
  className?: string;
}

export function StatCard({
  label,
  value,
  icon: Icon,
  accent = "var(--primary)",
  hint,
  className,
}: StatCardProps) {
  const displayValue = useCountUp(value);

  return (
    <div
      className={cn(
        "flex h-40 flex-col justify-between rounded-2xl border border-border bg-card p-4 shadow-sm transition-colors hover:border-foreground/10",
        className,
      )}
    >
      <span
        className="flex h-8 w-8 items-center justify-center rounded-lg"
        style={{
          backgroundColor: `color-mix(in srgb, ${accent} 15%, transparent)`,
          color: accent,
        }}
      >
        <Icon className="h-4 w-4" />
      </span>
      <div>
        <p className="text-2xl font-semibold tabular-nums text-foreground">
          {displayValue.toLocaleString()}
        </p>
        <p className="mt-1 text-xs font-medium text-muted-foreground">
          {label}
        </p>
        {hint && (
          <p className="mt-1.5 truncate text-[11px] text-muted-foreground/70">
            {hint}
          </p>
        )}
      </div>
    </div>
  );
}
