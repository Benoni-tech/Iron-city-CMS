"use client"

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts"

interface FinancePoint {
  label: string
  income: number
  expenditure: number
}

export default function FinanceTrendChart({ data }: { data: FinancePoint[] }) {
  if (data.length === 0) {
    return (
      <div className="flex h-56 items-center justify-center text-sm text-stone-400 italic">
        No finance data yet.
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <AreaChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="incomeFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#15803d" stopOpacity={0.25} />
            <stop offset="95%" stopColor="#15803d" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="expenditureFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#dc2626" stopOpacity={0.2} />
            <stop offset="95%" stopColor="#dc2626" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} stroke="#f0efec" />
        <XAxis
          dataKey="label"
          tick={{ fontSize: 11, fill: "#a8a29e" }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis tick={{ fontSize: 11, fill: "#a8a29e" }} axisLine={false} tickLine={false} />
        <Tooltip
          contentStyle={{
            borderRadius: 8,
            border: "1px solid #e7e5e4",
            fontSize: 12,
          }}
        />
        <Legend wrapperStyle={{ fontSize: 11 }} />
        <Area
          type="monotone"
          dataKey="income"
          name="Income"
          stroke="#15803d"
          fill="url(#incomeFill)"
          strokeWidth={2}
        />
        <Area
          type="monotone"
          dataKey="expenditure"
          name="Expenditure"
          stroke="#dc2626"
          fill="url(#expenditureFill)"
          strokeWidth={2}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}