import { parseApiResponse } from "@/lib/api/api-error";
import { backendFetch } from "@/lib/api/backend-client";
import type { components } from "@/lib/api/generated/schema";

export type UserResponse = components["schemas"]["UserResponse"];
export type UserDetailedResponse = components["schemas"]["UserDetailedResponse"];
export type BranchResponse = components["schemas"]["BranchResponse"];
export type PageResponseUserResponse = components["schemas"]["PageResponseUserResponse"];
export type AdminCreateUserRequest = components["schemas"]["AdminCreateUserRequest"];
export type UserUpdateRequest = components["schemas"]["UserUpdateRequest"];

export interface UserFilters {
  page?: number;
  email?: string;
  name?: string;
  userRole?: "USER" | "ADMIN" | "SUPER_ADMIN";
  branchId?: string;
  phone?: string;
  minCreatedAt?: string;
  maxCreatedAt?: string;
}

function buildQuery<T extends object>(params: T) {
  const q = new URLSearchParams();
  Object.entries(params as Record<string, string | number | undefined>).forEach(
    ([k, v]) => {
      if (v !== undefined && v !== "") q.set(k, String(v));
    },
  );
  const s = q.toString();
  return s ? `?${s}` : "";
}

export async function fetchCurrentUser(): Promise<UserDetailedResponse | undefined> {
  const res = await backendFetch(`/api/v1/users/me`);
  if (!res.ok) return undefined;
  const payload = await res.json();
  return payload.data;
}

export async function fetchUsers(
  filters: UserFilters,
): Promise<PageResponseUserResponse | undefined> {
  const res = await backendFetch(`/api/v1/users${buildQuery(filters)}`);
  if (!res.ok) return undefined;
  const payload = await res.json();
  return payload.data;
}

export async function fetchUserById(
  id: string,
): Promise<UserDetailedResponse | undefined> {
  const res = await backendFetch(`/api/v1/users/${id}`);
  if (!res.ok) return undefined;
  const payload = await res.json();
  return payload.data;
}

export async function createUser(
  body: AdminCreateUserRequest,
): Promise<{ data?: UserResponse; error?: string }> {
  const res = await backendFetch(`/api/v1/users`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const payload = await res.json();
  if (!res.ok) return { error: payload.msg ?? "Failed to create user" };
  return { data: payload.data };
}

export async function updateUser(
  id: string,
  body: UserUpdateRequest,
): Promise<{ data?: UserResponse; error?: string }> {
  const res = await backendFetch(`/api/v1/users/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const payload = await res.json();
  if (!res.ok) return { error: payload.msg ?? "Failed to update user" };
  return { data: payload.data };
}

export async function deleteUser(id: string): Promise<{ error?: string }> {
  const res = await backendFetch(`/api/v1/users/${id}`, { method: "DELETE" });
  if (!res.ok) {
    const payload = await res.json().catch(() => ({}));
    return { error: payload.msg ?? "Failed to delete user" };
  }
  return {};
}

export async function resetDeviceId(id: string): Promise<{ error?: string }> {
  const res = await backendFetch(`/api/v1/users/${id}/device-id`, {
    method: "PATCH",
  });
  if (!res.ok) {
    const payload = await res.json().catch(() => ({}));
    return { error: payload.msg ?? "Failed to reset device ID" };
  }
  return {};
}

export async function fetchBranchOptions(
  displayName?: string,
): Promise<BranchResponse[]> {
  const res = await backendFetch(
    `/api/v1/branches${buildQuery({ displayName, page: 0 })}`,
  );
  if (!res.ok) return [];
  const payload = await res.json();
  return payload.data?.content ?? [];
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

export interface AvatarInitializeResponse {
  signature: string;
  timeStamp: number;
  customPublicId: string;
  apiKey: string;
  cloudName: string;
  folder: string;
  uploadPreset: string;
  context: string;
}

export async function initializeAvatarUpload(): Promise<{
  data?: AvatarInitializeResponse;
  error?: string;
}> {
  try {
    const res = await backendFetch("/api/v1/avatar/initialize", {
      method: "POST",
    });
    const data = await parseApiResponse<AvatarInitializeResponse>(res);
    return { data };
  } catch (e) {
    return {
      error: e instanceof Error ? e.message : "Couldn't start avatar upload",
    };
  }
}

export async function deleteAvatar(): Promise<{ error?: string }> {
  try {
    const res = await backendFetch("/api/v1/users/me/avatar", {
      method: "DELETE",
    });
    await parseApiResponse<void>(res);
    return {};
  } catch (e) {
    return {
      error: e instanceof Error ? e.message : "Couldn't delete avatar",
    };
  }
}