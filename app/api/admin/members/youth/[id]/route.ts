import { NextRequest, NextResponse } from "next/server"
import { requireContributor, requireSuperAdmin } from "@/lib/auth"
import { getYouthById, updateYouth, deleteYouth } from "@/lib/firestore"

interface Params { params: Promise<{ id: string }> }

export async function GET(_req: NextRequest, { params }: Params) {
  try { await requireContributor() } catch { return NextResponse.json({ error: "Unauthorized" }, { status: 403 }) }
  const { id } = await params
  const member = await getYouthById(id)
  if (!member) return NextResponse.json({ error: "Not found" }, { status: 404 })
  return NextResponse.json({ member })
}

export async function PATCH(req: NextRequest, { params }: Params) {
  try { await requireContributor() } catch { return NextResponse.json({ error: "Unauthorized" }, { status: 403 }) }
  const { id } = await params
  const body = await req.json()
  await updateYouth(id, body)
  return NextResponse.json({ success: true })
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  try { await requireSuperAdmin() } catch { return NextResponse.json({ error: "Unauthorized" }, { status: 403 }) }
  const { id } = await params
  await deleteYouth(id)
  return NextResponse.json({ success: true })
}
