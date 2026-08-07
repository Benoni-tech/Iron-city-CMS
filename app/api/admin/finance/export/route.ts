import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { requireTenantSuperAdmin } from "@/lib/auth"
import { getFinancialRecordsByDateRange, getFinanceCategories } from "@/lib/firestore"
import { getTenantById } from "@/lib/platform"
import { buildFinanceWorkbook, resolveThisWeekRange, financeExportFilename } from "@/lib/finance-export"

const schema = z
  .object({
    preset: z.enum(["this_week"]).optional(),
    startDate: z.string().min(1).optional(),
    endDate: z.string().min(1).optional(),
  })
  .refine((v) => v.preset || (v.startDate && v.endDate), {
    message: "Provide either a preset or both startDate and endDate",
  })

export async function GET(req: NextRequest) {
  let user
  try { user = await requireTenantSuperAdmin() } catch { return NextResponse.json({ error: "Unauthorized" }, { status: 403 }) }

  const { searchParams } = new URL(req.url)
  const result = schema.safeParse({
    preset: searchParams.get("preset") ?? undefined,
    startDate: searchParams.get("startDate") ?? undefined,
    endDate: searchParams.get("endDate") ?? undefined,
  })
  if (!result.success) {
    return NextResponse.json({ error: "Validation failed", issues: result.error.flatten().fieldErrors }, { status: 422 })
  }

  const range = result.data.preset === "this_week"
    ? resolveThisWeekRange()
    : { startDate: result.data.startDate!, endDate: result.data.endDate! }

  if (range.startDate > range.endDate) {
    return NextResponse.json({ error: "Start date must be before end date" }, { status: 422 })
  }

  const [records, categories, tenant] = await Promise.all([
    getFinancialRecordsByDateRange(user.tenantId, range.startDate, range.endDate),
    getFinanceCategories(user.tenantId, undefined, false),
    getTenantById(user.tenantId),
  ])

  const buffer = await buildFinanceWorkbook(records, categories, {
    churchName: tenant?.churchName ?? "",
    churchAddress: "",
    range,
    generatedByEmail: user.email,
  })

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${financeExportFilename(range)}"`,
    },
  })
}
