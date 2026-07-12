"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import type { ServiceType } from "@/types"
import { SERVICE_TYPE_LABELS } from "@/types"

export default function NewSessionPage() {
  const router = useRouter()
  const [serviceType, setServiceType] = useState<ServiceType>("sunday_morning")
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))
  const [title, setTitle] = useState("")
  const [conductedBy, setConductedBy] = useState("")
  const [notes, setNotes] = useState("")
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setSaving(true)

    try {
      const res = await fetch("/api/admin/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ serviceType, date, title, conductedBy, notes }),
      })

      if (!res.ok) throw new Error((await res.json()).error ?? "Failed to create session")

      const { id } = await res.json()
      router.push(`/admin/attendance/${id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create session")
    } finally {
      setSaving(false)
    }
  }

  const serviceTypes: ServiceType[] = [
    "sunday_morning",
    "sunday_evening",
    "monday_bible",
    "wednesday_prayer",
    "special",
  ]

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="font-display font-bold text-3xl text-[#1a2744] mb-2">New Service Session</h1>
      <p className="text-sm text-stone-400 mb-8">
        Create a session, then mark attendance for it.
      </p>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold tracking-[0.08em] uppercase text-stone-500 mb-1.5">
              Service Type
            </label>
            <select
              value={serviceType}
              onChange={(e) => setServiceType(e.target.value as ServiceType)}
              className="admin-input"
            >
              {serviceTypes.map((type) => (
                <option key={type} value={type}>
                  {SERVICE_TYPE_LABELS[type]}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold tracking-[0.08em] uppercase text-stone-500 mb-1.5">
              Date
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="admin-input"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold tracking-[0.08em] uppercase text-stone-500 mb-1.5">
            Title (optional)
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="admin-input"
            placeholder="e.g. Easter Sunday, Youth Camp Service"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold tracking-[0.08em] uppercase text-stone-500 mb-1.5">
            Conducted By
          </label>
          <input
            type="text"
            value={conductedBy}
            onChange={(e) => setConductedBy(e.target.value)}
            className="admin-input"
            placeholder="Preacher or leader name"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold tracking-[0.08em] uppercase text-stone-500 mb-1.5">
            Notes (optional)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="admin-input resize-none"
            rows={3}
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={saving} className="admin-btn-primary">
            {saving ? "Creating..." : "Create Session & Mark Attendance"}
          </button>
          <button type="button" onClick={() => router.back()} className="admin-btn-secondary">
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}
