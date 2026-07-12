import Link from "next/link"
import { getAllProgrammesAdmin } from "@/lib/firestore"

export default async function ProgrammesAdminPage() {
  const programmes = await getAllProgrammesAdmin()
  const upcoming = programmes.filter((p) => p.status === "upcoming").length

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display font-bold text-3xl text-[#1a2744]">Programmes</h1>
          <p className="text-sm text-stone-400 mt-1">{upcoming} upcoming · {programmes.length} total</p>
        </div>
        <Link href="/admin/programmes/new" className="admin-btn-primary">+ Add Programme</Link>
      </div>

      {programmes.length === 0 ? (
        <div className="py-20 text-center border-2 border-dashed border-stone-200 rounded-xl">
          <p className="text-stone-400 italic text-sm">No programmes yet.</p>
          <Link href="/admin/programmes/new" className="text-sm text-[#1a2744] underline mt-2 inline-block">Add the first programme</Link>
        </div>
      ) : (
        <div className="bg-white border border-stone-200 rounded-xl overflow-hidden">
          <div className="grid grid-cols-[100px_1fr_120px_100px_60px] gap-4 px-5 py-3 bg-stone-50 border-b border-stone-100">
            {["Date", "Title", "Location", "Status", ""].map((h) => (
              <span key={h} className="text-xs font-semibold tracking-[0.08em] uppercase text-stone-400">{h}</span>
            ))}
          </div>
          {programmes.map((prog, i) => (
            <div key={prog.id} className={`grid grid-cols-[100px_1fr_120px_100px_60px] gap-4 items-center px-5 py-3.5 hover:bg-stone-50 transition-colors ${i > 0 ? "border-t border-stone-100" : ""}`}>
              <span className="text-xs text-stone-500">{prog.date}</span>
              <div>
                <p className="text-sm font-medium text-stone-900">{prog.title}</p>
                <p className="text-xs text-stone-400">{prog.time}</p>
              </div>
              <span className="text-xs text-stone-500 truncate">{prog.location}</span>
              <span className={`status-badge w-fit ${prog.status === "upcoming" ? "status-active" : "status-draft"}`}>{prog.status}</span>
              <Link href={`/admin/programmes/${prog.id}`} className="text-xs text-stone-400 hover:text-[#1a2744] transition-colors text-right">Edit →</Link>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
