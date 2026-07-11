"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";
import {
  fetchSessions,
  deleteSession,
  terminateSession,
  type SessionFilters,
} from "@/lib/api/sessions";
import { fetchUserById } from "@/features/users/api";
import { SessionTable } from "@/features/sessions/components/session-table";
import { ExportSessionsDialog } from "@/features/sessions/components/export-sessions-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/common/confirm-dialog";
import { useToasts } from "@/components/common/toast";
import type { components } from "@/lib/api/generated/schema";
import { DatePicker } from "@/components/common/date-picker";
import { EnumSelect } from "@/components/common/enum-select";
import { cn } from "@/lib/utils";
import { SlidersHorizontal, ArrowLeft, Download } from "lucide-react";

type PageResponseSessionResponse =
  components["schemas"]["PageResponseSessionResponse"];
type SessionResponse = components["schemas"]["SessionResponse"];

const ARRIVAL_OPTIONS = ["EARLY", "ON_TIME", "LATE"] as const;
const STATUS_OPTIONS = ["ACTIVE", "COMPLETED"] as const;

export default function SessionsPage() {
  const role = useAuthStore((s) => s.user?.userRole);
  const isStaffView = role === "ADMIN" || role === "SUPER_ADMIN";
  const isSuperAdmin = role === "SUPER_ADMIN";
  const toasts = useToasts();

  const router = useRouter();
  const searchParams = useSearchParams();
  const userIdParam = searchParams.get("userId") ?? undefined;

  const [filters, setFilters] = useState<SessionFilters>({
    page: 0,
    userId: userIdParam,
  });
  const [scopedUserName, setScopedUserName] = useState<string | null>(null);
  const [pageData, setPageData] = useState<PageResponseSessionResponse | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const [exportOpen, setExportOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<SessionResponse | null>(
    null,
  );
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [terminateTarget, setTerminateTarget] =
    useState<SessionResponse | null>(null);
  const [terminateLoading, setTerminateLoading] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    fetchSessions(filters).then((data) => {
      setPageData(data ?? null);
      setLoading(false);
    });
  }, [filters]);

  useEffect(() => {
    if (!userIdParam) return;
    fetchUserById(userIdParam).then((u) => {
      if (u) setScopedUserName(`${u.firstName} ${u.lastName}`);
    });
  }, [userIdParam]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setFilters((f) => ({ ...f, userId: userIdParam, page: 0 }));
  }, [userIdParam]);

  function updateFilter<K extends keyof SessionFilters>(
    key: K,
    value: SessionFilters[K],
  ) {
    setFilters((f) => ({ ...f, [key]: value, page: 0 }));
  }

  function clearFilters() {
    setFilters({ page: 0, userId: userIdParam });
  }

  const sessions = pageData?.content ?? [];

  const activeFilterCount = [
    filters.minWorkDate,
    filters.maxWorkDate,
    filters.arrivalStatus,
    filters.status,
    filters.sessionUser,
  ].filter(Boolean).length;

  const hasActiveFilters = activeFilterCount > 0;

  async function confirmDelete() {
    if (!deleteTarget?.id) return;
    setDeleteLoading(true);
    const { error } = await deleteSession(deleteTarget.id);
    setDeleteLoading(false);
    if (error) {
      toasts.error(error);
      return;
    }
    setPageData((pd) =>
      pd
        ? {
            ...pd,
            content: (pd.content ?? []).filter((s) => s.id !== deleteTarget.id),
          }
        : pd,
    );
    toasts.success("Session deleted");
    setDeleteTarget(null);
  }

  async function confirmTerminate() {
    if (!terminateTarget?.id) return;
    setTerminateLoading(true);
    const { error } = await terminateSession(terminateTarget.id);
    setTerminateLoading(false);
    if (error) {
      toasts.error(error);
      return;
    }
    setPageData((pd) =>
      pd
        ? {
            ...pd,
            content: (pd.content ?? []).map((s) =>
              s.id === terminateTarget.id
                ? { ...s, status: "COMPLETED" as const }
                : s,
            ),
          }
        : pd,
    );
    toasts.success("Session terminated");
    setTerminateTarget(null);
  }

  return (
    <div className="pb-16 pt-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Sessions</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {userIdParam
              ? "Filtered to one employee's clock-in history."
              : isStaffView
                ? "All sessions across your organization."
                : "Your clock-in history."}
          </p>
        </div>
        {isSuperAdmin && (
          <Button
            variant="outline"
            onClick={() => setExportOpen(true)}
            className="mt-1.5 gap-1.5"
          >
            <Download className="h-4 w-4" />
            Export
          </Button>
        )}
      </div>

      {userIdParam && (
        <button
          type="button"
          onClick={() => router.push("/users")}
          className="mt-3 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to users
          {scopedUserName && (
            <span className="text-foreground"> · {scopedUserName}</span>
          )}
        </button>
      )}

      <button
        type="button"
        onClick={() => setMobileFiltersOpen((v) => !v)}
        className="mt-6 flex w-full items-center justify-between rounded-2xl border border-border bg-card px-4 py-3 text-sm font-medium text-foreground shadow-sm md:hidden"
      >
        <span className="flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
          Filters
          {activeFilterCount > 0 && (
            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-xs font-semibold text-primary-foreground">
              {activeFilterCount}
            </span>
          )}
        </span>
        <span
          className={cn(
            "text-muted-foreground transition-transform",
            mobileFiltersOpen && "rotate-180",
          )}
        >
          ▾
        </span>
      </button>

      <div
        className={cn(
          "mt-4 grid-cols-1 gap-4 rounded-2xl border border-border bg-card p-4 shadow-sm sm:grid-cols-2 md:mt-6 md:grid md:grid-cols-3",
          isStaffView && !userIdParam ? "lg:grid-cols-6" : "lg:grid-cols-5",
          mobileFiltersOpen ? "grid" : "hidden md:grid",
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

        {isStaffView && !userIdParam && (
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
            className="h-10 w-full rounded-(--radius) border border-border text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground disabled:pointer-events-none disabled:opacity-40"
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
          <SessionTable
            sessions={sessions}
            showUserColumn={isStaffView && !userIdParam}
            showActions={isSuperAdmin}
            onDelete={setDeleteTarget}
            onTerminate={setTerminateTarget}
          />
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

      <ExportSessionsDialog open={exportOpen} onOpenChange={setExportOpen} />

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
        title="Delete session"
        description="Are you sure you want to delete this session? This can't be undone."
        confirmLabel="Delete"
        destructive
        loading={deleteLoading}
        onConfirm={confirmDelete}
      />

      <ConfirmDialog
        open={!!terminateTarget}
        onOpenChange={(o) => !o && setTerminateTarget(null)}
        title="Terminate session"
        description="This will force-end the active session. The employee will be clocked out immediately."
        confirmLabel="Terminate"
        loading={terminateLoading}
        onConfirm={confirmTerminate}
      />
    </div>
  );
}
