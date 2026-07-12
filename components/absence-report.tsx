"use client"

import { useState } from "react"
import type { AbsentMember } from "@/lib/attendance"
import type { MemberCategory } from "@/types"

interface AbsenceReportProps {
  members: AbsentMember[]
}

const categoryLabels: Record<MemberCategory, string> = {
  lambs: "Lambs",
  teens: "Teens",
  youth: "Youth",
  congregation: "Congregation",
}

export default function AbsenceReport({ members }: AbsenceReportProps) {
  const [filter, setFilter] = useState<MemberCategory | "all">("all")

  const filtered = filter === "all" ? members : members.filter((m) => m.category === filter)

  function exportCsv() {
    const headers = ["Name", "Category", "Phone", "Last Seen", "Consecutive Absences"]
    const rows = filtered.map((m) => [
      m.name,
      categoryLabels[m.category],
      m.phone ?? "",
      m.lastSeen ? new Date(m.lastSeen).toLocaleDateString("en-GB") : "Never recorded",
      String(m.consecutiveAbsences),
    ])

    const csv = [headers, ...rows]
      .map((row) => row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(","))
      .join("\n")

    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `absent-members-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex gap-1">
          {(["all", "lambs", "teens", "youth", "congregation"] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                filter === cat
                  ? "bg-[#1a2744] text-white"
                  : "bg-white border border-stone-200 text-stone-600 hover:border-stone-400"
              }`}
            >
              {cat === "all" ? "All" : categoryLabels[cat]}
            </button>
          ))}
        </div>
        <button onClick={exportCsv} className="admin-btn-secondary text-xs">
          Export CSV
        </button>
      </div>

      {filtered.length === 0 ? (
        <div className="py-12 text-center border-2 border-dashed border-stone-200 rounded-xl">
          <p className="text-sm text-stone-400 italic">
            No members have missed 3 consecutive Sundays. Good standing across the board.
          </p>
        </div>
      ) : (
        <div className="bg-white border border-stone-200 rounded-xl overflow-hidden">
          <div className="grid grid-cols-[1fr_100px_130px_140px] gap-4 px-5 py-3 bg-stone-50 border-b border-stone-100">
            {["Name", "Category", "Phone", "Last Seen"].map((h) => (
              <span key={h} className="text-xs font-semibold tracking-[0.08em] uppercase text-stone-400">
                {h}
              </span>
            ))}
          </div>
          {filtered.map((m, i) => (
            <div
              key={`${m.category}-${m.id}`}
              className={`grid grid-cols-[1fr_100px_130px_140px] gap-4 items-center px-5 py-3.5 ${
                i > 0 ? "border-t border-stone-100" : ""
              }`}
            >
              <p className="text-sm font-medium text-stone-900">{m.name}</p>
              <span className={`status-badge badge-${m.category} w-fit`}>
                {categoryLabels[m.category]}
              </span>
              <span className="text-xs text-stone-500">{m.phone || "—"}</span>
              <span className="text-xs text-stone-500">
                {m.lastSeen
                  ? new Date(m.lastSeen).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
                  : "Never recorded"}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
