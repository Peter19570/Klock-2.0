"use client";

import { useState } from "react";
import { Clock as ClockIcon } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface TimePickerProps {
  value?: string; // "HH:mm:ss"
  onChange: (value: string | undefined) => void;
  placeholder?: string;
  className?: string;
}

const HOURS = Array.from({ length: 12 }, (_, i) => i + 1);
const MINUTES = Array.from({ length: 12 }, (_, i) => i * 5);

function parseValue(value?: string) {
  if (!value) return null;
  const [hStr, mStr] = value.split(":");
  const h24 = parseInt(hStr, 10);
  const m = parseInt(mStr, 10);
  if (Number.isNaN(h24) || Number.isNaN(m)) return null;
  const period: "AM" | "PM" = h24 >= 12 ? "PM" : "AM";
  let h12 = h24 % 12;
  if (h12 === 0) h12 = 12;
  return { h12, m, period };
}

function toValue(h12: number, m: number, period: "AM" | "PM") {
  let h24 = h12 % 12;
  if (period === "PM") h24 += 12;
  return `${String(h24).padStart(2, "0")}:${String(m).padStart(2, "0")}:00`;
}

function formatDisplay(value?: string) {
  const parsed = parseValue(value);
  if (!parsed) return null;
  return `${parsed.h12}:${String(parsed.m).padStart(2, "0")} ${parsed.period}`;
}

export function TimePicker({
  value,
  onChange,
  placeholder = "Pick a time",
  className,
}: TimePickerProps) {
  const parsed = parseValue(value);
  const [open, setOpen] = useState(false);

  function update(
    partial: Partial<{ h12: number; m: number; period: "AM" | "PM" }>,
  ) {
    const base = parsed ?? { h12: 9, m: 0, period: "AM" as const };
    const next = { ...base, ...partial };
    onChange(toValue(next.h12, next.m, next.period));
  }

  const display = formatDisplay(value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        className={cn(
          "inline-flex h-10 w-full items-center justify-start rounded-(--radius) border border-input bg-input/40 px-3 text-left text-sm font-normal text-foreground transition-colors hover:bg-input/60",
          !display && "text-muted-foreground",
          className,
        )}
      >
        <ClockIcon className="mr-2 h-4 w-4 shrink-0 text-muted-foreground" />
        {display ?? placeholder}
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="w-56 rounded-2xl border border-border bg-card p-0 shadow-md"
      >
        <div className="flex items-center justify-center gap-1.5 border-b border-border/60 px-3 py-2.5">
          {(["AM", "PM"] as const).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => update({ period: p })}
              className={cn(
                "flex-1 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors",
                (parsed?.period ?? "AM") === p
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground",
              )}
            >
              {p}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 divide-x divide-border/60">
          <div className="max-h-48 overflow-y-auto p-1">
            {HOURS.map((h) => (
              <button
                key={h}
                type="button"
                onClick={() => update({ h12: h })}
                className={cn(
                  "block w-full rounded-md px-2 py-1.5 text-left text-sm transition-colors hover:bg-accent",
                  (parsed?.h12 ?? 9) === h &&
                    "bg-primary/10 font-medium text-primary",
                )}
              >
                {h}
              </button>
            ))}
          </div>
          <div className="max-h-48 overflow-y-auto p-1">
            {MINUTES.map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => update({ m })}
                className={cn(
                  "block w-full rounded-md px-2 py-1.5 text-left text-sm transition-colors hover:bg-accent",
                  (parsed?.m ?? 0) === m &&
                    "bg-primary/10 font-medium text-primary",
                )}
              >
                {String(m).padStart(2, "0")}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between gap-2 border-t border-border/60 px-3 py-2">
          <button
            type="button"
            onClick={() => {
              const now = new Date();
              onChange(
                `${String(now.getHours()).padStart(2, "0")}:${String(
                  now.getMinutes(),
                ).padStart(2, "0")}:00`,
              );
            }}
            className="rounded-md px-2 py-1 text-xs font-medium text-primary transition-colors hover:bg-accent"
          >
            Now
          </button>
          <button
            type="button"
            onClick={() => onChange(undefined)}
            disabled={!value}
            className="rounded-md px-2 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground disabled:pointer-events-none disabled:opacity-40"
          >
            Clear
          </button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
