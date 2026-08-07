import { redirect } from "next/navigation"
import { getSessionUser } from "@/lib/auth"
import type { UserRole } from "@/types"
import AdminSidebar from "./_components/AdminSidebar"

interface NavSection {
  label: string
  links: { href: string; label: string; roles?: UserRole[] }[]
  roles?: UserRole[]
}

const tenantNavSections: NavSection[] = [
  {
    label: "Overview",
    links: [{ href: "/admin", label: "Dashboard" }],
  },
  {
    label: "Membership",
    links: [
      { href: "/admin/members", label: "All Members" },
      { href: "/admin/members/lambs", label: "Lambs (4–10)" },
      { href: "/admin/members/teens", label: "Teens (11–16)" },
      { href: "/admin/members/youth", label: "Youth" },
      { href: "/admin/members/congregation", label: "Congregation" },
    ],
    roles: ["super_admin", "contributor"],
  },
  {
    label: "Attendance",
    links: [
      { href: "/admin/attendance", label: "Sessions" },
      { href: "/admin/attendance/new", label: "Mark Attendance" },
      { href: "/admin/attendance/reports", label: "Reports & Charts" },
    ],
  },
  {
    label: "Finance",
    links: [
      { href: "/admin/finance", label: "Overview" },
      { href: "/admin/finance/record", label: "Add Record" },
      { href: "/admin/finance/reports", label: "Reports" },
    ],
    roles: ["super_admin"],
  },
  {
    label: "Content",
    links: [{ href: "/admin/programmes", label: "Programmes" }],
    roles: ["super_admin", "contributor"],
  },
  {
    label: "Settings",
    links: [{ href: "/admin/users", label: "Users", roles: ["super_admin"] }],
    roles: ["super_admin"],
  },
]

const platformNavSections: NavSection[] = [
  {
    label: "Platform",
    links: [
      { href: "/admin/leads", label: "Leads" },
      { href: "/admin/tenants", label: "Tenants" },
    ],
  },
]

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getSessionUser()
  if (!user) redirect("/login")

  const navSections = user.role === "platform_admin" ? platformNavSections : tenantNavSections

  const visibleSections = navSections
    .filter((s) => !s.roles || s.roles.includes(user.role))
    .map((s) => ({
      ...s,
      links: s.links.filter((l) => !l.roles || l.roles.includes(user.role)),
    }))
    .filter((s) => s.links.length > 0)

  const roleLabel: Record<UserRole, string> = {
    platform_admin: "Platform Admin",
    super_admin: "Super Admin",
    contributor: "Contributor",
    viewer: "Viewer",
  }

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col md:flex-row">
      <AdminSidebar
        sections={visibleSections}
        userEmail={user.email}
        roleLabel={roleLabel[user.role]}
      />
      <main className="flex-1 overflow-auto min-w-0">{children}</main>
    </div>
  )
}