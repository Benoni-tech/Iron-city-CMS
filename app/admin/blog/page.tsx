import Link from "next/link"
import { getAllBlogPostsAdmin } from "@/lib/firestore"

export default async function BlogAdminPage() {
  const posts = await getAllBlogPostsAdmin()
  const published = posts.filter((p) => p.status === "published").length

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display font-bold text-3xl text-[#1a2744]">Blog</h1>
          <p className="text-sm text-stone-400 mt-1">
            {published} published · {posts.length - published} drafts
          </p>
        </div>
        <Link href="/admin/blog/new" className="admin-btn-primary">+ New Post</Link>
      </div>

      {posts.length === 0 ? (
        <div className="py-20 text-center border-2 border-dashed border-stone-200 rounded-xl">
          <p className="text-stone-400 italic text-sm">No blog posts yet.</p>
          <Link href="/admin/blog/new" className="text-sm text-[#1a2744] underline mt-2 inline-block">
            Write the first post
          </Link>
        </div>
      ) : (
        <div className="bg-white border border-stone-200 rounded-xl overflow-hidden">
          <div className="grid grid-cols-[1fr_120px_100px_60px] gap-4 px-5 py-3 bg-stone-50 border-b border-stone-100">
            {["Title", "Category", "Status", ""].map((h) => (
              <span key={h} className="text-xs font-semibold tracking-[0.08em] uppercase text-stone-400">
                {h}
              </span>
            ))}
          </div>
          {posts.map((post, i) => (
            <div
              key={post.id}
              className={`grid grid-cols-[1fr_120px_100px_60px] gap-4 items-center px-5 py-3.5 hover:bg-stone-50 transition-colors ${i > 0 ? "border-t border-stone-100" : ""}`}
            >
              <div>
                <p className="text-sm font-medium text-stone-900">{post.title}</p>
                <p className="text-xs text-stone-400 truncate mt-0.5">{post.excerpt}</p>
              </div>
              <span className="text-xs text-stone-500 capitalize">{post.category.replace(/-/g, " ")}</span>
              <span className={`status-badge w-fit status-${post.status}`}>{post.status}</span>
              <Link
                href={`/admin/blog/${post.id}`}
                className="text-xs text-stone-400 hover:text-[#1a2744] transition-colors text-right"
              >
                Edit →
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
