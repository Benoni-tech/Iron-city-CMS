import type { Metadata } from "next"
import Image from "next/image"
import Nav from "@/components/nav"
import Footer from "@/components/footer"
import ContactForm from "@/components/contact-form"

export const metadata: Metadata = {
  title: "Contact Us",
  description: "Get in touch about the platform — questions, support, or getting your church set up.",
}

const PLATFORM_EMAIL = process.env.PLATFORM_ADMIN_EMAIL ?? ""

export default function ContactPage() {
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
              Questions about the platform, support requests, or getting your church set up — we&apos;ll
              respond within one business day.
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
                alt="A church congregation"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#1a2744]/40 via-transparent to-transparent" />
            </div>
          </div>
        </div>

        {/* Contact info */}
        {PLATFORM_EMAIL && (
          <div className="max-w-6xl mx-auto px-6 pb-20 text-center">
            <div className="w-12 h-12 rounded-full bg-[#f8f7f4] flex items-center justify-center mb-4 mx-auto">
              <svg className="w-4 h-4 text-[#1a2744]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="font-display font-bold text-lg text-[#1a2744] mb-2">Write to Us</h3>
            <a href={`mailto:${PLATFORM_EMAIL}`} className="text-stone-600 text-sm hover:text-[#1a2744] transition-colors">
              {PLATFORM_EMAIL}
            </a>
          </div>
        )}
      </div>
      <Footer />
    </>
  )
}
