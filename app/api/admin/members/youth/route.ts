import { NextRequest, NextResponse } from "next/server"
import { requireTenantContributor } from "@/lib/auth"
import { getYouth, createYouth } from "@/lib/firestore"

export async function GET() {
  let user
  try { user = await requireTenantContributor() } catch { return NextResponse.json({ error: "Unauthorized" }, { status: 403 }) }
  const members = await getYouth(user.tenantId)
  return NextResponse.json({ members })
}

export async function POST(req: NextRequest) {
  let user
  try { user = await requireTenantContributor() } catch { return NextResponse.json({ error: "Unauthorized" }, { status: 403 }) }
  const body = await req.json()
  const id = await createYouth(user.tenantId, body)
  return NextResponse.json({ id }, { status: 201 })
}
