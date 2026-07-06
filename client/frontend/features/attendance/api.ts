"use client";

import { backendFetch } from "@/lib/api/backend-client";
import { parseApiResponse } from "@/lib/api/api-error";
import type { components } from "@/lib/api/generated/schema";

type ClockInRequest = components["schemas"]["ClockInRequest"];
type ClockOutRequest = components["schemas"]["ClockOutRequest"];
type ClockEventResponse = components["schemas"]["ClockEventResponse"];
type BranchUserResponse = components["schemas"]["BranchUserResponse"];

export async function isClockedIn(): Promise<boolean> {
  const res = await backendFetch("/api/v1/attendance/active", { method: "GET" });
  const active = await parseApiResponse<boolean>(res);
  return active ?? false;
}

export async function clockIn(payload: ClockInRequest): Promise<ClockEventResponse> {
  const res = await backendFetch("/api/v1/attendance", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return parseApiResponse<ClockEventResponse>(res);
}

export async function clockOut(payload: ClockOutRequest): Promise<ClockEventResponse> {
  const res = await backendFetch("/api/v1/attendance/active", {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
  return parseApiResponse<ClockEventResponse>(res);
}

export async function getActiveBranch(): Promise<BranchUserResponse> {
  const res = await backendFetch("/api/v1/branches/active", { method: "GET" });
  return parseApiResponse<BranchUserResponse>(res);
}

type UserDeviceIdRequest = components["schemas"]["UserDeviceIdRequest"];

export async function registerDeviceId(payload: UserDeviceIdRequest): Promise<void> {
  const res = await backendFetch("/api/v1/users/me/device-id", {
    method: "PUT",
    body: JSON.stringify(payload),
  });
  await parseApiResponse<void>(res);
}