"use client";

import { Users, UserCog, Activity, AlarmClock, Lock } from "lucide-react";
import { StatCard } from "./stat-card";
import { useIsMobile } from "@/hooks/use-is-mobile";
import { useAutoMarquee } from "@/hooks/use-auto-marquee";
import type { components } from "@/lib/api/generated/schema";

type DashboardData = components["schemas"]["DashboardSuperAdminResponse"] &
  components["schemas"]["DashboardAdminResponse"];

interface DashboardStatsProps {
  role?: string;
  data: DashboardData;
}

export function DashboardStats({ role, data }: DashboardStatsProps) {
  const isSuperAdmin = role === "SUPER_ADMIN";
  const isMobile = useIsMobile();
  const marqueeRef = useAutoMarquee<HTMLDivElement>(isMobile);

  const adminsValue = data.totalAdmins ?? 0;
  const activeValue =
    (isSuperAdmin ? data.totalActiveSessions : data.totalActiveClockEvents) ??
    0;
  const lateValue = data.totalLateArrivals ?? 0;
  const lockedValue = data.lockedBranchCount ?? 0;

  const stats = [
    {
      key: "employees",
      label: "Employees",
      value: data.totalEmployees ?? 0,
      icon: Users,
      accent: "var(--chart-1)",
      hint: isSuperAdmin ? "Across all branches" : "At your branch",
    },
    ...(isSuperAdmin
      ? [
          {
            key: "admins",
            label: "Admins",
            value: adminsValue,
            icon: UserCog,
            accent: "var(--chart-2)",
            hint: adminsValue === 0 ? "None assigned yet" : "Managing branches",
          },
        ]
      : []),
    {
      key: "active",
      label: "Active Sessions",
      value: activeValue,
      icon: Activity,
      accent: "var(--chart-3)",
      hint:
        activeValue === 0
          ? "Nobody clocked in right now"
          : "Clocked in right now",
    },
    {
      key: "late",
      label: "Late Arrivals",
      value: lateValue,
      icon: AlarmClock,
      accent: "var(--destructive)",
      hint:
        lateValue === 0
          ? "No late arrivals today"
          : `${lateValue} flagged today`,
    },
    ...(isSuperAdmin
      ? [
          {
            key: "locked",
            label: "Locked Branches",
            value: lockedValue,
            icon: Lock,
            accent: "var(--secondary)",
            hint:
              lockedValue === 0
                ? "All branches unlocked"
                : `${lockedValue} need${lockedValue === 1 ? "s" : ""} attention`,
          },
        ]
      : []),
  ];
  return (
    <div
      ref={marqueeRef}
      className="no-scrollbar -mx-4 flex gap-4 overflow-x-auto px-4 pb-2 sm:mx-0 sm:grid sm:grid-cols-[repeat(auto-fit,minmax(12rem,1fr))] sm:overflow-visible sm:px-0 sm:pb-0"
    >
      {stats.map((s) => (
        <StatCard
          key={s.key}
          label={s.label}
          value={s.value}
          icon={s.icon}
          accent={s.accent}
          hint={s.hint}
          className="w-40 shrink-0 sm:w-auto sm:shrink"
        />
      ))}
      {/* duplicate set — only rendered/looped on mobile, makes the wrap seamless */}
      <div className="contents sm:hidden" aria-hidden="true">
        {stats.map((s) => (
          <StatCard
            key={`${s.key}-dup`}
            label={s.label}
            value={s.value}
            icon={s.icon}
            accent={s.accent}
            hint={s.hint}
            className="w-40 shrink-0"
          />
        ))}
      </div>
    </div>
  );
}
