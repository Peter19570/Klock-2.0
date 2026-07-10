"use client";

import { useAuthStore } from "@/store/auth-store";
import { useDashboardData } from "@/features/dashboard/hooks/use-dashboard-data";
import { DashboardStats } from "@/features/dashboard/components/dashboard-stats";
import { SessionTrendChart } from "@/features/dashboard/components/session-trend-chart";
import { ClockOutPieChart } from "@/features/dashboard/components/clock-out-pie-chart";
import { SessionTable } from "@/features/sessions/components/session-table";

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const { role, data, loading } = useDashboardData();

  if (loading || !data) {
    return (
      <p className="pb-16 pt-8 text-sm text-muted-foreground">
        Loading dashboard...
      </p>
    );
  }

  const recentSessions = [...(data.recentSessions ?? [])]
    .sort((a, b) => {
      const dateA = a.workDate ? new Date(a.workDate).getTime() : 0;
      const dateB = b.workDate ? new Date(b.workDate).getTime() : 0;
      return dateB - dateA; // newest first
    })
    .slice(0, 15);

  return (
    <div className="flex flex-col gap-6 pb-16 pt-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Welcome back, {user?.firstName}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Here&apos;s what&apos;s happening{" "}
          {role === "SUPER_ADMIN"
            ? "across the organization"
            : "at your branch"}{" "}
          today.
        </p>
      </div>

      <DashboardStats role={role} data={data} />

      <div className="flex flex-col gap-6 lg:flex-row">
        <SessionTrendChart data={data.sessionTrend ?? []} />
        <ClockOutPieChart stats={data.clockOutStats} />
      </div>

      <div>
        <h2 className="mb-4 text-lg font-semibold tracking-tight text-foreground">
          Recent sessions
        </h2>
        <SessionTable sessions={recentSessions} showUserColumn />
      </div>
    </div>
  );
}
