import { NextRequest, NextResponse } from "next/server"
import { requireContributor } from "@/lib/auth"
import { getAllProgrammesAdmin, createProgramme } from "@/lib/firestore"
import { revalidatePath } from "next/cache"

export async function GET() {
  try { await requireContributor() } catch { return NextResponse.json({ error: "Unauthorized" }, { status: 403 }) }
  const programmes = await getAllProgrammesAdmin()
  return NextResponse.json({ programmes })
}

export async function POST(req: NextRequest) {
  try { await requireContributor() } catch { return NextResponse.json({ error: "Unauthorized" }, { status: 403 }) }
  const body = await req.json()
  const id = await createProgramme(body)
  revalidatePath("/")
  revalidatePath("/events")
  return NextResponse.json({ id }, { status: 201 })
}
