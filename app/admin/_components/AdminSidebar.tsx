"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Users,
  CalendarCheck,
  Wallet,
  FileText,
  Settings as SettingsIcon,
  ChevronDown,
  Menu,
  X,
  PanelLeftClose,
  PanelLeftOpen,
  LogOut,
  Circle,
  type LucideIcon,
} from "lucide-react"
import type { UserRole } from "@/types"

interface NavLink {
  href: string
  label: string
  roles?: UserRole[]
}

interface NavSection {
  label: string
  links: NavLink[]
  roles?: UserRole[]
}

const SECTION_ICONS: Record<string, LucideIcon> = {
  Overview: LayoutDashboard,
  Membership: Users,
  Attendance: CalendarCheck,
  Finance: Wallet,
  Content: FileText,
  Settings: SettingsIcon,
}

const FOCUS_RING =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1a2744]/40"

function isActivePath(pathname: string, href: string) {
  if (href === "/admin") return pathname === "/admin"
  return pathname === href || pathname.startsWith(href + "/")
}

export default function AdminSidebar({
  sections,
  userEmail,
  roleLabel,
}: {
  sections: NavSection[]
  userEmail: string
  roleLabel: string
}) {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [openGroups, setOpenGroups] = useState<Set<string>>(new Set())
  const [hydrated, setHydrated] = useState(false)

  // Restore collapsed preference once mounted (avoids SSR mismatch)
  useEffect(() => {
    const stored = window.localStorage.getItem("admin-sidebar-collapsed")
    if (stored === "1") setCollapsed(true)
    setHydrated(true)
  }, [])

  useEffect(() => {
    if (hydrated) {
      window.localStorage.setItem("admin-sidebar-collapsed", collapsed ? "1" : "0")
    }
  }, [collapsed, hydrated])

  // Auto-expand the group containing the active route; close mobile drawer on navigation
  useEffect(() => {
    setOpenGroups((prev) => {
      const next = new Set(prev)
      for (const section of sections) {
        if (
          section.links.length > 1 &&
          section.links.some((l) => isActivePath(pathname, l.href))
        ) {
          next.add(section.label)
        }
      }
      return next
    })
    setMobileOpen(false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname])

  function toggleGroup(label: string) {
    setOpenGroups((prev) => {
      const next = new Set(prev)
      if (next.has(label)) {
        next.delete(label)
      } else {
        next.add(label)
      }
      return next
    })
  }

  const sidebarContent = (
    <>
      {/* Header */}
      <div className="px-4 py-5 border-b border-stone-100">
        <div className={`flex items-center ${collapsed ? "flex-col gap-3" : "justify-between"}`}>
          <Link href="/" className="block hover:opacity-70 transition-opacity">
            {collapsed ? (
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#1a2744] text-white font-display font-bold text-xs">
                IC
              </span>
            ) : (
              <>
                <p className="font-display font-bold text-base text-[#1a2744]">Iron City</p>
                <p className="text-[9px] font-ui tracking-[0.18em] uppercase text-stone-400">
                  Church of Christ
                </p>
              </>
            )}
          </Link>

          <button
            onClick={() => setCollapsed((c) => !c)}
            className={`hidden md:flex h-7 w-7 items-center justify-center rounded-lg text-stone-400 hover:bg-stone-100 hover:text-stone-700 transition-colors ${FOCUS_RING}`}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}
          </button>

          <button
            onClick={() => setMobileOpen(false)}
            className={`md:hidden flex h-7 w-7 items-center justify-center rounded-lg text-stone-400 hover:bg-stone-100 hover:text-stone-700 ${FOCUS_RING}`}
            aria-label="Close menu"
          >
            <X size={16} />
          </button>
        </div>

        {!collapsed && (
          <div className="mt-3 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#c9a84c]" />
            <span className="text-[11px] font-ui text-stone-500">{roleLabel}</span>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-2.5 py-4 space-y-1.5">
        {sections.map((section) => {
          const Icon = SECTION_ICONS[section.label] ?? Circle

          // Single-link sections render as a flat item, no dropdown
          if (section.links.length === 1) {
            const link = section.links[0]
            const active = isActivePath(pathname, link.href)
            return (
              <Link
                key={section.label}
                href={link.href}
                title={collapsed ? link.label : undefined}
                className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-ui transition-colors ${FOCUS_RING} ${
                  collapsed ? "justify-center" : ""
                } ${active ? "bg-[#1a2744] text-white font-medium" : "text-stone-600 hover:bg-stone-100"}`}
              >
                <Icon size={17} className="shrink-0" />
                {!collapsed && <span className="truncate">{link.label}</span>}
              </Link>
            )
          }

          const groupActive = section.links.some((l) => isActivePath(pathname, l.href))

          // Collapsed rail: icon only, jumps straight to the group's first link
          if (collapsed) {
            return (
              <Link
                key={section.label}
                href={section.links[0].href}
                title={section.label}
                className={`flex items-center justify-center rounded-xl px-3 py-2.5 transition-colors ${FOCUS_RING} ${
                  groupActive ? "bg-[#1a2744] text-white" : "text-stone-500 hover:bg-stone-100"
                }`}
              >
                <Icon size={17} />
              </Link>
            )
          }

          const isOpen = openGroups.has(section.label)

          return (
            <div key={section.label}>
              <button
                onClick={() => toggleGroup(section.label)}
                aria-expanded={isOpen}
                className={`w-full flex items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-sm font-ui font-medium transition-colors ${FOCUS_RING} ${
                  groupActive ? "bg-[#1a2744] text-white" : "text-stone-700 hover:bg-stone-100"
                }`}
              >
                <span className="flex items-center gap-3">
                  <Icon size={17} className="shrink-0" />
                  {section.label}
                </span>
                <ChevronDown
                  size={15}
                  className={`shrink-0 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                />
              </button>

              {isOpen && (
                <ul className="relative mt-1 ml-[19px] space-y-0.5 border-l border-stone-200 pl-4">
                  {section.links.map((link) => {
                    const active = isActivePath(pathname, link.href)
                    return (
                      <li key={link.href}>
                        <Link
                          href={link.href}
                          className={`block rounded-lg px-3 py-2 text-[13px] font-ui transition-colors ${FOCUS_RING} ${
                            active
                              ? "bg-white text-[#1a2744] font-medium shadow-sm border border-stone-200"
                              : "text-stone-500 hover:bg-stone-100 hover:text-stone-800"
                          }`}
                        >
                          {link.label}
                        </Link>
                      </li>
                    )
                  })}
                </ul>
              )}
            </div>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="px-4 py-4 border-t border-stone-100">
        {!collapsed && (
          <p className="text-[11px] font-ui text-stone-400 mb-2 truncate">{userEmail}</p>
        )}
        <form
          action="/api/auth/signout"
          method="POST"
          className={collapsed ? "flex justify-center" : ""}
        >
          <button
            type="submit"
            title={collapsed ? "Sign out" : undefined}
            className={`flex items-center gap-2 text-[11px] font-ui font-medium text-stone-500 hover:text-stone-900 transition-colors tracking-wide rounded-lg ${FOCUS_RING}`}
          >
            <LogOut size={14} />
            {!collapsed && "Sign out"}
          </button>
        </form>
      </div>
    </>
  )

  return (
    <>
      {/* Mobile top bar */}
      <div className="md:hidden sticky top-0 z-30 flex items-center justify-between bg-white border-b border-stone-200 px-4 py-3">
        <button
          onClick={() => setMobileOpen(true)}
          className={`flex h-9 w-9 items-center justify-center rounded-lg text-stone-500 hover:bg-stone-100 ${FOCUS_RING}`}
          aria-label="Open menu"
        >
          <Menu size={20} />
        </button>
        <p className="font-display font-bold text-sm text-[#1a2744]">Iron City</p>
        <span className="w-9" aria-hidden="true" />
      </div>

      {/* Mobile overlay backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30 md:hidden"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Mobile drawer */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 max-w-[80vw] bg-white flex flex-col shadow-xl transition-transform duration-300 md:hidden ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Desktop sidebar */}
      <aside
        className={`hidden md:flex shrink-0 bg-white border-r border-stone-200 flex-col transition-[width] duration-200 ${
          collapsed ? "w-[76px]" : "w-64"
        }`}
      >
        {sidebarContent}
      </aside>
    </>
  )
}