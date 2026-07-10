"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuthStore } from "@/store/auth-store";
import { fetchSuperAdminDashboard, fetchAdminDashboard } from "@/lib/api/dashboard";
import type { components } from "@/lib/api/generated/schema";

type DashboardData = components["schemas"]["DashboardSuperAdminResponse"] &
  components["schemas"]["DashboardAdminResponse"];

export function useDashboardData() {
  const role = useAuthStore((s) => s.user?.userRole);
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    if (!role) return;
    setLoading(true);
    const fetcher =
      role === "SUPER_ADMIN" ? fetchSuperAdminDashboard : fetchAdminDashboard;
    fetcher()
      .then((d) => setData((d as DashboardData) ?? null))
      .finally(() => setLoading(false));
  }, [role]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  return { role, data, loading, refetch: load };
}