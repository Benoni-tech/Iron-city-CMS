import { getWeeklyAttendanceStats } from "@/lib/firestore"
import { getAbsentMembers } from "@/lib/attendance"
import AttendanceChart from "@/components/attendance-chart"
import AbsenceReport from "@/components/absence-report"
import type { AttendanceChartPoint, ServiceType } from "@/types"
import { SERVICE_TYPE_LABELS } from "@/types"

function buildWeeklyChartData(
  stats: { date: string; serviceType: ServiceType; total: number }[]
): AttendanceChartPoint[] {
  const grouped = new Map<string, AttendanceChartPoint>()

  for (const stat of stats) {
    const label = new Date(stat.date).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
    })

    if (!grouped.has(stat.date)) {
      grouped.set(stat.date, {
        label,
        lambs: 0,
        teens: 0,
        youth: 0,
        congregation: 0,
        total: 0,
      })
    }

    const point = grouped.get(stat.date)!
    point.total += stat.total
  }

  return Array.from(grouped.values()).sort((a, b) => a.label.localeCompare(b.label))
}

export default async function AttendanceReportsPage() {
  const [weeklyStats, absentMembers] = await Promise.all([
    getWeeklyAttendanceStats(8),
    getAbsentMembers(),
  ])

  const chartData = buildWeeklyChartData(weeklyStats)

  const byServiceType = weeklyStats.reduce<Record<string, number>>((acc, stat) => {
    acc[stat.serviceType] = (acc[stat.serviceType] ?? 0) + stat.total
    return acc
  }, {})

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <h1 className="font-display font-bold text-3xl text-[#1a2744] mb-2">
        Attendance Reports
      </h1>
      <p className="text-sm text-stone-400 mb-8">
        Weekly trends and absence tracking across all membership categories
      </p>

      {/* Service type totals */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        {(Object.keys(SERVICE_TYPE_LABELS) as ServiceType[]).map((type) => (
          <div key={type} className="bg-white border border-stone-200 rounded-xl p-4">
            <p className="text-xs text-stone-400 mb-1">{SERVICE_TYPE_LABELS[type]}</p>
            <p className="font-display font-bold text-2xl text-[#1a2744]">
              {byServiceType[type] ?? 0}
            </p>
            <p className="text-[10px] text-stone-400">last 8 weeks total</p>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div className="bg-white border border-stone-200 rounded-xl p-6 mb-8">
        <h2 className="font-semibold text-[#1a2744] text-sm mb-4">
          Total Attendance — Last 8 Weeks
        </h2>
        <AttendanceChart data={chartData} view="line" />
      </div>

      {/* Absence report */}
      <div>
        <h2 className="font-semibold text-[#1a2744] text-sm mb-4">
          Members Absent — 3+ Consecutive Sundays
        </h2>
        <AbsenceReport members={absentMembers} />
      </div>
    </div>
  )
}
