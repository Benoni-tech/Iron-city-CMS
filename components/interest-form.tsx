"use client"

import { useState } from "react"

export default function InterestForm() {
  const [churchName, setChurchName] = useState("")
  const [contactName, setContactName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [region, setRegion] = useState("")
  const [message, setMessage] = useState("")
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [errorMsg, setErrorMsg] = useState("")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!churchName || !contactName || !email || !region) return
    setStatus("loading")

    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ churchName, contactName, email, phone, region, message }),
      })
      if (!res.ok) throw new Error((await res.json()).error ?? "Failed to submit")
      setStatus("success")
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong")
      setStatus("error")
    }
  }

  if (status === "success") {
    return (
      <div className="bg-green-50 border border-green-200 rounded-2xl p-8 text-center">
        <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
          <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="font-display font-bold text-xl text-green-800 mb-2">Thanks for reaching out</h3>
        <p className="text-green-700 text-sm">
          We&apos;ve received your details and will be in touch about setting up your church.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold tracking-[0.08em] uppercase text-stone-500 mb-1.5">
            Church Name *
          </label>
          <input
            value={churchName}
            onChange={(e) => setChurchName(e.target.value)}
            className="admin-input"
            placeholder="Grace Chapel"
            required
          />
        </div>
        <div>
          <label className="block text-xs font-semibold tracking-[0.08em] uppercase text-stone-500 mb-1.5">
            Region *
          </label>
          <input
            value={region}
            onChange={(e) => setRegion(e.target.value)}
            className="admin-input"
            placeholder="Greater Accra"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold tracking-[0.08em] uppercase text-stone-500 mb-1.5">
            Your Name *
          </label>
          <input
            value={contactName}
            onChange={(e) => setContactName(e.target.value)}
            className="admin-input"
            placeholder="Your name"
            required
          />
        </div>
        <div>
          <label className="block text-xs font-semibold tracking-[0.08em] uppercase text-stone-500 mb-1.5">
            Phone (optional)
          </label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="admin-input"
            placeholder="+233 XX XXX XXXX"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold tracking-[0.08em] uppercase text-stone-500 mb-1.5">
          Email *
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="admin-input"
          placeholder="you@church.org"
          required
        />
      </div>

      <div>
        <label className="block text-xs font-semibold tracking-[0.08em] uppercase text-stone-500 mb-1.5">
          Anything else? (optional)
        </label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="admin-input resize-none"
          rows={4}
          placeholder="Tell us a bit about your church"
        />
      </div>

      {status === "error" && <p className="text-sm text-red-600">{errorMsg}</p>}

      <button
        type="submit"
        disabled={status === "loading" || !churchName || !contactName || !email || !region}
        className="bg-[#1a2744] hover:bg-[#1e3a5f] text-white font-ui font-semibold text-sm px-6 py-3.5 rounded-full transition-colors disabled:opacity-50"
      >
        {status === "loading" ? "Submitting..." : "Register Interest"}
      </button>
    </form>
  )
}
