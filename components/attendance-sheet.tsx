"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import type { MemberCategory, MemberRef } from "@/types"

interface AttendanceSheetProps {
  sessionId: string
  membersByCategory: Record<MemberCategory, MemberRef[]>
  existingPresent?: Set<string>
}

const categoryLabels: Record<MemberCategory, string> = {
  lambs: "Lambs (4–10)",
  teens: "Teens (11–16)",
  youth: "Youth",
  congregation: "Congregation",
}

const categories: MemberCategory[] = ["lambs", "teens", "youth", "congregation"]

export default function AttendanceSheet({
  sessionId,
  membersByCategory,
  existingPresent,
}: AttendanceSheetProps) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<MemberCategory>("congregation")
  const [present, setPresent] = useState<Set<string>>(existingPresent ?? new Set())
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [search, setSearch] = useState("")

  function toggle(memberId: string) {
    setPresent((prev) => {
      const next = new Set(prev)
      if (next.has(memberId)) next.delete(memberId)
      else next.add(memberId)
      return next
    })
  }

  function markAllVisible(category: MemberCategory, value: boolean) {
    const members = membersByCategory[category]
    setPresent((prev) => {
      const next = new Set(prev)
      members.forEach((m) => {
        if (value) next.add(m.id)
        else next.delete(m.id)
      })
      return next
    })
  }

  async function handleSave() {
    setError("")
    setSaving(true)

    try {
      const records = categories.flatMap((cat) =>
        membersByCategory[cat].map((m) => ({
          memberId: m.id,
          memberCategory: cat,
          memberName: m.name,
          present: present.has(m.id),
        }))
      )

      const res = await fetch(`/api/admin/attendance/${sessionId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ records }),
      })

      if (!res.ok) throw new Error((await res.json()).error ?? "Save failed")

      setSuccess("Attendance saved.")
      setTimeout(() => router.push("/admin/attendance"), 1200)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed")
    } finally {
      setSaving(false)
    }
  }

  const activeMembers = membersByCategory[activeTab].filter((m) =>
    m.name.toLowerCase().includes(search.toLowerCase())
  )

  const presentCountByCategory = (cat: MemberCategory) =>
    membersByCategory[cat].filter((m) => present.has(m.id)).length

  const totalPresent = categories.reduce((sum, cat) => sum + presentCountByCategory(cat), 0)
  const totalMembers = categories.reduce((sum, cat) => sum + membersByCategory[cat].length, 0)

  return (
    <div>
      {/* Summary bar */}
      <div className="flex items-center justify-between bg-[#1a2744] text-white rounded-xl px-6 py-4 mb-6">
        <div>
          <p className="text-2xl font-display font-bold">{totalPresent}</p>
          <p className="text-xs text-white/60">of {totalMembers} present</p>
        </div>
        <div className="flex items-center gap-3">
          {error && <p className="text-xs text-red-300">{error}</p>}
          {success && <p className="text-xs text-green-300">{success}</p>}
          <button onClick={handleSave} disabled={saving} className="admin-btn-gold">
            {saving ? "Saving..." : "Save Attendance"}
          </button>
        </div>
      </div>

      {/* Category tabs */}
      <div className="flex gap-1 mb-4 overflow-x-auto">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveTab(cat)}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              activeTab === cat
                ? "bg-[#1a2744] text-white"
                : "bg-white border border-stone-200 text-stone-600 hover:border-stone-400"
            }`}
          >
            {categoryLabels[cat]}{" "}
            <span className="opacity-70">
              ({presentCountByCategory(cat)}/{membersByCategory[cat].length})
            </span>
          </button>
        ))}
      </div>

      {/* Search and bulk actions */}
      <div className="flex items-center gap-3 mb-4">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="admin-input flex-1"
          placeholder={`Search ${categoryLabels[activeTab]}...`}
        />
        <button
          onClick={() => markAllVisible(activeTab, true)}
          className="admin-btn-secondary text-xs whitespace-nowrap"
        >
          Mark all present
        </button>
        <button
          onClick={() => markAllVisible(activeTab, false)}
          className="admin-btn-secondary text-xs whitespace-nowrap"
        >
          Clear
        </button>
      </div>

      {/* Member list */}
      <div className="bg-white border border-stone-200 rounded-xl overflow-hidden">
        {activeMembers.length === 0 ? (
          <p className="p-6 text-sm text-stone-400 italic text-center">
            No members found in this category.
          </p>
        ) : (
          activeMembers.map((member) => (
            <label
              key={member.id}
              className="attendance-row px-5 cursor-pointer hover:bg-stone-50 transition-colors"
            >
              <span className="text-sm text-stone-800">{member.name}</span>
              <input
                type="checkbox"
                checked={present.has(member.id)}
                onChange={() => toggle(member.id)}
                className="w-5 h-5 rounded accent-[#1a2744] cursor-pointer"
              />
            </label>
          ))
        )}
      </div>
    </div>
  )
}
