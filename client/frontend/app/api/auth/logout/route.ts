import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { SERVER_API_BASE_URL, REFRESH_COOKIE_NAME } from "@/lib/api/config";

export async function POST() {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get(REFRESH_COOKIE_NAME)?.value;

  if (refreshToken) {
    await fetch(`${SERVER_API_BASE_URL}/api/v1/auth/logout`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    }).catch(() => {});
  }

  const res = NextResponse.json({ msg: "Logged out" });
  res.cookies.delete(REFRESH_COOKIE_NAME);
  return res;
}