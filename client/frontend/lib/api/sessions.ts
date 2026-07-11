import { backendFetch } from "@/lib/api/backend-client";
import type { components } from "@/lib/api/generated/schema";

type ApiResponsePageResponseSessionResponse =
  components["schemas"]["ApiResponsePageResponseSessionResponse"];

export interface SessionFilters {
  page?: number;
  arrivalStatus?: "EARLY" | "ON_TIME" | "LATE";
  status?: "ACTIVE" | "COMPLETED";
  minWorkDate?: string;
  maxWorkDate?: string;
  sessionUser?: string;
  userId?: string;
}

export async function fetchSessions(filters: SessionFilters = {}) {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== "") params.set(key, String(value));
  });

  const res = await backendFetch(`/api/v1/sessions?${params.toString()}`);
  const payload: ApiResponsePageResponseSessionResponse = await res.json();
  return payload.data;
}

export async function deleteSession(id: string): Promise<{ error?: string }> {
  const res = await backendFetch(`/api/v1/sessions/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) {
    const payload = await res.json().catch(() => ({}));
    return { error: payload.msg ?? "Failed to delete session" };
  }
  return {};
}

export async function terminateSession(
  id: string,
): Promise<{ error?: string }> {
  const res = await backendFetch(`/api/v1/sessions/${id}/terminate`, {
    method: "PATCH",
  });
  if (!res.ok) {
    const payload = await res.json().catch(() => ({}));
    return { error: payload.msg ?? "Failed to terminate session" };
  }
  return {};
}

export async function exportSessions(
  start?: string,
  end?: string,
): Promise<{ error?: string }> {
  const params = new URLSearchParams();
  if (start) params.set("start", start);
  if (end) params.set("end", end);

  const res = await backendFetch(`/api/v1/sessions/export?${params.toString()}`);
  if (!res.ok) {
    const payload = await res.json().catch(() => ({}));
    return { error: payload.msg ?? "Failed to export sessions" };
  }

  const blob = await res.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `sessions-export${start ? `-${start}` : ""}${end ? `_to_${end}` : ""}.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
  return {};
}