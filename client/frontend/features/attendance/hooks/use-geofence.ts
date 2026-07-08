"use client";

import { useEffect, useRef, useState } from "react";
import type { components } from "@/lib/api/generated/schema";

type BranchUserResponse = components["schemas"]["BranchUserResponse"];

interface GeofenceState {
  insideGeofence: boolean | null;
  secondsUntilAutoClockOut: number | null;
  totalSeconds: number | null;
}

function distanceMeters(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371000;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

function deadlineKey(branchId: string) {
  return `klock:geofence-deadline:${branchId}`;
}

// Dodge fix: instead of snapshotting the remaining seconds every tick (which
// would drift if the tab was closed a while), we store the absolute deadline
// timestamp once. On refresh we just recompute "remaining = deadline - now".
function readStoredDeadline(branchId: string): number | null {
  try {
    const raw = sessionStorage.getItem(deadlineKey(branchId));
    if (!raw) return null;
    const deadline = Number(raw);
    if (!Number.isFinite(deadline) || deadline <= Date.now()) {
      sessionStorage.removeItem(deadlineKey(branchId));
      return null;
    }
    return deadline;
  } catch {
    return null;
  }
}

function writeStoredDeadline(branchId: string, deadline: number) {
  try {
    console.log("[geofence] wrote deadline", branchId, new Date(deadline).toISOString());
    sessionStorage.setItem(deadlineKey(branchId), String(deadline));
  } catch {
    // sessionStorage unavailable (private mode etc.) — countdown just won't survive a refresh
  }
}

// Exported so use-attendance-session can clear this on a MANUAL clock-out
// mid-countdown — otherwise the next clock-in at the same branch would
// wrongly resume the stale countdown.
export function clearGeofenceCountdown(branchId: string | null | undefined) {
  if (!branchId) return;
  try {
    console.log("[geofence] cleared deadline", branchId, new Error().stack);
    sessionStorage.removeItem(deadlineKey(branchId));
  } catch {
    // ignore
  }
}

export function useGeofenceWatcher(
  branch: BranchUserResponse | null,
  enabled: boolean,
  onAutoClockOut: (lat: number, lon: number) => void,
) {
  const [state, setState] = useState<GeofenceState>({
    insideGeofence: null,
    secondsUntilAutoClockOut: null,
    totalSeconds: null,
  });

  const deadlineRef = useRef<number | null>(null);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const firedRef = useRef(false);
  const branchRef = useRef(branch);

  // keep the ref current on every render without restarting the watch effect
  useEffect(() => {
    branchRef.current = branch;
  }, [branch]);

  useEffect(() => {
    if (!enabled || !branch?.latitude || !branch?.longitude || !branch?.radius) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setState({ insideGeofence: null, secondsUntilAutoClockOut: null, totalSeconds: null });
      return;
    }

    const branchId = branch.id ?? "unknown-branch";
    firedRef.current = false;

    const lastKnownPosition = { current: { lat: branch.latitude!, lon: branch.longitude! } };

    function clearTick() {
      if (tickRef.current) {
        clearInterval(tickRef.current);
        tickRef.current = null;
      }
      deadlineRef.current = null;
    }

    function startCountdown() {
      const current = branchRef.current!;
      const timeoutMs = (current.geofenceExitTimeoutMinutes ?? 5) * 60_000;
      const stored = readStoredDeadline(branchId);
      const deadline = stored ?? Date.now() + timeoutMs;
      deadlineRef.current = deadline;
      if (!stored) writeStoredDeadline(branchId, deadline);

      setState((s) => ({ ...s, totalSeconds: Math.round(timeoutMs / 1000) }));

      tickRef.current = setInterval(() => {
        const remainingMs = (deadlineRef.current ?? 0) - Date.now();
        const remainingSec = Math.max(0, Math.round(remainingMs / 1000));
        setState((s) => ({ ...s, secondsUntilAutoClockOut: remainingSec }));

        if (remainingMs <= 0 && !firedRef.current) {
          firedRef.current = true;
          clearTick();
          clearGeofenceCountdown(branchId);
          onAutoClockOut(lastKnownPosition.current.lat, lastKnownPosition.current.lon);
        }
      }, 1000);
    }

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const current = branchRef.current!;
        const { latitude, longitude } = position.coords;
        lastKnownPosition.current = { lat: latitude, lon: longitude };
        const distance = distanceMeters(latitude, longitude, current.latitude!, current.longitude!);
        const inside = distance <= current.radius!;

        setState((s) => ({ ...s, insideGeofence: inside }));

        if (inside) {
          clearTick();
          clearGeofenceCountdown(branchId);
          setState((s) => ({ ...s, secondsUntilAutoClockOut: null, totalSeconds: null }));
        } else if (!deadlineRef.current) {
          startCountdown();
        }
      },
      () => {},
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 15000 },
    );

    if (readStoredDeadline(branchId)) {
      setState((s) => ({ ...s, insideGeofence: false }));
      startCountdown();
    }

    return () => {
      navigator.geolocation.clearWatch(watchId);
      clearTick();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, branch?.id]);

  return state;
}