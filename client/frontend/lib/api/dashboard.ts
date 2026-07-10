import { backendFetch } from "@/lib/api/backend-client";
import type { components } from "@/lib/api/generated/schema";

type ApiResponseDashboardSuperAdminResponse =
  components["schemas"]["ApiResponseDashboardSuperAdminResponse"];
type ApiResponseDashboardAdminResponse =
  components["schemas"]["ApiResponseDashboardAdminResponse"];

export async function fetchSuperAdminDashboard() {
  const res = await backendFetch("/api/v1/dashboard/super");
  const payload: ApiResponseDashboardSuperAdminResponse = await res.json();
  return payload.data;
}

export async function fetchAdminDashboard() {
  const res = await backendFetch("/api/v1/dashboard/admin");
  const payload: ApiResponseDashboardAdminResponse = await res.json();
  return payload.data;
}