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

export async function logout(): Promise<void> {
  await fetch("/api/auth/logout", { method: "POST" }).catch(() => {});
}

export async function requestEmailChange(newEmail: string): Promise<{ error?: string }> {
  const res = await backendFetch("/api/v1/auth/change-email", {
    method: "POST",
    body: JSON.stringify({ newEmail }),
  });
  if (!res.ok) {
    const payload = await res.json().catch(() => ({}));
    return { error: payload.msg ?? "Failed to request email change" };
  }
  return {};
}

export async function confirmEmailChange(token: string): Promise<{ error?: string }> {
  const res = await backendFetch(`/api/v1/auth/confirm-email?token=${encodeURIComponent(token)}`);
  if (!res.ok) {
    const payload = await res.json().catch(() => ({}));
    return { error: payload.msg ?? "Failed to confirm email change" };
  }
  return {};
}