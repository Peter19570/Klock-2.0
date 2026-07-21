"use client";

import { API_BASE_URL } from "@/lib/api/api-config";
import { useAuthStore } from "@/store/auth-store";

let refreshPromise: Promise<string | null> | null = null;

export async function refreshAccessToken(): Promise<string | null> {
  if (refreshPromise) return refreshPromise; // dedupe concurrent callers

  refreshPromise = (async () => {
    try {
      const res = await fetch("/api/auth/refresh", { method: "POST" });
      if (!res.ok) return null;
      const { accessToken } = await res.json();
      useAuthStore.getState().setAccessToken(accessToken);
      return accessToken;
    } finally {
      refreshPromise = null; // release once settled, success or fail
    }
  })();

  return refreshPromise;
}

export async function backendFetch(path: string, init: RequestInit = {}, isRetry = false): Promise<Response> {
  const accessToken = useAuthStore.getState().accessToken;

  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    credentials: "include",
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