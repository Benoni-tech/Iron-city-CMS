"use client"

import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts"
import type { AttendanceChartPoint } from "@/types"

interface AttendanceChartProps {
  data: AttendanceChartPoint[]
  view: "line" | "bar"
}

const COLORS = {
  lambs: "#db2777",
  teens: "#7c3aed",
  youth: "#2563eb",
  congregation: "#16a34a",
}

export default function AttendanceChart({ data, view }: AttendanceChartProps) {
  if (data.length === 0) {
    return (
      <div className="h-72 flex items-center justify-center">
        <p className="text-sm text-stone-400 italic">No attendance data yet.</p>
      </div>
    )
  }

  if (view === "bar") {
    return (
      <ResponsiveContainer width="100%" height={320}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#78716c" }} />
          <YAxis tick={{ fontSize: 11, fill: "#78716c" }} />
          <Tooltip
            contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e7e5e4" }}
          />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Bar dataKey="lambs" stackId="a" fill={COLORS.lambs} name="Lambs" />
          <Bar dataKey="teens" stackId="a" fill={COLORS.teens} name="Teens" />
          <Bar dataKey="youth" stackId="a" fill={COLORS.youth} name="Youth" />
          <Bar dataKey="congregation" stackId="a" fill={COLORS.congregation} name="Congregation" />
        </BarChart>
      </ResponsiveContainer>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={320}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#78716c" }} />
        <YAxis tick={{ fontSize: 11, fill: "#78716c" }} />
        <Tooltip
          contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e7e5e4" }}
        />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        <Line type="monotone" dataKey="total" stroke="#1a2744" strokeWidth={2.5} name="Total" dot={{ r: 3 }} />
      </LineChart>
    </ResponsiveContainer>
  )
}
