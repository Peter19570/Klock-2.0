"use client";

import { useEffect, useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { EnumSelect } from "@/components/common/enum-select";
import { TimePicker } from "@/components/common/time-picker";
import { useToasts } from "@/components/common/toast";
import { cn } from "@/lib/utils";
import { ExternalLink, Loader2 } from "lucide-react";
import {
  createBranch,
  updateBranch,
  type BranchDetailedResponse,
  type BranchResponse,
} from "@/features/branches/api";

const STATUS_OPTIONS = ["UNLOCKED", "LOCKED"] as const;
const SUPPORT_TYPES = ["phone", "email"] as const;
type SupportType = (typeof SUPPORT_TYPES)[number];

interface BranchFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "create" | "edit";
  branch?: BranchDetailedResponse | null;
  onSuccess: (branch: BranchResponse) => void;
}

function detectSupportType(value?: string): SupportType {
  return value && value.includes("@") ? "email" : "phone";
}

export function BranchFormDialog({
  open,
  onOpenChange,
  mode,
  branch,
  onSuccess,
}: BranchFormDialogProps) {
  const toasts = useToasts();

  const [displayName, setDisplayName] = useState("");
  const [latitude, setLatitude] = useState("5.6037");
  const [longitude, setLongitude] = useState("-0.1870");
  const [radius, setRadius] = useState("100");
  const [geofenceName, setGeofenceName] = useState("");
  const [geofenceDirty, setGeofenceDirty] = useState(false);
  const [geofenceLoading, setGeofenceLoading] = useState(false);
  const [shiftStart, setShiftStart] = useState("08:00:00");
  const [shiftEnd, setShiftEnd] = useState("17:00:00");
  const [exitTimeout, setExitTimeout] = useState("15");
  const [branchStatus, setBranchStatus] = useState<
    "LOCKED" | "UNLOCKED" | undefined
  >("UNLOCKED");
  const [supportType, setSupportType] = useState<SupportType>("phone");
  const [support, setSupport] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const geocodeHandle = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!open) return;
    if (mode === "edit" && branch) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setDisplayName(branch.displayName ?? "");
      setLatitude(branch.latitude !== undefined ? String(branch.latitude) : "");
      setLongitude(
        branch.longitude !== undefined ? String(branch.longitude) : "",
      );
      setRadius(branch.radius !== undefined ? String(branch.radius) : "100");
      setGeofenceName(branch.geofenceName ?? "");
      setGeofenceDirty(true);
      setShiftStart(branch.shiftStart ?? "08:00:00");
      setShiftEnd(branch.shiftEnd ?? "17:00:00");
      setExitTimeout(
        branch.geofenceExitTimeoutMinutes !== undefined
          ? String(branch.geofenceExitTimeoutMinutes)
          : "15",
      );
      setBranchStatus(branch.branchStatus ?? "UNLOCKED");
      setSupportType(detectSupportType(branch.support));
      setSupport(branch.support ?? "");
    } else {
      setDisplayName("");
      setLatitude("5.6037");
      setLongitude("-0.1870");
      setRadius("100");
      setGeofenceName("");
      setGeofenceDirty(false);
      setShiftStart("08:00:00");
      setShiftEnd("17:00:00");
      setExitTimeout("15");
      setBranchStatus("UNLOCKED");
      setSupportType("phone");
      setSupport("");
    }
    setError(null);
  }, [open, mode, branch]);

  // Suggest a geofence name from the coordinates, unless the user already
  // typed their own.
  useEffect(() => {
    if (!open || geofenceDirty) return;
    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);
    if (Number.isNaN(lat) || Number.isNaN(lng)) return;

    if (geocodeHandle.current) clearTimeout(geocodeHandle.current);
    geocodeHandle.current = setTimeout(async () => {
      setGeofenceLoading(true);
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`,
        );
        const data = await res.json();
        const addr = data?.address ?? {};
        const label =
          addr.suburb ||
          addr.neighbourhood ||
          addr.road ||
          addr.city ||
          data?.name;
        setGeofenceName(label ? `${label} Geofence` : "New Geofence");
      } catch {
        setGeofenceName("New Geofence");
      } finally {
        setGeofenceLoading(false);
      }
    }, 600);

    return () => {
      if (geocodeHandle.current) clearTimeout(geocodeHandle.current);
    };
  }, [latitude, longitude, open, geofenceDirty]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!branchStatus) {
      setError("Please select a branch status.");
      return;
    }

    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);
    const rad = parseFloat(radius);
    const timeout = parseInt(exitTimeout, 10);

    if (Number.isNaN(lat) || Number.isNaN(lng)) {
      setError("Latitude and longitude must be valid numbers.");
      return;
    }

    setLoading(true);

    const body = {
      displayName,
      latitude: lat,
      longitude: lng,
      radius: Number.isNaN(rad) ? undefined : rad,
      geofenceName,
      shiftStart,
      shiftEnd,
      geofenceExitTimeoutMinutes: Number.isNaN(timeout) ? undefined : timeout,
      branchStatus,
      support,
    };

    if (mode === "create") {
      const { data, error: err } = await createBranch(body);
      setLoading(false);
      if (err || !data) {
        setError(err ?? "Something went wrong");
        toasts.error(err ?? "Failed to create branch");
        return;
      }
      toasts.success("Branch created");
      onSuccess(data);
      onOpenChange(false);
      return;
    }

    if (mode === "edit" && branch?.id) {
      const { data, error: err } = await updateBranch(branch.id, body);
      setLoading(false);
      if (err || !data) {
        setError(err ?? "Something went wrong");
        toasts.error(err ?? "Failed to update branch");
        return;
      }
      toasts.success("Branch updated");
      onSuccess(data);
      onOpenChange(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Create branch" : "Edit branch"}
          </DialogTitle>
        </DialogHeader>

        <form
          onSubmit={handleSubmit}
          className="max-h-[70vh] space-y-5 overflow-y-auto scrollbar-hide px-1"
        >
          <div className="space-y-1.5">
            <Label htmlFor="displayName">Branch name</Label>
            <Input
              id="displayName"
              placeholder="e.g. East Legon Branch"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              required
              autoFocus
            />
          </div>
          <div className="space-y-1.5">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="latitude">Latitude</Label>
                <Input
                  id="latitude"
                  type="number"
                  step="any"
                  value={latitude}
                  onChange={(e) => setLatitude(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="longitude">Longitude</Label>
                <Input
                  id="longitude"
                  type="number"
                  step="any"
                  value={longitude}
                  onChange={(e) => setLongitude(e.target.value)}
                  required
                />
              </div>
            </div>

            <a
              href="https://www.google.com/maps"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
            >
              Find coordinates on Google Maps
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="geofenceName">
              Geofence name
              {geofenceLoading && (
                <Loader2 className="ml-1.5 inline h-3 w-3 animate-spin text-muted-foreground" />
              )}
            </Label>
            <Input
              id="geofenceName"
              value={geofenceName}
              onChange={(e) => {
                setGeofenceName(e.target.value);
                setGeofenceDirty(true);
              }}
              placeholder="Auto-filled from coordinates"
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="radius">Radius (meters)</Label>
            <Input
              id="radius"
              type="number"
              step="any"
              min="1"
              value={radius}
              onChange={(e) => setRadius(e.target.value)}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Shift start</Label>
              <TimePicker
                value={shiftStart}
                onChange={(v) => setShiftStart(v ?? "")}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Shift end</Label>
              <TimePicker
                value={shiftEnd}
                onChange={(v) => setShiftEnd(v ?? "")}
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="exitTimeout">Geofence exit timeout (minutes)</Label>
            <Input
              id="exitTimeout"
              type="number"
              min="0"
              value={exitTimeout}
              onChange={(e) => setExitTimeout(e.target.value)}
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label>Status *</Label>
            <EnumSelect
              value={branchStatus}
              onChange={(v) => setBranchStatus(v)}
              options={STATUS_OPTIONS}
              placeholder="Select status"
              className="h-10 w-full"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="support">Support contact</Label>
            <div className="flex gap-3">
              <div className="flex shrink-0 overflow-hidden rounded-lg border border-border">
                {SUPPORT_TYPES.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setSupportType(t)}
                    className={cn(
                      "px-3 py-2 text-xs font-medium capitalize transition-colors",
                      supportType === t
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-accent hover:text-foreground",
                    )}
                  >
                    {t}
                  </button>
                ))}
              </div>
              <Input
                id="support"
                type={supportType === "email" ? "email" : "tel"}
                placeholder={
                  supportType === "email"
                    ? "support@company.com"
                    : "+233 24 000 0000"
                }
                value={support}
                onChange={(e) => setSupport(e.target.value)}
                required
                className="flex-1"
              />
            </div>
          </div>
          {error && (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          )}
          <Button type="submit" disabled={loading} className="w-full">
            {loading
              ? "Saving..."
              : mode === "create"
                ? "Create branch"
                : "Save changes"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
