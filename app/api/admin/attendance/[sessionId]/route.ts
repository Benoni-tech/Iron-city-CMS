import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { requireContributor } from "@/lib/auth"
import { saveAttendanceBatch } from "@/lib/firestore"

const recordSchema = z.object({
  memberId: z.string().min(1),
  memberCategory: z.enum(["lambs", "teens", "youth", "congregation"]),
  memberName: z.string().min(1),
  present: z.boolean(),
})

const schema = z.object({
  records: z.array(recordSchema),
})

interface Params {
  params: Promise<{ sessionId: string }>
}

export async function POST(req: NextRequest, { params }: Params) {
  let user
  try {
    user = await requireContributor()
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
  }

  const { sessionId } = await params

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
    await saveAttendanceBatch(sessionId, result.data.records, user.uid)
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("Save attendance error:", err)
    return NextResponse.json({ error: "Failed to save attendance" }, { status: 500 })
  }
}
