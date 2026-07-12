import type { Metadata } from "next"
import Link from "next/link"
import Nav from "@/components/nav"
import Footer from "@/components/footer"
import ScrollReveal from "@/components/scroll-reveal"
import { getSiteConfig } from "@/lib/firestore"

export const metadata: Metadata = {
  title: "About Us",
  description: "Learn about Iron City Church of Christ — our history, mission, vision, and beliefs.",
}

export default async function AboutPage() {
  const config = await getSiteConfig()

  const mission = config?.aboutMission || "We exist to glorify God, make disciples, and serve our community with the love of Christ."
  const vision = config?.aboutVision || "To be a church where every person encounters God and is transformed by His grace."
  const values = config?.aboutValues ?? ["Faith", "Integrity", "Service", "Unity", "Love"]

  return (
    <>
      <Nav />
      <div className="pt-16 min-h-screen bg-white">
        <div className="bg-[#1a2744] py-20 px-6">
          <div className="max-w-6xl mx-auto">
            <p className="text-[11px] font-ui font-semibold tracking-[0.2em] uppercase text-[#c9a84c] mb-3">About Us</p>
            <h1 className="font-display font-bold text-5xl text-white">Who We Are</h1>
          </div>
        </div>

        {/* Sub-navigation */}
        <div className="border-b border-stone-100 bg-white sticky top-16 z-30">
          <div className="max-w-6xl mx-auto px-6">
            <div className="flex gap-6 overflow-x-auto">
              {[
                { href: "/about", label: "Overview" },
                { href: "/about/our-story", label: "Our Story" },
                { href: "/about/our-beliefs", label: "Our Beliefs" },
                { href: "/about/mission-vision", label: "Mission & Vision" },
              ].map((link) => (
                <Link key={link.href} href={link.href}
                  className="py-4 text-sm font-medium text-stone-600 hover:text-[#1a2744] border-b-2 border-transparent hover:border-[#c9a84c] transition-colors whitespace-nowrap">
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </div>

        <ScrollReveal>
          <div className="max-w-6xl mx-auto px-6 py-20">
            <div className="grid lg:grid-cols-2 gap-16 mb-20">
              <div className="reveal">
                <p className="text-[11px] font-ui font-semibold tracking-[0.2em] uppercase text-[#c9a84c] mb-3">Our Mission</p>
                <h2 className="font-display font-bold text-3xl text-[#1a2744] mb-4">Why we exist</h2>
                <p className="font-body text-lg text-stone-600 leading-relaxed">{mission}</p>
              </div>
              <div className="reveal reveal-delay-1">
                <p className="text-[11px] font-ui font-semibold tracking-[0.2em] uppercase text-[#c9a84c] mb-3">Our Vision</p>
                <h2 className="font-display font-bold text-3xl text-[#1a2744] mb-4">Where we are going</h2>
                <p className="font-body text-lg text-stone-600 leading-relaxed">{vision}</p>
              </div>
            </div>

            <div className="bg-[#f8f7f4] rounded-2xl p-10 reveal">
              <p className="text-[11px] font-ui font-semibold tracking-[0.2em] uppercase text-[#c9a84c] mb-3">Core Values</p>
              <h2 className="font-display font-bold text-3xl text-[#1a2744] mb-8">What we believe in</h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {values.map((value, i) => (
                  <div key={value} className={`reveal reveal-delay-${Math.min(i + 1, 4)} flex items-center gap-3 bg-white border border-stone-100 rounded-xl p-4`}>
                    <span className="w-2 h-2 rounded-full bg-[#c9a84c] shrink-0" />
                    <p className="font-semibold text-stone-800">{value}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6 mt-12">
              {[
                { href: "/about/our-story", title: "Our Story", description: "How Iron City Church came to be and where we have come from." },
                { href: "/about/our-beliefs", title: "Our Beliefs", description: "The Statement of Faith that grounds everything we do." },
                { href: "/about/mission-vision", title: "Mission & Vision", description: "Our purpose and the future we are building toward." },
              ].map((card, i) => (
                <Link key={card.href} href={card.href}
                  className={`reveal reveal-delay-${i + 1} block bg-white border border-stone-100 rounded-xl p-6 hover:border-[#c9a84c] hover:shadow-sm transition-all group`}>
                  <h3 className="font-display font-bold text-xl text-[#1a2744] group-hover:text-[#c9a84c] transition-colors mb-2">{card.title}</h3>
                  <p className="text-stone-500 text-sm">{card.description}</p>
                </Link>
              ))}
            </div>
          </div>
        </ScrollReveal>
      </div>
      <Footer />
    </>
  )
}
