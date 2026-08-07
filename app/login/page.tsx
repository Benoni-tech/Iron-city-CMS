"use client"

import { Suspense, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { signInWithEmailAndPassword } from "firebase/auth"
import { auth } from "@/lib/firebase"
import { Eye, EyeOff } from "lucide-react"

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  )
}

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const next = searchParams.get("next") ?? "/admin"

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const credential = await signInWithEmailAndPassword(auth, email, password)
      const idToken = await credential.user.getIdToken()

      const res = await fetch("/api/auth/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
      })

      if (!res.ok) throw new Error("Session creation failed")
      router.push(next)
      router.refresh()
    } catch (err: unknown) {
      const code = (err as { code?: string }).code
      if (
        code === "auth/invalid-credential" ||
        code === "auth/wrong-password" ||
        code === "auth/user-not-found"
      ) {
        setError("Invalid email or password.")
      } else if (code === "auth/too-many-requests") {
        setError("Too many attempts. Try again later.")
      } else {
        setError("Sign in failed. Please try again.")
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#e5e1d8] flex items-center justify-center p-4 md:p-8">
      <div className="w-full max-w-5xl bg-black rounded-3xl overflow-hidden flex flex-col md:flex-row shadow-2xl">
        <div className="hidden md:flex md:w-1/2 relative flex-col justify-end p-10 min-h-[600px] bg-gradient-to-br from-[#1a2744] via-[#0f1420] to-black">
          <div className="absolute top-8 left-8 w-12 h-12 rounded-xl bg-[#0f1420] border border-white/10 flex items-center justify-center">
            <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-[#c98a2b] to-[#e8c07a]" />
          </div>

          <div>
            <h2 className="text-white font-display font-bold text-3xl leading-tight mb-4">
              One Portal,
              <br />
              Every Ministry
            </h2>
            <p className="text-white/50 text-sm leading-relaxed max-w-xs">
              Manage your church&apos;s members, attendance, and finances, all from one staff portal.
            </p>
          </div>

          <div className="flex gap-1.5 mt-8">
            <span className="w-2 h-2 rounded-full bg-white" />
            <span className="w-2 h-2 rounded-full bg-white/30" />
            <span className="w-2 h-2 rounded-full bg-white/30" />
          </div>
        </div>

        <div className="w-full md:w-1/2 bg-white flex flex-col p-6 sm:p-10">
          <div className="flex items-center justify-between mb-10">
            <div className="w-9 h-9 rounded-lg border border-stone-200 flex items-center justify-center">
              <div className="w-4 h-4 rounded-full bg-gradient-to-tr from-[#c98a2b] to-[#e8c07a]" />
            </div>
            <p className="text-xs text-stone-500">
              Need access?{" "}
              <a
                href="/contact"
                className="font-semibold text-[#1a2744] underline underline-offset-2"
              >
                Contact us
              </a>
            </p>
          </div>

          <div className="flex-1 flex flex-col justify-center max-w-sm w-full mx-auto">
            <h1 className="font-display font-bold text-2xl text-[#1a2744] text-center mb-1">
              Welcome back
            </h1>
            <p className="text-sm text-stone-400 text-center mb-7">
              Sign in with your staff account to continue
            </p>

            <div className="h-px bg-stone-200 mb-6" />

            <form onSubmit={handleSubmit} className="space-y-4" autoComplete="on">
              <div>
                <label className="block text-xs font-semibold tracking-[0.08em] uppercase text-stone-500 mb-1.5">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-lg border border-stone-200 px-3.5 py-2.5 text-sm text-[#1a2744] placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#c98a2b]/40 focus:border-[#c98a2b]"
                  placeholder="you@example.com"
                  required
                  disabled={loading}
                  autoComplete="email"
                  autoCapitalize="none"
                  spellCheck={false}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold tracking-[0.08em] uppercase text-stone-500 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-lg border border-stone-200 px-3.5 py-2.5 pr-10 text-sm text-[#1a2744] placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#c98a2b]/40 focus:border-[#c98a2b]"
                    placeholder="minimum 8 characters"
                    required
                    minLength={8}
                    disabled={loading}
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                    tabIndex={-1}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {error && (
                <p className="text-sm text-red-600" role="alert">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading || !email || !password}
                className="w-full mt-2 rounded-lg bg-gradient-to-r from-[#c98a2b] to-[#dba43f] text-white font-semibold text-sm py-2.5 flex items-center justify-center gap-1.5 hover:brightness-105 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                {loading ? "Signing in..." : "Sign in ->"}
              </button>

              <div className="text-center">
                <a
                  href="/forgot-password"
                  className="text-xs font-semibold text-[#1a2744] underline underline-offset-2"
                >
                  Forgot password?
                </a>
              </div>
            </form>
          </div>

          <div className="flex items-center justify-between text-[11px] text-stone-400 pt-8">
            <p>Copyright {new Date().getFullYear()} Church Platform</p>
            <div className="flex gap-4">
              <a href="/privacy" className="hover:text-stone-600">Privacy Policy</a>
              <a href="/support" className="hover:text-stone-600">Support</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}