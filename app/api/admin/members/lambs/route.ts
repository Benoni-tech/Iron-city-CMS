import { NextRequest, NextResponse } from "next/server"
import { requireContributor } from "@/lib/auth"
import { getLambs, createLamb } from "@/lib/firestore"

export async function GET() {
  try { await requireContributor() } catch { return NextResponse.json({ error: "Unauthorized" }, { status: 403 }) }
  const members = await getLambs()
  return NextResponse.json({ members })
}

export async function POST(req: NextRequest) {
  try { await requireContributor() } catch { return NextResponse.json({ error: "Unauthorized" }, { status: 403 }) }
  const body = await req.json()
  const id = await createLamb(body)
  return NextResponse.json({ id }, { status: 201 })
}
