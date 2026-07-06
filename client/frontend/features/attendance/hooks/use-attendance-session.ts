"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useAuthStore } from "@/store/auth-store";
import { useToasts } from "@/components/common/toast";
import { ApiError } from "@/lib/api/api-error";
import { useGeofenceWatcher, clearGeofenceCountdown } from "./use-geofence";
import type { components } from "@/lib/api/generated/schema";
import { getOrCreateDeviceId } from "@/lib/device-id";
import { emitAttendanceChanged } from "@/lib/attendance-events";
import {
  clockIn,
  clockOut,
  getActiveBranch,
  isClockedIn,
  registerDeviceId,
} from "../api";

type BranchUserResponse = components["schemas"]["BranchUserResponse"];

const AUTO_CLOCK_IN_ATTEMPTS = 3;
const AUTO_CLOCK_IN_RETRY_DELAY_MS = 2500;

function getPosition(): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    if (!("geolocation" in navigator)) {
      reject(new Error("Geolocation isn't supported on this device."));
      return;
    }
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: true,
      timeout: 10000,
    });
  });
}

async function getBatteryLevel(): Promise<number> {
  try {
    // @ts-expect-error - non-standard, Chromium-only API; other browsers just fall through
    const battery = await navigator.getBattery?.();
    return battery ? Math.round(battery.level * 100) : 0;
  } catch {
    return 0;
  }
}

// backend expects a plain HH:mm:ss LocalTime, not an ISO instant —
// don't "helpfully" switch this back to new Date().toISOString().
function getLocalTimeString(): string {
  const now = new Date();
  const hh = String(now.getHours()).padStart(2, "0");
  const mm = String(now.getMinutes()).padStart(2, "0");
  const ss = String(now.getSeconds()).padStart(2, "0");
  return `${hh}:${mm}:${ss}`;
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function useAttendanceSession() {
  const role = useAuthStore((s) => s.user?.userRole);
  const isUser = role === "USER";
  const toasts = useToasts();

  const [clockedIn, setClockedIn] = useState<boolean | null>(null);
  const [activeBranch, setActiveBranch] = useState<BranchUserResponse | null>(null);
  const [isBusy, setIsBusy] = useState(true);

  const attemptedRef = useRef(false);

  const loadActiveBranch = useCallback(async () => {
    try {
      const branch = await getActiveBranch();
      setActiveBranch(branch ?? null);
    } catch {
      setActiveBranch(null);
    }
  }, []);

  const performClockIn = useCallback(
    async (silent: boolean) => {
      const position = await getPosition();
      const deviceId = getOrCreateDeviceId();
      const batteryLevel = await getBatteryLevel();

      const event = await clockIn({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
        isDelaySync: false,
        deviceId,
        batteryLevel,
        signalStrength: 0,
        clientTimeStamp: getLocalTimeString(),
      });

      setClockedIn(true);
      await loadActiveBranch();
      emitAttendanceChanged();

      if (!silent) {
        toasts.success(`Clocked in${event?.branchName ? ` at ${event.branchName}` : ""}.`);
      }
    },
    [loadActiveBranch, toasts],
  );

  const handleManualClockIn = useCallback(async () => {
    setIsBusy(true);
    try {
      await performClockIn(false);
    } catch (err) {
      toasts.error(err instanceof ApiError ? err.detail : "Couldn't clock in. Try again.");
    } finally {
      setIsBusy(false);
    }
  }, [performClockIn, toasts]);

  const handleClockOut = useCallback(
    async (type: "MANUAL" | "AUTOMATIC" = "MANUAL") => {
      setIsBusy(true);
      const branchId = activeBranch?.id;
      try {
        const position = await getPosition().catch(() => null);
        await clockOut({
          clockOutType: type,
          latitude: position?.coords.latitude ?? activeBranch?.latitude ?? 0,
          longitude: position?.coords.longitude ?? activeBranch?.longitude ?? 0,
        });

        // manual clock-out mid-countdown needs an explicit clear — the
        // auto-clockout path already clears this itself in use-geofence
        if (type === "MANUAL") {
          clearGeofenceCountdown(branchId);
        }

        setClockedIn(false);
        setActiveBranch(null);
        emitAttendanceChanged();

        if (type === "AUTOMATIC") {
          toasts.warning("You left the branch zone — automatically clocked out.");
        } else {
          toasts.success("Clocked out.");
        }
      } catch (err) {
        toasts.error(err instanceof ApiError ? err.detail : "Couldn't clock out. Try again.");
      } finally {
        setIsBusy(false);
      }
    },
    [activeBranch, toasts],
  );

  useEffect(() => {
    if (!isUser || attemptedRef.current) return;
    attemptedRef.current = true;

    (async () => {
      setIsBusy(true);

      const user = useAuthStore.getState().user;
      if (user && user.hasSetDevice === false) {
        try {
          await registerDeviceId({ deviceId: getOrCreateDeviceId() });
        } catch {
          // non-fatal — if the backend still rejects clock-in over device
          // mismatch, that error surfaces naturally from clockIn() below.
        }
      }

      let active: boolean;
      try {
        active = await isClockedIn();
      } catch {
        setClockedIn(false);
        setIsBusy(false);
        return;
      }

      setClockedIn(active);

      if (active) {
        // only hit /branches/active when there IS an active session —
        // the backend 404s/rejects this otherwise
        await loadActiveBranch();
        setIsBusy(false);
        return;
      }

      for (let attempt = 1; attempt <= AUTO_CLOCK_IN_ATTEMPTS; attempt++) {
        try {
          await performClockIn(true);
          setIsBusy(false);
          return;
        } catch {
          if (attempt < AUTO_CLOCK_IN_ATTEMPTS) {
            await sleep(AUTO_CLOCK_IN_RETRY_DELAY_MS);
          }
        }
      }

      // all 3 silent attempts failed — hand control to the user
      setIsBusy(false);
    })();
  }, [isUser, loadActiveBranch, performClockIn]);

  const geofence = useGeofenceWatcher(activeBranch, clockedIn === true, () => {
    handleClockOut("AUTOMATIC");
  });

  return {
    isClockedIn: clockedIn,
    activeBranch,
    isBusy,
    clockIn: handleManualClockIn,
    clockOut: () => handleClockOut("MANUAL"),
    geofence,
  };
}