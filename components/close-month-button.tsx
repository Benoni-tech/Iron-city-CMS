"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

export default function CloseMonthButton() {
  const router = useRouter()
  const [closing, setClosing] = useState(false)
  const [error, setError] = useState("")

  const now = new Date()
  const monthLabel = now.toLocaleDateString("en-GB", { month: "long", year: "numeric" })

  async function handleClose() {
    if (
      !window.confirm(
        `Close ${monthLabel}? This locks all records for the month and generates the summary report.`
      )
    )
      return

    setError("")
    setClosing(true)

    try {
      const res = await fetch("/api/admin/finance/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          year: now.getFullYear(),
          month: now.getMonth() + 1,
        }),
      })

      if (!res.ok) throw new Error((await res.json()).error ?? "Failed to close month")

      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to close month")
    } finally {
      setClosing(false)
    }
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button onClick={handleClose} disabled={closing} className="admin-btn-gold">
        {closing ? "Closing..." : `Close ${monthLabel}`}
      </button>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
}
