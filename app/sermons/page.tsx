import type { Metadata } from "next"
import Link from "next/link"
import Nav from "@/components/nav"
import Footer from "@/components/footer"
import ScrollReveal from "@/components/scroll-reveal"
import { getPublishedSermons } from "@/lib/firestore"

export const metadata: Metadata = {
  title: "Sermons",
  description: "Sermon notes, Bible studies, and teachings from Iron City Church of Christ.",
}

interface PageProps {
  searchParams: Promise<{ speaker?: string; series?: string }>
}

export default async function SermonsPage({ searchParams }: PageProps) {
  const { speaker: speakerFilter, series: seriesFilter } = await searchParams
  const allSermons = await getPublishedSermons(50)

  const filtered = allSermons.filter((s) => {
    if (speakerFilter && s.speaker !== speakerFilter) return false
    if (seriesFilter && s.series !== seriesFilter) return false
    return true
  })

  const speakers = Array.from(new Set(allSermons.map((s) => s.speaker))).sort()
  const seriesList = Array.from(new Set(allSermons.map((s) => s.series).filter(Boolean))).sort() as string[]

  return (
    <>
      <Nav />
      <div className="pt-16 min-h-screen bg-white">
        <div className="bg-[#1a2744] py-20 px-6">
          <div className="max-w-6xl mx-auto">
            <p className="text-[11px] font-ui font-semibold tracking-[0.2em] uppercase text-[#c9a84c] mb-3">
              Sermons & Teachings
            </p>
            <h1 className="font-display font-bold text-5xl text-white mb-4">The Word</h1>
            <p className="text-white/70 text-lg max-w-xl">
              Sermon notes, Bible studies, and teachings from our services.
            </p>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-6 py-14">
          {/* Filters */}
          {(speakers.length > 1 || seriesList.length > 0) && (
            <div className="flex flex-wrap gap-4 mb-10">
              {speakers.length > 1 && (
                <div>
                  <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider mb-2">Speaker</p>
                  <div className="flex flex-wrap gap-2">
                    <Link href="/sermons" className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${!speakerFilter ? "bg-[#1a2744] text-white border-[#1a2744]" : "border-stone-200 text-stone-500 hover:border-stone-400"}`}>
                      All
                    </Link>
                    {speakers.map((s) => (
                      <Link key={s} href={`/sermons?speaker=${encodeURIComponent(s)}`}
                        className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${speakerFilter === s ? "bg-[#1a2744] text-white border-[#1a2744]" : "border-stone-200 text-stone-500 hover:border-stone-400"}`}>
                        {s}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
              {seriesList.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider mb-2">Series</p>
                  <div className="flex flex-wrap gap-2">
                    <Link href="/sermons" className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${!seriesFilter ? "bg-[#c9a84c] text-[#1a2744] border-[#c9a84c]" : "border-stone-200 text-stone-500 hover:border-stone-400"}`}>
                      All
                    </Link>
                    {seriesList.map((s) => (
                      <Link key={s} href={`/sermons?series=${encodeURIComponent(s)}`}
                        className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${seriesFilter === s ? "bg-[#c9a84c] text-[#1a2744] border-[#c9a84c]" : "border-stone-200 text-stone-500 hover:border-stone-400"}`}>
                        {s}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <ScrollReveal>
            {filtered.length === 0 ? (
              <div className="py-20 text-center border-2 border-dashed border-stone-200 rounded-xl">
                <p className="text-stone-400 italic">No sermons found.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filtered.map((sermon, i) => (
                  <Link key={sermon.id} href={`/sermons/${sermon.slug}`}
                    className={`reveal reveal-delay-${Math.min(i + 1, 4)} flex items-start justify-between gap-6 p-6 bg-white border border-stone-100 rounded-xl hover:border-[#c9a84c] hover:shadow-sm transition-all group`}>
                    <div>
                      {sermon.series && (
                        <p className="text-[10px] font-ui font-semibold tracking-[0.15em] uppercase text-[#c9a84c] mb-1">
                          {sermon.series}
                        </p>
                      )}
                      <h2 className="font-display font-bold text-xl text-[#1a2744] group-hover:text-[#c9a84c] transition-colors mb-1">
                        {sermon.title}
                      </h2>
                      <p className="text-sm text-stone-500 italic">{sermon.scripture}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-medium text-stone-700">{sermon.speaker}</p>
                      <p className="text-xs text-stone-400 mt-0.5">
                        {new Date(sermon.date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </ScrollReveal>
        </div>
      </div>
      <Footer />
    </>
  )
}
