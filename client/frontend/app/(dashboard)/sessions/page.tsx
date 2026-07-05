"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/auth-store";
import { fetchSessions, type SessionFilters } from "@/lib/api/sessions";
import { SessionTable } from "@/features/sessions/components/session-table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import type { components } from "@/lib/api/generated/schema";

type PageResponseSessionResponse = components["schemas"]["PageResponseSessionResponse"];

const ARRIVAL_OPTIONS = ["EARLY", "ON_TIME", "LATE"] as const;
const STATUS_OPTIONS = ["ACTIVE", "COMPLETED"] as const;

export default function SessionsPage() {
  const role = useAuthStore((s) => s.user?.userRole);
  const isStaffView = role === "ADMIN" || role === "SUPER_ADMIN";

  const [filters, setFilters] = useState<SessionFilters>({ page: 0 });
  const [pageData, setPageData] = useState<PageResponseSessionResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetchSessions(filters).then((data) => {
      setPageData(data ?? null);
      setLoading(false);
    });
  }, [filters]);

  function updateFilter<K extends keyof SessionFilters>(key: K, value: SessionFilters[K]) {
    setFilters((f) => ({ ...f, [key]: value, page: 0 }));
  }

  const sessions = pageData?.content ?? [];

  return (
    <div className="pb-16 pt-8">
      <h1 className="text-2xl font-semibold tracking-tight text-foreground">Sessions</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        {isStaffView ? "All sessions across your organization." : "Your clock-in history."}
      </p>

      <div className="mt-6 flex flex-wrap items-end gap-4 rounded-2xl border border-border bg-card p-4">
        <div className="space-y-1.5">
          <Label htmlFor="minWorkDate">From</Label>
          <Input id="minWorkDate" type="date" value={filters.minWorkDate ?? ""}
            onChange={(e) => updateFilter("minWorkDate", e.target.value || undefined)} className="w-40" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="maxWorkDate">To</Label>
          <Input id="maxWorkDate" type="date" value={filters.maxWorkDate ?? ""}
            onChange={(e) => updateFilter("maxWorkDate", e.target.value || undefined)} className="w-40" />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="arrivalStatus">Arrival</Label>
          <select
            id="arrivalStatus"
            value={filters.arrivalStatus ?? ""}
            onChange={(e) => updateFilter("arrivalStatus", (e.target.value || undefined) as SessionFilters["arrivalStatus"])}
            className="h-10 rounded-[var(--radius)] border border-input bg-input/40 px-3 text-sm text-foreground"
          >
            <option value="">Any</option>
            {ARRIVAL_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>{opt.replace("_", " ")}</option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="status">Status</Label>
          <select
            id="status"
            value={filters.status ?? ""}
            onChange={(e) => updateFilter("status", (e.target.value || undefined) as SessionFilters["status"])}
            className="h-10 rounded-[var(--radius)] border border-input bg-input/40 px-3 text-sm text-foreground"
          >
            <option value="">Any</option>
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </div>

        {/* admin/super-admin only — server already scopes USER results to themselves; branch filter deliberately left out for now */}
        {isStaffView && (
          <div className="space-y-1.5">
            <Label htmlFor="sessionUser">Employee</Label>
            <Input id="sessionUser" placeholder="Search by name" value={filters.sessionUser ?? ""}
              onChange={(e) => updateFilter("sessionUser", e.target.value || undefined)} className="w-48" />
          </div>
        )}
      </div>

      <div className="mt-6">
        {loading ? (
          <div className="rounded-2xl border border-border bg-card p-8 text-center text-sm text-muted-foreground">Loading sessions...</div>
        ) : (
          <SessionTable sessions={sessions} showUserColumn={isStaffView} />
        )}
      </div>

      {pageData && (
        <div className="mt-4 flex items-center justify-between">
          <Button
            variant="outline"
            disabled={(pageData.pageNumber ?? 0) === 0}
            onClick={() => setFilters((f) => ({ ...f, page: (pageData.pageNumber ?? 0) - 1 }))}
          >
            Previous
          </Button>
          <span className="text-xs text-muted-foreground">
            Page {(pageData.pageNumber ?? 0) + 1} of {pageData.totalPages ?? 1}
          </span>
          <Button
            variant="outline"
            disabled={pageData.isLast}
            onClick={() => setFilters((f) => ({ ...f, page: (pageData.pageNumber ?? 0) + 1 }))}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}