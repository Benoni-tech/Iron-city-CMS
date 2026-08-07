import Link from "next/link"

export default function Footer() {
  return (
    <footer className="bg-[#1a2744] text-white">
      <div className="max-w-6xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div>
            <p className="font-display font-bold text-xl mb-4">Church Platform</p>
            <p className="text-white/70 text-sm leading-relaxed max-w-xs">
              One place for any church to manage membership, attendance, and finances — and get a home
              on the web.
            </p>
          </div>

          <div>
            <p className="text-[11px] font-ui font-semibold tracking-[0.12em] uppercase text-[#c9a84c] mb-4">
              Quick Links
            </p>
            <ul className="space-y-2">
              {[
                { href: "/", label: "Home" },
                { href: "/directory", label: "Directory" },
                { href: "/contact", label: "Contact" },
                { href: "/#get-started", label: "Register Interest" },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-white/70 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-white/40 text-xs">
            &copy; {new Date().getFullYear()} Church Platform. All rights reserved.
          </p>
          <Link
            href="/login"
            className="text-white/30 hover:text-white/60 text-xs transition-colors"
          >
            Staff login
          </Link>
        </div>
      </div>
    </footer>
  )
}
