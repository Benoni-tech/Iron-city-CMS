import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import Nav from "@/components/nav"
import Footer from "@/components/footer"
import ScrollReveal from "@/components/scroll-reveal"
import { getSiteConfig, getUpcomingProgrammes, getPublishedSermons } from "@/lib/firestore"

export const metadata: Metadata = {
  title: "Iron City Church of Christ",
  description:
    "A community of faith, worship, and service. Join us every Sunday.",
}

const SERVICE_TIMES = [
  { day: "Sunday", services: ["Morning Service — 9:00 AM", "Evening Service — 5:00 PM"] },
  { day: "Monday", services: ["Bible Class — 6:30 PM"] },
  { day: "Wednesday", services: ["Prayer Meeting — 6:30 PM"] },
]

export default async function HomePage() {
  const [config, programmes, sermons] = await Promise.all([
    getSiteConfig(),
    getUpcomingProgrammes(3),
    getPublishedSermons(1),
  ])

  const latestSermon = sermons[0] ?? null

  const heroHeadline = config?.heroHeadline || "Welcome to Iron City Church of Christ"
  const heroSubline = config?.heroSubline || "A community of faith, worship, and service."
  const heroImage = config?.heroImageUrl || "/background.jpg"
  const missionText = config?.aboutMission || "We exist to glorify God, make disciples, and serve our community."

  return (
    <>
      <Nav />

      {/* HERO */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        <Image
          src={heroImage}
          alt="Iron City Church of Christ"
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />
        <div className="hero-overlay" />

        <div className="relative z-10 max-w-6xl mx-auto px-6 pt-32 pb-40 text-white w-full">
          <p className="text-[12px] font-ui font-semibold tracking-[0.25em] uppercase text-[#c9a84c] mb-4 animate-fade-up">
            Iron City Church of Christ
          </p>
          <h1
            className="font-display font-bold text-1xl md:text-6xl leading-[1.05] mb-6 max-w-3xl animate-fade-up"
            style={{ animationDelay: "0.1s" }}
          >
            {heroHeadline}
          </h1>
          <p
            className="text-white/80 text-xl md:text-2xl font-body leading-relaxed mb-10 max-w-xl animate-fade-up"
            style={{ animationDelay: "0.2s" }}
          >
            {heroSubline}
          </p>
          <div
            className="flex flex-wrap gap-4 animate-fade-up"
            style={{ animationDelay: "0.3s" }}
          >
            <Link
              href="/about"
              className="inline-flex items-center gap-2 bg-[#c9a84c] hover:bg-[#b8953e] text-[#1a2744] font-semibold px-7 py-3.5 rounded-full transition-colors text-sm"
            >
              About Our Church
              <span aria-hidden>→</span>
            </Link>
            <Link
              href="/sermons"
              className="inline-flex items-center gap-2 border border-white/40 hover:border-white text-white font-semibold px-7 py-3.5 rounded-full transition-colors text-sm"
            >
              Our Sermons
            </Link>
          </div>
        </div>
      </section>

      {/* FLOATING SERVICE CARD */}
      <div className="relative z-20 -mt-20 md:-mt-24 px-6">
        <div className="max-w-5xl mx-auto bg-white rounded-3xl shadow-2xl border border-stone-100 p-3 md:p-4">
          <div className="flex items-center gap-1 border-b border-stone-100 pb-3 mb-4 px-1 overflow-x-auto">
            <button className="pill-tab active whitespace-nowrap">Service Times</button>
            <button className="pill-tab whitespace-nowrap">Ministries</button>
            <button className="pill-tab whitespace-nowrap">Give</button>
          </div>

          <div className="grid sm:grid-cols-3 gap-3 md:gap-4 items-stretch px-1 pb-1">
            {SERVICE_TIMES.slice(0, 2).map((day) => (
              <div key={day.day} className="bg-[#f8f7f4] rounded-2xl p-4">
                <p className="text-[10px] font-ui font-semibold uppercase tracking-wider text-[#c9a84c] mb-1">
                  {day.day}
                </p>
                {day.services.map((s) => (
                  <p key={s} className="text-sm font-medium text-[#1a2744] leading-snug">
                    {s}
                  </p>
                ))}
              </div>
            ))}

            <Link
              href="/contact"
              className="flex items-center justify-between gap-3 bg-[#1a2744] hover:bg-[#1e3a5f] rounded-2xl p-4 text-white transition-colors"
            >
              <div>
                <p className="text-[10px] font-ui font-semibold uppercase tracking-wider text-[#c9a84c] mb-1">
                  Plan a visit
                </p>
                <p className="text-sm font-semibold">Get directions</p>
              </div>
              <span
                aria-hidden
                className="w-9 h-9 rounded-full bg-[#c9a84c] text-[#1a2744] flex items-center justify-center shrink-0"
              >
                →
              </span>
            </Link>
          </div>
        </div>
      </div>

      {/* ABOUT SNIPPET */}
      <ScrollReveal>
        <section className="py-24 bg-[#f8f7f4]">
          <div className="max-w-6xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <p className="text-[11px] font-ui font-semibold tracking-[0.2em] uppercase text-[#c9a84c] mb-3 reveal">
                Our Mission
              </p>
              <h2 className="font-display font-bold text-4xl text-[#1a2744] leading-tight mb-6 reveal reveal-delay-1">
                Grounded in faith.<br />Growing together.
              </h2>
              <p className="text-stone-600 text-lg leading-relaxed mb-8 reveal reveal-delay-2 font-body">
                {missionText}
              </p>
              <Link
                href="/about"
                className="reveal reveal-delay-3 inline-flex items-center gap-2 text-sm font-semibold text-[#1a2744] border border-[#1a2744] px-5 py-2.5 rounded-lg hover:bg-[#1a2744] hover:text-white transition-colors"
              >
                Learn more about us
              </Link>
            </div>

            <div className="grid grid-cols-2 gap-4 reveal reveal-delay-2">
              {[
                { value: "200+", label: "Members" },
                { value: "4", label: "Ministries" },
                { value: "Every", label: "Sunday" },
                { value: "All", label: "Welcome" },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="bg-white rounded-xl p-6 border border-stone-100 text-center"
                >
                  <p className="font-display font-bold text-3xl text-[#c9a84c]">{stat.value}</p>
                  <p className="text-stone-500 text-sm mt-1">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </ScrollReveal>

      {/* UPCOMING PROGRAMMES */}
      {programmes.length > 0 && (
        <ScrollReveal>
          <section className="py-24 bg-white">
            <div className="max-w-6xl mx-auto px-6">
              <div className="flex items-end justify-between mb-12">
                <div>
                  <p className="text-[11px] font-ui font-semibold tracking-[0.2em] uppercase text-[#c9a84c] mb-2 reveal">
                    Upcoming
                  </p>
                  <h2 className="font-display font-bold text-4xl text-[#1a2744] reveal reveal-delay-1">
                    Programmes & Events
                  </h2>
                </div>
                <Link
                  href="/events"
                  className="hidden sm:inline-flex text-sm font-semibold text-[#1a2744] hover:text-[#c9a84c] transition-colors reveal"
                >
                  View all →
                </Link>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                {programmes.map((prog, i) => (
                  <div
                    key={prog.id}
                    className={`reveal reveal-delay-${i + 1} bg-[#f8f7f4] rounded-xl p-6 border border-stone-100`}
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <div className="bg-[#1a2744] text-white rounded-lg px-3 py-2 text-center min-w-[56px]">
                        <p className="text-[10px] font-ui uppercase tracking-wider opacity-70">
                          {new Date(prog.date).toLocaleDateString("en-GB", { month: "short" })}
                        </p>
                        <p className="font-display font-bold text-xl leading-none">
                          {new Date(prog.date).getDate()}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-ui text-stone-400">{prog.time}</p>
                        <p className="text-xs font-ui text-stone-400">{prog.location}</p>
                      </div>
                    </div>
                    <h3 className="font-display font-bold text-lg text-[#1a2744] mb-2">
                      {prog.title}
                    </h3>
                    <p className="text-stone-500 text-sm leading-relaxed line-clamp-2">
                      {prog.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </ScrollReveal>
      )}

      {/* LATEST SERMON */}
      {latestSermon && (
        <ScrollReveal>
          <section className="py-24 bg-[#1a2744]">
            <div className="max-w-6xl mx-auto px-6">
              <p className="text-[11px] font-ui font-semibold tracking-[0.2em] uppercase text-[#c9a84c] mb-2 reveal">
                Latest Message
              </p>
              <div className="grid lg:grid-cols-2 gap-12 items-center">
                <div>
                  <h2 className="font-display font-bold text-4xl text-white leading-tight mb-4 reveal reveal-delay-1">
                    {latestSermon.title}
                  </h2>
                  <p className="text-white/60 text-sm font-ui mb-2 reveal reveal-delay-2">
                    {latestSermon.speaker}
                    {latestSermon.series && ` · ${latestSermon.series}`}
                    {" · "}
                    {new Date(latestSermon.date).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                  <p className="text-[#c9a84c] font-body italic text-lg mb-8 reveal reveal-delay-2">
                    {latestSermon.scripture}
                  </p>
                  <Link
                    href={`/sermons/${latestSermon.slug}`}
                    className="reveal reveal-delay-3 inline-flex items-center gap-2 bg-[#c9a84c] hover:bg-[#b8953e] text-[#1a2744] font-semibold px-6 py-3 rounded-lg transition-colors text-sm"
                  >
                    Read sermon notes
                  </Link>
                </div>
                <div className="reveal reveal-delay-2 border border-white/10 rounded-xl p-8">
                  <p className="text-[11px] font-ui font-semibold tracking-[0.15em] uppercase text-[#c9a84c] mb-4">
                    All Sermons
                  </p>
                  <p className="text-white/70 text-base leading-relaxed mb-6">
                    Browse our library of sermon notes, Bible studies, and teachings.
                  </p>
                  <Link
                    href="/sermons"
                    className="text-sm font-semibold text-white/80 hover:text-white transition-colors"
                  >
                    Browse all messages →
                  </Link>
                </div>
              </div>
            </div>
          </section>
        </ScrollReveal>
      )}

      {/* CONTACT CTA */}
      <ScrollReveal>
        <section className="py-20 bg-white">
          <div className="max-w-2xl mx-auto px-6 text-center">
            <h2 className="font-display font-bold text-4xl text-[#1a2744] mb-4 reveal">
              Come worship with us
            </h2>
            <p className="text-stone-500 text-lg mb-8 reveal reveal-delay-1">
              We would love to have you. Find our location and service times below.
            </p>
            <Link
              href="/contact"
              className="reveal reveal-delay-2 inline-flex bg-[#1a2744] hover:bg-[#1e3a5f] text-white font-semibold px-8 py-4 rounded-lg transition-colors"
            >
              Get in touch
            </Link>
          </div>
        </section>
      </ScrollReveal>

      <Footer />
    </>
  )
}