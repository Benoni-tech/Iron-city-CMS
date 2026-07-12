import type { Metadata } from "next"
import Link from "next/link"
import Nav from "@/components/nav"
import Footer from "@/components/footer"
import PostBody from "@/components/post-body"
import { getSiteConfig } from "@/lib/firestore"

export const metadata: Metadata = {
  title: "Our Story",
  description: "The history of Iron City Church of Christ.",
}

const fallbackHistory = {
  type: "doc" as const,
  content: [
    {
      type: "paragraph",
      content: [{ type: "text", text: "The history of Iron City Church of Christ will be written here. Edit this from the Site Config section of the admin dashboard." }],
    },
  ],
}

export default async function OurStoryPage() {
  const config = await getSiteConfig()
  const history = config?.aboutHistory ?? fallbackHistory

  return (
    <>
      <Nav />
      <div className="pt-16 min-h-screen bg-[#f8f7f4]">
        <div className="bg-[#1a2744] py-16 px-6">
          <div className="max-w-3xl mx-auto">
            <Link href="/about" className="text-xs text-white/50 hover:text-white/80 transition-colors mb-6 inline-block">
              ← About Us
            </Link>
            <p className="text-[11px] font-ui font-semibold tracking-[0.2em] uppercase text-[#c9a84c] mb-3">Our Story</p>
            <h1 className="font-display font-bold text-4xl md:text-5xl text-white leading-tight">
              How We Came to Be
            </h1>
          </div>
        </div>

        <div className="max-w-3xl mx-auto px-6 py-16">
          <div className="bg-white rounded-2xl p-8 md:p-12 shadow-sm">
            <PostBody body={history} />
          </div>
        </div>
      </div>
      <Footer />
    </>
  )
}
