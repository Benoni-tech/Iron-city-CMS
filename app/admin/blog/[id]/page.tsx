"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import dynamic from "next/dynamic"
import ImageUpload from "@/components/image-upload"
import type { BlogPost, TipTapDocument } from "@/types"

const TipTapEditor = dynamic(() => import("@/components/tiptap-editor"), { ssr: false })
type Tab = "content" | "details"

interface PageProps { params: Promise<{ id: string }> }

export default function EditBlogPostPage({ params }: PageProps) {
  const router = useRouter()
  const [postId, setPostId] = useState("")
  const [post, setPost] = useState<BlogPost | null>(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<Tab>("content")
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const [title, setTitle] = useState("")
  const [excerpt, setExcerpt] = useState("")
  const [category, setCategory] = useState("news")
  const [featuredImage, setFeaturedImage] = useState("")
  const [body, setBody] = useState<TipTapDocument | null>(null)

  useEffect(() => {
    params.then(({ id }) => {
      setPostId(id)
      fetch(`/api/admin/blog/${id}`)
        .then((r) => r.json())
        .then(({ post: p }: { post: BlogPost }) => {
          setPost(p)
          setTitle(p.title); setExcerpt(p.excerpt)
          setCategory(p.category); setFeaturedImage(p.featuredImage)
          setBody(p.body)
        })
        .finally(() => setLoading(false))
    })
  }, [params])

  const handleBodyChange = useCallback((doc: TipTapDocument) => setBody(doc), [])

  async function handleSave() {
    setError(""); setSuccess(""); setSaving(true)
    try {
      const res = await fetch(`/api/admin/blog/${postId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, excerpt, category, featuredImage, body }),
      })
      if (!res.ok) throw new Error((await res.json()).error ?? "Save failed")
      setSuccess("Saved"); setTimeout(() => setSuccess(""), 2000)
    } catch (err) { setError(err instanceof Error ? err.message : "Save failed") }
    finally { setSaving(false) }
  }

  async function handlePublish() {
    setSaving(true)
    try {
      await fetch(`/api/admin/blog/${postId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "publish" }),
      })
      setPost((p) => p ? { ...p, status: "published" } : p)
      setSuccess("Published!")
    } catch (err) { setError(err instanceof Error ? err.message : "Failed") }
    finally { setSaving(false) }
  }

  async function handleDelete() {
    if (!window.confirm("Delete this post permanently?")) return
    const res = await fetch(`/api/admin/blog/${postId}`, { method: "DELETE" })
    if (res.ok) router.push("/admin/blog")
    else setError("Delete failed")
  }

  if (loading) return <div className="p-10"><p className="text-sm text-stone-400">Loading...</p></div>
  if (!post || !body) return <div className="p-10"><p className="text-sm text-red-500">Not found.</p></div>

  return (
    <div className="min-h-screen bg-stone-50">
      <div className="bg-white border-b border-stone-200 px-8 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <span className={`status-badge status-${post.status}`}>{post.status}</span>
          <div className="flex gap-1">
            {(["content", "details"] as Tab[]).map((t) => (
              <button key={t} onClick={() => setTab(t)}
                className={`text-xs px-3 py-1.5 rounded-lg transition-colors capitalize ${tab === t ? "bg-[#1a2744] text-white" : "text-stone-500 hover:text-stone-900"}`}>
                {t}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-3">
          {error && <p className="text-xs text-red-500">{error}</p>}
          {success && <p className="text-xs text-green-600">{success}</p>}
          <button onClick={handleSave} disabled={saving} className="admin-btn-secondary text-xs">Save</button>
          {post.status === "draft" && (
            <button onClick={handlePublish} disabled={saving} className="admin-btn-primary text-xs">Publish</button>
          )}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-8 py-10">
        <input type="text" value={title} onChange={(e) => setTitle(e.target.value)}
          className="w-full font-display text-3xl font-bold text-[#1a2744] bg-transparent border-none outline-none placeholder:text-stone-300 mb-6" />

        {tab === "content" && <TipTapEditor value={body} onChange={handleBodyChange} />}

        {tab === "details" && (
          <div className="space-y-5 max-w-2xl">
            <div>
              <label className="block text-xs font-semibold tracking-[0.08em] uppercase text-stone-500 mb-1.5">Excerpt</label>
              <textarea value={excerpt} onChange={(e) => setExcerpt(e.target.value)} className="admin-input resize-none" rows={3} />
            </div>
            <div>
              <label className="block text-xs font-semibold tracking-[0.08em] uppercase text-stone-500 mb-1.5">Category</label>
              <select value={category} onChange={(e) => setCategory(e.target.value)} className="admin-input">
                <option value="news">News</option>
                <option value="announcement">Announcement</option>
                <option value="devotional">Devotional</option>
              </select>
            </div>
            <ImageUpload value={featuredImage} onChange={setFeaturedImage} folder="blog" label="Featured Image" />
            <div className="border-t border-stone-100 pt-5">
              <button onClick={handleDelete} className="admin-btn-danger">Delete this post permanently</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
