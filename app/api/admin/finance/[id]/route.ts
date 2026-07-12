import { NextRequest, NextResponse } from "next/server"
import { requireSuperAdmin } from "@/lib/auth"
import { updateFinancialRecord, deleteFinancialRecord } from "@/lib/firestore"

interface Params { params: Promise<{ id: string }> }

export async function PATCH(req: NextRequest, { params }: Params) {
  try { await requireSuperAdmin() } catch { return NextResponse.json({ error: "Unauthorized" }, { status: 403 }) }
  const { id } = await params
  const body = await req.json()
  await updateFinancialRecord(id, body)
  return NextResponse.json({ success: true })
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  try { await requireSuperAdmin() } catch { return NextResponse.json({ error: "Unauthorized" }, { status: 403 }) }
  const { id } = await params
  await deleteFinancialRecord(id)
  return NextResponse.json({ success: true })
}
