import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { clearSessionCookieOptions } from "@/lib/auth"

export async function POST() {
  const cookieStore = await cookies()
  cookieStore.set(clearSessionCookieOptions())
  return NextResponse.redirect(new URL("/login", process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"))
}
