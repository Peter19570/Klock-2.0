"use client";

import { useEffect, useState } from "react";
import { Plus, SlidersHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { EnumSelect } from "@/components/common/enum-select";
import { ConfirmDialog } from "@/components/common/confirm-dialog";
import { useToasts } from "@/components/common/toast";
import { cn } from "@/lib/utils";
import { BranchTable } from "@/features/branches/components/branch-table";
import { BranchFormDialog } from "@/features/branches/components/branch-form-dialog";
import { BranchDetailModal } from "@/features/branches/components/branch-detail-modal";
import {
  fetchBranches,
  fetchBranchById,
  deleteBranch,
  type BranchFilters,
  type BranchResponse,
  type BranchDetailedResponse,
  type PageResponseBranchResponse,
} from "@/features/branches/api";
import { Pagination } from "@/components/common/pagination";
import { Spinner } from "@/components/ui/spinner";

const STATUS_OPTIONS = ["UNLOCKED", "LOCKED"] as const;

export function SuperAdminBranchesView() {
  const toasts = useToasts();

  const [filters, setFilters] = useState<BranchFilters>({ page: 0 });
  const [pageData, setPageData] = useState<PageResponseBranchResponse | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [formBranch, setFormBranch] = useState<BranchDetailedResponse | null>(
    null,
  );

  const [detailOpen, setDetailOpen] = useState(false);
  const [detailBranch, setDetailBranch] =
    useState<BranchDetailedResponse | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<
    BranchResponse | BranchDetailedResponse | null
  >(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    fetchBranches(filters).then((data) => {
      setPageData(data ?? null);
      setLoading(false);
    });
  }, [filters]);

  function updateFilter<K extends keyof BranchFilters>(
    key: K,
    value: BranchFilters[K],
  ) {
    setFilters((f) => ({ ...f, [key]: value, page: 0 }));
  }

  function clearFilters() {
    setFilters({ page: 0 });
  }

  const branches = pageData?.content ?? [];
  const activeFilterCount = [filters.displayName, filters.branchStatus].filter(
    Boolean,
  ).length;
  const hasActiveFilters = activeFilterCount > 0;

  function refetchList() {
    fetchBranches(filters).then((data) => setPageData(data ?? null));
  }

  function openCreate() {
    setFormMode("create");
    setFormBranch(null);
    setFormOpen(true);
  }

  async function openEdit(branch: BranchResponse) {
    if (!branch.id) return;
    const detailed = await fetchBranchById(branch.id);
    if (!detailed) {
      toasts.error("Failed to load branch");
      return;
    }
    setFormMode("edit");
    setFormBranch(detailed);
    setFormOpen(true);
  }

  async function openDetail(branch: BranchResponse) {
    if (!branch.id) return;
    setDetailOpen(true);
    setDetailLoading(true);
    setDetailBranch(null);
    const detailed = await fetchBranchById(branch.id);
    setDetailLoading(false);
    if (!detailed) {
      toasts.error("Failed to load branch");
      setDetailOpen(false);
      return;
    }
    setDetailBranch(detailed);
  }

  function handleFormSuccess() {
    refetchList();
  }

  async function confirmDelete() {
    if (!deleteTarget?.id) return;
    setDeleteLoading(true);
    const { error } = await deleteBranch(deleteTarget.id);
    setDeleteLoading(false);
    if (error) {
      toasts.error(error);
      return;
    }
    setPageData((pd) =>
      pd
        ? {
            ...pd,
            content: (pd.content ?? []).filter((b) => b.id !== deleteTarget.id),
          }
        : pd,
    );
    toasts.success("Branch deleted");
    setDeleteTarget(null);
    setDetailOpen(false);
  }

  const totalBranches = pageData?.totalElements;

  return (
    <div className="pb-16 pt-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Branches</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {totalBranches !== undefined
              ? `${totalBranches} ${totalBranches === 1 ? "branch" : "branches"} across your organization.`
              : "All branches across your organization."}
          </p>
        </div>
        <Button onClick={openCreate} className="mt-1.5 gap-1.5">
          <Plus className="h-4 w-4" />
          New branch
        </Button>
      </div>

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
          "mt-4 grid-cols-1 gap-4 rounded-2xl border border-border bg-card p-4 shadow-sm sm:grid-cols-3 md:mt-6 md:grid",
          mobileFiltersOpen ? "grid" : "hidden md:grid",
        )}
      >
        <div className="space-y-1.5">
          <Label htmlFor="displayName">Branch name</Label>
          <Input
            id="displayName"
            placeholder="Search by name"
            value={filters.displayName ?? ""}
            onChange={(e) =>
              updateFilter("displayName", e.target.value || undefined)
            }
          />
        </div>

        <div className="space-y-1.5">
          <Label>Status</Label>
          <EnumSelect
            value={filters.branchStatus}
            onChange={(v) => updateFilter("branchStatus", v)}
            options={STATUS_OPTIONS}
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
        {loading ? (
          <Spinner size={32} />
        ) : (
          <BranchTable
            branches={branches}
            onSelect={openDetail}
            onEdit={openEdit}
            onDelete={setDeleteTarget}
          />
        )}
      </div>

      <Pagination
        page={pageData?.pageNumber ?? 0}
        totalPages={pageData?.totalPages ?? 0}
        totalElements={pageData?.totalElements}
        onPageChange={(p) => setFilters((f) => ({ ...f, page: p }))}
      />

      <BranchFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        mode={formMode}
        branch={formBranch}
        onSuccess={handleFormSuccess}
      />

      <BranchDetailModal
        open={detailOpen}
        onOpenChange={setDetailOpen}
        branch={detailBranch}
        loading={detailLoading}
        onEdit={(b) => {
          setDetailOpen(false);
          setFormMode("edit");
          setFormBranch(b);
          setFormOpen(true);
        }}
        onDelete={(b) => setDeleteTarget(b)}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
        title="Delete branch"
        description="Are you sure you want to delete this branch? This can't be undone."
        confirmLabel="Delete"
        destructive
        loading={deleteLoading}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
