import Link from "next/link"
import { getServiceSessions } from "@/lib/firestore"
import { getTenantSession } from "@/lib/auth"
import { SERVICE_TYPE_LABELS } from "@/types"

export default async function AttendancePage() {
  const { tenantId } = await getTenantSession()
  const sessions = await getServiceSessions(tenantId, 30)

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display font-bold text-3xl text-[#1a2744]">Attendance</h1>
          <p className="text-sm text-stone-400 mt-1">Service sessions and attendance records</p>
        </div>
        <Link href="/admin/attendance/new" className="admin-btn-primary">
          + New Session
        </Link>
      </div>

      <div className="flex gap-3 mb-6">
        <Link
          href="/admin/attendance/reports"
          className="admin-btn-secondary text-sm"
        >
          View Reports & Charts
        </Link>
      </div>

      {sessions.length === 0 ? (
        <div className="py-20 text-center border-2 border-dashed border-stone-200 rounded-xl">
          <p className="text-stone-400 italic text-sm">No sessions recorded yet.</p>
          <Link href="/admin/attendance/new" className="text-sm text-[#1a2744] underline mt-2 inline-block">
            Create the first session
          </Link>
        </div>
      ) : (
        <div className="bg-white border border-stone-200 rounded-xl overflow-hidden">
          <div className="grid grid-cols-[120px_1fr_140px_100px_60px] gap-4 px-5 py-3 bg-stone-50 border-b border-stone-100">
            {["Date", "Service", "Conducted By", "Present", ""].map((h) => (
              <span key={h} className="text-xs font-semibold tracking-[0.08em] uppercase text-stone-400">
                {h}
              </span>
            ))}
          </div>
          {sessions.map((session, i) => (
            <div
              key={session.id}
              className={`grid grid-cols-[120px_1fr_140px_100px_60px] gap-4 items-center px-5 py-3.5 hover:bg-stone-50 transition-colors ${
                i > 0 ? "border-t border-stone-100" : ""
              }`}
            >
              <span className="text-sm text-stone-700">
                {new Date(session.date).toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </span>
              <div>
                <p className="text-sm font-medium text-stone-900">
                  {session.title || SERVICE_TYPE_LABELS[session.serviceType]}
                </p>
                {session.title && (
                  <p className="text-xs text-stone-400">{SERVICE_TYPE_LABELS[session.serviceType]}</p>
                )}
              </div>
              <span className="text-xs text-stone-500">{session.conductedBy || "—"}</span>
              <span className="text-sm font-bold text-[#1a2744]">{session.totalPresent}</span>
              <Link
                href={`/admin/attendance/${session.id}`}
                className="text-xs text-stone-400 hover:text-[#1a2744] transition-colors text-right"
              >
                View →
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
