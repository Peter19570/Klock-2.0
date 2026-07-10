import { create } from "zustand";
import type { components } from "@/lib/api/generated/schema";

type UserDetailedResponse = components["schemas"]["UserDetailedResponse"];
type AuthStatus = "idle" | "loading" | "authenticated" | "unauthenticated";

interface AuthState {
  accessToken: string | null;
  user: UserDetailedResponse | null;
  status: AuthStatus;
  setAuth: (accessToken: string, user: UserDetailedResponse) => void;
  setAccessToken: (accessToken: string) => void;
  clearAuth: () => void;
  setStatus: (status: AuthStatus) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  user: null,
  status: "idle",
  setAuth: (accessToken, user) => set({ accessToken, user, status: "authenticated" }),
  setAccessToken: (accessToken) => set({ accessToken }),
  clearAuth: () => set({ accessToken: null, user: null, status: "unauthenticated" }),
  setStatus: (status) => set({ status }),
}));