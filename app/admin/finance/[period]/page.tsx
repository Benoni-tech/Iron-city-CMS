import { notFound } from "next/navigation"
import { getFinancialPeriods } from "@/lib/firestore"
import { buildIncomeCategoryData, buildExpenditureCategoryData, formatGHS } from "@/lib/finance-reports"
import { CategoryPieChart } from "@/components/finance-chart"
import { getTenantSession } from "@/lib/auth"

interface PageProps {
  params: Promise<{ period: string }>
}

export default async function PeriodDetailPage({ params }: PageProps) {
  const { tenantId } = await getTenantSession()
  const { period: periodId } = await params
  const periods = await getFinancialPeriods(tenantId)
  const period = periods.find((p) => p.id === periodId)

  if (!period) notFound()

  const incomeData = await buildIncomeCategoryData(tenantId, period)
  const expenditureData = await buildExpenditureCategoryData(tenantId, period)

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <h1 className="font-display font-bold text-3xl text-[#1a2744] mb-2">
        {new Date(period.year, period.month - 1).toLocaleDateString("en-GB", {
          month: "long",
          year: "numeric",
        })}
      </h1>
      <p className="text-sm text-stone-400 mb-8">
        Closed {new Date(period.closedAt).toLocaleDateString("en-GB")}
      </p>

      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-white border border-stone-200 rounded-xl p-5">
          <p className="text-xs text-stone-400 mb-1">Total Income</p>
          <p className="font-display font-bold text-2xl text-green-700">
            {formatGHS(period.totalIncome)}
          </p>
        </div>
        <div className="bg-white border border-stone-200 rounded-xl p-5">
          <p className="text-xs text-stone-400 mb-1">Total Expenditure</p>
          <p className="font-display font-bold text-2xl text-red-600">
            {formatGHS(period.totalExpenditure)}
          </p>
        </div>
        <div className="bg-[#1a2744] rounded-xl p-5">
          <p className="text-xs text-white/60 mb-1">Net Balance</p>
          <p className="font-display font-bold text-2xl text-white">
            {formatGHS(period.netBalance)}
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white border border-stone-200 rounded-xl p-6">
          <h2 className="font-semibold text-[#1a2744] text-sm mb-4">Income Breakdown</h2>
          <CategoryPieChart data={incomeData} />
        </div>
        <div className="bg-white border border-stone-200 rounded-xl p-6">
          <h2 className="font-semibold text-[#1a2744] text-sm mb-4">Expenditure Breakdown</h2>
          <CategoryPieChart data={expenditureData} />
        </div>
      </div>
    </div>
  )
}
