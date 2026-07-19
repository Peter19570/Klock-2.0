"use client";

import { useEffect, useState } from "react";
import { Calendar, Fingerprint, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { OrganizationFormDialog } from "@/features/organization/components/organization-form-dialog";
import { DeleteOrganizationDialog } from "@/features/organization/components/delete-organization-dialog";
import {
  deleteOrganization,
  fetchOrganization,
  type OrganizationDetailedResponse,
} from "@/features/organization/api";
import { useAuthStore } from "@/store/auth-store";
import { useRouter } from "next/navigation";
import { Spinner } from "@/components/ui/spinner";

function formatDate(dateStr?: string) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function AdminOrgView() {
  const router = useRouter();
  const clearAuth = useAuthStore((s) => s.clearAuth);

  const [organization, setOrganization] =
    useState<OrganizationDetailedResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  function load() {
    setLoading(true);
    fetchOrganization().then((data) => {
      setOrganization(data ?? null);
      setLoading(false);
    });
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, []);

  async function handleDelete() {
    setDeleting(true);
    const { error } = await deleteOrganization();
    setDeleting(false);
    if (error) {
      console.error(error);
      return;
    }
    clearAuth();
    router.replace("/login");
  }

  return (
    <div className="pb-16 pt-8">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="truncate text-2xl font-semibold tracking-tight">
            {loading
              ? "Organization"
              : (organization?.displayName ?? "Organization")}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage your organization&apos;s name and description.
          </p>
        </div>

        <div className="mt-1.5 shrink-0">
          <Button
            className="gap-1.5"
            disabled={loading}
            onClick={() => setFormOpen(true)}
          >
            <Pencil className="h-4 w-4" />
            Edit organization
          </Button>
        </div>
      </div>

      {loading || !organization ? (
        <Spinner size={32} />
      ) : (
        <>
          <div className="mt-6 space-y-4 rounded-2xl border border-border bg-card p-4 text-sm shadow-sm sm:p-5">
            <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
              <span className="shrink-0 text-muted-foreground">
                Description
              </span>
              <span className="font-medium text-foreground sm:max-w-sm sm:text-right">
                {organization.description || "—"}
              </span>
            </div>
            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
              <span className="text-muted-foreground">Created</span>
              <span className="flex items-center gap-1.5 font-medium text-foreground">
                <Calendar className="h-3.5 w-3.5" />
                {formatDate(organization.createdAt)}
              </span>
            </div>
            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
              <span className="text-muted-foreground">Organization ID</span>
              <span className="flex items-center gap-1.5 font-mono text-xs text-foreground">
                <Fingerprint className="h-3.5 w-3.5" />
                {organization.id}
              </span>
            </div>
          </div>

          <div className="mt-6 rounded-2xl border border-destructive/30 bg-destructive/5 p-4 shadow-sm sm:p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-semibold text-destructive">
                  Danger zone
                </h2>
                <p className="mt-1 text-xs text-muted-foreground">
                  Permanently delete this organization and everything in it —
                  users, branches, sessions, and audit logs.
                </p>
              </div>
              <Button
                variant="outline"
                className="shrink-0 gap-1.5 border-destructive/30 text-destructive hover:bg-destructive/10"
                onClick={() => setDeleteOpen(true)}
              >
                <Trash2 className="h-3.5 w-3.5" />
                Delete organization
              </Button>
            </div>
          </div>
        </>
      )}

      <OrganizationFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        organization={organization}
        onSuccess={load}
      />

      {organization && (
        <DeleteOrganizationDialog
          open={deleteOpen}
          onOpenChange={setDeleteOpen}
          organizationName={organization.displayName ?? ""}
          loading={deleting}
          onConfirm={handleDelete}
        />
      )}
    </div>
  );
}
