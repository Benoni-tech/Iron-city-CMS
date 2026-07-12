"use client"

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts"
import type { FinanceChartPoint } from "@/types"
import { formatGHS } from "@/lib/finance-reports"

const PIE_COLORS = [
  "#1a2744", "#c9a84c", "#2563eb", "#16a34a", "#dc2626", "#7c3aed",
]

interface IncomeExpenditureChartProps {
  data: FinanceChartPoint[]
}

export function IncomeExpenditureChart({ data }: IncomeExpenditureChartProps) {
  if (data.length === 0) {
    return (
      <div className="h-72 flex items-center justify-center">
        <p className="text-sm text-stone-400 italic">No financial periods closed yet.</p>
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={320}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#78716c" }} />
        <YAxis
          tick={{ fontSize: 11, fill: "#78716c" }}
          tickFormatter={(v) => `₵${v}`}
        />
        <Tooltip
          formatter={(value: number) => formatGHS(value)}
          contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e7e5e4" }}
        />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        <Bar dataKey="income" fill="#16a34a" name="Income" radius={[4, 4, 0, 0]} />
        <Bar dataKey="expenditure" fill="#dc2626" name="Expenditure" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}

interface CategoryPieChartProps {
  data: { name: string; value: number }[]
}

export function CategoryPieChart({ data }: CategoryPieChartProps) {
  if (data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center">
        <p className="text-sm text-stone-400 italic">No records this period.</p>
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={260}>
      <PieChart>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          outerRadius={90}
          label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
          labelLine={false}
        >
          {data.map((_, i) => (
            <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
          ))}
        </Pie>
        <Tooltip formatter={(value: number) => formatGHS(value)} />
      </PieChart>
    </ResponsiveContainer>
  )
}
