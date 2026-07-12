import { NextRequest, NextResponse } from "next/server"
import { requireContributor, requireSuperAdmin } from "@/lib/auth"
import { getProgrammeById, updateProgramme, deleteProgramme } from "@/lib/firestore"
import { revalidatePath } from "next/cache"

interface Params { params: Promise<{ id: string }> }

export async function GET(_req: NextRequest, { params }: Params) {
  try { await requireContributor() } catch { return NextResponse.json({ error: "Unauthorized" }, { status: 403 }) }
  const { id } = await params
  const programme = await getProgrammeById(id)
  if (!programme) return NextResponse.json({ error: "Not found" }, { status: 404 })
  return NextResponse.json({ programme })
}

export async function PATCH(req: NextRequest, { params }: Params) {
  try { await requireContributor() } catch { return NextResponse.json({ error: "Unauthorized" }, { status: 403 }) }
  const { id } = await params
  await updateProgramme(id, await req.json())
  revalidatePath("/")
  revalidatePath("/events")
  return NextResponse.json({ success: true })
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  try { await requireSuperAdmin() } catch { return NextResponse.json({ error: "Unauthorized" }, { status: 403 }) }
  const { id } = await params
  await deleteProgramme(id)
  revalidatePath("/events")
  return NextResponse.json({ success: true })
}
