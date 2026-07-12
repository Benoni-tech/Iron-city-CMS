import { NextRequest, NextResponse } from "next/server"
import { requireContributor, requireSuperAdmin } from "@/lib/auth"
import { getBlogPostById, updateBlogPost, publishBlogPost, deleteBlogPost } from "@/lib/firestore"
import { revalidatePath } from "next/cache"

interface Params { params: Promise<{ id: string }> }

export async function GET(_req: NextRequest, { params }: Params) {
  try { await requireContributor() } catch { return NextResponse.json({ error: "Unauthorized" }, { status: 403 }) }
  const { id } = await params
  const post = await getBlogPostById(id)
  if (!post) return NextResponse.json({ error: "Not found" }, { status: 404 })
  return NextResponse.json({ post })
}

export async function PATCH(req: NextRequest, { params }: Params) {
  try { await requireContributor() } catch { return NextResponse.json({ error: "Unauthorized" }, { status: 403 }) }
  const { id } = await params
  const body = await req.json()
  if (body.action === "publish") {
    await publishBlogPost(id)
    revalidatePath("/")
  } else {
    await updateBlogPost(id, body)
  }
  return NextResponse.json({ success: true })
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  try { await requireSuperAdmin() } catch { return NextResponse.json({ error: "Unauthorized" }, { status: 403 }) }
  const { id } = await params
  await deleteBlogPost(id)
  return NextResponse.json({ success: true })
}
