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