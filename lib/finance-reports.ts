import type {
  FinancialRecord,
  FinancialPeriod,
  IncomeCategory,
  ExpenditureCategory,
  FinanceChartPoint,
} from "@/types"
import { getFinancialRecordsByMonth, saveFinancialPeriod } from "./firestore"

const INCOME_CATEGORIES: IncomeCategory[] = [
  "tithe",
  "offering",
  "special_collection",
  "building_fund",
  "missions",
  "other",
]

const EXPENDITURE_CATEGORIES: ExpenditureCategory[] = [
  "utilities",
  "maintenance",
  "staff",
  "missions_support",
  "programmes",
  "other",
]

export async function generateMonthlyPeriod(
  year: number,
  month: number,
  closedBy: string
): Promise<FinancialPeriod> {
  const records = await getFinancialRecordsByMonth(year, month)

  const incomeBreakdown = Object.fromEntries(
    INCOME_CATEGORIES.map((cat) => [cat, 0])
  ) as Record<IncomeCategory, number>

  const expenditureBreakdown = Object.fromEntries(
    EXPENDITURE_CATEGORIES.map((cat) => [cat, 0])
  ) as Record<ExpenditureCategory, number>

  let totalIncome = 0
  let totalExpenditure = 0

  for (const record of records) {
    if (record.type === "income") {
      totalIncome += record.amount
      const cat = record.category as IncomeCategory
      incomeBreakdown[cat] = (incomeBreakdown[cat] ?? 0) + record.amount
    } else {
      totalExpenditure += record.amount
      const cat = record.category as ExpenditureCategory
      expenditureBreakdown[cat] = (expenditureBreakdown[cat] ?? 0) + record.amount
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

export function buildIncomeCategoryData(
  period: FinancialPeriod
): { name: string; value: number }[] {
  const labels: Record<IncomeCategory, string> = {
    tithe: "Tithe",
    offering: "Offering",
    special_collection: "Special Collection",
    building_fund: "Building Fund",
    missions: "Missions",
    other: "Other",
  }
  return INCOME_CATEGORIES
    .filter((cat) => period.incomeBreakdown[cat] > 0)
    .map((cat) => ({
      name: labels[cat],
      value: period.incomeBreakdown[cat],
    }))
}

export function buildExpenditureCategoryData(
  period: FinancialPeriod
): { name: string; value: number }[] {
  const labels: Record<ExpenditureCategory, string> = {
    utilities: "Utilities",
    maintenance: "Maintenance",
    staff: "Staff",
    missions_support: "Missions Support",
    programmes: "Programmes",
    other: "Other",
  }
  return EXPENDITURE_CATEGORIES
    .filter((cat) => period.expenditureBreakdown[cat] > 0)
    .map((cat) => ({
      name: labels[cat],
      value: period.expenditureBreakdown[cat],
    }))
}

export function formatGHS(amount: number): string {
  return new Intl.NumberFormat("en-GH", {
    style: "currency",
    currency: "GHS",
    minimumFractionDigits: 2,
  }).format(amount)
}
