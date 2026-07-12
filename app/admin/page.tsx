import Link from "next/link"
import { getSessionUser } from "@/lib/auth"
import {
  getMemberCounts,
  getServiceSessions,
  getUpcomingProgrammes,
  getFinancialRecordsByMonth,
} from "@/lib/firestore"
import { getAbsentMembers } from "@/lib/attendance"
import { formatGHS } from "@/lib/finance-reports"
import type { MemberCategory } from "@/types"

const categoryLabels: Record<MemberCategory, string> = {
  lambs: "Lambs",
  teens: "Teens",
  youth: "Youth",
  congregation: "Congregation",
}

const categoryColors: Record<MemberCategory, string> = {
  lambs: "bg-pink-100 text-pink-800",
  teens: "bg-purple-100 text-purple-800",
  youth: "bg-blue-100 text-blue-800",
  congregation: "bg-green-100 text-green-800",
}

export default async function AdminDashboard() {
  const user = await getSessionUser()
  if (!user) return null

  const isSuperAdmin = user.role === "super_admin"
  const isViewer = user.role === "viewer"

  const [counts, recentSessions, upcoming, absentMembers] = await Promise.all([
    getMemberCounts(),
    getServiceSessions(5),
    getUpcomingProgrammes(3),
    isViewer ? Promise.resolve([]) : getAbsentMembers(),
  ])

  const totalMembers = Object.values(counts).reduce((a, b) => a + b, 0)

  let monthlyIncome = 0
  let monthlyExpenditure = 0

  if (isSuperAdmin) {
    const now = new Date()
    const records = await getFinancialRecordsByMonth(
      now.getFullYear(),
      now.getMonth() + 1
    )
    monthlyIncome = records
      .filter((r) => r.type === "income")
      .reduce((sum, r) => sum + r.amount, 0)
    monthlyExpenditure = records
      .filter((r) => r.type === "expenditure")
      .reduce((sum, r) => sum + r.amount, 0)
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="font-display font-bold text-3xl text-[#1a2744]">Dashboard</h1>
        <p className="text-sm text-stone-400 mt-1">
          {new Date().toLocaleDateString("en-GB", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </p>
      </div>

      {/* Membership summary */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        {(Object.keys(counts) as MemberCategory[]).map((cat) => (
          <Link
            key={cat}
            href={`/admin/members/${cat}`}
            className="bg-white border border-stone-200 rounded-xl p-5 hover:border-[#1a2744] transition-colors group"
          >
            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${categoryColors[cat]}`}>
              {categoryLabels[cat]}
            </span>
            <p className="font-display font-bold text-3xl text-[#1a2744] mt-3 group-hover:text-[#c9a84c] transition-colors">
              {counts[cat]}
            </p>
            <p className="text-xs text-stone-400 mt-0.5">active members</p>
          </Link>
        ))}
        <div className="bg-[#1a2744] rounded-xl p-5 text-white">
          <p className="text-[10px] font-semibold text-white/50 uppercase tracking-wider">Total</p>
          <p className="font-display font-bold text-3xl mt-3">{totalMembers}</p>
          <p className="text-xs text-white/50 mt-0.5">all members</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        {/* Recent sessions */}
        <div className="bg-white border border-stone-200 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-[#1a2744] text-sm">Recent Services</h2>
            <Link
              href="/admin/attendance"
              className="text-xs text-stone-400 hover:text-[#1a2744] transition-colors"
            >
              View all →
            </Link>
          </div>
          {recentSessions.length === 0 ? (
            <p className="text-sm text-stone-400 italic">No sessions recorded yet.</p>
          ) : (
            <ul className="space-y-3">
              {recentSessions.map((session) => (
                <li key={session.id} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-stone-800">
                      {session.title ?? session.serviceType.replace(/_/g, " ")}
                    </p>
                    <p className="text-xs text-stone-400">{session.date}</p>
                  </div>
                  <span className="text-sm font-bold text-[#1a2744]">
                    {session.totalPresent}
                  </span>
                </li>
              ))}
            </ul>
          )}
          <div className="mt-4 pt-4 border-t border-stone-100">
            <Link
              href="/admin/attendance/new"
              className="text-xs font-semibold text-[#c9a84c] hover:text-[#b8953e] transition-colors"
            >
              + Mark attendance
            </Link>
          </div>
        </div>

        {/* Absent members */}
        <div className="bg-white border border-stone-200 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-[#1a2744] text-sm">
              Absent (3+ Sundays)
            </h2>
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
                  <span
                    className={`status-badge badge-${m.category}`}
                  >
                    {categoryLabels[m.category]}
                  </span>
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
                <p className="text-xs text-stone-400 pt-1">
                  +{absentMembers.length - 5} more
                </p>
              )}
            </ul>
          )}
        </div>

        {/* Upcoming programmes */}
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
                    <p className="font-bold text-lg leading-none">
                      {new Date(prog.date).getDate()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-stone-800 leading-snug">{prog.title}</p>
                    <p className="text-xs text-stone-400 mt-0.5">{prog.time} · {prog.location}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Finance snapshot — super admin only */}
      {isSuperAdmin && (
        <div className="bg-white border border-stone-200 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-[#1a2744] text-sm">
              Finance — {new Date().toLocaleDateString("en-GB", { month: "long", year: "numeric" })}
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
              <p className="font-display font-bold text-2xl text-green-700">
                {formatGHS(monthlyIncome)}
              </p>
            </div>
            <div>
              <p className="text-xs text-stone-400 mb-1">Expenditure</p>
              <p className="font-display font-bold text-2xl text-red-600">
                {formatGHS(monthlyExpenditure)}
              </p>
            </div>
            <div>
              <p className="text-xs text-stone-400 mb-1">Net Balance</p>
              <p
                className={`font-display font-bold text-2xl ${
                  monthlyIncome - monthlyExpenditure >= 0
                    ? "text-[#1a2744]"
                    : "text-red-600"
                }`}
              >
                {formatGHS(monthlyIncome - monthlyExpenditure)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Quick actions */}
      <div className="mt-6 flex flex-wrap gap-3">
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
  )
}
