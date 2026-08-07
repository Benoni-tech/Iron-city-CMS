import { getFinancialPeriods } from "@/lib/firestore"
import { buildFinanceChartData } from "@/lib/finance-reports"
import { IncomeExpenditureChart } from "@/components/finance-chart"
import CloseMonthButton from "@/components/close-month-button"
import FinanceExportPanel from "@/components/finance-export-panel"
import { getTenantSession } from "@/lib/auth"

export default async function FinanceReportsPage() {
  const { tenantId } = await getTenantSession()
  const periods = await getFinancialPeriods(tenantId)
  const chartData = buildFinanceChartData(periods)

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display font-bold text-3xl text-[#1a2744]">Financial Reports</h1>
          <p className="text-sm text-stone-400 mt-1">Income vs expenditure over time</p>
        </div>
        <div className="flex items-start gap-4">
          <FinanceExportPanel />
          <CloseMonthButton />
        </div>
      </div>

      <div className="bg-white border border-stone-200 rounded-xl p-6 mb-8">
        <h2 className="font-semibold text-[#1a2744] text-sm mb-4">Monthly Trend</h2>
        <IncomeExpenditureChart data={chartData} />
      </div>

      {periods.length === 0 ? (
        <div className="py-12 text-center border-2 border-dashed border-stone-200 rounded-xl">
          <p className="text-sm text-stone-400 italic">
            No periods closed yet. Close the current month to generate the first report.
          </p>
        </div>
      ) : (
        <p className="text-xs text-stone-400">
          View individual period breakdowns from the{" "}
          <a href="/admin/finance" className="text-[#1a2744] underline">finance overview</a>.
        </p>
      )}
    </div>
  )
}
