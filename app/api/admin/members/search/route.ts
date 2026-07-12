import { NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth"
import { searchAdultMembers } from "@/lib/firestore"

export async function GET(req: NextRequest) {
  try { await requireAuth() } catch { return NextResponse.json({ error: "Unauthorized" }, { status: 403 }) }

  const q = req.nextUrl.searchParams.get("q") ?? ""
  if (q.trim().length < 2) {
    return NextResponse.json({ members: [] })
  }

  const members = await searchAdultMembers(q)
  return NextResponse.json({ members })
}
