import { backendFetch } from "@/lib/api/backend-client";
import type { components } from "@/lib/api/generated/schema";

type ApiResponsePageResponseSessionResponse = components["schemas"]["ApiResponsePageResponseSessionResponse"];

export interface SessionFilters {
  page?: number;
  arrivalStatus?: "EARLY" | "ON_TIME" | "LATE";
  status?: "ACTIVE" | "COMPLETED";
  minWorkDate?: string;
  maxWorkDate?: string;
  sessionUser?: string;
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