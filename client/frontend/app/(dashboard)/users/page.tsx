"use client";

import { useEffect, useState } from "react";
import { SlidersHorizontal, UserPlus } from "lucide-react";
import { useAuthStore } from "@/store/auth-store";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { EnumSelect } from "@/components/common/enum-select";
import { ConfirmDialog } from "@/components/common/confirm-dialog";
import { useToasts } from "@/components/common/toast";
import { cn } from "@/lib/utils";
import { UserTable } from "@/features/users/components/user-table";
import { UserDetailModal } from "@/features/users/components/user-detail-modal";
import { UserFormDialog } from "@/features/users/components/user-form-dialog";
import { BranchSelect } from "@/features/users/components/branch-select";
import {
  fetchUsers,
  deleteUser,
  resetDeviceId,
  type UserFilters,
  type UserResponse,
  type PageResponseUserResponse,
} from "@/features/users/api";

const ROLE_OPTIONS = ["USER", "ADMIN", "SUPER_ADMIN"] as const;
import { AnimatePresence, motion } from "framer-motion";
import { DatePicker } from "@/components/common/date-picker";

export default function UsersPage() {
  const role = useAuthStore((s) => s.user?.userRole);
  const isSuperAdmin = role === "SUPER_ADMIN";
  const toasts = useToasts();

  const [filters, setFilters] = useState<UserFilters>({ page: 0 });
  const [pageData, setPageData] = useState<PageResponseUserResponse | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [branchLabel, setBranchLabel] = useState<string | undefined>();

  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [editingUser, setEditingUser] = useState<UserResponse | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<UserResponse | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [resetTarget, setResetTarget] = useState<UserResponse | null>(null);
  const [resetLoading, setResetLoading] = useState(false);
  const [showMoreFilters, setShowMoreFilters] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    fetchUsers(filters).then((data) => {
      setPageData(data ?? null);
      setLoading(false);
    });
  }, [filters]);

  function updateFilter<K extends keyof UserFilters>(
    key: K,
    value: UserFilters[K],
  ) {
    setFilters((f) => ({ ...f, [key]: value, page: 0 }));
  }

  function clearFilters() {
    setFilters({ page: 0 });
    setBranchLabel(undefined);
  }

  const users = pageData?.content ?? [];

  const activeFilterCount = [
    filters.name,
    filters.userRole,
    filters.branchId,
    filters.email,
    filters.phone,
    filters.minCreatedAt,
    filters.maxCreatedAt,
  ].filter(Boolean).length;
  const hasActiveFilters = activeFilterCount > 0;

  function handleCreated(user: UserResponse) {
    setPageData((pd) =>
      pd ? { ...pd, content: [user, ...(pd.content ?? [])] } : pd,
    );
  }

  function handleUpdated(user: UserResponse) {
    setPageData((pd) =>
      pd
        ? {
            ...pd,
            content: (pd.content ?? []).map((u) =>
              u.id === user.id ? { ...u, ...user } : u,
            ),
          }
        : pd,
    );
  }

  async function confirmDelete() {
    if (!deleteTarget?.id) return;
    setDeleteLoading(true);
    const { error } = await deleteUser(deleteTarget.id);
    setDeleteLoading(false);
    if (error) {
      toasts.error(error);
      return;
    }
    setPageData((pd) =>
      pd
        ? {
            ...pd,
            content: (pd.content ?? []).filter((u) => u.id !== deleteTarget.id),
          }
        : pd,
    );
    toasts.success("User deleted");
    setDeleteTarget(null);
  }

  async function confirmResetDevice() {
    if (!resetTarget?.id) return;
    setResetLoading(true);
    const { error } = await resetDeviceId(resetTarget.id);
    setResetLoading(false);
    if (error) {
      toasts.error(error);
      return;
    }
    toasts.success("Device ID reset");
    setResetTarget(null);
  }

  return (
    <div className="pb-16 pt-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Users</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage employees and their access.
          </p>
        </div>
        <Button
          onClick={() => {
            setFormMode("create");
            setEditingUser(null);
            setFormOpen(true);
          }}
          className="mt-1.5 gap-1.5"
        >
          <UserPlus className="h-4 w-4" />
          New user
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
          "mt-4 rounded-2xl border border-border bg-card p-4 shadow-sm",
          mobileFiltersOpen ? "block" : "hidden md:block",
        )}
      >
        <div
          className={cn(
            "grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3",
            isSuperAdmin ? "lg:grid-cols-4" : "lg:grid-cols-3",
          )}
        >
          <div className="space-y-1.5">
            <Label htmlFor="name">Search</Label>
            <Input
              id="name"
              placeholder="Search by name"
              value={filters.name ?? ""}
              onChange={(e) =>
                updateFilter("name", e.target.value || undefined)
              }
            />
          </div>

          <div className="space-y-1.5">
            <Label>Role</Label>
            <EnumSelect
              value={filters.userRole}
              onChange={(v) => updateFilter("userRole", v)}
              options={ROLE_OPTIONS}
              formatLabel={(v) => v.replace("_", " ")}
            />
          </div>

          {isSuperAdmin && (
            <div className="space-y-1.5">
              <Label>Branch</Label>
              <BranchSelect
                value={filters.branchId}
                valueLabel={branchLabel}
                onChange={(id, branch) => {
                  updateFilter("branchId", id);
                  setBranchLabel(branch?.displayName);
                }}
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

        <button
          type="button"
          onClick={() => setShowMoreFilters((v) => !v)}
          className="mt-3 flex items-center gap-1 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          {showMoreFilters ? "Fewer filters" : "More filters"}
          <span
            className={cn(
              "transition-transform",
              showMoreFilters && "rotate-180",
            )}
          >
            ▾
          </span>
        </button>

        <AnimatePresence initial={false}>
          {showMoreFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
              className="overflow-hidden"
            >
              <div
                className={cn(
                  "mt-4 grid grid-cols-1 gap-4 border-t border-border/60 pt-4 sm:grid-cols-2",
                  isSuperAdmin ? "lg:grid-cols-4" : "lg:grid-cols-3",
                )}
              >
                <div className="space-y-1.5">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    placeholder="Search by email"
                    value={filters.email ?? ""}
                    onChange={(e) =>
                      updateFilter("email", e.target.value || undefined)
                    }
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    placeholder="Search by phone"
                    value={filters.phone ?? ""}
                    onChange={(e) =>
                      updateFilter("phone", e.target.value || undefined)
                    }
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Joined from</Label>
                  <DatePicker
                    value={filters.minCreatedAt}
                    onChange={(v) => updateFilter("minCreatedAt", v)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Joined to</Label>
                  <DatePicker
                    value={filters.maxCreatedAt}
                    onChange={(v) => updateFilter("maxCreatedAt", v)}
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="mt-6">
        {loading ? (
          <div className="rounded-2xl border border-border bg-card p-8 text-center text-sm text-muted-foreground">
            Loading users...
          </div>
        ) : (
          <UserTable
            users={users}
            canDelete={isSuperAdmin}
            onRowClick={setSelectedUserId}
            onEdit={(u) => {
              setFormMode("edit");
              setEditingUser(u);
              setFormOpen(true);
            }}
            onDelete={setDeleteTarget}
            onResetDevice={setResetTarget}
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

      <UserDetailModal
        userId={selectedUserId}
        onOpenChange={(open) => !open && setSelectedUserId(null)}
      />

      <UserFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        mode={formMode}
        user={editingUser}
        onSuccess={formMode === "create" ? handleCreated : handleUpdated}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
        title="Delete user"
        description={`Are you sure you want to delete ${deleteTarget?.firstName} ${deleteTarget?.lastName}? This can't be undone.`}
        confirmLabel="Delete"
        destructive
        loading={deleteLoading}
        onConfirm={confirmDelete}
      />

      <ConfirmDialog
        open={!!resetTarget}
        onOpenChange={(o) => !o && setResetTarget(null)}
        title="Reset device ID"
        description={`This will clear the registered device for ${resetTarget?.firstName} ${resetTarget?.lastName}, letting them clock in from a new device.`}
        confirmLabel="Reset"
        loading={resetLoading}
        onConfirm={confirmResetDevice}
      />
    </div>
  );
}
