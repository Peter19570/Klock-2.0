"use client";

import { backendFetch } from "@/lib/api/backend-client";
import type { components } from "@/lib/api/generated/schema";

type BranchResponse = components["schemas"]["BranchResponse"];
type BranchDetailedResponse = components["schemas"]["BranchDetailedResponse"];
type PageResponseBranchResponse =
  components["schemas"]["PageResponseBranchResponse"];

export async function getMyBranch(): Promise<BranchDetailedResponse | null> {
  const res = await backendFetch("/api/v1/branches/0");
  if (!res.ok) return null;
  const json: { data?: BranchDetailedResponse } = await res.json();
  return json.data ?? null;
}

export async function getAllBranches(): Promise<BranchResponse[]> {
  const res = await backendFetch("/api/v1/branches?page=0");
  if (!res.ok) return [];
  const json: { data?: PageResponseBranchResponse } = await res.json();
  return json.data?.content ?? [];
}