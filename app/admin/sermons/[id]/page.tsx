"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import dynamic from "next/dynamic"
import type { Sermon, TipTapDocument } from "@/types"

const TipTapEditor = dynamic(() => import("@/components/tiptap-editor"), { ssr: false })
type Tab = "notes" | "details"

interface PageProps { params: Promise<{ id: string }> }

export default function EditSermonPage({ params }: PageProps) {
  const router = useRouter()
  const [sermonId, setSermonId] = useState("")
  const [sermon, setSermon] = useState<Sermon | null>(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<Tab>("notes")
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const [title, setTitle] = useState("")
  const [speaker, setSpeaker] = useState("")
  const [series, setSeries] = useState("")
  const [date, setDate] = useState("")
  const [scripture, setScripture] = useState("")
  const [tags, setTags] = useState("")
  const [body, setBody] = useState<TipTapDocument | null>(null)

  useEffect(() => {
    params.then(({ id }) => {
      setSermonId(id)
      fetch(`/api/admin/sermons/${id}`)
        .then((r) => r.json())
        .then(({ sermon: s }: { sermon: Sermon }) => {
          setSermon(s)
          setTitle(s.title); setSpeaker(s.speaker); setSeries(s.series ?? "")
          setDate(s.date); setScripture(s.scripture); setTags(s.tags.join(", "))
          setBody(s.body)
        })
        .finally(() => setLoading(false))
    })
  }, [params])

  const handleBodyChange = useCallback((doc: TipTapDocument) => setBody(doc), [])

  async function handleSave() {
    setError(""); setSuccess(""); setSaving(true)
    try {
      const res = await fetch(`/api/admin/sermons/${sermonId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, speaker, series, date, scripture, tags: tags.split(",").map((t) => t.trim()).filter(Boolean), body }),
      })
      if (!res.ok) throw new Error((await res.json()).error ?? "Save failed")
      setSuccess("Saved"); setTimeout(() => setSuccess(""), 2000)
    } catch (err) { setError(err instanceof Error ? err.message : "Save failed") }
    finally { setSaving(false) }
  }

  async function handlePublish() {
    setSaving(true)
    try {
      await fetch(`/api/admin/sermons/${sermonId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "publish" }),
      })
      setSermon((s) => s ? { ...s, status: "published" } : s)
      setSuccess("Published!")
    } catch (err) { setError(err instanceof Error ? err.message : "Failed") }
    finally { setSaving(false) }
  }

  if (loading) return <div className="p-10"><p className="text-sm text-stone-400">Loading...</p></div>
  if (!sermon || !body) return <div className="p-10"><p className="text-sm text-red-500">Not found.</p></div>

  return (
    <div className="min-h-screen bg-stone-50">
      <div className="bg-white border-b border-stone-200 px-8 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <span className={`status-badge status-${sermon.status}`}>{sermon.status}</span>
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
          {error && <p className="text-xs text-red-500">{error}</p>}
          {success && <p className="text-xs text-green-600">{success}</p>}
          <button onClick={handleSave} disabled={saving} className="admin-btn-secondary text-xs">Save</button>
          {sermon.status === "draft" && (
            <button onClick={handlePublish} disabled={saving} className="admin-btn-primary text-xs">Publish</button>
          )}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-8 py-10">
        <input type="text" value={title} onChange={(e) => setTitle(e.target.value)}
          className="w-full font-display text-3xl font-bold text-[#1a2744] bg-transparent border-none outline-none placeholder:text-stone-300 mb-6" />

        {tab === "notes" && <TipTapEditor value={body} onChange={handleBodyChange} />}

        {tab === "details" && (
          <div className="space-y-5 max-w-2xl">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold tracking-[0.08em] uppercase text-stone-500 mb-1.5">Speaker</label>
                <input value={speaker} onChange={(e) => setSpeaker(e.target.value)} className="admin-input" />
              </div>
              <div>
                <label className="block text-xs font-semibold tracking-[0.08em] uppercase text-stone-500 mb-1.5">Date</label>
                <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="admin-input" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold tracking-[0.08em] uppercase text-stone-500 mb-1.5">Scripture</label>
                <input value={scripture} onChange={(e) => setScripture(e.target.value)} className="admin-input" />
              </div>
              <div>
                <label className="block text-xs font-semibold tracking-[0.08em] uppercase text-stone-500 mb-1.5">Series</label>
                <input value={series} onChange={(e) => setSeries(e.target.value)} className="admin-input" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold tracking-[0.08em] uppercase text-stone-500 mb-1.5">Tags</label>
              <input value={tags} onChange={(e) => setTags(e.target.value)} className="admin-input" />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
