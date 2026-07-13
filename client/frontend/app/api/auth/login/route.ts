import { NextResponse } from "next/server";
import { SERVER_API_BASE_URL, REFRESH_COOKIE_NAME } from "@/lib/api/config";
import type { components } from "@/lib/api/generated/schema";

type ApiResponseAuthResponse = components["schemas"]["ApiResponseAuthResponse"];

export async function POST(request: Request) {
  const credentials = await request.json();

  const backendRes = await fetch(`${SERVER_API_BASE_URL}/api/v1/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(credentials),
  });

  const payload: ApiResponseAuthResponse = await backendRes.json();

  if (!backendRes.ok || !payload.data?.token?.refresh) {
    return NextResponse.json({ msg: payload.msg ?? "Login failed" }, { status: backendRes.status || 401 });
  }

  const { token, userInfo } = payload.data;
  const res = NextResponse.json({ accessToken: token.access, user: userInfo });

  res.cookies.set(REFRESH_COOKIE_NAME, token.refresh!, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });

  return res;
}