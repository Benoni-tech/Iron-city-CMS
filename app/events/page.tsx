import type { Metadata } from "next"
import Nav from "@/components/nav"
import Footer from "@/components/footer"
import ScrollReveal from "@/components/scroll-reveal"
import { getUpcomingProgrammes } from "@/lib/firestore"
import type { ProgrammeCategory } from "@/types"

export const metadata: Metadata = {
  title: "Events",
  description: "Upcoming programmes and events at Iron City Church of Christ.",
}

const categoryLabels: Record<ProgrammeCategory, string> = {
  sunday_service: "Sunday Service",
  prayer: "Prayer",
  bible_study: "Bible Study",
  special: "Special",
  annual: "Annual",
}

const categoryColors: Record<ProgrammeCategory, string> = {
  sunday_service: "bg-blue-100 text-blue-800",
  prayer: "bg-purple-100 text-purple-800",
  bible_study: "bg-green-100 text-green-800",
  special: "bg-amber-100 text-amber-800",
  annual: "bg-red-100 text-red-800",
}

export default async function EventsPage() {
  const programmes = await getUpcomingProgrammes(20)

  return (
    <>
      <Nav />
      <div className="pt-16 min-h-screen bg-white">
        <div className="bg-[#f8f7f4] border-b border-stone-100 py-20 px-6">
          <div className="max-w-6xl mx-auto">
            <p className="text-[11px] font-ui font-semibold tracking-[0.2em] uppercase text-[#c9a84c] mb-3">
              What is coming up
            </p>
            <h1 className="font-display font-bold text-5xl text-[#1a2744]">
              Programmes & Events
            </h1>
          </div>
        </div>

        <ScrollReveal>
          <div className="max-w-6xl mx-auto px-6 py-14">
            {programmes.length === 0 ? (
              <div className="py-20 text-center border-2 border-dashed border-stone-200 rounded-xl">
                <p className="text-stone-400 italic">No upcoming programmes at the moment.</p>
                <p className="text-stone-400 text-sm mt-2">Check back soon.</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-6">
                {programmes.map((prog, i) => (
                  <div key={prog.id} className={`reveal reveal-delay-${Math.min(i % 4 + 1, 4)} bg-white border border-stone-100 rounded-2xl p-6 hover:shadow-md transition-shadow`}>
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div className="bg-[#1a2744] text-white rounded-xl px-4 py-3 text-center min-w-[64px] shrink-0">
                        <p className="text-[10px] font-ui uppercase tracking-wide opacity-60">
                          {new Date(prog.date).toLocaleDateString("en-GB", { month: "short" })}
                        </p>
                        <p className="font-display font-bold text-2xl leading-none">
                          {new Date(prog.date).getDate()}
                        </p>
                      </div>
                      <span className={`status-badge text-[10px] ${categoryColors[prog.category]}`}>
                        {categoryLabels[prog.category]}
                      </span>
                    </div>

                    <h2 className="font-display font-bold text-xl text-[#1a2744] mb-2">{prog.title}</h2>
                    <p className="text-stone-500 text-sm leading-relaxed mb-4">{prog.description}</p>

                    <div className="flex items-center gap-4 text-xs text-stone-400 border-t border-stone-100 pt-4">
                      <span>🕐 {prog.time}</span>
                      <span>📍 {prog.location}</span>
                      {prog.endDate && prog.endDate !== prog.date && (
                        <span>Until {new Date(prog.endDate).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </ScrollReveal>
      </div>
      <Footer />
    </>
  )
}
