import Link from "next/link"
import { getMemberCounts } from "@/lib/firestore"
import { getTenantSession } from "@/lib/auth"

export default async function MembersPage() {
  const { tenantId } = await getTenantSession()
  const counts = await getMemberCounts(tenantId)
  const total = Object.values(counts).reduce((a, b) => a + b, 0)

  const categories = [
    {
      key: "lambs",
      label: "Lambs",
      age: "Age 4–10",
      href: "/admin/members/lambs",
      newHref: "/admin/members/lambs/new",
      color: "border-pink-200 bg-pink-50",
      badge: "badge-lambs",
    },
    {
      key: "teens",
      label: "Teens",
      age: "Age 11–16",
      href: "/admin/members/teens",
      newHref: "/admin/members/teens/new",
      color: "border-purple-200 bg-purple-50",
      badge: "badge-teens",
    },
    {
      key: "youth",
      label: "Youth",
      age: "SHS & University",
      href: "/admin/members/youth",
      newHref: "/admin/members/youth/new",
      color: "border-blue-200 bg-blue-50",
      badge: "badge-youth",
    },
    {
      key: "congregation",
      label: "Congregation",
      age: "Main members",
      href: "/admin/members/congregation",
      newHref: "/admin/members/congregation/new",
      color: "border-green-200 bg-green-50",
      badge: "badge-congregation",
    },
  ] as const

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="font-display font-bold text-3xl text-[#1a2744]">Membership</h1>
        <p className="text-sm text-stone-400 mt-1">{total} total active members across all categories</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-12">
        {categories.map((cat) => (
          <div
            key={cat.key}
            className={`border-2 rounded-xl p-6 ${cat.color}`}
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <span className={`status-badge ${cat.badge}`}>{cat.label}</span>
                <p className="text-xs text-stone-400 mt-1">{cat.age}</p>
              </div>
              <p className="font-display font-bold text-4xl text-[#1a2744]">
                {counts[cat.key]}
              </p>
            </div>
            <div className="flex gap-3">
              <Link href={cat.href} className="admin-btn-secondary text-xs">
                View all
              </Link>
              <Link href={cat.newHref} className="admin-btn-primary text-xs">
                + Add member
              </Link>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-[#1a2744] rounded-xl p-6 text-white text-center">
        <p className="text-[11px] font-ui tracking-[0.12em] uppercase text-white/50 mb-1">
          Total Active Members
        </p>
        <p className="font-display font-bold text-5xl">{total}</p>
      </div>
    </div>
  )
}
