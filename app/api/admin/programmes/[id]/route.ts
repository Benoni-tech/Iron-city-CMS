import { NextRequest, NextResponse } from "next/server"
import { requireTenantContributor, requireTenantSuperAdmin } from "@/lib/auth"
import { getProgrammeById, updateProgramme, deleteProgramme } from "@/lib/firestore"

interface Params { params: Promise<{ id: string }> }

export async function GET(_req: NextRequest, { params }: Params) {
  let user
  try { user = await requireTenantContributor() } catch { return NextResponse.json({ error: "Unauthorized" }, { status: 403 }) }
  const { id } = await params
  const programme = await getProgrammeById(user.tenantId, id)
  if (!programme) return NextResponse.json({ error: "Not found" }, { status: 404 })
  return NextResponse.json({ programme })
}

export async function PATCH(req: NextRequest, { params }: Params) {
  let user
  try { user = await requireTenantContributor() } catch { return NextResponse.json({ error: "Unauthorized" }, { status: 403 }) }
  const { id } = await params
  await updateProgramme(user.tenantId, id, await req.json())
  return NextResponse.json({ success: true })
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  let user
  try { user = await requireTenantSuperAdmin() } catch { return NextResponse.json({ error: "Unauthorized" }, { status: 403 }) }
  const { id } = await params
  await deleteProgramme(user.tenantId, id)
  return NextResponse.json({ success: true })
}
