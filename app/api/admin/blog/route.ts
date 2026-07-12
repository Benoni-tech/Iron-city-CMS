import { NextRequest, NextResponse } from "next/server"
import { requireContributor } from "@/lib/auth"
import { getAllBlogPostsAdmin, createBlogPost } from "@/lib/firestore"

export async function GET() {
  try { await requireContributor() } catch { return NextResponse.json({ error: "Unauthorized" }, { status: 403 }) }
  const posts = await getAllBlogPostsAdmin()
  return NextResponse.json({ posts })
}

export async function POST(req: NextRequest) {
  try { await requireContributor() } catch { return NextResponse.json({ error: "Unauthorized" }, { status: 403 }) }
  const body = await req.json()
  const id = await createBlogPost(body)
  return NextResponse.json({ id }, { status: 201 })
}
