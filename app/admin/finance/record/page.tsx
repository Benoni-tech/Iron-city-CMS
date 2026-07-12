"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import type { FinanceType, IncomeCategory, ExpenditureCategory } from "@/types"

const incomeCategories: { value: IncomeCategory; label: string }[] = [
  { value: "tithe", label: "Tithe" },
  { value: "offering", label: "Offering" },
  { value: "special_collection", label: "Special Collection" },
  { value: "building_fund", label: "Building Fund" },
  { value: "missions", label: "Missions" },
  { value: "other", label: "Other" },
]

const expenditureCategories: { value: ExpenditureCategory; label: string }[] = [
  { value: "utilities", label: "Utilities" },
  { value: "maintenance", label: "Maintenance" },
  { value: "staff", label: "Staff" },
  { value: "missions_support", label: "Missions Support" },
  { value: "programmes", label: "Programmes" },
  { value: "other", label: "Other" },
]

function TagIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-4 h-4">
      <path d="M12.59 2.59 20 10l-8 8-9-9V2h7l2.59.59Z" strokeLinejoin="round" />
      <circle cx="6.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  )
}
function CalendarIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-4 h-4">
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M3 10h18M8 3v4M16 3v4" strokeLinecap="round" />
    </svg>
  )
}
function CoinIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-4 h-4">
      <circle cx="12" cy="12" r="9" />
      <path d="M9.5 15.5c0 1 1 1.5 2.5 1.5s2.5-.6 2.5-1.6c0-2.4-5-1.2-5-3.6 0-1 1-1.6 2.5-1.6s2.5.5 2.5 1.5" strokeLinecap="round" />
    </svg>
  )
}
function NoteIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-4 h-4">
      <path d="M6 3h9l5 5v13a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z" strokeLinejoin="round" />
      <path d="M14 3v5h5M8 12h8M8 16h5" strokeLinecap="round" />
    </svg>
  )
}
function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3.5 h-3.5">
      <path d="M5 12.5 9.5 17 19 7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export default function NewFinanceRecordPage() {
  const router = useRouter()
  const [type, setType] = useState<FinanceType>("income")
  const [category, setCategory] = useState<string>("offering")
  const [amount, setAmount] = useState("")
  const [description, setDescription] = useState("")
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  function handleTypeChange(newType: FinanceType) {
    setType(newType)
    setCategory(newType === "income" ? "offering" : "utilities")
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const amountNum = parseFloat(amount)
    if (!amountNum || amountNum <= 0) {
      setError("Enter a valid amount.")
      return
    }
    setError("")
    setSaving(true)

    try {
      const res = await fetch("/api/admin/finance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          category,
          amount: amountNum,
          description,
          date,
        }),
      })

      if (!res.ok) throw new Error((await res.json()).error ?? "Save failed")

      setSuccess("Record saved.")
      setAmount("")
      setDescription("")
      setTimeout(() => setSuccess(""), 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed")
    } finally {
      setSaving(false)
    }
  }

  const categories = type === "income" ? incomeCategories : expenditureCategories

  // Presentational only — reflects form completeness for the checklist panel
  const amountValid = !!amount && parseFloat(amount) > 0
  const steps = [
    { label: "Entry type selected", detail: type === "income" ? "Income" : "Expenditure", done: true },
    { label: "Category & amount", detail: amountValid ? `${categories.find((c) => c.value === category)?.label}` : "Pending", done: amountValid },
    { label: "Ready to save", detail: amountValid ? "All set" : "Add an amount", done: amountValid },
  ]

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="font-display font-bold text-3xl text-[#1a2744]">Add Finance Record</h1>
        <p className="text-sm text-stone-400 mt-1">Log a new income or expenditure entry.</p>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-[1fr_320px] gap-6 items-start">
        {/* Left panel — record details */}
        <div className="bg-white border border-stone-200 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-semibold text-[#1a2744] text-sm">Record Details</h2>
          </div>

          {/* Type segmented control */}
          <div className="flex gap-1 p-1 bg-stone-100 rounded-xl mb-5">
            <button
              type="button"
              onClick={() => handleTypeChange("income")}
              className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-colors ${
                type === "income" ? "bg-green-600 text-white shadow-sm" : "text-stone-500 hover:text-stone-700"
              }`}
            >
              Income
            </button>
            <button
              type="button"
              onClick={() => handleTypeChange("expenditure")}
              className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-colors ${
                type === "expenditure" ? "bg-red-600 text-white shadow-sm" : "text-stone-500 hover:text-stone-700"
              }`}
            >
              Expenditure
            </button>
          </div>

          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-3 border border-stone-200 rounded-xl px-4 py-2.5 focus-within:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-100 transition-colors">
                <span className="w-8 h-8 shrink-0 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <TagIcon />
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-stone-400">Category</p>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-transparent text-sm font-medium text-stone-800 outline-none"
                  >
                    {categories.map((c) => (
                      <option key={c.value} value={c.value}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-3 border border-stone-200 rounded-xl px-4 py-2.5 focus-within:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-100 transition-colors">
                <span className="w-8 h-8 shrink-0 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <CalendarIcon />
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-stone-400">Date</p>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-transparent text-sm font-medium text-stone-800 outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 border border-stone-200 rounded-xl px-4 py-2.5 focus-within:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-100 transition-colors">
              <span className="w-8 h-8 shrink-0 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <CoinIcon />
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-stone-400">Amount (GHS)</p>
                <input
                  type="number"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full bg-transparent text-sm font-medium text-stone-800 outline-none"
                  placeholder="0.00"
                />
              </div>
            </div>

            <div className="flex gap-3 border border-stone-200 rounded-xl px-4 py-2.5 focus-within:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-100 transition-colors">
              <span className="w-8 h-8 shrink-0 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center mt-0.5">
                <NoteIcon />
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-stone-400 mb-0.5">Description</p>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-transparent text-sm font-medium text-stone-800 outline-none resize-none"
                  rows={3}
                  placeholder="Optional notes"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right panel — checklist + summary + actions */}
        <div className="space-y-4">
          <div className="bg-white border border-stone-200 rounded-2xl p-5">
            <h3 className="text-xs font-semibold uppercase tracking-[0.08em] text-stone-400 mb-4">Progress</h3>
            <div className="space-y-2">
              {steps.map((step, i) => (
                <div
                  key={step.label}
                  className={`flex items-center gap-3 rounded-xl border px-3.5 py-3 transition-colors ${
                    step.done
                      ? "border-stone-200 bg-white"
                      : "border-indigo-200 bg-indigo-50/60"
                  }`}
                >
                  <span
                    className={`w-5 h-5 shrink-0 rounded-full flex items-center justify-center ${
                      step.done ? "bg-green-100 text-green-600" : "border-2 border-indigo-300 text-indigo-400 text-[10px] font-bold"
                    }`}
                  >
                    {step.done ? <CheckIcon /> : i + 1}
                  </span>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-stone-700 truncate">{step.label}</p>
                    <p className="text-[11px] text-stone-400 truncate">{step.detail}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-4 border-t border-stone-100">
              <p className="text-[11px] leading-relaxed text-stone-400">
                Records post immediately to this month&apos;s totals and update the Finance overview in real time.
              </p>
            </div>
          </div>

          {error && (
            <p className="text-xs font-medium text-red-600 bg-red-50 border border-red-100 rounded-xl px-3.5 py-2.5">
              {error}
            </p>
          )}
          {success && (
            <p className="text-xs font-medium text-green-700 bg-green-50 border border-green-100 rounded-xl px-3.5 py-2.5">
              {success}
            </p>
          )}

          <div className="space-y-2">
            <button
              type="submit"
              disabled={saving}
              className="w-full py-3 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 shadow-sm shadow-indigo-200 transition-colors"
            >
              {saving ? "Saving..." : "Save Record"}
            </button>
            <button
              type="button"
              onClick={() => router.push("/admin/finance")}
              className="w-full py-3 rounded-xl text-sm font-semibold text-stone-500 border border-stone-200 hover:bg-stone-50 transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}