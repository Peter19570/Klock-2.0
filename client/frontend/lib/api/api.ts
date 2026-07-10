"use client";

import { backendFetch } from "@/lib/api/backend-client";
import { parseApiResponse } from "@/lib/api/api-error";
import type { components } from "@/lib/api/generated/schema";

type UserChangePassword = components["schemas"]["UserChangePassword"];

export async function changePassword(payload: UserChangePassword): Promise<void> {
  const res = await backendFetch("/api/v1/users/me/change-password", {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
  await parseApiResponse<void>(res);
}

export async function updateDeviceId(payload: { deviceId: string }): Promise<void> {
  const res = await backendFetch("/api/v1/users/me/device-id", {
    method: "PUT",
    body: JSON.stringify(payload),
  });
  await parseApiResponse<void>(res);
}

// Fire-and-forget: sync device id if the backend hasn't recorded one yet.
// Never throws — this should never block or break the auth flow.
export async function syncDeviceIdIfNeeded(hasSetDevice: boolean | undefined) {
  if (hasSetDevice) return;
  try {
    const { getOrCreateDeviceId } = await import("@/lib/device-id");
    const deviceId = getOrCreateDeviceId();
    if (!deviceId) return;
    await updateDeviceId({ deviceId });
  } catch {
    // silent by design — don't surface this to the user or block login
  }
}