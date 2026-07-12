import type { Metadata } from "next"
import Link from "next/link"
import Nav from "@/components/nav"
import Footer from "@/components/footer"
import ScrollReveal from "@/components/scroll-reveal"
import { getSiteConfig } from "@/lib/firestore"

export const metadata: Metadata = {
  title: "Mission & Vision",
  description: "The mission, vision, and core values of Iron City Church of Christ.",
}

export default async function MissionVisionPage() {
  const config = await getSiteConfig()

  const mission = config?.aboutMission || "We exist to glorify God, make disciples, and serve our community with the love of Christ."
  const vision = config?.aboutVision || "To be a church where every person encounters God and is transformed by His grace."
  const values = config?.aboutValues ?? ["Faith", "Integrity", "Service", "Unity", "Love"]

  return (
    <>
      <Nav />
      <div className="pt-16 min-h-screen bg-white">
        <div className="bg-[#1a2744] py-16 px-6">
          <div className="max-w-4xl mx-auto">
            <Link href="/about" className="text-xs text-white/50 hover:text-white/80 transition-colors mb-6 inline-block">
              ← About Us
            </Link>
            <p className="text-[11px] font-ui font-semibold tracking-[0.2em] uppercase text-[#c9a84c] mb-3">
              Mission & Vision
            </p>
            <h1 className="font-display font-bold text-4xl md:text-5xl text-white leading-tight">
              Our Purpose & Direction
            </h1>
          </div>
        </div>

        <ScrollReveal>
          <div className="max-w-4xl mx-auto px-6 py-20 space-y-20">
            {/* Mission */}
            <div className="grid lg:grid-cols-[200px_1fr] gap-10 items-start reveal">
              <div>
                <div className="w-12 h-1 bg-[#c9a84c] mb-4" />
                <p className="font-display font-bold text-4xl text-[#1a2744] leading-tight">Our<br />Mission</p>
              </div>
              <div className="bg-[#f8f7f4] rounded-2xl p-8">
                <p className="font-body text-xl text-stone-700 leading-relaxed">{mission}</p>
              </div>
            </div>

            {/* Vision */}
            <div className="grid lg:grid-cols-[200px_1fr] gap-10 items-start reveal reveal-delay-1">
              <div>
                <div className="w-12 h-1 bg-[#c9a84c] mb-4" />
                <p className="font-display font-bold text-4xl text-[#1a2744] leading-tight">Our<br />Vision</p>
              </div>
              <div className="bg-[#f8f7f4] rounded-2xl p-8">
                <p className="font-body text-xl text-stone-700 leading-relaxed">{vision}</p>
              </div>
            </div>

            {/* Values */}
            <div className="reveal reveal-delay-2">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-1 bg-[#c9a84c]" />
                <p className="font-display font-bold text-4xl text-[#1a2744]">Core Values</p>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {values.map((value, i) => (
                  <div
                    key={value}
                    className={`reveal reveal-delay-${Math.min(i + 1, 4)} bg-[#1a2744] rounded-2xl p-6`}
                  >
                    <span className="text-[#c9a84c] font-display font-bold text-3xl">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <p className="font-display font-bold text-xl text-white mt-3">{value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </ScrollReveal>
      </div>
      <Footer />
    </>
  )
}
