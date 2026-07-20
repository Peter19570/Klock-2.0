// import { REFRESH_COOKIE_NAME } from "@/lib/constants";

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "/backend-api";
export const SERVER_API_BASE_URL = process.env.BACKEND_INTERNAL_URL ?? "http://localhost:8080";
// REMOVE: export const REFRESH_COOKIE_NAME = "klock_rt"; (now imported from constants)