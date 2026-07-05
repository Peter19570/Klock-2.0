"use client";

import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface EnumSelectProps<T extends string> {
  value?: T;
  onChange: (value: T | undefined) => void;
  options: readonly T[];
  placeholder?: string;
  formatLabel?: (value: T) => string;
  className?: string;
}

const ANY = "__any__";

export function EnumSelect<T extends string>({
  value,
  onChange,
  options,
  placeholder = "Any",
  formatLabel = (v) => v,
  className,
}: EnumSelectProps<T>) {
  return (
    <Select
      value={value ?? ANY}
      onValueChange={(v) => onChange(v === ANY ? undefined : (v as T))}
    >
      <SelectTrigger
        className={cn(
          "h-10 w-full data-[size=default]:h-10 border-input bg-input/40 text-foreground",
          className,
        )}
      >
        <SelectValue>
          {(v: string) =>
            !v || v === ANY ? placeholder : formatLabel(v as T)
          }
        </SelectValue>
      </SelectTrigger>
      <SelectContent className="border-border bg-card">
        <SelectItem value={ANY}>{placeholder}</SelectItem>
        {options.map((opt) => (
          <SelectItem key={opt} value={opt}>
            {formatLabel(opt)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}