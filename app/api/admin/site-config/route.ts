import { NextRequest, NextResponse } from "next/server"
import { requireSuperAdmin } from "@/lib/auth"
import { getSiteConfig, updateSiteConfig } from "@/lib/firestore"
import { revalidatePath } from "next/cache"

export async function GET() {
  try { await requireSuperAdmin() } catch { return NextResponse.json({ error: "Unauthorized" }, { status: 403 }) }
  const config = await getSiteConfig()
  return NextResponse.json({ config })
}

export async function PATCH(req: NextRequest) {
  try { await requireSuperAdmin() } catch { return NextResponse.json({ error: "Unauthorized" }, { status: 403 }) }
  const body = await req.json()
  await updateSiteConfig(body)
  revalidatePath("/")
  revalidatePath("/about")
  revalidatePath("/contact")
  return NextResponse.json({ success: true })
}
