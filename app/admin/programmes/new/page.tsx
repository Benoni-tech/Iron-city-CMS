"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import type { ProgrammeCategory } from "@/types"

const categories: { value: ProgrammeCategory; label: string }[] = [
  { value: "sunday_service", label: "Sunday Service" },
  { value: "prayer", label: "Prayer Meeting" },
  { value: "bible_study", label: "Bible Study" },
  { value: "special", label: "Special Programme" },
  { value: "annual", label: "Annual Programme" },
]

export default function NewProgrammePage() {
  const router = useRouter()
  const [title, setTitle] = useState("")
  const [date, setDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [time, setTime] = useState("")
  const [location, setLocation] = useState("")
  const [description, setDescription] = useState("")
  const [category, setCategory] = useState<ProgrammeCategory>("special")
  const [publishedOnSite, setPublishedOnSite] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title || !date || !time || !location) {
      setError("Title, date, time and location are required.")
      return
    }
    setError("")
    setSaving(true)

    try {
      const res = await fetch("/api/admin/programmes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, date, endDate: endDate || undefined, time, location, description, category, publishedOnSite, status: "upcoming" }),
      })
      if (!res.ok) throw new Error((await res.json()).error ?? "Save failed")
      router.push("/admin/programmes")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="font-display font-bold text-3xl text-[#1a2744] mb-8">Add Programme</h1>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-xs font-semibold tracking-[0.08em] uppercase text-stone-500 mb-1.5">Title *</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} className="admin-input" placeholder="Annual Thanksgiving Service" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold tracking-[0.08em] uppercase text-stone-500 mb-1.5">Start Date *</label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="admin-input" />
          </div>
          <div>
            <label className="block text-xs font-semibold tracking-[0.08em] uppercase text-stone-500 mb-1.5">End Date (optional)</label>
            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="admin-input" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold tracking-[0.08em] uppercase text-stone-500 mb-1.5">Time *</label>
            <input value={time} onChange={(e) => setTime(e.target.value)} className="admin-input" placeholder="9:00 AM" />
          </div>
          <div>
            <label className="block text-xs font-semibold tracking-[0.08em] uppercase text-stone-500 mb-1.5">Category</label>
            <select value={category} onChange={(e) => setCategory(e.target.value as ProgrammeCategory)} className="admin-input">
              {categories.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold tracking-[0.08em] uppercase text-stone-500 mb-1.5">Location *</label>
          <input value={location} onChange={(e) => setLocation(e.target.value)} className="admin-input" placeholder="Church Auditorium" />
        </div>

        <div>
          <label className="block text-xs font-semibold tracking-[0.08em] uppercase text-stone-500 mb-1.5">Description</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="admin-input resize-none" rows={4} />
        </div>

        <div className="flex items-center justify-between p-4 bg-stone-50 border border-stone-200 rounded-xl">
          <div>
            <p className="text-sm font-medium text-stone-900">Publish on website</p>
            <p className="text-xs text-stone-400 mt-0.5">Show on the public events page</p>
          </div>
          <button type="button" onClick={() => setPublishedOnSite(!publishedOnSite)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${publishedOnSite ? "bg-[#1a2744]" : "bg-stone-200"}`}
          >
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${publishedOnSite ? "translate-x-6" : "translate-x-1"}`} />
          </button>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={saving} className="admin-btn-primary">{saving ? "Saving..." : "Add Programme"}</button>
          <button type="button" onClick={() => router.back()} className="admin-btn-secondary">Cancel</button>
        </div>
      </form>
    </div>
  )
}
