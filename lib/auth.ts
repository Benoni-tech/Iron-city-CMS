import { cookies } from "next/headers"
import { redirect } from "next/navigation"
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
    const tenantId = (decoded["tenantId"] as string | undefined) ?? null
    return { uid: decoded.uid, email: decoded.email ?? "", role, tenantId }
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

export async function requirePlatformAdmin(): Promise<SessionUser> {
  const user = await getSessionUser()
  if (!user || user.role !== "platform_admin") throw new Error("Forbidden")
  return user
}

// Every tenant-scoped route calls this instead of requireAuth/requireContributor/
// requireSuperAdmin directly, so a tenant user without a tenantId claim (which
// should never happen, but would otherwise silently query the wrong data) is
// rejected instead of falling through.
export async function requireTenantUser(): Promise<
  SessionUser & { tenantId: string }
> {
  const user = await requireAuth()
  if (!user.tenantId) throw new Error("Forbidden")
  return { ...user, tenantId: user.tenantId }
}

export async function requireTenantContributor(): Promise<
  SessionUser & { tenantId: string }
> {
  const user = await requireContributor()
  if (!user.tenantId) throw new Error("Forbidden")
  return { ...user, tenantId: user.tenantId }
}

export async function requireTenantSuperAdmin(): Promise<
  SessionUser & { tenantId: string }
> {
  const user = await requireSuperAdmin()
  if (!user.tenantId) throw new Error("Forbidden")
  return { ...user, tenantId: user.tenantId }
}

// For tenant-scoped Server Components (pages under /admin that render one
// church's data). Unlike the require* helpers above, this redirects instead
// of throwing — /login if there's no session, /admin if a platform admin
// (who has no tenantId) navigates to a church-scoped page directly.
export async function getTenantSession(): Promise<SessionUser & { tenantId: string }> {
  const user = await getSessionUser()
  if (!user) redirect("/login")
  if (!user.tenantId) redirect("/admin")
  return { ...user, tenantId: user.tenantId }
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
