import { NextRequest, NextResponse } from "next/server"
import { createLead } from "@/lib/platform"
import { sendLeadNotification } from "@/lib/resend"
import { leadSchema } from "@/lib/schemas/leads"

export async function POST(req: NextRequest) {
  let body: unknown
  try { body = await req.json() } catch { return NextResponse.json({ error: "Invalid request" }, { status: 400 }) }

  const result = leadSchema.safeParse(body)
  if (!result.success) {
    return NextResponse.json({ error: "Validation failed", issues: result.error.flatten().fieldErrors }, { status: 422 })
  }

  try {
    await createLead(result.data)
  } catch (err) {
    console.error("Lead submission error:", err)
    return NextResponse.json({ error: "Failed to submit" }, { status: 500 })
  }

  try {
    await sendLeadNotification(result.data)
  } catch (err) {
    console.error("Lead notification email failed (lead was still saved):", err)
  }

  return NextResponse.json({ success: true }, { status: 201 })
}
