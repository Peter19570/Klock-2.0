"use client";

import { API_BASE_URL } from "@/lib/api/config";
import { useAuthStore } from "@/store/auth-store";

async function refreshAccessToken(): Promise<string | null> {
  const res = await fetch("/api/auth/refresh", { method: "POST" });
  if (!res.ok) return null;
  const { accessToken } = await res.json();
  useAuthStore.getState().setAccessToken(accessToken);
  return accessToken;
}

export async function backendFetch(path: string, init: RequestInit = {}, isRetry = false): Promise<Response> {
  const accessToken = useAuthStore.getState().accessToken;

  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      ...init.headers,
    },
  });

  if (res.status === 401 && !isRetry) {
    const newToken = await refreshAccessToken();
    if (newToken) return backendFetch(path, init, true);
    useAuthStore.getState().clearAuth();
  }

  return res;
}