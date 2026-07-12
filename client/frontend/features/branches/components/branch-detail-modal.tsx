"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  ExternalLink,
  MapPin,
  Pencil,
  Shield,
  Trash2,
  UserCheck,
  Users,
} from "lucide-react";
import type { BranchDetailedResponse } from "@/features/branches/api";

interface BranchDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  branch: BranchDetailedResponse | null;
  loading?: boolean;
  onEdit: (branch: BranchDetailedResponse) => void;
  onDelete: (branch: BranchDetailedResponse) => void;
}

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

export function BranchDetailModal({
  open,
  onOpenChange,
  branch,
  loading,
  onEdit,
  onDelete,
}: BranchDetailModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        {loading || !branch ? (
          <div className="py-10 text-center text-sm text-muted-foreground">
            Loading branch...
          </div>
        ) : (
          <>
            <DialogHeader>
              <div className="flex items-center gap-2 pr-6">
                <DialogTitle className="truncate">
                  {branch.displayName}
                </DialogTitle>
                {branch.branchStatus && (
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
            </DialogHeader>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-border bg-muted/30 p-3">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Users className="h-3.5 w-3.5" />
                  Active now
                </div>
                <div className="mt-1 text-xl font-semibold text-foreground">
                  {branch.currentActiveCount ?? 0}
                </div>
              </div>
              <div className="rounded-xl border border-border bg-muted/30 p-3">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <UserCheck className="h-3.5 w-3.5" />
                  Employees
                </div>
                <div className="mt-1 text-xl font-semibold text-foreground">
                  {branch.totalEmployees ?? 0}
                </div>
              </div>
              <div className="rounded-xl border border-border bg-muted/30 p-3">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Shield className="h-3.5 w-3.5" />
                  Admins
                </div>
                <div className="mt-1 text-xl font-semibold text-foreground">
                  {branch.totalAdmins ?? 0}
                </div>
              </div>
              <div className="rounded-xl border border-border bg-muted/30 p-3">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <MapPin className="h-3.5 w-3.5" />
                  Avg. clock-in distance
                </div>
                <div className="mt-1 text-xl font-semibold text-foreground">
                  {formatDistance(branch.avgClockInDistanceFromBranch)}
                </div>
              </div>
            </div>

            <div className="space-y-2.5 rounded-xl border border-border p-3.5 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Shift hours</span>
                <span className="font-medium text-foreground">
                  {formatTime(branch.shiftStart)} –{" "}
                  {formatTime(branch.shiftEnd)}
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

            <div className="flex items-center gap-2 pt-1">
              <Button
                variant="outline"
                className="flex-1 gap-1.5"
                onClick={() => onEdit(branch)}
              >
                <Pencil className="h-3.5 w-3.5" />
                Edit branch
              </Button>
              <Button
                variant="outline"
                className="flex-1 gap-1.5 border-destructive/30 text-destructive hover:bg-destructive/10"
                onClick={() => onDelete(branch)}
              >
                <Trash2 className="h-3.5 w-3.5" />
                Delete
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
