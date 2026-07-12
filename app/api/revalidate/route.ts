import { NextRequest, NextResponse } from "next/server"
import { revalidatePath } from "next/cache"
import { requireAuth } from "@/lib/auth"

export async function POST(req: NextRequest) {
  try { await requireAuth() } catch { return NextResponse.json({ error: "Unauthorized" }, { status: 403 }) }
  const { paths } = await req.json()
  if (Array.isArray(paths)) paths.forEach((p: string) => revalidatePath(p))
  return NextResponse.json({ success: true })
}
