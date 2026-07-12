import type { AuditAction } from "@/features/audits/api";

export const AUDIT_ACTION_STYLES: Record<AuditAction, string> = {
  REGISTER: "bg-emerald-500/10 border-emerald-500/30 text-emerald-500",
  LOGIN: "bg-blue-500/10 border-blue-500/30 text-blue-500",
  OAUTH_LOGIN: "bg-sky-500/10 border-sky-500/30 text-sky-500",
  LOGIN_FAILURE: "bg-red-500/10 border-red-500/30 text-red-500",
  LOGIN_ATTEMPT: "bg-amber-500/10 border-amber-500/30 text-amber-500",
  LOGOUT: "bg-slate-500/10 border-slate-500/30 text-slate-500",

  PASSWORD_REQUEST: "bg-orange-500/10 border-orange-500/30 text-orange-500",
  PASSWORD_RESET: "bg-yellow-500/10 border-yellow-500/30 text-yellow-600",
  EMAIL_VERIFIED: "bg-teal-500/10 border-teal-500/30 text-teal-500",
  EMAIL_CHANGE_REQUEST: "bg-cyan-500/10 border-cyan-500/30 text-cyan-500",
  EMAIL_CHANGE_CONFIRM: "bg-indigo-500/10 border-indigo-500/30 text-indigo-500",

  ACCOUNT_SOFT_DELETED: "bg-rose-500/10 border-rose-500/30 text-rose-500",
  ACCOUNT_HARD_DELETED: "bg-red-700/10 border-red-700/30 text-red-700",

  SOCIAL_LINK: "bg-violet-500/10 border-violet-500/30 text-violet-500",
  SOCIAL_UNLINK: "bg-fuchsia-500/10 border-fuchsia-500/30 text-fuchsia-500",

  CLOCK_IN_SUCCESS: "bg-emerald-600/10 border-emerald-600/30 text-emerald-600",
  CLOCK_OUT_SUCCESS: "bg-primary/10 border-primary/30 text-primary",
  ADMIN_FORCE_CLOCK_OUT: "bg-amber-600/10 border-amber-600/30 text-amber-600",
  SERVER_CLOCK_OUT: "bg-zinc-500/10 border-zinc-500/30 text-zinc-500",
  SUSPICIOUS_CLOCK_OUT: "bg-destructive/10 border-destructive/30 text-destructive",
  DIFFERENT_DEVICE_DETECT: "bg-orange-600/10 border-orange-600/30 text-orange-600",
  AMBIGUOUS_CLOCK_EVENT: "bg-yellow-600/10 border-yellow-600/30 text-yellow-700",

  USER_CREATED: "bg-green-500/10 border-green-500/30 text-green-500",
  USER_UPDATED: "bg-blue-600/10 border-blue-600/30 text-blue-600",
  DEVICE_ID_RESET: "bg-purple-500/10 border-purple-500/30 text-purple-500",

  BRANCH_INFO_UPDATED: "bg-indigo-600/10 border-indigo-600/30 text-indigo-600",
  BRANCH_CREATED: "bg-lime-500/10 border-lime-600/30 text-lime-600",
  BRANCH_DELETED: "bg-rose-700/10 border-rose-700/30 text-rose-700",
};

export function formatAuditAction(action: string) {
  return action
    .split("_")
    .map((w) => w[0] + w.slice(1).toLowerCase())
    .join(" ");
}