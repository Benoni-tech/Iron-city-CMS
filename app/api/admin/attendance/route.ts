import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { requireContributor } from "@/lib/auth"
import { createServiceSession } from "@/lib/firestore"

const schema = z.object({
  serviceType: z.enum([
    "sunday_morning",
    "sunday_evening",
    "monday_bible",
    "wednesday_prayer",
    "special",
  ]),
  date: z.string().min(1),
  title: z.string().optional(),
  conductedBy: z.string().optional(),
  notes: z.string().optional(),
})

export async function POST(req: NextRequest) {
  let user
  try {
    user = await requireContributor()
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 })
  }

  const result = schema.safeParse(body)
  if (!result.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: result.error.flatten().fieldErrors },
      { status: 422 }
    )
  }

  try {
    const id = await createServiceSession(
      {
        serviceType: result.data.serviceType,
        date: result.data.date,
        title: result.data.title,
        conductedBy: result.data.conductedBy ?? "",
        notes: result.data.notes,
      },
      user.uid
    )
    return NextResponse.json({ id }, { status: 201 })
  } catch (err) {
    console.error("Create session error:", err)
    return NextResponse.json({ error: "Failed to create session" }, { status: 500 })
  }
}
