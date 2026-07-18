"use client"

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts"

interface AttendancePoint {
  label: string
  present: number
}

export default function AttendanceChart({ data }: { data: AttendancePoint[] }) {
  if (data.length === 0) {
    return (
      <div className="flex h-56 items-center justify-center text-sm text-stone-400 italic">
        No attendance data yet.
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
        <CartesianGrid vertical={false} stroke="#f0efec" />
        <XAxis
          dataKey="label"
          tick={{ fontSize: 11, fill: "#a8a29e" }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis tick={{ fontSize: 11, fill: "#a8a29e" }} axisLine={false} tickLine={false} />
        <Tooltip
          cursor={{ fill: "#f5f4f1" }}
          contentStyle={{
            borderRadius: 8,
            border: "1px solid #e7e5e4",
            fontSize: 12,
          }}
        />
        <Bar dataKey="present" name="Present" fill="#1a2744" radius={[4, 4, 0, 0]} maxBarSize={28} />
      </BarChart>
    </ResponsiveContainer>
  )
}