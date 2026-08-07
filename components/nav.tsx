"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"

const links = [
  { href: "/", label: "Home" },
  { href: "/directory", label: "Directory" },
  { href: "/contact", label: "Contact" },
]

export default function Nav() {
  const pathname = usePathname()
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  const isHero = pathname === "/"
  const glass = isHero && !scrolled

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60)
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <header className="fixed top-4 left-4 right-4 md:top-6 md:left-8 md:right-8 z-50">
      <nav
        className={`pill-nav max-w-6xl mx-auto h-16 px-4 md:px-6 flex items-center justify-between border ${
          glass
            ? "bg-white/10 backdrop-blur-md border-white/20"
            : "bg-white border-stone-100 shadow-lg"
        }`}
      >
        <Link
          href="/"
          className={`flex items-center gap-2 font-display font-bold text-lg tracking-tight transition-colors ${
            glass ? "text-white" : "text-[#1a2744]"
          }`}
        >
          <span className="w-8 h-8 rounded-full bg-[#c9a84c] flex items-center justify-center text-[#1a2744] text-xs font-bold">
            CP
          </span>
          <span>
            Church Platform
          </span>
        </Link>

        <ul className="hidden md:flex items-center gap-1">
          {links.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className={`px-4 py-2 rounded-full text-sm font-medium tracking-wide transition-colors ${
                  pathname === link.href
                    ? glass
                      ? "bg-white/15 text-[#e8d5a3]"
                      : "bg-[#f8f7f4] text-[#1a2744] font-semibold"
                    : glass
                    ? "text-white/85 hover:bg-white/10 hover:text-white"
                    : "text-stone-600 hover:bg-stone-50 hover:text-[#1a2744]"
                }`}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-3">
          <Link
            href="/#get-started"
            className="hidden md:inline-flex bg-[#c9a84c] hover:bg-[#b8953e] text-[#1a2744] font-semibold text-sm px-5 py-2.5 rounded-full transition-colors"
          >
            Get Started
          </Link>

          <button
            onClick={() => setOpen(!open)}
            className={`md:hidden p-2 rounded-full ${glass ? "text-white" : "text-stone-800"}`}
            aria-label="Toggle menu"
          >
            <span className={`block w-5 h-0.5 bg-current transition-all ${open ? "rotate-45 translate-y-1" : ""}`} />
            <span className={`block w-5 h-0.5 bg-current mt-1.5 transition-all ${open ? "-rotate-45 -translate-y-1" : ""}`} />
          </button>
        </div>
      </nav>

      {open && (
        <div className="md:hidden mt-2 bg-white rounded-3xl border border-stone-100 shadow-lg px-6 pb-6 pt-4 max-w-6xl mx-auto">
          <ul className="flex flex-col gap-2">
            {links.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="block px-3 py-2 rounded-full text-sm font-medium text-stone-700 hover:bg-stone-50 hover:text-[#1a2744] transition-colors"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
          <Link
            href="/#get-started"
            onClick={() => setOpen(false)}
            className="mt-4 block text-center bg-[#c9a84c] text-[#1a2744] font-semibold text-sm px-5 py-3 rounded-full"
          >
            Get Started
          </Link>
        </div>
      )}
    </header>
  )
}