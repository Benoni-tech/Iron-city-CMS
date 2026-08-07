import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import Nav from "@/components/nav"
import Footer from "@/components/footer"
import ScrollReveal from "@/components/scroll-reveal"
import InterestForm from "@/components/interest-form"

export const metadata: Metadata = {
  title: "Church Platform — websites and management for churches",
  description:
    "One platform for any church: membership, attendance, and finance management, plus a home on the web.",
}

const FEATURES = [
  {
    title: "Membership",
    description: "Track Lambs, Teens, Youth, and Congregation records, with family linking built in.",
  },
  {
    title: "Attendance",
    description: "Mark attendance per service and automatically flag members who've drifted away.",
  },
  {
    title: "Finance",
    description: "Record income and expenditure, close months, and export reports — for your leadership only.",
  },
  {
    title: "A home on the web",
    description: "Your church gets listed in our public directory, discoverable by region.",
  },
]

const STEPS = [
  { step: "1", title: "Register interest", description: "Tell us about your church below." },
  { step: "2", title: "We set up your account", description: "We create your church's private space and your first admin login." },
  { step: "3", title: "Your team takes it from there", description: "Manage members, attendance, and finances — all in one place." },
]

export default function HomePage() {
  return (
    <>
      <Nav />

      {/* HERO */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        <Image
          src="/background.jpg"
          alt=""
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />
        <div className="hero-overlay" />

        <div className="relative z-10 max-w-6xl mx-auto px-6 pt-32 pb-40 text-white w-full">
          <p className="text-[12px] font-ui font-semibold tracking-[0.25em] uppercase text-[#c9a84c] mb-4 animate-fade-up">
            For churches, by people who build for churches
          </p>
          <h1
            className="font-display font-bold text-4xl md:text-6xl leading-[1.05] mb-6 max-w-3xl animate-fade-up"
            style={{ animationDelay: "0.1s" }}
          >
            One platform to run your church and be found online
          </h1>
          <p
            className="text-white/80 text-xl md:text-2xl font-body leading-relaxed mb-10 max-w-xl animate-fade-up"
            style={{ animationDelay: "0.2s" }}
          >
            Membership, attendance, and finance in one dashboard — and a listing in our public church
            directory.
          </p>
          <div
            className="flex flex-wrap gap-4 animate-fade-up"
            style={{ animationDelay: "0.3s" }}
          >
            <Link
              href="#get-started"
              className="inline-flex items-center gap-2 bg-[#c9a84c] hover:bg-[#b8953e] text-[#1a2744] font-semibold px-7 py-3.5 rounded-full transition-colors text-sm"
            >
              Register Your Church
              <span aria-hidden>→</span>
            </Link>
            <Link
              href="/directory"
              className="inline-flex items-center gap-2 border border-white/40 hover:border-white text-white font-semibold px-7 py-3.5 rounded-full transition-colors text-sm"
            >
              View Directory
            </Link>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <ScrollReveal>
        <section className="py-24 bg-[#f8f7f4]">
          <div className="max-w-6xl mx-auto px-6">
            <p className="text-[11px] font-ui font-semibold tracking-[0.2em] uppercase text-[#c9a84c] mb-3 reveal">
              What You Get
            </p>
            <h2 className="font-display font-bold text-4xl text-[#1a2744] leading-tight mb-12 reveal reveal-delay-1 max-w-xl">
              Everything your church office needs, none of the spreadsheets
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {FEATURES.map((f, i) => (
                <div
                  key={f.title}
                  className={`reveal reveal-delay-${i + 1} bg-white rounded-xl p-6 border border-stone-100`}
                >
                  <h3 className="font-display font-bold text-lg text-[#1a2744] mb-2">{f.title}</h3>
                  <p className="text-stone-500 text-sm leading-relaxed">{f.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </ScrollReveal>

      {/* HOW IT WORKS */}
      <ScrollReveal>
        <section className="py-24 bg-[#1a2744]">
          <div className="max-w-6xl mx-auto px-6">
            <p className="text-[11px] font-ui font-semibold tracking-[0.2em] uppercase text-[#c9a84c] mb-3 reveal">
              How It Works
            </p>
            <h2 className="font-display font-bold text-4xl text-white leading-tight mb-12 reveal reveal-delay-1 max-w-xl">
              Getting set up takes three steps
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              {STEPS.map((s, i) => (
                <div key={s.step} className={`reveal reveal-delay-${i + 1}`}>
                  <p className="font-display font-bold text-3xl text-[#c9a84c] mb-3">{s.step}</p>
                  <h3 className="font-display font-bold text-lg text-white mb-2">{s.title}</h3>
                  <p className="text-white/60 text-sm leading-relaxed">{s.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </ScrollReveal>

      {/* GET STARTED */}
      <ScrollReveal>
        <section id="get-started" className="py-24 bg-white scroll-mt-24">
          <div className="max-w-2xl mx-auto px-6">
            <div className="text-center mb-10">
              <p className="text-[11px] font-ui font-semibold tracking-[0.2em] uppercase text-[#c9a84c] mb-3 reveal">
                Get Started
              </p>
              <h2 className="font-display font-bold text-4xl text-[#1a2744] leading-tight mb-4 reveal reveal-delay-1">
                Register your church&apos;s interest
              </h2>
              <p className="text-stone-500 text-lg reveal reveal-delay-2">
                Tell us about your church and we&apos;ll be in touch to get you set up.
              </p>
            </div>
            <div className="bg-[#f8f7f4] rounded-2xl p-8 lg:p-10 reveal reveal-delay-2">
              <InterestForm />
            </div>
          </div>
        </section>
      </ScrollReveal>

      <Footer />
    </>
  )
}
