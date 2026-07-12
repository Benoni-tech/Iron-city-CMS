"use client"

import { useState } from "react"
import type { MemberRef } from "@/types"

interface GuardianLinkSearchProps {
  onSelect: (member: MemberRef) => void
  label?: string
}

export default function GuardianLinkSearch({
  onSelect,
  label = "Link to existing member",
}: GuardianLinkSearchProps) {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<MemberRef[]>([])
  const [searching, setSearching] = useState(false)
  const [searched, setSearched] = useState(false)

  async function handleSearch() {
    if (query.trim().length < 2) return
    setSearching(true)
    setSearched(false)
    try {
      const res = await fetch(
        `/api/admin/members/search?q=${encodeURIComponent(query)}`
      )
      const { members } = await res.json()
      setResults(members ?? [])
      setSearched(true)
    } finally {
      setSearching(false)
    }
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === "Enter") {
      e.preventDefault()
      handleSearch()
    }
  }

  return (
    <div className="border border-stone-200 rounded-xl p-4 bg-stone-50">
      <p className="text-xs font-semibold tracking-[0.08em] uppercase text-stone-500 mb-3">
        {label}
      </p>
      <div className="flex gap-2">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKey}
          className="admin-input flex-1"
          placeholder="Search by name or phone number"
        />
        <button
          type="button"
          onClick={handleSearch}
          disabled={searching || query.trim().length < 2}
          className="admin-btn-secondary text-xs shrink-0"
        >
          {searching ? "..." : "Search"}
        </button>
      </div>

      {searched && results.length === 0 && (
        <p className="text-xs text-stone-400 mt-3 italic">
          No matching members found. You can still fill in the guardian details manually.
        </p>
      )}

      {results.length > 0 && (
        <ul className="mt-3 space-y-2">
          {results.map((member) => (
            <li key={`${member.category}-${member.id}`}>
              <button
                type="button"
                onClick={() => {
                  onSelect(member)
                  setQuery("")
                  setResults([])
                  setSearched(false)
                }}
                className="w-full text-left flex items-center justify-between px-3 py-2.5 bg-white border border-stone-200 rounded-lg hover:border-[#1a2744] transition-colors"
              >
                <div>
                  <p className="text-sm font-medium text-stone-900">{member.name}</p>
                  {member.phone && (
                    <p className="text-xs text-stone-400">{member.phone}</p>
                  )}
                </div>
                <span
                  className={`status-badge badge-${member.category} shrink-0`}
                >
                  {member.category}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
