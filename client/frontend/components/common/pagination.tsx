"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface PaginationProps {
  page: number; // 0-indexed, matches your backend's pageNumber
  totalPages: number;
  totalElements?: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export function Pagination({
  page,
  totalPages,
  totalElements,
  onPageChange,
  className,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const canPrev = page > 0;
  const canNext = page < totalPages - 1;

  return (
    <div
      className={cn(
        "flex items-center justify-between gap-4 px-1 pt-3 text-sm",
        className,
      )}
    >
      <span className="text-xs text-muted-foreground">
        Page {page + 1} of {totalPages}
        {totalElements !== undefined && ` · ${totalElements} total`}
      </span>
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          disabled={!canPrev}
          onClick={() => onPageChange(page - 1)}
          className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border text-foreground transition-colors hover:bg-accent disabled:pointer-events-none disabled:opacity-40"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <button
          type="button"
          disabled={!canNext}
          onClick={() => onPageChange(page + 1)}
          className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border text-foreground transition-colors hover:bg-accent disabled:pointer-events-none disabled:opacity-40"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
