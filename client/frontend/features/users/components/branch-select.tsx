"use client";

import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown, Loader2, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { fetchBranchOptions, type BranchResponse } from "@/features/users/api";

interface BranchSelectProps {
  value?: string;
  valueLabel?: string;
  onChange: (branchId: string | undefined, branch?: BranchResponse) => void;
  placeholder?: string;
  className?: string;
}

export function BranchSelect({
  value,
  valueLabel,
  onChange,
  placeholder = "Select branch",
  className,
}: BranchSelectProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [options, setOptions] = useState<BranchResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    const handle = setTimeout(() => {
      fetchBranchOptions(query || undefined).then((res) => {
        setOptions(res);
        setLoading(false);
      });
    }, 300);
    return () => clearTimeout(handle);
  }, [query, open]);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex h-10 w-full items-center justify-between gap-1.5 rounded-lg border border-input bg-input/40 px-2.5 text-sm text-foreground outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
      >
        <span className={cn("truncate", !value && "text-muted-foreground")}>
          {value ? (valueLabel ?? "Selected branch") : placeholder}
        </span>
        <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
      </button>

      {open && (
        <div className="absolute z-50 mt-1.5 w-full overflow-hidden rounded-lg bg-popover text-popover-foreground shadow-md ring-1 ring-foreground/10">
          <div className="flex items-center gap-2 border-b border-border/60 px-2.5 py-2">
            <Search className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search branches..."
              className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
          </div>
          <div className="max-h-56 overflow-y-auto p-1">
            {loading ? (
              <div className="flex items-center justify-center gap-2 py-4 text-xs text-muted-foreground">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Searching...
              </div>
            ) : options.length === 0 ? (
              <div className="py-4 text-center text-xs text-muted-foreground">
                No branches found.
              </div>
            ) : (
              options.map((b) => (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => {
                    onChange(b.id, b);
                    setOpen(false);
                    setQuery("");
                  }}
                  className="flex w-full items-center justify-between gap-2 rounded-md px-2 py-1.5 text-left text-sm hover:bg-accent hover:text-accent-foreground"
                >
                  <span className="truncate">{b.displayName}</span>
                  {b.id === value && (
                    <Check className="h-3.5 w-3.5 shrink-0 text-primary" />
                  )}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
