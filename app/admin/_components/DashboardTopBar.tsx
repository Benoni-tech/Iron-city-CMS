"use client"

import { useState } from "react"
import Link from "next/link"
import { Search, Bell, Settings, ChevronDown, LogOut } from "lucide-react"

interface NotificationItem {
  id: string
  label: string
  sublabel?: string
}

export default function DashboardTopBar({
  userEmail,
  roleLabel,
  isSuperAdmin,
  notifications,
}: {
  userEmail: string
  roleLabel: string
  isSuperAdmin: boolean
  notifications: NotificationItem[]
}) {
  const [profileOpen, setProfileOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)

  const anyOpen = profileOpen || notifOpen

  function closeAll() {
    setProfileOpen(false)
    setNotifOpen(false)
  }

  return (
    <div className="relative flex items-center justify-between gap-4 px-6 py-4 border-b border-stone-200 bg-white">
      {/* Click-outside layer */}
      {anyOpen && (
        <button
          aria-hidden="true"
          tabIndex={-1}
          className="fixed inset-0 z-10 cursor-default"
          onClick={closeAll}
        />
      )}

      <div className="flex items-center gap-1.5 text-sm text-stone-400 min-w-0">
        <span className="truncate">Admin</span>
        <span>/</span>
        <span className="font-semibold text-[#1a2744]">Dashboard</span>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative hidden sm:block">
          <Search
            size={15}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-stone-400"
          />
          <input
            type="text"
            placeholder="Search members, sessions..."
            className="w-56 lg:w-72 rounded-lg border border-stone-200 bg-stone-50 py-2 pl-9 pr-3 text-sm text-[#1a2744] placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#1a2744]/20 focus:border-[#1a2744] transition-colors"
          />
        </div>

        {/* Notifications */}
        <div className="relative z-20">
          <button
            onClick={() => {
              setNotifOpen((o) => !o)
              setProfileOpen(false)
            }}
            className="relative flex h-9 w-9 items-center justify-center rounded-lg text-stone-500 hover:bg-stone-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1a2744]/40"
            aria-label="Notifications"
          >
            <Bell size={17} />
            {notifications.length > 0 && (
              <span className="absolute top-1 right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold text-white">
                {notifications.length}
              </span>
            )}
          </button>

          {notifOpen && (
            <div className="absolute right-0 mt-2 w-72 rounded-xl border border-stone-200 bg-white shadow-lg overflow-hidden">
              <div className="px-4 py-3 border-b border-stone-100">
                <p className="text-xs font-semibold text-[#1a2744]">
                  Absent members (3+ Sundays)
                </p>
              </div>
              {notifications.length === 0 ? (
                <p className="px-4 py-6 text-xs text-stone-400 text-center">
                  No absences to flag right now.
                </p>
              ) : (
                <ul className="max-h-64 overflow-y-auto">
                  {notifications.map((n) => (
                    <li
                      key={n.id}
                      className="px-4 py-2.5 border-b border-stone-50 last:border-0"
                    >
                      <p className="text-sm text-stone-800">{n.label}</p>
                      {n.sublabel && (
                        <p className="text-[11px] text-stone-400">{n.sublabel}</p>
                      )}
                    </li>
                  ))}
                </ul>
              )}
              <Link
                href="/admin/attendance/reports"
                className="block px-4 py-2.5 text-xs font-semibold text-[#c9a84c] hover:bg-stone-50 transition-colors"
                onClick={closeAll}
              >
                View full report →
              </Link>
            </div>
          )}
        </div>

        {isSuperAdmin && (
          <Link
            href="/admin/site-config"
            className="hidden sm:flex h-9 w-9 items-center justify-center rounded-lg text-stone-500 hover:bg-stone-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1a2744]/40"
            aria-label="Settings"
          >
            <Settings size={17} />
          </Link>
        )}

        {/* Profile */}
        <div className="relative z-20">
          <button
            onClick={() => {
              setProfileOpen((o) => !o)
              setNotifOpen(false)
            }}
            className="flex items-center gap-2 rounded-lg py-1 pl-1 pr-2 hover:bg-stone-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1a2744]/40"
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#1a2744] text-white text-[11px] font-semibold">
              {userEmail.slice(0, 2).toUpperCase()}
            </span>
            <ChevronDown size={14} className="hidden sm:block text-stone-400" />
          </button>

          {profileOpen && (
            <div className="absolute right-0 mt-2 w-56 rounded-xl border border-stone-200 bg-white shadow-lg overflow-hidden">
              <div className="px-4 py-3 border-b border-stone-100">
                <p className="text-sm font-medium text-stone-800 truncate">{userEmail}</p>
                <p className="text-[11px] text-stone-400">{roleLabel}</p>
              </div>
              <form action="/api/auth/signout" method="POST">
                <button
                  type="submit"
                  className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-stone-600 hover:bg-stone-50 transition-colors"
                >
                  <LogOut size={14} />
                  Sign out
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}