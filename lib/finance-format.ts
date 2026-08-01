import type { FinancialPeriod, FinanceChartPoint } from "@/types"

export function buildFinanceChartData(
  periods: FinancialPeriod[]
): FinanceChartPoint[] {
  const monthNames = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ]

  return periods
    .slice()
    .sort((a, b) => a.year !== b.year ? a.year - b.year : a.month - b.month)
    .map((p) => ({
      label: `${monthNames[p.month - 1]} ${p.year}`,
      income: p.totalIncome,
      expenditure: p.totalExpenditure,
      net: p.netBalance,
    }))
}

export function formatGHS(amount: number): string {
  return new Intl.NumberFormat("en-GH", {
    style: "currency",
    currency: "GHS",
    minimumFractionDigits: 2,
  }).format(amount)
}
