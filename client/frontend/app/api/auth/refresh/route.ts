import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { API_BASE_URL, REFRESH_COOKIE_NAME } from "@/lib/api/config";
import type { components } from "@/lib/api/generated/schema";

type ApiResponseTokenResponse = components["schemas"]["ApiResponseTokenResponse"];

export async function POST() {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get(REFRESH_COOKIE_NAME)?.value;

  if (!refreshToken) {
    return NextResponse.json({ msg: "No refresh token" }, { status: 401 });
  }

  const backendRes = await fetch(`${API_BASE_URL}/api/v1/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken }),
  });

  const payload: ApiResponseTokenResponse = await backendRes.json();

  if (!backendRes.ok || !payload.data?.access) {
    const res = NextResponse.json({ msg: "Session expired" }, { status: 401 });
    res.cookies.delete(REFRESH_COOKIE_NAME);
    return res;
  }

  const res = NextResponse.json({ accessToken: payload.data.access });

  if (payload.data.refresh) {
    res.cookies.set(REFRESH_COOKIE_NAME, payload.data.refresh, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });
  }

  return res;
}