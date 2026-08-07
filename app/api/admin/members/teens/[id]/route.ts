import { NextRequest, NextResponse } from "next/server"
import { requireTenantContributor, requireTenantSuperAdmin } from "@/lib/auth"
import { getTeenById, updateTeen, deleteTeen } from "@/lib/firestore"

interface Params { params: Promise<{ id: string }> }

export async function GET(_req: NextRequest, { params }: Params) {
  let user
  try { user = await requireTenantContributor() } catch { return NextResponse.json({ error: "Unauthorized" }, { status: 403 }) }
  const { id } = await params
  const member = await getTeenById(user.tenantId, id)
  if (!member) return NextResponse.json({ error: "Not found" }, { status: 404 })
  return NextResponse.json({ member })
}

export async function PATCH(req: NextRequest, { params }: Params) {
  let user
  try { user = await requireTenantContributor() } catch { return NextResponse.json({ error: "Unauthorized" }, { status: 403 }) }
  const { id } = await params
  const body = await req.json()
  await updateTeen(user.tenantId, id, body)
  return NextResponse.json({ success: true })
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  let user
  try { user = await requireTenantSuperAdmin() } catch { return NextResponse.json({ error: "Unauthorized" }, { status: 403 }) }
  const { id } = await params
  await deleteTeen(user.tenantId, id)
  return NextResponse.json({ success: true })
}
