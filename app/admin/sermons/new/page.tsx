"use client"

import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import dynamic from "next/dynamic"
import { generateSlug } from "@/lib/slug"
import type { TipTapDocument } from "@/types"

const TipTapEditor = dynamic(() => import("@/components/tiptap-editor"), { ssr: false })

const emptyDoc: TipTapDocument = { type: "doc", content: [{ type: "paragraph" }] }

type Tab = "notes" | "details"

export default function NewSermonPage() {
  const router = useRouter()
  const [tab, setTab] = useState<Tab>("notes")
  const [title, setTitle] = useState("")
  const [slug, setSlug] = useState("")
  const [slugManual, setSlugManual] = useState(false)
  const [speaker, setSpeaker] = useState("")
  const [series, setSeries] = useState("")
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))
  const [scripture, setScripture] = useState("")
  const [tags, setTags] = useState("")
  const [body, setBody] = useState<TipTapDocument>(emptyDoc)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  function handleTitleChange(value: string) {
    setTitle(value)
    if (!slugManual) setSlug(generateSlug(value))
  }

  const handleBodyChange = useCallback((doc: TipTapDocument) => setBody(doc), [])

  async function handleSave(publish = false) {
    if (!title || !speaker || !date) {
      setError("Title, speaker, and date are required.")
      return
    }
    setError("")
    setSaving(true)

    try {
      const res = await fetch("/api/admin/sermons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title, slug: slug || generateSlug(title),
          speaker, series, date, scripture,
          tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
          body, status: publish ? "published" : "draft",
        }),
      })
      if (!res.ok) throw new Error((await res.json()).error ?? "Save failed")
      const { id } = await res.json()
      if (publish) {
        await fetch(`/api/admin/sermons/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "publish" }),
        })
      }
      router.push("/admin/sermons")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-stone-50">
      <div className="bg-white border-b border-stone-200 px-8 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <h1 className="text-sm font-semibold text-[#1a2744]">New Sermon</h1>
          <div className="flex gap-1">
            {(["notes", "details"] as Tab[]).map((t) => (
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
          placeholder="Sermon title"
          className="w-full font-display text-3xl font-bold text-[#1a2744] bg-transparent border-none outline-none placeholder:text-stone-300 mb-6" />

        {tab === "notes" && (
          <TipTapEditor value={body} onChange={handleBodyChange} />
        )}

        {tab === "details" && (
          <div className="space-y-5 max-w-2xl">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold tracking-[0.08em] uppercase text-stone-500 mb-1.5">Speaker *</label>
                <input value={speaker} onChange={(e) => setSpeaker(e.target.value)} className="admin-input" placeholder="Preacher name" />
              </div>
              <div>
                <label className="block text-xs font-semibold tracking-[0.08em] uppercase text-stone-500 mb-1.5">Date *</label>
                <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="admin-input" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold tracking-[0.08em] uppercase text-stone-500 mb-1.5">Scripture</label>
                <input value={scripture} onChange={(e) => setScripture(e.target.value)} className="admin-input" placeholder="John 3:16" />
              </div>
              <div>
                <label className="block text-xs font-semibold tracking-[0.08em] uppercase text-stone-500 mb-1.5">Series</label>
                <input value={series} onChange={(e) => setSeries(e.target.value)} className="admin-input" placeholder="e.g. Walking in Faith" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold tracking-[0.08em] uppercase text-stone-500 mb-1.5">Slug</label>
              <input value={slug} onChange={(e) => { setSlugManual(true); setSlug(e.target.value) }} className="admin-input font-mono text-sm" />
            </div>
            <div>
              <label className="block text-xs font-semibold tracking-[0.08em] uppercase text-stone-500 mb-1.5">Tags (comma separated)</label>
              <input value={tags} onChange={(e) => setTags(e.target.value)} className="admin-input" placeholder="faith, prayer, discipleship" />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
