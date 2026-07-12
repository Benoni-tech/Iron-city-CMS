import { NextRequest, NextResponse } from "next/server"
import { requireContributor } from "@/lib/auth"
import { getAllSermonsAdmin, createSermon } from "@/lib/firestore"

export async function GET() {
  try { await requireContributor() } catch { return NextResponse.json({ error: "Unauthorized" }, { status: 403 }) }
  const sermons = await getAllSermonsAdmin()
  return NextResponse.json({ sermons })
}

export async function POST(req: NextRequest) {
  try { await requireContributor() } catch { return NextResponse.json({ error: "Unauthorized" }, { status: 403 }) }
  const body = await req.json()
  const id = await createSermon(body)
  return NextResponse.json({ id }, { status: 201 })
}
