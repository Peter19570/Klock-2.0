"use client";

import { Users, UserCog, Activity, AlarmClock, Lock } from "lucide-react";
import { StatCard } from "./stat-card";
import type { components } from "@/lib/api/generated/schema";

type DashboardData = components["schemas"]["DashboardSuperAdminResponse"] &
  components["schemas"]["DashboardAdminResponse"];

interface DashboardStatsProps {
  role?: string;
  data: DashboardData;
}

export function DashboardStats({ role, data }: DashboardStatsProps) {
  const isSuperAdmin = role === "SUPER_ADMIN";

  const stats = [
    {
      key: "employees",
      label: "Employees",
      value: data.totalEmployees ?? 0,
      icon: Users,
      accent: "var(--chart-1)",
    },
    ...(isSuperAdmin
      ? [{ key: "admins", label: "Admins", value: data.totalAdmins ?? 0, icon: UserCog, accent: "var(--chart-2)" }]
      : []),
    {
      key: "active",
      label: "Active Sessions",
      value: (isSuperAdmin ? data.totalActiveSessions : data.totalActiveClockEvents) ?? 0,
      icon: Activity,
      accent: "var(--chart-3)",
    },
    {
      key: "late",
      label: "Late Arrivals",
      value: data.totalLateArrivals ?? 0,
      icon: AlarmClock,
      accent: "var(--destructive)",
    },
    ...(isSuperAdmin
      ? [{ key: "locked", label: "Locked Branches", value: data.lockedBranchCount ?? 0, icon: Lock, accent: "var(--secondary)" }]
      : []),
  ];

  return (
    <div className="flex flex-wrap gap-4">
      {stats.map((s) => (
        <StatCard key={s.key} label={s.label} value={s.value} icon={s.icon} accent={s.accent} />
      ))}
    </div>
  );
}