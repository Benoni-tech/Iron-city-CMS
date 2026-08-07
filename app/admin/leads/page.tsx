"use client"

import { useEffect, useState } from "react"
import type { Lead } from "@/types"

const statusColors: Record<Lead["status"], string> = {
  new: "bg-blue-100 text-blue-800",
  contacted: "bg-amber-100 text-amber-800",
  approved: "bg-green-100 text-green-800",
  declined: "bg-stone-100 text-stone-500",
}

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    fetch("/api/admin/leads")
      .then((r) => r.json())
      .then((data) => setLeads(data.leads ?? []))
      .catch(() => setError("Failed to load leads"))
      .finally(() => setLoading(false))
  }, [])

  async function setStatus(id: string, status: Lead["status"]) {
    setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, status } : l)))
    try {
      const res = await fetch("/api/admin/leads", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      })
      if (!res.ok) throw new Error()
    } catch {
      setError("Failed to update status")
    }
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="font-display font-bold text-3xl text-[#1a2744]">Leads</h1>
        <p className="text-sm text-stone-400 mt-1">Churches that registered interest on the marketing site</p>
      </div>

      {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

      {loading ? (
        <p className="text-sm text-stone-400">Loading...</p>
      ) : leads.length === 0 ? (
        <div className="py-20 text-center border-2 border-dashed border-stone-200 rounded-xl">
          <p className="text-stone-400 italic text-sm">No leads yet.</p>
        </div>
      ) : (
        <div className="bg-white border border-stone-200 rounded-xl overflow-hidden">
          {leads.map((lead, i) => (
            <div
              key={lead.id}
              className={`flex items-center justify-between gap-4 px-5 py-4 ${i > 0 ? "border-t border-stone-100" : ""}`}
            >
              <div className="min-w-0">
                <p className="text-sm font-medium text-stone-900">{lead.churchName}</p>
                <p className="text-xs text-stone-400">
                  {lead.contactName} · {lead.email}
                  {lead.phone ? ` · ${lead.phone}` : ""} · {lead.region}
                </p>
                {lead.message && <p className="text-xs text-stone-500 mt-1 truncate">{lead.message}</p>}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className={`status-badge ${statusColors[lead.status]}`}>{lead.status}</span>
                <select
                  value={lead.status}
                  onChange={(e) => setStatus(lead.id, e.target.value as Lead["status"])}
                  className="admin-input text-xs py-1.5"
                >
                  <option value="new">New</option>
                  <option value="contacted">Contacted</option>
                  <option value="approved">Approved</option>
                  <option value="declined">Declined</option>
                </select>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
