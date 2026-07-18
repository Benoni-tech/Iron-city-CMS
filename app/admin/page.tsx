import Link from "next/link"
import {
  Baby,
  BookOpen,
  Sparkles,
  Users2,
  Users,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CalendarDays,
} from "lucide-react"
import { getSessionUser } from "@/lib/auth"
import {
  getMemberCounts,
  getMemberCountsAsOf,
  getServiceSessions,
  getWeeklyAttendanceStats,
  getUpcomingProgrammes,
  getFinancialRecordsByMonth,
} from "@/lib/firestore"
import { getAbsentMembers } from "@/lib/attendance"
import { formatGHS } from "@/lib/finance-reports"
import type { MemberCategory } from "@/types"
import DashboardTopBar from "./_components/DashboardTopBar"
import RecentSessionsTable from "./_components/RecentSessionsTable"
import AttendanceChart from "./_components/AttendanceChart"
import FinanceTrendChart from "./_components/FinanceTrendChart"

const categoryLabels: Record<MemberCategory, string> = {
  lambs: "Lambs",
  teens: "Teens",
  youth: "Youth",
  congregation: "Congregation",
}

const categoryIcons: Record<MemberCategory, typeof Baby> = {
  lambs: Baby,
  teens: BookOpen,
  youth: Sparkles,
  congregation: Users2,
}

const roleLabels: Record<string, string> = {
  super_admin: "Super Admin",
  contributor: "Contributor",
  viewer: "Viewer",
}

function trendPct(current: number, previous: number): number | null {
  if (previous === 0) return null
  return ((current - previous) / previous) * 100
}

// Groups sessions (which may include multiple service types per week) into
// one bar per calendar week, summing attendance across all services that week.
function buildWeeklyAttendance(
  stats: { date: string; total: number }[]
): { label: string; present: number }[] {
  const weekMap = new Map<string, number>()

  for (const s of stats) {
    const d = new Date(s.date)
    const dayIdx = (d.getDay() + 6) % 7 // Monday = 0 ... Sunday = 6
    const weekStart = new Date(d)
    weekStart.setDate(d.getDate() - dayIdx)
    const key = weekStart.toISOString().slice(0, 10)
    weekMap.set(key, (weekMap.get(key) ?? 0) + s.total)
  }

  return Array.from(weekMap.entries())
    .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
    .map(([weekStart, total]) => ({
      label: new Date(weekStart).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
      }),
      present: total,
    }))
}

function StatCard({
  icon: Icon,
  label,
  value,
  trend,
  dark = false,
  href,
}: {
  icon: typeof Baby
  label: string
  value: string
  trend: number | null
  dark?: boolean
  href?: string
}) {
  const trendUp = trend !== null && trend >= 0
  const content = (
    <div
      className={`rounded-xl p-5 border transition-colors h-full ${
        dark
          ? "bg-[#1a2744] border-[#1a2744] text-white"
          : "bg-white border-stone-200 hover:border-[#1a2744]"
      }`}
    >
      <div className="flex items-center justify-between">
        <span
          className={`flex h-8 w-8 items-center justify-center rounded-lg ${
            dark ? "bg-white/10" : "bg-stone-100"
          }`}
        >
          <Icon size={16} className={dark ? "text-white" : "text-[#1a2744]"} />
        </span>
        {trend !== null && (
          <span
            className={`flex items-center gap-0.5 text-[11px] font-semibold ${
              dark
                ? trendUp
                  ? "text-green-300"
                  : "text-red-300"
                : trendUp
                ? "text-green-600"
                : "text-red-500"
            }`}
          >
            {trendUp ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            {Math.abs(trend).toFixed(0)}%
          </span>
        )}
      </div>
      <p className={`font-display font-bold text-2xl mt-3 ${dark ? "text-white" : "text-[#1a2744]"}`}>
        {value}
      </p>
      <p className={`text-xs mt-0.5 ${dark ? "text-white/50" : "text-stone-400"}`}>{label}</p>
    </div>
  )

  return href ? <Link href={href}>{content}</Link> : content
}

export default async function AdminDashboard() {
  const user = await getSessionUser()
  if (!user) return null

  const isSuperAdmin = user.role === "super_admin"
  const isViewer = user.role === "viewer"

  const now = new Date()
  const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1)

  const [counts, previousCounts, sessions, weeklyStats, upcoming, absentMembers] =
    await Promise.all([
      getMemberCounts(),
      getMemberCountsAsOf(startOfThisMonth),
      getServiceSessions(20),
      getWeeklyAttendanceStats(8),
      getUpcomingProgrammes(3),
      isViewer ? Promise.resolve([]) : getAbsentMembers(),
    ])

  const totalMembers = Object.values(counts).reduce((a, b) => a + b, 0)
  const previousTotalMembers = Object.values(previousCounts).reduce((a, b) => a + b, 0)

  const financeHistory = isSuperAdmin
    ? await Promise.all(
        [5, 4, 3, 2, 1, 0].map(async (offset) => {
          const d = new Date(now.getFullYear(), now.getMonth() - offset, 1)
          const records = await getFinancialRecordsByMonth(d.getFullYear(), d.getMonth() + 1)
          const income = records
            .filter((r) => r.type === "income")
            .reduce((sum, r) => sum + r.amount, 0)
          const expenditure = records
            .filter((r) => r.type === "expenditure")
            .reduce((sum, r) => sum + r.amount, 0)
          return {
            label: d.toLocaleDateString("en-GB", { month: "short" }),
            income,
            expenditure,
          }
        })
      )
    : []

  const currentFinance = financeHistory[financeHistory.length - 1]
  const previousFinance = financeHistory[financeHistory.length - 2]
  const monthlyIncome = currentFinance?.income ?? 0
  const monthlyExpenditure = currentFinance?.expenditure ?? 0
  const netBalance = monthlyIncome - monthlyExpenditure
  const previousNet = previousFinance ? previousFinance.income - previousFinance.expenditure : 0

  const attendanceChartData = buildWeeklyAttendance(weeklyStats)

  const notifications = absentMembers.slice(0, 5).map((m) => ({
    id: `${m.category}-${m.id}`,
    label: m.name,
    sublabel: m.lastSeen ? `Last seen ${new Date(m.lastSeen).toLocaleDateString("en-GB")}` : undefined,
  }))

  const nextProgramme = upcoming[0]

  return (
    <div>
      <DashboardTopBar
        userEmail={user.email}
        roleLabel={roleLabels[user.role] ?? user.role}
        isSuperAdmin={isSuperAdmin}
        notifications={notifications}
      />

      <div className="p-6 md:p-8 max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="font-display font-bold text-3xl text-[#1a2744]">Dashboard</h1>
          <p className="text-sm text-stone-400 mt-1">
            {now.toLocaleDateString("en-GB", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
        </div>

        {!isViewer && absentMembers.length > 0 ? (
          <div className="mb-6 rounded-xl bg-gradient-to-r from-[#1a2744] to-[#2a3f66] px-6 py-4 flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 shrink-0">
                <AlertTriangle size={16} className="text-amber-300" />
              </span>
              <p className="text-sm text-white">
                <span className="font-semibold">{absentMembers.length} members</span> haven&apos;t attended in 3+ Sundays.
              </p>
            </div>
            <Link
              href="/admin/attendance/reports"
              className="shrink-0 rounded-lg bg-white px-4 py-2 text-xs font-semibold text-[#1a2744] hover:bg-stone-100 transition-colors"
            >
              View report
            </Link>
          </div>
        ) : nextProgramme ? (
          <div className="mb-6 rounded-xl bg-gradient-to-r from-[#1a2744] to-[#2a3f66] px-6 py-4 flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 shrink-0">
                <CalendarDays size={16} className="text-white" />
              </span>
              <p className="text-sm text-white">
                Next up: <span className="font-semibold">{nextProgramme.title}</span> · {nextProgramme.time}
              </p>
            </div>
            <Link
              href="/admin/programmes"
              className="shrink-0 rounded-lg bg-white px-4 py-2 text-xs font-semibold text-[#1a2744] hover:bg-stone-100 transition-colors"
            >
              Manage programmes
            </Link>
          </div>
        ) : null}

        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          {(Object.keys(counts) as MemberCategory[]).map((cat) => (
            <StatCard
              key={cat}
              icon={categoryIcons[cat]}
              label={`${categoryLabels[cat]} · active members`}
              value={String(counts[cat])}
              trend={trendPct(counts[cat], previousCounts[cat])}
              href={`/admin/members/${cat}`}
            />
          ))}
          <StatCard
            icon={Users}
            label="all members"
            value={String(totalMembers)}
            trend={trendPct(totalMembers, previousTotalMembers)}
            dark
          />
        </div>

        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white border border-stone-200 rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <h2 className="font-semibold text-[#1a2744] text-sm">Attendance — Last 8 Weeks</h2>
            </div>
            <AttendanceChart data={attendanceChartData} />
          </div>

          {isSuperAdmin && (
            <div className="bg-white border border-stone-200 rounded-xl p-6">
              <div className="flex items-center justify-between mb-2">
                <h2 className="font-semibold text-[#1a2744] text-sm">Finance — Last 6 Months</h2>
              </div>
              <FinanceTrendChart data={financeHistory} />
            </div>
          )}
        </div>

        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2">
            <RecentSessionsTable sessions={sessions} />
          </div>

          <div className="flex flex-col gap-6">
            <div className="bg-white border border-stone-200 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-[#1a2744] text-sm">Absent (3+ Sundays)</h2>
                <Link
                  href="/admin/attendance/reports"
                  className="text-xs text-stone-400 hover:text-[#1a2744] transition-colors"
                >
                  Full report →
                </Link>
              </div>
              {absentMembers.length === 0 ? (
                <p className="text-sm text-stone-400 italic">
                  {isViewer ? "No access." : "No absences detected."}
                </p>
              ) : (
                <ul className="space-y-3">
                  {absentMembers.slice(0, 5).map((m) => (
                    <li key={`${m.category}-${m.id}`} className="flex items-center gap-3">
                      <span className={`status-badge badge-${m.category}`}>{categoryLabels[m.category]}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-stone-800 truncate">{m.name}</p>
                        {m.lastSeen && (
                          <p className="text-xs text-stone-400">
                            Last: {new Date(m.lastSeen).toLocaleDateString("en-GB")}
                          </p>
                        )}
                      </div>
                    </li>
                  ))}
                  {absentMembers.length > 5 && (
                    <p className="text-xs text-stone-400 pt-1">+{absentMembers.length - 5} more</p>
                  )}
                </ul>
              )}
            </div>

            <div className="bg-white border border-stone-200 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-[#1a2744] text-sm">Upcoming Programmes</h2>
                <Link
                  href="/admin/programmes"
                  className="text-xs text-stone-400 hover:text-[#1a2744] transition-colors"
                >
                  Manage →
                </Link>
              </div>
              {upcoming.length === 0 ? (
                <p className="text-sm text-stone-400 italic">No upcoming programmes.</p>
              ) : (
                <ul className="space-y-4">
                  {upcoming.map((prog) => (
                    <li key={prog.id} className="flex gap-3">
                      <div className="bg-[#1a2744] text-white rounded-lg px-2.5 py-2 text-center min-w-[44px] shrink-0">
                        <p className="text-[9px] uppercase tracking-wide opacity-60">
                          {new Date(prog.date).toLocaleDateString("en-GB", { month: "short" })}
                        </p>
                        <p className="font-bold text-lg leading-none">{new Date(prog.date).getDate()}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-stone-800 leading-snug">{prog.title}</p>
                        <p className="text-xs text-stone-400 mt-0.5">
                          {prog.time} · {prog.location}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>

        {isSuperAdmin && (
          <div className="bg-white border border-stone-200 rounded-xl p-6 mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-[#1a2744] text-sm">
                Finance — {now.toLocaleDateString("en-GB", { month: "long", year: "numeric" })}
              </h2>
              <Link
                href="/admin/finance"
                className="text-xs text-stone-400 hover:text-[#1a2744] transition-colors"
              >
                Full view →
              </Link>
            </div>
            <div className="grid grid-cols-3 gap-6">
              <div>
                <p className="text-xs text-stone-400 mb-1">Income</p>
                <p className="font-display font-bold text-2xl text-green-700">{formatGHS(monthlyIncome)}</p>
              </div>
              <div>
                <p className="text-xs text-stone-400 mb-1">Expenditure</p>
                <p className="font-display font-bold text-2xl text-red-600">{formatGHS(monthlyExpenditure)}</p>
              </div>
              <div>
                <p className="text-xs text-stone-400 mb-1">Net Balance</p>
                <p
                  className={`font-display font-bold text-2xl flex items-center gap-2 ${
                    netBalance >= 0 ? "text-[#1a2744]" : "text-red-600"
                  }`}
                >
                  {formatGHS(netBalance)}
                  {(() => {
                    const t = trendPct(netBalance, previousNet)
                    if (t === null) return null
                    const up = t >= 0
                    return (
                      <span
                        className={`flex items-center gap-0.5 text-[11px] font-semibold ${
                          up ? "text-green-600" : "text-red-500"
                        }`}
                      >
                        {up ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                        {Math.abs(t).toFixed(0)}%
                      </span>
                    )
                  })()}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-wrap gap-3">
          <Link href="/admin/members/lambs/new" className="admin-btn-primary text-xs">
            + Add Lamb
          </Link>
          <Link href="/admin/members/teens/new" className="admin-btn-primary text-xs">
            + Add Teen
          </Link>
          <Link href="/admin/members/youth/new" className="admin-btn-primary text-xs">
            + Add Youth
          </Link>
          <Link href="/admin/members/congregation/new" className="admin-btn-primary text-xs">
            + Add Congregation Member
          </Link>
          <Link href="/admin/attendance/new" className="admin-btn-secondary text-xs">
            Mark Attendance
          </Link>
          {isSuperAdmin && (
            <Link href="/admin/finance/record" className="admin-btn-gold text-xs">
              Add Finance Record
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}