"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/store/auth-store";
import { backendFetch } from "@/lib/api/backend-client";
import type { components } from "@/lib/api/generated/schema";

type ApiResponseUserDetailedResponse = components["schemas"]["ApiResponseUserDetailedResponse"];

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const setStatus = useAuthStore((s) => s.setStatus);
  const setAuth = useAuthStore((s) => s.setAuth);

  useEffect(() => {
    async function bootstrap() {
      setStatus("loading");

      const refreshRes = await fetch("/api/auth/refresh", { method: "POST" });
      if (!refreshRes.ok) {
        setStatus("unauthenticated");
        return;
      }

      const { accessToken } = await refreshRes.json();
      useAuthStore.getState().setAccessToken(accessToken);

      const meRes = await backendFetch("/api/v1/users/me");
      if (!meRes.ok) {
        setStatus("unauthenticated");
        return;
      }

      const payload: ApiResponseUserDetailedResponse = await meRes.json();
      if (payload.data) setAuth(accessToken, payload.data);
    }

    bootstrap();
  }, [setStatus, setAuth]);

  return <>{children}</>;
}