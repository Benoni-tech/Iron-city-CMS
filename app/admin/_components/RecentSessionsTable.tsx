"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import type { ServiceSession } from "@/types"

type ServiceType =
  | "sunday_morning"
  | "sunday_evening"
  | "monday_bible"
  | "wednesday_prayer"
  | "special"

const TYPE_LABELS: Record<ServiceType, string> = {
  sunday_morning: "Sunday Morning",
  sunday_evening: "Sunday Evening",
  monday_bible: "Bible Study",
  wednesday_prayer: "Prayer Meeting",
  special: "Special",
}

const TYPE_COLORS: Record<ServiceType, string> = {
  sunday_morning: "bg-blue-100 text-blue-800",
  sunday_evening: "bg-indigo-100 text-indigo-800",
  monday_bible: "bg-purple-100 text-purple-800",
  wednesday_prayer: "bg-amber-100 text-amber-800",
  special: "bg-pink-100 text-pink-800",
}

const PAGE_SIZE = 6

const TABS: { key: ServiceType | "all"; label: string }[] = [
  { key: "all", label: "All Sessions" },
  { key: "sunday_morning", label: "Sunday Morning" },
  { key: "sunday_evening", label: "Sunday Evening" },
  { key: "monday_bible", label: "Bible Study" },
  { key: "wednesday_prayer", label: "Prayer Meeting" },
  { key: "special", label: "Special" },
]

export default function RecentSessionsTable({ sessions }: { sessions: ServiceSession[] }) {
  const [activeTab, setActiveTab] = useState<ServiceType | "all">("all")
  const [page, setPage] = useState(0)

  const filtered = useMemo(() => {
    if (activeTab === "all") return sessions
    return sessions.filter((s) => s.serviceType === activeTab)
  }, [sessions, activeTab])

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const currentPage = Math.min(page, pageCount - 1)
  const pageItems = filtered.slice(
    currentPage * PAGE_SIZE,
    currentPage * PAGE_SIZE + PAGE_SIZE
  )

  function selectTab(tab: ServiceType | "all") {
    setActiveTab(tab)
    setPage(0)
  }

  return (
    <div className="bg-white border border-stone-200 rounded-xl overflow-hidden">
      <div className="flex items-center justify-between px-6 pt-5">
        <h2 className="font-semibold text-[#1a2744] text-sm">Recent Service Sessions</h2>
        <Link
          href="/admin/attendance"
          className="text-xs text-stone-400 hover:text-[#1a2744] transition-colors"
        >
          View all →
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 px-6 mt-4 border-b border-stone-100 overflow-x-auto">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => selectTab(tab.key)}
            className={`whitespace-nowrap px-3 py-2 text-xs font-medium border-b-2 -mb-px transition-colors ${
              activeTab === tab.key
                ? "border-[#1a2744] text-[#1a2744]"
                : "border-transparent text-stone-400 hover:text-stone-600"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Table */}
      {pageItems.length === 0 ? (
        <p className="px-6 py-10 text-sm text-stone-400 italic text-center">
          No sessions in this category yet.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[11px] uppercase tracking-wide text-stone-400">
                <th className="px-6 py-3 font-medium">Date</th>
                <th className="px-6 py-3 font-medium">Type</th>
                <th className="px-6 py-3 font-medium">Title</th>
                <th className="px-6 py-3 font-medium">Conducted By</th>
                <th className="px-6 py-3 font-medium text-right">Present</th>
                <th className="px-6 py-3 font-medium text-right">&nbsp;</th>
              </tr>
            </thead>
            <tbody>
              {pageItems.map((session) => (
                <tr
                  key={session.id}
                  className="border-t border-stone-50 hover:bg-stone-50/60 transition-colors"
                >
                  <td className="px-6 py-3 text-stone-600 whitespace-nowrap">
                    {new Date(session.date).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </td>
                  <td className="px-6 py-3">
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap ${
                        TYPE_COLORS[session.serviceType as ServiceType]
                      }`}
                    >
                      {TYPE_LABELS[session.serviceType as ServiceType]}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-stone-800 font-medium truncate max-w-[200px]">
                    {session.title ?? "—"}
                  </td>
                  <td className="px-6 py-3 text-stone-500">{session.conductedBy}</td>
                  <td className="px-6 py-3 text-right font-semibold text-[#1a2744]">
                    {session.totalPresent}
                  </td>
                  <td className="px-6 py-3 text-right">
                    <Link
                      href={`/admin/attendance/${session.id}`}
                      className="text-xs text-stone-400 hover:text-[#1a2744] transition-colors"
                    >
                      View →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      <div className="flex items-center justify-between px-6 py-4 border-t border-stone-100">
        <p className="text-xs text-stone-400">
          Page {currentPage + 1} of {pageCount}
        </p>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={currentPage === 0}
            className="px-3 py-1.5 text-xs font-medium rounded-lg border border-stone-200 text-stone-500 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-stone-50 transition-colors"
          >
            Previous
          </button>
          <button
            onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))}
            disabled={currentPage >= pageCount - 1}
            className="px-3 py-1.5 text-xs font-medium rounded-lg border border-stone-200 text-stone-500 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-stone-50 transition-colors"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  )
}