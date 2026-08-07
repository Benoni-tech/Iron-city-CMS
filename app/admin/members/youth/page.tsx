import Link from "next/link"
import { getYouth } from "@/lib/firestore"
import { getTenantSession } from "@/lib/auth"

export default async function YouthPage() {
  const { tenantId } = await getTenantSession()
  const members = await getYouth(tenantId)
  const active = members.filter((m) => m.memberStatus === "active").length

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display font-bold text-3xl text-[#1a2744]">Youth</h1>
          <p className="text-sm text-stone-400 mt-1">SHS & University · {active} active</p>
        </div>
        <Link href="/admin/members/youth/new" className="admin-btn-primary">+ Register Youth</Link>
      </div>
      {members.length === 0 ? (
        <div className="py-20 text-center border-2 border-dashed border-stone-200 rounded-xl">
          <p className="text-stone-400 italic text-sm">No Youth registered yet.</p>
          <Link href="/admin/members/youth/new" className="text-sm text-[#1a2744] underline mt-2 inline-block">Register first</Link>
        </div>
      ) : (
        <div className="bg-white border border-stone-200 rounded-xl overflow-hidden">
          <div className="grid grid-cols-[1fr_120px_120px_100px_60px] gap-4 px-5 py-3 bg-stone-50 border-b border-stone-100">
            {["Name","Phone","Education","Status",""].map((h) => (
              <span key={h} className="text-xs font-semibold tracking-[0.08em] uppercase text-stone-400">{h}</span>
            ))}
          </div>
          {members.map((m, i) => (
            <div key={m.id} className={`grid grid-cols-[1fr_120px_120px_100px_60px] gap-4 items-center px-5 py-3.5 hover:bg-stone-50 transition-colors ${i > 0 ? "border-t border-stone-100" : ""}`}>
              <div>
                <p className="text-sm font-medium text-stone-900">{m.firstName} {m.surname}</p>
                <p className="text-xs text-stone-400">{m.schoolName}</p>
              </div>
              <span className="text-xs text-stone-500">{m.phone}</span>
              <span className="text-xs text-stone-500">{m.educationLevel} · {m.yearGroup}</span>
              <span className={`status-badge status-${m.memberStatus} w-fit`}>{m.memberStatus}</span>
              <Link href={`/admin/members/youth/${m.id}`} className="text-xs text-stone-400 hover:text-[#1a2744] transition-colors">Edit →</Link>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
