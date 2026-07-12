import type { Metadata } from "next"
import Image from "next/image"
import Nav from "@/components/nav"
import Footer from "@/components/footer"
import ContactForm from "@/components/contact-form"
import { getSiteConfig } from "@/lib/firestore"

export const metadata: Metadata = {
  title: "Contact Us",
  description: "Get in touch with Iron City Church of Christ. Find our location, phone number, and email.",
}

export default async function ContactPage() {
  const config = await getSiteConfig()

  const phone = config?.phone || ""
  const email = config?.email || ""
  const address = config?.address || ""
  const officeHours = config?.officeHours || "Monday – Friday: 9:00 AM – 5:00 PM"
  const mapsEmbedUrl = config?.mapsEmbedUrl || ""

  return (
    <>
      <Nav />
      <div className="pt-16 min-h-screen bg-white">
        {/* Hero */}
        <div className="border-b border-stone-100 py-16 px-6">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <div>
              <p className="text-[11px] font-ui font-semibold tracking-[0.2em] uppercase text-[#c9a84c] mb-3">
                We&apos;d Love to Hear From You
              </p>
              <h1 className="font-display font-bold text-5xl text-[#1a2744]">Contact Us</h1>
            </div>
            <p className="text-stone-500 text-sm leading-relaxed max-w-xs">
              Reach out with a question, a prayer request, or to plan your first visit — we&apos;ll respond within one business day.
            </p>
          </div>
        </div>

        {/* Form + image */}
        <div className="max-w-6xl mx-auto px-6 py-16">
          <div className="grid lg:grid-cols-2 gap-8 items-stretch">
            <div className="bg-[#f8f7f4] rounded-2xl p-8 lg:p-10">
              <h2 className="font-display font-bold text-2xl text-[#1a2744] mb-8">
                Send Us a Message
              </h2>
              <ContactForm />
            </div>

            <div className="relative w-full min-h-[320px] lg:min-h-0 rounded-2xl overflow-hidden">
              <Image
                src="/contact-hero.jpg"
                alt="Iron City Church of Christ congregation"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#1a2744]/40 via-transparent to-transparent" />
              <span className="absolute top-5 right-5 text-[11px] font-ui font-semibold tracking-[0.15em] uppercase text-white border border-white/50 rounded-full px-3 py-1.5">
                Join Us Sunday
              </span>
            </div>
          </div>
        </div>

        {/* Contact info row */}
        <div className="max-w-6xl mx-auto px-6 pb-16">
          <div className="grid sm:grid-cols-3 gap-10 text-center">
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 rounded-full bg-[#f8f7f4] flex items-center justify-center mb-4">
                <svg className="w-4 h-4 text-[#1a2744]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
              <h3 className="font-display font-bold text-lg text-[#1a2744] mb-2">Call &amp; WhatsApp</h3>
              {phone ? (
                <a href={`tel:${phone}`} className="text-stone-600 text-sm hover:text-[#1a2744] transition-colors">
                  {phone}
                </a>
              ) : (
                <p className="text-stone-400 text-sm">Coming soon</p>
              )}
            </div>

            <div className="flex flex-col items-center">
              <div className="w-12 h-12 rounded-full bg-[#f8f7f4] flex items-center justify-center mb-4">
                <svg className="w-4 h-4 text-[#1a2744]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="font-display font-bold text-lg text-[#1a2744] mb-2">Working Hours</h3>
              <p className="text-stone-600 text-sm whitespace-pre-line">{officeHours}</p>
            </div>

            <div className="flex flex-col items-center">
              <div className="w-12 h-12 rounded-full bg-[#f8f7f4] flex items-center justify-center mb-4">
                <svg className="w-4 h-4 text-[#1a2744]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="font-display font-bold text-lg text-[#1a2744] mb-2">Write to Us</h3>
              {email ? (
                <a href={`mailto:${email}`} className="text-stone-600 text-sm hover:text-[#1a2744] transition-colors">
                  {email}
                </a>
              ) : (
                <p className="text-stone-400 text-sm">Coming soon</p>
              )}
            </div>
          </div>

          {address && (
            <div className="mt-10 flex items-start justify-center gap-3 text-center">
              <svg className="w-4 h-4 text-[#c9a84c] shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <p className="text-stone-600 text-sm leading-relaxed whitespace-pre-line">{address}</p>
            </div>
          )}
        </div>

        {/* Service times */}
        <div className="max-w-6xl mx-auto px-6 pb-16">
          <div className="bg-[#1a2744] rounded-2xl p-8 md:p-10">
            <p className="text-[11px] font-ui font-semibold tracking-[0.2em] uppercase text-[#c9a84c] mb-6">
              Service Times
            </p>
            <ul className="grid sm:grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { day: "Sunday Morning", time: "9:00 AM" },
                { day: "Sunday Evening", time: "5:00 PM" },
                { day: "Monday Bible Class", time: "6:30 PM" },
                { day: "Wednesday Prayer", time: "6:30 PM" },
              ].map((s) => (
                <li key={s.day}>
                  <p className="text-white/60 text-xs uppercase tracking-wider mb-1">{s.day}</p>
                  <p className="text-[#c9a84c] text-xl font-display font-bold">{s.time}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Map embed */}
        {mapsEmbedUrl && (
          <div className="max-w-6xl mx-auto px-6 pb-16">
            <div className="relative w-full h-80 rounded-2xl overflow-hidden border border-stone-100">
              <iframe
                src={mapsEmbedUrl}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Iron City Church of Christ location"
              />
            </div>
          </div>
        )}

        {/* Bottom CTA banner */}
        <div className="max-w-6xl mx-auto px-6 pb-20">
          <div className="bg-[#f8f7f4] rounded-2xl p-8 md:p-12">
            <div className="grid md:grid-cols-2 gap-10 items-center">
              <div>
                <span className="inline-block text-[11px] font-ui font-semibold tracking-[0.2em] uppercase text-[#c9a84c] border border-[#c9a84c]/40 rounded-full px-3 py-1.5 mb-6">
                  Plan Your Visit
                </span>
                <h2 className="font-display font-bold text-3xl md:text-4xl text-[#1a2744] leading-tight mb-4">
                  There&apos;s always <span className="text-[#c9a84c]">a seat</span> for you here
                </h2>
                <p className="text-stone-600 text-sm leading-relaxed mb-8">
                  Whether it&apos;s your first Sunday or your hundredth, we&apos;d love to welcome you home.
                </p>
                <a
                  href="#"
                  className="inline-flex items-center gap-2 bg-[#1a2744] text-white text-sm font-ui font-semibold rounded-full px-6 py-3 hover:bg-[#1a2744]/90 transition-colors"
                >
                  Plan Your Visit
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7 17L17 7M17 7H8M17 7v9" />
                  </svg>
                </a>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="relative aspect-[3/4] rounded-2xl overflow-hidden">
                  <Image
                    src="/contact-hero.jpg"
                    alt="Sunday worship at Iron City Church of Christ"
                    fill
                    className="object-cover"
                    sizes="25vw"
                  />
                </div>
                <div className="relative aspect-[3/4] rounded-2xl overflow-hidden mt-8">
                  <Image
                    src="/contact-hero.jpg"
                    alt="Fellowship at Iron City Church of Christ"
                    fill
                    className="object-cover"
                    sizes="25vw"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  )
}