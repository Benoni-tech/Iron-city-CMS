"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import type { Programme, ProgrammeCategory } from "@/types"

const categories: { value: ProgrammeCategory; label: string }[] = [
  { value: "sunday_service", label: "Sunday Service" },
  { value: "prayer", label: "Prayer Meeting" },
  { value: "bible_study", label: "Bible Study" },
  { value: "special", label: "Special Programme" },
  { value: "annual", label: "Annual Programme" },
]

interface PageProps { params: Promise<{ id: string }> }

export default function EditProgrammePage({ params }: PageProps) {
  const router = useRouter()
  const [progId, setProgId] = useState("")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const [title, setTitle] = useState("")
  const [date, setDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [time, setTime] = useState("")
  const [location, setLocation] = useState("")
  const [description, setDescription] = useState("")
  const [category, setCategory] = useState<ProgrammeCategory>("special")
  const [publishedOnSite, setPublishedOnSite] = useState(true)
  const [status, setStatus] = useState<Programme["status"]>("upcoming")

  useEffect(() => {
    params.then(({ id }) => {
      setProgId(id)
      fetch(`/api/admin/programmes/${id}`)
        .then((r) => r.json())
        .then(({ programme: p }: { programme: Programme }) => {
          setTitle(p.title); setDate(p.date); setEndDate(p.endDate ?? "")
          setTime(p.time); setLocation(p.location); setDescription(p.description)
          setCategory(p.category); setPublishedOnSite(p.publishedOnSite); setStatus(p.status)
        })
        .finally(() => setLoading(false))
    })
  }, [params])

  async function handleSave() {
    setError(""); setSuccess(""); setSaving(true)
    try {
      const res = await fetch(`/api/admin/programmes/${progId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, date, endDate: endDate || undefined, time, location, description, category, publishedOnSite, status }),
      })
      if (!res.ok) throw new Error((await res.json()).error ?? "Save failed")
      setSuccess("Saved"); setTimeout(() => setSuccess(""), 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed")
    } finally { setSaving(false) }
  }

  async function handleDelete() {
    if (!window.confirm("Delete this programme?")) return
    const res = await fetch(`/api/admin/programmes/${progId}`, { method: "DELETE" })
    if (res.ok) router.push("/admin/programmes")
    else setError("Delete failed")
  }

  if (loading) return <div className="p-10"><p className="text-sm text-stone-400">Loading...</p></div>

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display font-bold text-3xl text-[#1a2744]">Edit Programme</h1>
        <div className="flex gap-3">
          {error && <p className="text-xs text-red-500">{error}</p>}
          {success && <p className="text-xs text-green-600">{success}</p>}
          <button onClick={handleSave} disabled={saving} className="admin-btn-primary">
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>

      <div className="space-y-5">
        <div>
          <label className="block text-xs font-semibold tracking-[0.08em] uppercase text-stone-500 mb-1.5">Title</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} className="admin-input" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold tracking-[0.08em] uppercase text-stone-500 mb-1.5">Start Date</label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="admin-input" />
          </div>
          <div>
            <label className="block text-xs font-semibold tracking-[0.08em] uppercase text-stone-500 mb-1.5">End Date</label>
            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="admin-input" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold tracking-[0.08em] uppercase text-stone-500 mb-1.5">Time</label>
            <input value={time} onChange={(e) => setTime(e.target.value)} className="admin-input" />
          </div>
          <div>
            <label className="block text-xs font-semibold tracking-[0.08em] uppercase text-stone-500 mb-1.5">Status</label>
            <select value={status} onChange={(e) => setStatus(e.target.value as Programme["status"])} className="admin-input">
              <option value="upcoming">Upcoming</option>
              <option value="ongoing">Ongoing</option>
              <option value="past">Past</option>
            </select>
          </div>
        </div>
        <div>
          <label className="block text-xs font-semibold tracking-[0.08em] uppercase text-stone-500 mb-1.5">Location</label>
          <input value={location} onChange={(e) => setLocation(e.target.value)} className="admin-input" />
        </div>
        <div>
          <label className="block text-xs font-semibold tracking-[0.08em] uppercase text-stone-500 mb-1.5">Category</label>
          <select value={category} onChange={(e) => setCategory(e.target.value as ProgrammeCategory)} className="admin-input">
            {categories.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold tracking-[0.08em] uppercase text-stone-500 mb-1.5">Description</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="admin-input resize-none" rows={4} />
        </div>
        <div className="flex items-center justify-between p-4 bg-stone-50 border border-stone-200 rounded-xl">
          <p className="text-sm font-medium text-stone-900">Published on website</p>
          <button type="button" onClick={() => setPublishedOnSite(!publishedOnSite)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${publishedOnSite ? "bg-[#1a2744]" : "bg-stone-200"}`}>
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${publishedOnSite ? "translate-x-6" : "translate-x-1"}`} />
          </button>
        </div>
        <div className="border-t border-stone-100 pt-5">
          <button onClick={handleDelete} className="admin-btn-danger">Delete this programme</button>
        </div>
      </div>
    </div>
  )
}
