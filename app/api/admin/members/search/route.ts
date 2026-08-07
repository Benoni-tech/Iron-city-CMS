import { NextRequest, NextResponse } from "next/server"
import { requireTenantUser } from "@/lib/auth"
import { searchAdultMembers } from "@/lib/firestore"

export async function GET(req: NextRequest) {
  let user
  try { user = await requireTenantUser() } catch { return NextResponse.json({ error: "Unauthorized" }, { status: 403 }) }

  const q = req.nextUrl.searchParams.get("q") ?? ""
  if (q.trim().length < 2) {
    return NextResponse.json({ members: [] })
  }

  const members = await searchAdultMembers(user.tenantId, q)
  return NextResponse.json({ members })
}
