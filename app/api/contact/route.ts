import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { sendContactNotification } from "@/lib/resend"

const schema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional(),
  message: z.string().min(10),
})

export async function POST(req: NextRequest) {
  let body: unknown
  try { body = await req.json() } catch { return NextResponse.json({ error: "Invalid request" }, { status: 400 }) }

  const result = schema.safeParse(body)
  if (!result.success) {
    return NextResponse.json({ error: "Validation failed", issues: result.error.flatten().fieldErrors }, { status: 422 })
  }

  try {
    await sendContactNotification(result.data)
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("Contact form error:", err)
    return NextResponse.json({ error: "Failed to send" }, { status: 500 })
  }
}
