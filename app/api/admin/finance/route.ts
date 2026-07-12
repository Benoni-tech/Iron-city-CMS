import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { requireSuperAdmin } from "@/lib/auth"
import { createFinancialRecord, getFinancialRecords } from "@/lib/firestore"

const schema = z.object({
  type: z.enum(["income", "expenditure"]),
  category: z.string().min(1),
  amount: z.number().positive(),
  description: z.string().default(""),
  date: z.string().min(1),
  serviceSessionId: z.string().optional(),
})

export async function GET() {
  try { await requireSuperAdmin() } catch { return NextResponse.json({ error: "Unauthorized" }, { status: 403 }) }
  const records = await getFinancialRecords()
  return NextResponse.json({ records })
}

export async function POST(req: NextRequest) {
  let user
  try { user = await requireSuperAdmin() } catch { return NextResponse.json({ error: "Unauthorized" }, { status: 403 }) }

  let body: unknown
  try { body = await req.json() } catch { return NextResponse.json({ error: "Invalid request" }, { status: 400 }) }

  const result = schema.safeParse(body)
  if (!result.success) {
    return NextResponse.json({ error: "Validation failed", issues: result.error.flatten().fieldErrors }, { status: 422 })
  }

  const id = await createFinancialRecord({
    ...result.data,
    recordedBy: user.uid,
    approved: false,
  })

  return NextResponse.json({ id }, { status: 201 })
}
