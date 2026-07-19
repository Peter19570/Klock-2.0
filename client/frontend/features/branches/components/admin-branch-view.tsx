"use client";

import { useEffect, useState } from "react";
import {
  ExternalLink,
  Lock,
  MapPin,
  Pencil,
  Shield,
  UserCheck,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { BranchFormDialog } from "@/features/branches/components/branch-form-dialog";
import {
  fetchOwnBranch,
  type BranchDetailedResponse,
} from "@/features/branches/api";
import { Spinner } from "@/components/ui/spinner";

const STATUS_STYLES: Record<string, string> = {
  UNLOCKED: "bg-emerald-500/10 border-emerald-500/30 text-emerald-500",
  LOCKED: "bg-destructive/10 border-destructive/30 text-destructive",
};

const DRIFT_STATUS_STYLES: Record<string, string> = {
  STABLE: "bg-emerald-500/10 border-emerald-500/30 text-emerald-500",
  DRIFTING: "bg-amber-500/10 border-amber-500/30 text-amber-500",
};

function formatTime(value?: string) {
  if (!value) return "—";
  const [hStr, mStr] = value.split(":");
  const h24 = parseInt(hStr, 10);
  const m = parseInt(mStr, 10);
  if (Number.isNaN(h24) || Number.isNaN(m)) return "—";
  const period = h24 >= 12 ? "PM" : "AM";
  let h12 = h24 % 12;
  if (h12 === 0) h12 = 12;
  return `${h12}:${String(m).padStart(2, "0")} ${period}`;
}

function formatDistance(meters?: number) {
  if (meters === undefined || meters === null) return "—";
  return meters >= 1000
    ? `${(meters / 1000).toFixed(2)} km`
    : `${meters.toFixed(0)} m`;
}

function formatDate(dateStr?: string) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

const STAT_CARDS = (branch: BranchDetailedResponse) => [
  {
    icon: Users,
    label: "Active now",
    value: branch.currentActiveCount ?? 0,
    desc: "Staff currently clocked in",
  },
  {
    icon: UserCheck,
    label: "Employees",
    value: branch.totalEmployees ?? 0,
    desc: "Total staff assigned here",
  },
  {
    icon: Shield,
    label: "Admins",
    value: branch.totalAdmins ?? 0,
    desc: "Admins managing this branch",
  },
  {
    icon: MapPin,
    label: "Avg. clock-in distance",
    value: formatDistance(branch.avgClockInDistanceFromBranch),
    desc: "How far off the geofence center, on average",
  },
];

export function AdminBranchView() {
  const [branch, setBranch] = useState<BranchDetailedResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);

  function load() {
    setLoading(true);
    fetchOwnBranch().then((data) => {
      setBranch(data ?? null);
      setLoading(false);
    });
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, []);

  const isLocked = branch?.branchStatus === "LOCKED";

  return (
    <div className="pb-16 pt-8">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="truncate text-2xl font-semibold tracking-tight">
              {loading ? "Branch" : (branch?.displayName ?? "Branch")}
            </h1>
            {branch?.branchStatus && (
              <span
                className={cn(
                  "shrink-0 rounded-lg border px-2 py-0.5 text-xs font-medium",
                  STATUS_STYLES[branch.branchStatus],
                )}
              >
                {branch.branchStatus}
              </span>
            )}
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            {isLocked
              ? "This branch is locked by your admin — contact them to make changes."
              : "Manage your branch's geofence, shift hours, and support contact."}
          </p>
        </div>

        <div
          className="mt-1.5 shrink-0"
          title={
            isLocked
              ? "Locked by your admin — contact them to make changes"
              : undefined
          }
        >
          <Button
            variant={isLocked ? "outline" : "default"}
            disabled={isLocked || loading}
            className={cn(
              "gap-1.5",
              isLocked && "cursor-not-allowed text-muted-foreground opacity-50",
            )}
            onClick={() => !isLocked && setFormOpen(true)}
          >
            {isLocked ? (
              <Lock className="h-4 w-4" />
            ) : (
              <Pencil className="h-4 w-4" />
            )}
            {isLocked ? "Locked" : "Edit branch"}
          </Button>
        </div>
      </div>

      {loading || !branch ? (
        <Spinner size={32} />
      ) : (
        <>
          <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
            {STAT_CARDS(branch).map(({ icon: Icon, label, value, desc }) => (
              <div
                key={label}
                className="rounded-2xl border border-border bg-card p-4 shadow-sm"
              >
                <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                  <Icon className="h-3.5 w-3.5" />
                  {label}
                </div>
                <div className="mt-2 text-2xl font-semibold text-foreground">
                  {value}
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{desc}</p>
              </div>
            ))}
          </div>

          <div className="mt-6 space-y-2.5 rounded-2xl border border-border bg-card p-4 text-sm shadow-sm sm:p-5">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Shift hours</span>
              <span className="font-medium text-foreground">
                {formatTime(branch.shiftStart)} – {formatTime(branch.shiftEnd)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Clock-in status</span>
              {branch.status ? (
                <span
                  className={cn(
                    "rounded-lg border px-2 py-0.5 text-xs font-medium",
                    DRIFT_STATUS_STYLES[branch.status] ??
                      "border-border bg-muted text-muted-foreground",
                  )}
                >
                  {branch.status}
                </span>
              ) : (
                <span className="font-medium text-foreground">—</span>
              )}
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Geofence</span>
              <span className="font-medium text-foreground">
                {branch.geofenceName ?? "—"} · {formatDistance(branch.radius)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Auto clock-out</span>
              <span className="font-medium text-foreground">
                {branch.geofenceExitTimeoutMinutes !== undefined
                  ? `${branch.geofenceExitTimeoutMinutes} min after leaving zone`
                  : "—"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Support contact</span>
              <span className="font-medium text-foreground">
                {branch.support ?? "—"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Coordinates</span>
              <a
                href={`https://www.google.com/maps?q=${branch.latitude},${branch.longitude}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 font-medium text-primary hover:underline"
              >
                {branch.latitude?.toFixed(5)}, {branch.longitude?.toFixed(5)}
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Created</span>
              <span className="font-medium text-foreground">
                {formatDate(branch.createdAt)}
              </span>
            </div>
          </div>
        </>
      )}

      <BranchFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        mode="edit"
        branch={branch}
        onSuccess={load}
      />
    </div>
  );
}
