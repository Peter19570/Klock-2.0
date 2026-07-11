"use client";

import { Building2, Clock, MapPinOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/auth-store";
import { useAttendanceSession } from "../hooks/use-attendance-session";
import { ClockButton } from "./clock-button";
import { StatusPill, type ClockPillState } from "./status-pill";
import { MarqueeText } from "./marquee-text";

function formatCountdown(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function ClockCard() {
  const session = useAttendanceSession();
  const assignedBranch = useAuthStore((s) => s.user?.assignedBranch);
  const clockedIn = session.isClockedIn === true;
  const away = clockedIn && session.geofence.insideGeofence === false;

  const pillState: ClockPillState =
    session.isClockedIn === null
      ? "checking"
      : away
        ? "away"
        : clockedIn
          ? "in"
          : "out";

  const activeBranchName =
    session.activeBranch?.geofenceName ??
    session.activeBranch?.displayName ??
    null;

  const showCountdownBar =
    away &&
    session.geofence.secondsUntilAutoClockOut != null &&
    !!session.geofence.totalSeconds;

  const percentRemaining =
    showCountdownBar && session.geofence.totalSeconds
      ? Math.max(
          0,
          Math.min(
            100,
            (session.geofence.secondsUntilAutoClockOut! /
              session.geofence.totalSeconds) *
              100,
          ),
        )
      : 0;

  return (
    <div className="relative flex h-55 w-full max-w-90 flex-col overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-sm sm:h-70 sm:max-w-140 sm:p-6">
      {/* top row: state pill (left) + branch you're CLOCKED IN AT (right, desktop) / countdown badge (right, mobile) */}
      <div className="flex items-start justify-between gap-3">
        <StatusPill state={pillState} />

        {clockedIn && activeBranchName && (
          <div className="hidden max-w-[55%] flex-col items-end text-right sm:flex">
            <MarqueeText
              text={activeBranchName}
              className="max-w-full text-sm font-medium text-foreground"
            />
            {session.activeBranch?.shiftStart &&
              session.activeBranch?.shiftEnd && (
                <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3 shrink-0" />
                  {session.activeBranch.shiftStart} –{" "}
                  {session.activeBranch.shiftEnd}
                </p>
              )}
          </div>
        )}

        {/* mobile-only compact countdown badge — replaces the bottom bar since there's no room for it */}
        {showCountdownBar && (
          <div className="flex shrink-0 items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 text-xs font-semibold text-amber-500 sm:hidden">
            <MapPinOff className="h-3 w-3 shrink-0" />
            {formatCountdown(session.geofence.secondsUntilAutoClockOut!)}
          </div>
        )}
      </div>

      {/* center column: button + contextual info below it */}
      <div className="flex flex-1 flex-col items-center justify-center gap-3 py-6 sm:py-8">
        <ClockButton
          isClockedIn={clockedIn}
          onToggle={clockedIn ? session.clockOut : session.clockIn}
          disabled={session.isBusy || session.isClockedIn === null}
          className="max-w-55"
        />

        {/* assigned branch — always visible, regardless of clock state */}
        {assignedBranch && (
          <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Building2 className="h-3.5 w-3.5 shrink-0" />
            <span className="max-w-55 truncate">{assignedBranch}</span>
          </p>
        )}

        {/* mobile only — the active-branch marquee above is hidden below sm */}
        {clockedIn && activeBranchName && (
          <div className="flex max-w-65 flex-col items-center text-center sm:hidden">
            <MarqueeText
              text={activeBranchName}
              className="max-w-full text-sm font-medium text-foreground"
            />
            {session.activeBranch?.shiftStart &&
              session.activeBranch?.shiftEnd && (
                <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3 shrink-0" />
                  {session.activeBranch.shiftStart} –{" "}
                  {session.activeBranch.shiftEnd}
                </p>
              )}
          </div>
        )}

        {/* desktop bar — animated grid-rows wrapper so it pushes content up instead of popping in */}
        <div
          className={cn(
            "hidden w-full max-w-70 grid-cols-1 transition-[grid-template-rows] duration-300 ease-out sm:grid",
            showCountdownBar ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
          )}
        >
          <div className="overflow-hidden">
            <div className="pt-1">
              <div className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-amber-500">
                <MapPinOff className="h-3.5 w-3.5 shrink-0" />
                <span>
                  You&apos;re away from the branch perimeter — clocking out in{" "}
                  {session.geofence.secondsUntilAutoClockOut != null
                    ? formatCountdown(session.geofence.secondsUntilAutoClockOut)
                    : "0:00"}
                </span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-amber-500/15">
                <div
                  className="h-full rounded-full bg-amber-500 transition-[width] duration-1000 ease-linear"
                  style={{ width: `${percentRemaining}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
