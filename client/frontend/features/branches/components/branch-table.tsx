"use client";

import React from "react";
import { motion } from "framer-motion";
import { Pencil, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { components } from "@/lib/api/generated/schema";

type BranchResponse = components["schemas"]["BranchResponse"];

interface BranchTableProps {
  branches: BranchResponse[];
  onSelect?: (branch: BranchResponse) => void;
  onEdit?: (branch: BranchResponse) => void;
  onDelete?: (branch: BranchResponse) => void;
  className?: string;
}

const STATUS_STYLES: Record<string, string> = {
  UNLOCKED: "bg-emerald-500/10 border-emerald-500/30 text-emerald-500",
  LOCKED: "bg-destructive/10 border-destructive/30 text-destructive",
};

function formatRadius(meters?: number) {
  if (meters === undefined || meters === null) return "—";
  return meters >= 1000
    ? `${(meters / 1000).toFixed(2)} km`
    : `${meters.toFixed(0)} m`;
}

const gridCols = "1.6fr 1fr 1fr 100px";

export function BranchTable({
  branches,
  onSelect,
  onEdit,
  onDelete,
  className,
}: BranchTableProps) {
  if (branches.length === 0) {
    return (
      <div
        className={cn(
          "rounded-2xl border border-border bg-card p-8 text-center text-sm text-muted-foreground",
          className,
        )}
      >
        No branches found.
      </div>
    );
  }

  return (
    <div
      className={cn(
        "w-full overflow-hidden rounded-2xl border border-border bg-card shadow-sm",
        className,
      )}
    >
      <div className="overflow-x-auto scrollbar-hide">
        <div className="min-w-160">
          <div
            className="grid items-center gap-3 border-b border-border/60 bg-muted/40 px-5 py-3 text-xs font-medium uppercase tracking-wide text-muted-foreground"
            style={{ gridTemplateColumns: gridCols }}
          >
            <div>Branch</div>
            <div>Status</div>
            <div>Radius</div>
            <div className="text-right">Actions</div>
          </div>

          <motion.div
            initial="hidden"
            animate="visible"
            variants={{ visible: { transition: { staggerChildren: 0.03 } } }}
          >
            {branches.map((branch, i) => (
              <motion.div
                key={branch.id}
                variants={{
                  hidden: { opacity: 0, y: 8 },
                  visible: { opacity: 1, y: 0 },
                }}
                onClick={() => onSelect?.(branch)}
                className={cn(
                  "grid cursor-pointer items-center gap-3 px-5 py-3.5 text-sm transition-colors hover:bg-muted/30",
                  i < branches.length - 1 && "border-b border-border/40",
                )}
                style={{ gridTemplateColumns: gridCols }}
              >
                <div className="truncate font-medium text-foreground">
                  {branch.displayName ?? "—"}
                </div>
                <div>
                  {branch.branchStatus && (
                    <span
                      className={cn(
                        "rounded-lg border px-2 py-1 text-xs font-medium",
                        STATUS_STYLES[branch.branchStatus],
                      )}
                    >
                      {branch.branchStatus}
                    </span>
                  )}
                </div>
                <div className="text-muted-foreground">
                  {formatRadius(branch.radius)}
                </div>
                <div
                  className="flex items-center justify-end gap-1.5"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    type="button"
                    title="Edit branch"
                    onClick={() => onEdit?.(branch)}
                    className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-border text-foreground transition-colors hover:bg-accent"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    title="Delete branch"
                    onClick={() => onDelete?.(branch)}
                    className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-border text-destructive transition-colors hover:bg-destructive/10"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
