import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { requirePlatformAdmin } from "@/lib/auth"
import { getLeads, updateLeadStatus } from "@/lib/platform"

const statusSchema = z.object({
  id: z.string().min(1),
  status: z.enum(["new", "contacted", "approved", "declined"]),
})

export async function GET() {
  try { await requirePlatformAdmin() } catch { return NextResponse.json({ error: "Unauthorized" }, { status: 403 }) }
  const leads = await getLeads()
  return NextResponse.json({ leads })
}

export async function PATCH(req: NextRequest) {
  try { await requirePlatformAdmin() } catch { return NextResponse.json({ error: "Unauthorized" }, { status: 403 }) }

  let body: unknown
  try { body = await req.json() } catch { return NextResponse.json({ error: "Invalid request" }, { status: 400 }) }

  const result = statusSchema.safeParse(body)
  if (!result.success) {
    return NextResponse.json({ error: "Validation failed", issues: result.error.flatten().fieldErrors }, { status: 422 })
  }

  await updateLeadStatus(result.data.id, result.data.status)
  return NextResponse.json({ success: true })
}
