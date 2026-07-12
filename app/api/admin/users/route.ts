import { NextRequest, NextResponse } from "next/server"
import { requireSuperAdmin } from "@/lib/auth"
import { adminAuth } from "@/lib/firebase-admin"
import type { UserRole } from "@/types"

export async function POST(req: NextRequest) {
  try { await requireSuperAdmin() } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
  }

  let body: { email?: string; password?: string; role?: UserRole }
  try { body = await req.json() } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 })
  }

  const { email, password, role } = body
  if (!email || !password || !role) {
    return NextResponse.json({ error: "email, password, and role are required" }, { status: 422 })
  }
  if (password.length < 8) {
    return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 422 })
  }
  if (!["super_admin", "contributor", "viewer"].includes(role)) {
    return NextResponse.json({ error: "Invalid role" }, { status: 422 })
  }

  try {
    const userRecord = await adminAuth.createUser({ email, password })
    await adminAuth.setCustomUserClaims(userRecord.uid, { role })
    return NextResponse.json({ uid: userRecord.uid }, { status: 201 })
  } catch (err) {
    const firebaseErr = err as { code?: string; message?: string }
    if (firebaseErr.code === "auth/email-already-exists") {
      return NextResponse.json({ error: "An account with this email already exists" }, { status: 409 })
    }
    console.error("Create user error:", err)
    return NextResponse.json({ error: "Failed to create account" }, { status: 500 })
  }
}
