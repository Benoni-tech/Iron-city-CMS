import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { requireTenantSuperAdmin } from "@/lib/auth"
import { generateMonthlyPeriod } from "@/lib/finance-reports"
import { revalidatePath } from "next/cache"

const schema = z.object({
  year: z.number().int().min(2020).max(2100),
  month: z.number().int().min(1).max(12),
})

export async function POST(req: NextRequest) {
  let user
  try { user = await requireTenantSuperAdmin() } catch { return NextResponse.json({ error: "Unauthorized" }, { status: 403 }) }

  let body: unknown
  try { body = await req.json() } catch { return NextResponse.json({ error: "Invalid request" }, { status: 400 }) }

  const result = schema.safeParse(body)
  if (!result.success) {
    return NextResponse.json({ error: "Validation failed" }, { status: 422 })
  }

  try {
    const period = await generateMonthlyPeriod(user.tenantId, result.data.year, result.data.month, user.uid)
    revalidatePath("/admin/finance")
    revalidatePath("/admin/finance/reports")
    return NextResponse.json({ period })
  } catch (err) {
    console.error("Close month error:", err)
    return NextResponse.json({ error: "Failed to close month" }, { status: 500 })
  }
}
