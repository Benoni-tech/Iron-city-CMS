import Link from "next/link"
import { getFinancialRecords, getFinancialPeriods } from "@/lib/firestore"
import { formatGHS } from "@/lib/finance-reports"

export default async function FinanceOverviewPage() {
  const [recentRecords, periods] = await Promise.all([
    getFinancialRecords(undefined, 15),
    getFinancialPeriods(),
  ])

  const now = new Date()
  const thisMonthRecords = recentRecords.filter((r) => {
    const d = new Date(r.date)
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
  })

  const monthlyIncome = thisMonthRecords
    .filter((r) => r.type === "income")
    .reduce((sum, r) => sum + r.amount, 0)
  const monthlyExpenditure = thisMonthRecords
    .filter((r) => r.type === "expenditure")
    .reduce((sum, r) => sum + r.amount, 0)
  const netBalance = monthlyIncome - monthlyExpenditure

  const categoryLabels: Record<string, string> = {
    tithe: "Tithe",
    offering: "Offering",
    special_collection: "Special Collection",
    building_fund: "Building Fund",
    missions: "Missions",
    utilities: "Utilities",
    maintenance: "Maintenance",
    staff: "Staff",
    missions_support: "Missions Support",
    programmes: "Programmes",
    other: "Other",
  }

  // --- Derived data for donut chart: expenditure by category, this month ---
  const expenseByCategory: Record<string, number> = {}
  thisMonthRecords
    .filter((r) => r.type === "expenditure")
    .forEach((r) => {
      expenseByCategory[r.category] = (expenseByCategory[r.category] ?? 0) + r.amount
    })

  const donutColors = ["#4f46e5", "#7c3aed", "#a855f7", "#c4b5fd", "#e0e7ff"]
  const expenseEntries = Object.entries(expenseByCategory)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
  const expenseTotal = expenseEntries.reduce((sum, [, amt]) => sum + amt, 0)

  const radius = 70
  const circumference = 2 * Math.PI * radius
  let cumulative = 0
  const donutSegments = expenseEntries.map(([category, amount], i) => {
    const pct = expenseTotal > 0 ? amount / expenseTotal : 0
    const dasharray = `${pct * circumference} ${circumference}`
    const dashoffset = -(cumulative * circumference)
    cumulative += pct
    return {
      category,
      amount,
      pct,
      dasharray,
      dashoffset,
      color: donutColors[i % donutColors.length],
    }
  })

  // --- Derived data for bar chart: net balance trend across closed periods ---
  const trendPeriods = [...periods]
    .sort((a, b) => (a.year - b.year) || (a.month - b.month))
    .slice(-6)
  const maxTrendValue = Math.max(1, ...trendPeriods.map((p) => Math.max(p.totalIncome, p.totalExpenditure)))

  return (
    <div className="p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display font-bold text-3xl text-[#1a2744]">Finance</h1>
          <p className="text-sm text-stone-400 mt-1">
            {now.toLocaleDateString("en-GB", { month: "long", year: "numeric" })}
          </p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/admin/finance/reports"
            className="px-4 py-2.5 rounded-lg text-sm font-medium text-stone-600 border border-stone-200 hover:bg-stone-50 transition-colors"
          >
            Reports
          </Link>
          <Link
            href="/admin/finance/record"
            className="px-4 py-2.5 rounded-lg text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm shadow-indigo-200 transition-colors"
          >
            + Add Record
          </Link>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-white border border-stone-200 rounded-xl p-5">
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs text-stone-400">Income This Month</p>
            <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-green-50 text-green-700">
              Income
            </span>
          </div>
          <p className="font-display font-bold text-2xl text-green-700">{formatGHS(monthlyIncome)}</p>
        </div>

        <div className="bg-white border border-stone-200 rounded-xl p-5">
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs text-stone-400">Expenditure This Month</p>
            <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-red-50 text-red-600">
              Expenses
            </span>
          </div>
          <p className="font-display font-bold text-2xl text-red-600">{formatGHS(monthlyExpenditure)}</p>
        </div>

        <div className="relative overflow-hidden rounded-xl p-5 bg-gradient-to-br from-[#1a2744] to-indigo-900">
          <div className="absolute -right-6 -top-6 w-28 h-28 rounded-full bg-indigo-500/20 blur-2xl" />
          <p className="text-xs text-white/60 mb-1 relative">Net Balance</p>
          <p className="font-display font-bold text-2xl text-white relative">{formatGHS(netBalance)}</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-[1fr_1.3fr] gap-4 mb-8">
        {/* Donut: expenditure by category */}
        <div className="bg-white border border-stone-200 rounded-xl p-5">
          <h2 className="font-semibold text-[#1a2744] text-sm mb-4">Expenditure by Category</h2>
          {expenseEntries.length === 0 ? (
            <div className="py-10 text-center">
              <p className="text-sm text-stone-400 italic">No expenditure recorded this month.</p>
            </div>
          ) : (
            <div className="flex items-center gap-5">
              <svg viewBox="0 0 180 180" className="w-32 h-32 shrink-0 -rotate-90">
                {donutSegments.map((seg) => (
                  <circle
                    key={seg.category}
                    cx="90"
                    cy="90"
                    r={radius}
                    fill="none"
                    stroke={seg.color}
                    strokeWidth="20"
                    strokeDasharray={seg.dasharray}
                    strokeDashoffset={seg.dashoffset}
                  />
                ))}
              </svg>
              <div className="flex-1 space-y-2.5">
                {donutSegments.map((seg) => (
                  <div key={seg.category} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: seg.color }}
                      />
                      <span className="text-stone-600 truncate">
                        {categoryLabels[seg.category] ?? seg.category}
                      </span>
                    </div>
                    <span className="text-stone-400 shrink-0 ml-2">
                      {Math.round(seg.pct * 100)}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Bar chart: monthly trend across closed periods */}
        <div className="bg-white border border-stone-200 rounded-xl p-5">
          <h2 className="font-semibold text-[#1a2744] text-sm mb-4">Monthly Trend</h2>
          {trendPeriods.length === 0 ? (
            <div className="py-10 text-center">
              <p className="text-sm text-stone-400 italic">No closed periods yet.</p>
            </div>
          ) : (
            <div className="flex items-end justify-between gap-3 h-40">
              {trendPeriods.map((p) => {
                const incomeHeight = Math.max(4, (p.totalIncome / maxTrendValue) * 100)
                const expenseHeight = Math.max(4, (p.totalExpenditure / maxTrendValue) * 100)
                return (
                  <div key={p.id} className="flex-1 flex flex-col items-center gap-2">
                    <div className="w-full flex items-end justify-center gap-1 h-32">
                      <div
                        className="w-2.5 rounded-t-sm bg-indigo-600"
                        style={{ height: `${incomeHeight}%` }}
                        title={`Income: ${formatGHS(p.totalIncome)}`}
                      />
                      <div
                        className="w-2.5 rounded-t-sm bg-violet-200"
                        style={{ height: `${expenseHeight}%` }}
                        title={`Expenditure: ${formatGHS(p.totalExpenditure)}`}
                      />
                    </div>
                    <span className="text-[10px] text-stone-400">
                      {new Date(p.year, p.month - 1).toLocaleDateString("en-GB", { month: "short" })}
                    </span>
                  </div>
                )
              })}
            </div>
          )}
          <div className="flex items-center gap-4 mt-3 pt-3 border-t border-stone-100">
            <div className="flex items-center gap-1.5 text-[11px] text-stone-500">
              <span className="w-2 h-2 rounded-full bg-indigo-600" /> Income
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-stone-500">
              <span className="w-2 h-2 rounded-full bg-violet-200" /> Expenditure
            </div>
          </div>
        </div>
      </div>

      {/* Recent records */}
      <div className="mb-8">
        <h2 className="font-semibold text-[#1a2744] text-sm mb-4">Recent Records</h2>
        {recentRecords.length === 0 ? (
          <div className="py-12 text-center border-2 border-dashed border-stone-200 rounded-xl">
            <p className="text-sm text-stone-400 italic">No financial records yet.</p>
            <Link href="/admin/finance/record" className="text-sm text-indigo-600 underline mt-2 inline-block">
              Add the first record
            </Link>
          </div>
        ) : (
          <div className="bg-white border border-stone-200 rounded-xl overflow-hidden">
            <div className="grid grid-cols-[100px_1fr_120px_100px] gap-4 px-5 py-3 bg-[#1a2744]">
              {["Date", "Category / Description", "Type", "Amount"].map((h) => (
                <span key={h} className="text-[11px] font-semibold tracking-[0.08em] uppercase text-white/60">
                  {h}
                </span>
              ))}
            </div>
            {recentRecords.map((record, i) => (
              <div
                key={record.id}
                className={`grid grid-cols-[100px_1fr_120px_100px] gap-4 items-center px-5 py-3.5 ${
                  i > 0 ? "border-t border-stone-100" : ""
                }`}
              >
                <span className="text-xs text-stone-500">{record.date}</span>
                <div>
                  <p className="text-sm font-medium text-stone-900">
                    {categoryLabels[record.category] ?? record.category}
                  </p>
                  {record.description && (
                    <p className="text-xs text-stone-400 truncate">{record.description}</p>
                  )}
                </div>
                <span>
                  <span
                    className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                      record.type === "income"
                        ? "bg-green-50 text-green-700"
                        : "bg-red-50 text-red-600"
                    }`}
                  >
                    {record.type === "income" ? "Income" : "Expenditure"}
                  </span>
                </span>
                <span
                  className={`text-sm font-bold ${
                    record.type === "income" ? "text-green-700" : "text-red-600"
                  }`}
                >
                  {record.type === "income" ? "+" : "−"}
                  {formatGHS(record.amount)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Closed periods */}
      <div>
        <h2 className="font-semibold text-[#1a2744] text-sm mb-4">Closed Periods</h2>
        {periods.length === 0 ? (
          <p className="text-sm text-stone-400 italic">No periods closed yet.</p>
        ) : (
          <div className="bg-white border border-stone-200 rounded-xl overflow-hidden">
            {periods.map((period, i) => (
              <Link
                key={period.id}
                href={`/admin/finance/${period.id}`}
                className={`flex items-center justify-between px-5 py-3.5 hover:bg-indigo-50/50 transition-colors ${
                  i > 0 ? "border-t border-stone-100" : ""
                }`}
              >
                <span className="text-sm font-medium text-stone-900">
                  {new Date(period.year, period.month - 1).toLocaleDateString("en-GB", {
                    month: "long",
                    year: "numeric",
                  })}
                </span>
                <div className="flex items-center gap-6">
                  <span className="text-xs text-green-700">+{formatGHS(period.totalIncome)}</span>
                  <span className="text-xs text-red-600">−{formatGHS(period.totalExpenditure)}</span>
                  <span className="text-sm font-bold px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700">
                    {formatGHS(period.netBalance)}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}