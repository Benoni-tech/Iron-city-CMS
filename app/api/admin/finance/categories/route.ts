import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { requireTenantSuperAdmin } from "@/lib/auth"
import { getFinanceCategories, createFinanceCategory } from "@/lib/firestore"
import { generateSlug } from "@/lib/slug"

const schema = z.object({
  name: z.string().trim().min(2),
  type: z.enum(["income", "expenditure"]),
})

export async function GET(req: NextRequest) {
  let user
  try { user = await requireTenantSuperAdmin() } catch { return NextResponse.json({ error: "Unauthorized" }, { status: 403 }) }

  const { searchParams } = new URL(req.url)
  const type = searchParams.get("type")
  const activeOnly = searchParams.get("activeOnly") !== "false"

  const categories = await getFinanceCategories(
    user.tenantId,
    type === "income" || type === "expenditure" ? type : undefined,
    activeOnly
  )
  return NextResponse.json({ categories })
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

  const existing = await getFinanceCategories(user.tenantId, result.data.type, false)
  const id = generateSlug(result.data.name)
  if (existing.some((c) => c.id === id)) {
    return NextResponse.json({ error: "A category with that name already exists" }, { status: 409 })
  }

  const categoryId = await createFinanceCategory(user.tenantId, {
    name: result.data.name,
    type: result.data.type,
    createdBy: user.uid,
  })

  return NextResponse.json({ id: categoryId }, { status: 201 })
}
