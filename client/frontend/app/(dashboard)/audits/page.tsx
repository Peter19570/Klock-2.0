"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { EnumSelect } from "@/components/common/enum-select";
import { DatePicker } from "@/components/common/date-picker";
import { Pagination } from "@/components/common/pagination";
import { AuditTable } from "@/features/audits/components/audit-table";
import { formatAuditAction } from "@/features/audits/constants";
import {
  AUDIT_ACTIONS,
  fetchAudits,
  type AuditAction,
  type AuditResponse,
} from "@/features/audits/api";
import { cn } from "@/lib/utils";
import { ArrowLeft, SlidersHorizontal } from "lucide-react";
import { fetchUserById } from "@/features/users/api";
import { usePageTitle } from "@/hooks/use-page-title";
import { Spinner } from "@/components/ui/spinner";

export default function AuditsPage() {
  usePageTitle("Audits");

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const page = Number(searchParams.get("page") ?? 0);
  const fullName = searchParams.get("fullName") ?? "";
  const auditAction =
    (searchParams.get("auditAction") as AuditAction | null) ?? undefined;
  const minCreatedAt = searchParams.get("minCreatedAt") ?? undefined;
  const maxCreatedAt = searchParams.get("maxCreatedAt") ?? undefined;

  const [audits, setAudits] = useState<AuditResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const userIdParam = searchParams.get("userId") ?? undefined;
  const [scopedUserName, setScopedUserName] = useState<string | null>(null);

  useEffect(() => {
    if (!userIdParam) return;
    fetchUserById(userIdParam).then((u) => {
      if (u) setScopedUserName(`${u.firstName} ${u.lastName}`);
    });
  }, [userIdParam]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    fetchAudits({
      page,
      fullName: fullName || undefined,
      auditAction,
      minCreatedAt,
      maxCreatedAt,
      userId: userIdParam,
    }).then((data) => {
      setAudits(data?.content ?? []);
      setTotalPages(data?.totalPages ?? 0);
      setTotalElements(data?.totalElements ?? 0);
      setLoading(false);
    });
  }, [page, fullName, auditAction, minCreatedAt, maxCreatedAt, userIdParam]);

  function updateParams(
    updates: Record<string, string | undefined>,
    resetPage = true,
  ) {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, value]) => {
      if (value) params.set(key, value);
      else params.delete(key);
    });
    if (resetPage) params.set("page", "0");
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }

  function setPage(newPage: number) {
    updateParams({ page: String(newPage) }, false);
  }

  function clearFilters() {
    router.replace(pathname, { scroll: false });
  }

  const activeFilterCount = [
    fullName,
    auditAction,
    minCreatedAt,
    maxCreatedAt,
  ].filter(Boolean).length;
  const hasActiveFilters = activeFilterCount > 0;

  return (
    <div className="pb-16 pt-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Audit log</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Every recorded action across your organization.
        </p>
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
          "mt-4 grid-cols-1 gap-4 rounded-2xl border border-border bg-card p-4 shadow-sm sm:grid-cols-2 md:mt-6 md:grid md:grid-cols-3 lg:grid-cols-5",
          mobileFiltersOpen ? "grid" : "hidden md:grid",
        )}
      >
        <div className="space-y-1.5">
          <Label htmlFor="fullName">Name</Label>
          <Input
            id="fullName"
            placeholder="Search by name"
            value={fullName}
            onChange={(e) =>
              updateParams({ fullName: e.target.value || undefined })
            }
          />
        </div>

        <div className="space-y-1.5">
          <Label>Action</Label>
          <EnumSelect
            value={auditAction}
            onChange={(v) => updateParams({ auditAction: v })}
            options={AUDIT_ACTIONS}
            placeholder="Any action"
            formatLabel={formatAuditAction}
          />
        </div>

        <div className="space-y-1.5">
          <Label>From</Label>
          <DatePicker
            value={minCreatedAt}
            onChange={(v) => updateParams({ minCreatedAt: v })}
          />
        </div>

        <div className="space-y-1.5">
          <Label>To</Label>
          <DatePicker
            value={maxCreatedAt}
            onChange={(v) => updateParams({ maxCreatedAt: v })}
          />
        </div>

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
        {loading ? <Spinner size={32} /> : <AuditTable audits={audits} />}
      </div>

      <Pagination
        page={page}
        totalPages={totalPages}
        totalElements={totalElements}
        onPageChange={setPage}
      />
    </div>
  );
}
