"use client"

import { useState } from "react"

type RangeMode = "this_week" | "custom"

export default function FinanceExportPanel() {
  const [mode, setMode] = useState<RangeMode>("this_week")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [exporting, setExporting] = useState(false)
  const [error, setError] = useState("")

  async function handleExport() {
    if (mode === "custom" && (!startDate || !endDate)) {
      setError("Select a start and end date.")
      return
    }
    setError("")
    setExporting(true)

    try {
      const params = new URLSearchParams(
        mode === "this_week" ? { preset: "this_week" } : { startDate, endDate }
      )
      const res = await fetch(`/api/admin/finance/export?${params.toString()}`)
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error ?? "Export failed")
      }

      const disposition = res.headers.get("Content-Disposition") ?? ""
      const filenameMatch = disposition.match(/filename="(.+)"/)
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = filenameMatch?.[1] ?? "finance-report.xlsx"
      document.body.appendChild(link)
      link.click()
      link.remove()
      URL.revokeObjectURL(url)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Export failed")
    } finally {
      setExporting(false)
    }
  }

  return (
    <div className="flex flex-col items-end gap-1.5">
      <div className="flex items-center gap-2">
        <div className="flex gap-1 p-1 bg-stone-100 rounded-lg">
          <button
            type="button"
            onClick={() => setMode("this_week")}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
              mode === "this_week" ? "bg-white text-[#1a2744] shadow-sm" : "text-stone-500 hover:text-stone-700"
            }`}
          >
            This Week
          </button>
          <button
            type="button"
            onClick={() => setMode("custom")}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
              mode === "custom" ? "bg-white text-[#1a2744] shadow-sm" : "text-stone-500 hover:text-stone-700"
            }`}
          >
            Custom Range
          </button>
        </div>

        {mode === "custom" && (
          <div className="flex items-center gap-1.5">
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="text-xs border border-stone-200 rounded-lg px-2 py-1.5 outline-none focus:border-indigo-400"
            />
            <span className="text-xs text-stone-400">to</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="text-xs border border-stone-200 rounded-lg px-2 py-1.5 outline-none focus:border-indigo-400"
            />
          </div>
        )}

        <button onClick={handleExport} disabled={exporting} className="admin-btn-gold">
          {exporting ? "Exporting..." : "Export to Excel"}
        </button>
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
}
