"use client";

import { Clock, MapPinCheck, Radio } from "lucide-react";
import type { LiveUserInfoResponse } from "../hooks/use-live-users-socket";

function getInitials(fullName: string) {
  const parts = fullName.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return `${first}${last}`.toUpperCase() || "?";
}

function timeAgo(isoTimestamp: string): string {
  const ms = Date.now() - new Date(isoTimestamp).getTime();
  if (Number.isNaN(ms)) return "unknown";
  const seconds = Math.round(ms / 1000);
  if (seconds < 5) return "just now";
  if (seconds < 60) return `${seconds}s ago`;
  return `${Math.round(seconds / 60)}m ago`;
}

// clockEventStatus values are freeform strings from the backend for now —
// this just maps a few common ones to a dot color. Anything unrecognized
// falls back to muted grey rather than guessing.
function statusColor(status: string) {
  const s = status.toUpperCase();
  if (s.includes("IN")) return "#22c55e"; // clocked in — green
  if (s.includes("OUT")) return "#6b7280"; // clocked out — grey
  if (s.includes("BREAK")) return "#e78a53"; // on break — amber/brand
  return "#6b7280";
}

export function UserInfoTooltip({ user }: { user: LiveUserInfoResponse }) {
  const initials = getInitials(user.fullName);
  const dotColor = statusColor(user.clockEventStatus);

  return (
    <div className="w-56 overflow-hidden rounded-xl">
      {/* Header: avatar + name/email */}
      <div className="flex items-center gap-2.5 bg-secondary/10 px-3 py-2.5">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-secondary text-xs font-semibold text-secondary-foreground">
          {initials}
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-foreground">
            {user.fullName}
          </p>
          <p className="truncate text-[11px] text-muted-foreground">
            {user.email}
          </p>
        </div>
      </div>

      {/* Body: status + session details */}
      <div className="space-y-1.5 px-3 py-2.5">
        <div className="flex items-center justify-between">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-foreground">
            <span
              className="h-1.5 w-1.5 rounded-full"
              style={{ backgroundColor: dotColor }}
            />
            {user.clockEventStatus}
          </span>
          <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
            <Radio className="h-3 w-3" />
            {timeAgo(user.timeStamp)}
          </span>
        </div>

        <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
          <Clock className="h-3 w-3 shrink-0" />
          <span className="truncate">
            {user.sessionInfo?.sessionState ?? "—"}
          </span>
        </div>

        <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
          <MapPinCheck className="h-3 w-3 shrink-0" />
          <span className="truncate">
            {user.sessionInfo?.arrivalStatus ?? "—"}
          </span>
        </div>
      </div>
    </div>
  );
}