import type { Metadata } from "next"
import { notFound } from "next/navigation"
import Link from "next/link"
import Nav from "@/components/nav"
import Footer from "@/components/footer"
import PostBody from "@/components/post-body"
import { getSermonBySlug } from "@/lib/firestore"

interface PageProps { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const sermon = await getSermonBySlug(slug)
  if (!sermon) return { title: "Sermon not found" }
  return {
    title: sermon.title,
    description: `${sermon.scripture} — ${sermon.speaker}`,
  }
}

export default async function SermonPage({ params }: PageProps) {
  const { slug } = await params
  const sermon = await getSermonBySlug(slug)
  if (!sermon) notFound()

  return (
    <>
      <Nav />
      <div className="pt-16 min-h-screen bg-[#f8f7f4]">
        <div className="bg-[#1a2744] py-16 px-6">
          <div className="max-w-3xl mx-auto">
            <Link href="/sermons" className="text-xs text-white/50 hover:text-white/80 transition-colors mb-6 inline-block">
              ← All Sermons
            </Link>
            {sermon.series && (
              <p className="text-[11px] font-ui font-semibold tracking-[0.2em] uppercase text-[#c9a84c] mb-3">
                {sermon.series}
              </p>
            )}
            <h1 className="font-display font-bold text-4xl md:text-5xl text-white leading-tight mb-4">
              {sermon.title}
            </h1>
            <p className="text-[#c9a84c] font-body italic text-xl mb-4">{sermon.scripture}</p>
            <p className="text-white/60 text-sm">
              {sermon.speaker} ·{" "}
              {new Date(sermon.date).toLocaleDateString("en-GB", {
                day: "numeric", month: "long", year: "numeric",
              })}
            </p>
          </div>
        </div>

        <div className="max-w-3xl mx-auto px-6 py-16">
          <div className="bg-white rounded-2xl p-8 md:p-12 shadow-sm">
            <PostBody body={sermon.body} />
          </div>

          {sermon.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-8">
              {sermon.tags.map((tag) => (
                <span key={tag} className="text-xs bg-stone-100 text-stone-600 px-3 py-1.5 rounded-full">
                  {tag}
                </span>
              ))}
            </div>
          )}

          <div className="mt-10 pt-8 border-t border-stone-200 text-center">
            <Link href="/sermons" className="admin-btn-secondary text-sm inline-flex">
              ← Browse all sermons
            </Link>
          </div>
        </div>
      </div>
      <Footer />
    </>
  )
}
