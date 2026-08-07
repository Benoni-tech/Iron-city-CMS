import { NextRequest, NextResponse } from "next/server"
import { requirePlatformAdmin } from "@/lib/auth"
import { adminAuth } from "@/lib/firebase-admin"
import { createTenant, getTenants } from "@/lib/platform"
import { sendTenantInviteEmail } from "@/lib/resend"
import { createTenantSchema } from "@/lib/schemas/tenant"

function generateTempPassword(): string {
  return Math.random().toString(36).slice(-10) + "A1!"
}

export async function GET() {
  try { await requirePlatformAdmin() } catch { return NextResponse.json({ error: "Unauthorized" }, { status: 403 }) }
  const tenants = await getTenants()
  return NextResponse.json({ tenants })
}

export async function POST(req: NextRequest) {
  let admin
  try { admin = await requirePlatformAdmin() } catch { return NextResponse.json({ error: "Unauthorized" }, { status: 403 }) }

  let body: unknown
  try { body = await req.json() } catch { return NextResponse.json({ error: "Invalid request" }, { status: 400 }) }

  const result = createTenantSchema.safeParse(body)
  if (!result.success) {
    return NextResponse.json({ error: "Validation failed", issues: result.error.flatten().fieldErrors }, { status: 422 })
  }

  const { churchName, region, contactEmail, contactPhone, publishedInDirectory, adminEmail } = result.data

  const tenantId = await createTenant({
    churchName,
    region,
    contactEmail,
    contactPhone,
    status: "active",
    publishedInDirectory,
    createdBy: admin.uid,
  })

  const tempPassword = generateTempPassword()

  try {
    const userRecord = await adminAuth.createUser({ email: adminEmail, password: tempPassword })
    await adminAuth.setCustomUserClaims(userRecord.uid, { role: "super_admin", tenantId })
  } catch (err) {
    const firebaseErr = err as { code?: string }
    if (firebaseErr.code === "auth/email-already-exists") {
      return NextResponse.json(
        { id: tenantId, warning: "Tenant created, but that email already has an account — assign it manually." },
        { status: 201 }
      )
    }
    console.error("Create tenant admin error:", err)
    return NextResponse.json(
      { id: tenantId, warning: "Tenant created, but the first admin account failed to create." },
      { status: 201 }
    )
  }

  // Best-effort — the account and its password are returned below either way,
  // so a missing/misconfigured Resend key never strands the admin without
  // a way to sign in.
  let emailed = false
  try {
    emailed = await sendTenantInviteEmail({ toEmail: adminEmail, churchName, tempPassword })
  } catch (err) {
    console.error("Tenant invite email failed (account was still created):", err)
  }

  return NextResponse.json({ id: tenantId, adminEmail, tempPassword, emailed }, { status: 201 })
}
