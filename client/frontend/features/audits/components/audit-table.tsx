"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { AuditMetadataSubTable } from "./audit-metadata-subtable";
import {
  AUDIT_ACTION_STYLES,
  formatAuditAction,
} from "@/features/audits/constants";
import type { AuditResponse } from "@/features/audits/api";

interface AuditTableProps {
  audits: AuditResponse[];
  className?: string;
}

const GRID_COLS = "1.4fr 1fr 100px";

export function AuditTable({ audits, className }: AuditTableProps) {
  const [expandedKey, setExpandedKey] = useState<string | null>(null);

  if (audits.length === 0) {
    return (
      <div
        className={cn(
          "rounded-2xl border border-border bg-card p-8 text-center text-sm text-muted-foreground",
          className,
        )}
      >
        No audit events found.
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
      <div className="overflow-x-auto">
        <div className="min-w-150">
          <div
            className="grid items-center gap-3 border-b border-border/60 bg-muted/40 px-5 py-3 text-xs font-medium uppercase tracking-wide text-muted-foreground"
            style={{ gridTemplateColumns: GRID_COLS }}
          >
            <div>User</div>
            <div>Action</div>
            <div className="pr-2 text-right">Metadata</div>
          </div>

          <motion.div
            initial="hidden"
            animate="visible"
            variants={{ visible: { transition: { staggerChildren: 0.03 } } }}
          >
            {audits.map((audit, i) => {
              const key = `${audit.userId}-${audit.action}-${i}`;
              const isExpanded = expandedKey === key;
              return (
                <motion.div
                  key={key}
                  variants={{
                    hidden: { opacity: 0, y: 8 },
                    visible: { opacity: 1, y: 0 },
                  }}
                  className={cn(
                    i < audits.length - 1 && "border-b border-border/40",
                  )}
                >
                  <div
                    className="grid items-center gap-3 px-5 py-3.5 text-sm transition-colors hover:bg-muted/30"
                    style={{ gridTemplateColumns: GRID_COLS }}
                  >
                    <div className="min-w-0">
                      <div className="truncate font-medium text-foreground">
                        {audit.fullName ?? "—"}
                      </div>
                      <div className="truncate text-xs text-muted-foreground">
                        {audit.email ?? "—"}
                      </div>
                    </div>
                    <div>
                      {audit.action && (
                        <span
                          className={cn(
                            "inline-block rounded-lg border px-2 py-1 text-xs font-medium",
                            AUDIT_ACTION_STYLES[audit.action],
                          )}
                        >
                          {formatAuditAction(audit.action)}
                        </span>
                      )}
                    </div>
                    <div className="text-right">
                      <button
                        type="button"
                        onClick={() => setExpandedKey(isExpanded ? null : key)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-border px-2.5 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-accent"
                      >
                        <ChevronDown
                          className={cn(
                            "h-3.5 w-3.5 transition-transform",
                            isExpanded && "rotate-180",
                          )}
                        />
                        {isExpanded ? "Hide" : "View"}
                      </button>
                    </div>
                  </div>

                  <AnimatePresence initial={false}>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2, ease: "easeInOut" }}
                        className="overflow-hidden"
                      >
                        <div className="px-5 pb-4">
                          <AuditMetadataSubTable
                            metadata={
                              (audit.metadata as Record<string, unknown>) ?? {}
                            }
                          />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
