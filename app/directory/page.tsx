import type { Metadata } from "next"
import Link from "next/link"
import Nav from "@/components/nav"
import Footer from "@/components/footer"
import { getDirectoryTenants } from "@/lib/platform"

export const metadata: Metadata = {
  title: "Church Directory",
  description: "Find churches using the platform, organised by region.",
}

export default async function DirectoryPage() {
  const tenants = await getDirectoryTenants()

  const byRegion = new Map<string, typeof tenants>()
  for (const tenant of tenants) {
    const list = byRegion.get(tenant.region) ?? []
    list.push(tenant)
    byRegion.set(tenant.region, list)
  }
  const regions = Array.from(byRegion.keys()).sort()

  return (
    <>
      <Nav />
      <div className="pt-32 pb-24 min-h-screen bg-white">
        <div className="max-w-4xl mx-auto px-6">
          <p className="text-[11px] font-ui font-semibold tracking-[0.2em] uppercase text-[#c9a84c] mb-3">
            Church Directory
          </p>
          <h1 className="font-display font-bold text-4xl md:text-5xl text-[#1a2744] mb-4">
            Churches on the platform
          </h1>
          <p className="text-stone-500 text-lg mb-12 max-w-xl">
            Browse participating churches by region.
          </p>

          {regions.length === 0 ? (
            <div className="py-20 text-center border-2 border-dashed border-stone-200 rounded-xl">
              <p className="text-stone-400 italic text-sm">No churches listed yet.</p>
            </div>
          ) : (
            <div className="space-y-10">
              {regions.map((region) => (
                <div key={region}>
                  <h2 className="font-display font-bold text-xl text-[#1a2744] mb-4">{region}</h2>
                  <div className="bg-[#f8f7f4] border border-stone-100 rounded-xl overflow-hidden">
                    {byRegion.get(region)!.map((tenant, i) => (
                      <div
                        key={tenant.id}
                        className={`px-5 py-4 ${i > 0 ? "border-t border-stone-200" : ""}`}
                      >
                        <p className="text-sm font-medium text-stone-900">{tenant.churchName}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-16 text-center">
            <p className="text-stone-500 mb-4">Don&apos;t see your church?</p>
            <Link
              href="/#get-started"
              className="inline-flex items-center gap-2 bg-[#1a2744] hover:bg-[#1e3a5f] text-white font-semibold px-6 py-3 rounded-full transition-colors text-sm"
            >
              Register interest
            </Link>
          </div>
        </div>
      </div>
      <Footer />
    </>
  )
}
