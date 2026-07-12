import { backendFetch } from "@/lib/api/backend-client";
import type { components } from "@/lib/api/generated/schema";

export type AuditResponse = components["schemas"]["AuditResponse"];
export type PageResponseAuditResponse =
  components["schemas"]["PageResponseAuditResponse"];
export type AuditAction = NonNullable<AuditResponse["action"]>;

export const AUDIT_ACTIONS: readonly AuditAction[] = [
  "REGISTER",
  "LOGIN",
  "OAUTH_LOGIN",
  "LOGIN_FAILURE",
  "LOGIN_ATTEMPT",
  "LOGOUT",
  "PASSWORD_REQUEST",
  "PASSWORD_RESET",
  "EMAIL_VERIFIED",
  "EMAIL_CHANGE_REQUEST",
  "EMAIL_CHANGE_CONFIRM",
  "ACCOUNT_SOFT_DELETED",
  "ACCOUNT_HARD_DELETED",
  "SOCIAL_LINK",
  "SOCIAL_UNLINK",
  "CLOCK_IN_SUCCESS",
  "CLOCK_OUT_SUCCESS",
  "ADMIN_FORCE_CLOCK_OUT",
  "SERVER_CLOCK_OUT",
  "SUSPICIOUS_CLOCK_OUT",
  "DIFFERENT_DEVICE_DETECT",
  "AMBIGUOUS_CLOCK_EVENT",
  "USER_CREATED",
  "USER_UPDATED",
  "DEVICE_ID_RESET",
  "BRANCH_INFO_UPDATED",
  "BRANCH_CREATED",
  "BRANCH_DELETED",
] as const;

export interface AuditFilters {
  page?: number;
  fullName?: string;
  auditAction?: AuditAction;
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

export async function fetchAudits(
  filters: AuditFilters = {},
): Promise<PageResponseAuditResponse | undefined> {
  const res = await backendFetch(`/api/v1/audits${buildQuery(filters)}`);
  if (!res.ok) return undefined;
  const payload = await res.json();
  return payload.data;
}