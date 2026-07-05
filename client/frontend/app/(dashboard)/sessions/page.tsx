"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/auth-store";
import { fetchSessions, type SessionFilters } from "@/lib/api/sessions";
import { SessionTable } from "@/features/sessions/components/session-table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import type { components } from "@/lib/api/generated/schema";
import { DatePicker } from "@/components/common/date-picker";
import { EnumSelect } from "@/components/common/enum-select";
import { cn } from "@/lib/utils";

type PageResponseSessionResponse =
  components["schemas"]["PageResponseSessionResponse"];

const ARRIVAL_OPTIONS = ["EARLY", "ON_TIME", "LATE"] as const;
const STATUS_OPTIONS = ["ACTIVE", "COMPLETED"] as const;

export default function SessionsPage() {
  const role = useAuthStore((s) => s.user?.userRole);
  const isStaffView = role === "ADMIN" || role === "SUPER_ADMIN";

  const [filters, setFilters] = useState<SessionFilters>({ page: 0 });
  const [pageData, setPageData] = useState<PageResponseSessionResponse | null>(
    null,
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    fetchSessions(filters).then((data) => {
      setPageData(data ?? null);
      setLoading(false);
    });
  }, [filters]);

  function updateFilter<K extends keyof SessionFilters>(
    key: K,
    value: SessionFilters[K],
  ) {
    setFilters((f) => ({ ...f, [key]: value, page: 0 }));
  }

  function clearFilters() {
    setFilters({ page: 0 });
  }

  const sessions = pageData?.content ?? [];

  const hasActiveFilters =
    !!filters.minWorkDate ||
    !!filters.maxWorkDate ||
    !!filters.arrivalStatus ||
    !!filters.status ||
    !!filters.sessionUser;

  return (
    <div className="pb-16 pt-8">
      <h1 className="text-2xl font-semibold tracking-tight text-foreground">
        Sessions
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">
        {isStaffView
          ? "All sessions across your organization."
          : "Your clock-in history."}
      </p>

      <div
        className={cn(
          "mt-6 grid grid-cols-1 gap-4 rounded-2xl border border-border bg-card p-4 shadow-sm sm:grid-cols-2 md:grid-cols-3",
          isStaffView ? "lg:grid-cols-6" : "lg:grid-cols-5",
        )}
      >
        <div className="space-y-1.5">
          <Label>From</Label>
          <DatePicker
            value={filters.minWorkDate}
            onChange={(v) => updateFilter("minWorkDate", v)}
          />
        </div>
        <div className="space-y-1.5">
          <Label>To</Label>
          <DatePicker
            value={filters.maxWorkDate}
            onChange={(v) => updateFilter("maxWorkDate", v)}
          />
        </div>

        <div className="space-y-1.5">
          <Label>Arrival</Label>
          <EnumSelect
            value={filters.arrivalStatus}
            onChange={(v) => updateFilter("arrivalStatus", v)}
            options={ARRIVAL_OPTIONS}
            formatLabel={(v) => v.replace("_", " ")}
          />
        </div>

        <div className="space-y-1.5">
          <Label>Status</Label>
          <EnumSelect
            value={filters.status}
            onChange={(v) => updateFilter("status", v)}
            options={STATUS_OPTIONS}
          />
        </div>

        {isStaffView && (
          <div className="space-y-1.5">
            <Label htmlFor="sessionUser">Employee</Label>
            <Input
              id="sessionUser"
              placeholder="Search by name"
              value={filters.sessionUser ?? ""}
              onChange={(e) =>
                updateFilter("sessionUser", e.target.value || undefined)
              }
              className="w-full"
            />
          </div>
        )}

        <div className="space-y-1.5">
          <Label className="invisible">Clear</Label>
          <button
            type="button"
            onClick={clearFilters}
            disabled={!hasActiveFilters}
            className="h-10 w-full rounded-[var(--radius)] border border-border text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground disabled:pointer-events-none disabled:opacity-40"
          >
            Clear all
          </button>
        </div>
      </div>

      <div className="mt-6">
        {loading ? (
          <div className="rounded-2xl border border-border bg-card p-8 text-center text-sm text-muted-foreground">
            Loading sessions...
          </div>
        ) : (
          <SessionTable sessions={sessions} showUserColumn={isStaffView} />
        )}
      </div>

      {pageData && (
        <div className="mt-4 flex items-center justify-between">
          <Button
            variant="outline"
            disabled={(pageData.pageNumber ?? 0) === 0}
            onClick={() =>
              setFilters((f) => ({
                ...f,
                page: (pageData.pageNumber ?? 0) - 1,
              }))
            }
          >
            Previous
          </Button>
          <span className="text-xs text-muted-foreground">
            Page {(pageData.pageNumber ?? 0) + 1} of {pageData.totalPages ?? 1}
          </span>
          <Button
            variant="outline"
            disabled={pageData.isLast}
            onClick={() =>
              setFilters((f) => ({
                ...f,
                page: (pageData.pageNumber ?? 0) + 1,
              }))
            }
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
