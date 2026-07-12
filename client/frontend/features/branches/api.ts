import { backendFetch } from "@/lib/api/backend-client";
import type { components } from "@/lib/api/generated/schema";

export type BranchResponse = components["schemas"]["BranchResponse"];
export type BranchDetailedResponse =
  components["schemas"]["BranchDetailedResponse"];
export type BranchRequest = components["schemas"]["BranchRequest"];
export type PageResponseBranchResponse =
  components["schemas"]["PageResponseBranchResponse"];

export interface BranchFilters {
  page?: number;
  displayName?: string;
  branchStatus?: "LOCKED" | "UNLOCKED";
}

// Backend resolves this sentinel UUID to the caller's own branch —
// used by admins, who can't hit the list/all-branches endpoint.
export const OWN_BRANCH_ID = "00000000-0000-0000-0000-000000000000";

function buildQuery<T extends object>(params: T) {
  const q = new URLSearchParams();
  Object.entries(params as Record<string, string | number | undefined>).forEach(
    ([k, v]) => {
      if (v !== undefined && v !== "") q.set(k, String(v));
    },
  );
  const s = q.toString();
  return s ? `?${s}` : "";
}

export async function fetchBranches(
  filters: BranchFilters = {},
): Promise<PageResponseBranchResponse | undefined> {
  const res = await backendFetch(`/api/v1/branches${buildQuery(filters)}`);
  if (!res.ok) return undefined;
  const payload = await res.json();
  return payload.data;
}

export async function fetchBranchById(
  id: string,
): Promise<BranchDetailedResponse | undefined> {
  const res = await backendFetch(`/api/v1/branches/${id}`);
  if (!res.ok) return undefined;
  const payload = await res.json();
  return payload.data;
}

export async function fetchOwnBranch(): Promise<
  BranchDetailedResponse | undefined
> {
  return fetchBranchById(OWN_BRANCH_ID);
}

export async function createBranch(
  body: BranchRequest,
): Promise<{ data?: BranchResponse; error?: string }> {
  const res = await backendFetch(`/api/v1/branches`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const payload = await res.json();
  if (!res.ok) return { error: payload.msg ?? "Failed to create branch" };
  return { data: payload.data };
}

export async function updateBranch(
  id: string,
  body: BranchRequest,
): Promise<{ data?: BranchResponse; error?: string }> {
  const res = await backendFetch(`/api/v1/branches/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const payload = await res.json();
  if (!res.ok) return { error: payload.msg ?? "Failed to update branch" };
  return { data: payload.data };
}

export async function deleteBranch(id: string): Promise<{ error?: string }> {
  const res = await backendFetch(`/api/v1/branches/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) {
    const payload = await res.json().catch(() => ({}));
    return { error: payload.msg ?? "Failed to delete branch" };
  }
  return {};
}