import type { FinancialPeriod, FinanceChartPoint } from "@/types"
import { getFinancialRecordsByMonth, saveFinancialPeriod, getFinanceCategories } from "./firestore"

export async function generateMonthlyPeriod(
  year: number,
  month: number,
  closedBy: string
): Promise<FinancialPeriod> {
  const records = await getFinancialRecordsByMonth(year, month)

  const incomeBreakdown: Record<string, number> = {}
  const expenditureBreakdown: Record<string, number> = {}

  let totalIncome = 0
  let totalExpenditure = 0

  for (const record of records) {
    if (record.type === "income") {
      totalIncome += record.amount
      incomeBreakdown[record.category] = (incomeBreakdown[record.category] ?? 0) + record.amount
    } else {
      totalExpenditure += record.amount
      expenditureBreakdown[record.category] = (expenditureBreakdown[record.category] ?? 0) + record.amount
    }
  }

  const period: FinancialPeriod = {
    id: `${year}-${String(month).padStart(2, "0")}`,
    year,
    month,
    totalIncome,
    totalExpenditure,
    netBalance: totalIncome - totalExpenditure,
    incomeBreakdown,
    expenditureBreakdown,
    closedAt: new Date().toISOString(),
    closedBy,
  }

  await saveFinancialPeriod(period)
  return period
}

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

async function buildCategoryData(
  breakdown: Record<string, number>,
  type: "income" | "expenditure"
): Promise<{ name: string; value: number }[]> {
  const categories = await getFinanceCategories(type, false)
  const labels = new Map(categories.map((c) => [c.id, c.name]))

  return Object.entries(breakdown)
    .filter(([, value]) => value > 0)
    .map(([id, value]) => ({
      name: labels.get(id) ?? id,
      value,
    }))
}

export async function buildIncomeCategoryData(
  period: FinancialPeriod
): Promise<{ name: string; value: number }[]> {
  return buildCategoryData(period.incomeBreakdown, "income")
}

export async function buildExpenditureCategoryData(
  period: FinancialPeriod
): Promise<{ name: string; value: number }[]> {
  return buildCategoryData(period.expenditureBreakdown, "expenditure")
}

export function formatGHS(amount: number): string {
  return new Intl.NumberFormat("en-GH", {
    style: "currency",
    currency: "GHS",
    minimumFractionDigits: 2,
  }).format(amount)
}
