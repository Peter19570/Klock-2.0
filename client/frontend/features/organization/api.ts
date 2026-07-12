import { backendFetch } from "@/lib/api/backend-client";
import type { components } from "@/lib/api/generated/schema";

export type OrganizationDetailedResponse =
  components["schemas"]["OrganizationDetailedResponse"];
export type OrganizationUpdateRequest =
  components["schemas"]["OrganizationUpdateRequest"];

export async function fetchOrganization(): Promise<
  OrganizationDetailedResponse | undefined
> {
  const res = await backendFetch(`/api/v1/organization`);
  if (!res.ok) return undefined;
  const payload = await res.json();
  return payload.data;
}

export async function updateOrganization(
  body: OrganizationUpdateRequest,
): Promise<{ data?: OrganizationDetailedResponse; error?: string }> {
  const res = await backendFetch(`/api/v1/organization`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const payload = await res.json();
  if (!res.ok)
    return { error: payload.msg ?? "Failed to update organization" };
  return { data: payload.data };
}

export async function deleteOrganization(): Promise<{ error?: string }> {
  const res = await backendFetch(`/api/v1/organization`, {
    method: "DELETE",
  });
  if (!res.ok) {
    const payload = await res.json().catch(() => ({}));
    return { error: payload.msg ?? "Failed to delete organization" };
  }
  return {};
}