"use client"

import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import dynamic from "next/dynamic"
import ImageUpload from "@/components/image-upload"
import { generateSlug } from "@/lib/slug"
import type { TipTapDocument } from "@/types"

const TipTapEditor = dynamic(() => import("@/components/tiptap-editor"), { ssr: false })

const emptyDoc: TipTapDocument = { type: "doc", content: [{ type: "paragraph" }] }
type Tab = "content" | "details"

export default function NewBlogPostPage() {
  const router = useRouter()
  const [tab, setTab] = useState<Tab>("content")
  const [title, setTitle] = useState("")
  const [slug, setSlug] = useState("")
  const [slugManual, setSlugManual] = useState(false)
  const [excerpt, setExcerpt] = useState("")
  const [category, setCategory] = useState("news")
  const [featuredImage, setFeaturedImage] = useState("")
  const [body, setBody] = useState<TipTapDocument>(emptyDoc)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  function handleTitleChange(v: string) {
    setTitle(v)
    if (!slugManual) setSlug(generateSlug(v))
  }

  const handleBodyChange = useCallback((doc: TipTapDocument) => setBody(doc), [])

  async function handleSave(publish = false) {
    if (!title || !excerpt) { setError("Title and excerpt are required."); return }
    setError(""); setSaving(true)
    try {
      const res = await fetch("/api/admin/blog", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title, slug: slug || generateSlug(title),
          excerpt, category, featuredImage, body,
        }),
      })
      if (!res.ok) throw new Error((await res.json()).error ?? "Save failed")
      const { id } = await res.json()
      if (publish) {
        await fetch(`/api/admin/blog/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "publish" }),
        })
      }
      router.push("/admin/blog")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed")
    } finally { setSaving(false) }
  }

  return (
    <div className="min-h-screen bg-stone-50">
      <div className="bg-white border-b border-stone-200 px-8 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <h1 className="text-sm font-semibold text-[#1a2744]">New Blog Post</h1>
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
          {error && <p className="text-xs text-red-500 max-w-xs truncate">{error}</p>}
          <button onClick={() => handleSave(false)} disabled={saving} className="admin-btn-secondary text-xs">Save Draft</button>
          <button onClick={() => handleSave(true)} disabled={saving} className="admin-btn-primary text-xs">Publish</button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-8 py-10">
        <input type="text" value={title} onChange={(e) => handleTitleChange(e.target.value)}
          placeholder="Post title"
          className="w-full font-display text-3xl font-bold text-[#1a2744] bg-transparent border-none outline-none placeholder:text-stone-300 mb-6" />

        {tab === "content" && <TipTapEditor value={body} onChange={handleBodyChange} />}

        {tab === "details" && (
          <div className="space-y-5 max-w-2xl">
            <div>
              <label className="block text-xs font-semibold tracking-[0.08em] uppercase text-stone-500 mb-1.5">Excerpt *</label>
              <textarea value={excerpt} onChange={(e) => setExcerpt(e.target.value)} className="admin-input resize-none" rows={3} placeholder="Brief summary shown on listing pages" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold tracking-[0.08em] uppercase text-stone-500 mb-1.5">Category</label>
                <select value={category} onChange={(e) => setCategory(e.target.value)} className="admin-input">
                  <option value="news">News</option>
                  <option value="announcement">Announcement</option>
                  <option value="devotional">Devotional</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold tracking-[0.08em] uppercase text-stone-500 mb-1.5">Slug</label>
                <input value={slug} onChange={(e) => { setSlugManual(true); setSlug(e.target.value) }} className="admin-input font-mono text-sm" />
              </div>
            </div>
            <ImageUpload value={featuredImage} onChange={setFeaturedImage} folder="blog" label="Featured Image" />
          </div>
        )}
      </div>
    </div>
  )
}
