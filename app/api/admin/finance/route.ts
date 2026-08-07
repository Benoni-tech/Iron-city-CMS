import { NextRequest, NextResponse } from "next/server"
import { requireTenantSuperAdmin } from "@/lib/auth"
import { createFinancialRecord, getFinancialRecords } from "@/lib/firestore"
import { financialRecordSchema } from "@/lib/finance-schema"

const schema = financialRecordSchema
  .superRefine((data, ctx) => {
    if (data.type === "expenditure") {
      if (!data.recipient) {
        ctx.addIssue({ code: "custom", path: ["recipient"], message: "Recipient is required" })
      }
      if (!data.disbursedBy) {
        ctx.addIssue({ code: "custom", path: ["disbursedBy"], message: "Disbursed by is required" })
      }
    }
  })

export async function GET() {
  let user
  try { user = await requireTenantSuperAdmin() } catch { return NextResponse.json({ error: "Unauthorized" }, { status: 403 }) }
  const records = await getFinancialRecords(user.tenantId)
  return NextResponse.json({ records })
}

export async function POST(req: NextRequest) {
  let user
  try { user = await requireTenantSuperAdmin() } catch { return NextResponse.json({ error: "Unauthorized" }, { status: 403 }) }

  let body: unknown
  try { body = await req.json() } catch { return NextResponse.json({ error: "Invalid request" }, { status: 400 }) }

  const result = schema.safeParse(body)
  if (!result.success) {
    return NextResponse.json({ error: "Validation failed", issues: result.error.flatten().fieldErrors }, { status: 422 })
  }

  const id = await createFinancialRecord(user.tenantId, {
    ...result.data,
    recordedBy: user.uid,
    approved: false,
  })

  return NextResponse.json({ id }, { status: 201 })
}
