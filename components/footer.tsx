import Link from "next/link"

export default function Footer() {
  return (
    <footer className="bg-[#1a2744] text-white">
      <div className="max-w-6xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          <div>
            <p className="font-display font-bold text-xl mb-1">Iron City</p>
            <p className="text-[11px] font-ui tracking-[0.18em] uppercase text-white/60 mb-4">
              Church of Christ
            </p>
            <p className="text-white/70 text-sm leading-relaxed">
              A community of faith, worship, and service.
            </p>
          </div>

          <div>
            <p className="text-[11px] font-ui font-semibold tracking-[0.12em] uppercase text-[#c9a84c] mb-4">
              Quick Links
            </p>
            <ul className="space-y-2">
              {[
                { href: "/", label: "Home" },
                { href: "/about", label: "About Us" },
                { href: "/sermons", label: "Sermons" },
                { href: "/events", label: "Events" },
                { href: "/contact", label: "Contact" },
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

          <div>
            <p className="text-[11px] font-ui font-semibold tracking-[0.12em] uppercase text-[#c9a84c] mb-4">
              Service Times
            </p>
            <ul className="space-y-2 text-sm text-white/70">
              <li>Sunday Morning — 9:00 AM</li>
              <li>Sunday Evening — 5:00 PM</li>
              <li>Monday Bible Class — 6:30 PM</li>
              <li>Wednesday Prayer — 6:30 PM</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-white/40 text-xs">
            &copy; {new Date().getFullYear()} Iron City Church of Christ. All rights reserved.
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
