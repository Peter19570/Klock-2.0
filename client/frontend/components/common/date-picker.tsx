"use client";

import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface DatePickerProps {
  value?: string;
  onChange: (value: string | undefined) => void;
  placeholder?: string;
  className?: string;
}

export function DatePicker({
  value,
  onChange,
  placeholder = "Pick a date",
  className,
}: DatePickerProps) {
  const selected = value ? new Date(value) : undefined;

  return (
    <Popover>
      <PopoverTrigger
        className={cn(
          "inline-flex h-10 w-full items-center justify-start rounded-[var(--radius)] border border-input bg-input/40 px-3 text-left text-sm font-normal text-foreground transition-colors hover:bg-input/60",
          !selected && "text-muted-foreground",
          className,
        )}
      >
        <CalendarIcon className="mr-2 h-4 w-4 shrink-0 text-muted-foreground" />
        {selected ? format(selected, "MMM d, yyyy") : placeholder}
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="w-auto rounded-2xl border border-border bg-card p-0 shadow-md"
      >
        <Calendar
          mode="single"
          selected={selected}
          onSelect={(date) =>
            onChange(date ? format(date, "yyyy-MM-dd") : undefined)
          }
        />
        <div className="flex items-center justify-between gap-2 border-t border-border/60 px-3 py-2">
          <button
            type="button"
            onClick={() => onChange(format(new Date(), "yyyy-MM-dd"))}
            className="rounded-md px-2 py-1 text-xs font-medium text-primary transition-colors hover:bg-accent"
          >
            Today
          </button>
          <button
            type="button"
            onClick={() => onChange(undefined)}
            disabled={!selected}
            className="rounded-md px-2 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground disabled:pointer-events-none disabled:opacity-40"
          >
            Clear
          </button>
        </div>
      </PopoverContent>
    </Popover>
  );
}