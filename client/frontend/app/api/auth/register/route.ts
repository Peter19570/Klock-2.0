import { NextResponse } from "next/server";
import { SERVER_API_BASE_URL, REFRESH_COOKIE_NAME } from "@/lib/api/api-config";
import type { components } from "@/lib/api/generated/schema";

type ApiResponseOrganizationResponse = components["schemas"]["ApiResponseOrganizationResponse"];

export async function POST(request: Request) {
  const body = await request.json();

  const backendRes = await fetch(`${SERVER_API_BASE_URL}/api/v1/organization`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const payload: ApiResponseOrganizationResponse = await backendRes.json();
  const authResponse = payload.data?.authResponse;

  if (!backendRes.ok || !authResponse?.token?.refresh) {
    return NextResponse.json({ msg: payload.msg ?? "Registration failed" }, { status: backendRes.status || 400 });
  }

  const res = NextResponse.json({
    accessToken: authResponse.token.access,
    user: authResponse.userInfo,
    organization: payload.data?.organizationInfo,
  });

  res.cookies.set(REFRESH_COOKIE_NAME, authResponse.token.refresh, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });

  return res;
}