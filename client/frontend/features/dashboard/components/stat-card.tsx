import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: number;
  icon: LucideIcon;
  accent?: string;
}

export function StatCard({
  label,
  value,
  icon: Icon,
  accent = "var(--primary)",
}: StatCardProps) {
  return (
    <div className="flex h-40 w-51.25 flex-col justify-between rounded-2xl border border-border bg-card p-4 shadow-sm transition-colors hover:border-foreground/10">
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
          {value.toLocaleString()}
        </p>
        <p className="mt-1 text-xs font-medium text-muted-foreground">
          {label}
        </p>
      </div>
    </div>
  );
}
