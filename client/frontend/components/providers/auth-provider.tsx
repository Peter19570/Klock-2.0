"use client";

import { useEffect, useRef } from "react";
import { useAuthStore } from "@/store/auth-store";
import { backendFetch, refreshAccessToken } from "@/lib/api/backend-client";
import { syncDeviceIdIfNeeded } from "@/lib/api/api";
import type { components } from "@/lib/api/generated/schema";

type ApiResponseUserDetailedResponse =
  components["schemas"]["ApiResponseUserDetailedResponse"];

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const setStatus = useAuthStore((s) => s.setStatus);
  const setAuth = useAuthStore((s) => s.setAuth);
  const bootstrappedRef = useRef(false);

  useEffect(() => {
    if (bootstrappedRef.current) return;
    bootstrappedRef.current = true;

    async function bootstrap() {
      setStatus("loading");

      const accessToken = await refreshAccessToken();
      if (!accessToken) {
        setStatus("unauthenticated");
        return;
      }

      const meRes = await backendFetch("/api/v1/users/me");
      if (!meRes.ok) {
        setStatus("unauthenticated");
        return;
      }

      const payload: ApiResponseUserDetailedResponse = await meRes.json();
      if (payload.data) {
        setAuth(accessToken, payload.data);
        void syncDeviceIdIfNeeded(payload.data.hasSetDevice);
      }
    }

    bootstrap();
  }, [setStatus, setAuth]);

  return <>{children}</>;
}
