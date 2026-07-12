import type { Metadata } from "next"
import { Plus_Jakarta_Sans, Inter } from "next/font/google"
import "./globals.css"

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
  weight: ["500", "600", "700", "800"],
})

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-ui",
  display: "swap",
})

export const metadata: Metadata = {
  title: {
    default: "Iron City Church of Christ",
    template: "%s | Iron City Church of Christ",
  },
  description:
    "Iron City Church of Christ — a community of faith, worship, and service.",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://ironcitychurchofchrist.org"
  ),
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${jakarta.variable} ${inter.variable}`}>
      <body className="bg-white text-stone-900 antialiased">{children}</body>
    </html>
  )
}