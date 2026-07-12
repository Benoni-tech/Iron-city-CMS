import { cookies } from "next/headers"
import { adminAuth } from "./firebase-admin"
import type { SessionUser, UserRole } from "@/types"

const SESSION_COOKIE = "icc_session"
const SESSION_EXPIRY_MS = 60 * 60 * 24 * 7 * 1000

export async function createSessionCookie(idToken: string): Promise<string> {
  return adminAuth.createSessionCookie(idToken, { expiresIn: SESSION_EXPIRY_MS })
}

export async function getSessionUser(): Promise<SessionUser | null> {
  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get(SESSION_COOKIE)?.value
  if (!sessionCookie) return null

  try {
    const decoded = await adminAuth.verifySessionCookie(sessionCookie, true)
    const role = (decoded["role"] as UserRole) ?? "viewer"
    return { uid: decoded.uid, email: decoded.email ?? "", role }
  } catch {
    return null
  }
}

export async function requireAuth(): Promise<SessionUser> {
  const user = await getSessionUser()
  if (!user) throw new Error("Unauthorized")
  return user
}

export async function requireContributor(): Promise<SessionUser> {
  const user = await getSessionUser()
  if (!user || user.role === "viewer") throw new Error("Forbidden")
  return user
}

export async function requireSuperAdmin(): Promise<SessionUser> {
  const user = await getSessionUser()
  if (!user || user.role !== "super_admin") throw new Error("Forbidden")
  return user
}

export function sessionCookieOptions(value: string) {
  return {
    name: SESSION_COOKIE,
    value,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict" as const,
    maxAge: SESSION_EXPIRY_MS / 1000,
    path: "/",
  }
}

export function clearSessionCookieOptions() {
  return {
    name: SESSION_COOKIE,
    value: "",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict" as const,
    maxAge: 0,
    path: "/",
  }
}
