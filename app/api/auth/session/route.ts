import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { createSessionCookie, sessionCookieOptions } from "@/lib/auth"

export async function POST(req: NextRequest) {
  let idToken: string
  try {
    const body = await req.json()
    idToken = body.idToken
    if (!idToken) throw new Error()
  } catch {
    return NextResponse.json({ error: "Missing idToken" }, { status: 400 })
  }

  try {
    const sessionCookie = await createSessionCookie(idToken)
    const cookieStore = await cookies()
    cookieStore.set(sessionCookieOptions(sessionCookie))
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: "Failed to create session" }, { status: 401 })
  }
}
