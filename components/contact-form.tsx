"use client"

import { useState } from "react"

export default function ContactForm() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [message, setMessage] = useState("")
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [errorMsg, setErrorMsg] = useState("")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name || !email || !message) return
    setStatus("loading")

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, phone, message }),
      })
      if (!res.ok) throw new Error((await res.json()).error ?? "Failed to send")
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
        <h3 className="font-display font-bold text-xl text-green-800 mb-2">Message Sent</h3>
        <p className="text-green-700 text-sm">
          Thank you for reaching out. We will get back to you as soon as possible.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold tracking-[0.08em] uppercase text-stone-500 mb-1.5">
            Full Name *
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
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
          placeholder="your@email.com"
          required
        />
      </div>

      <div>
        <label className="block text-xs font-semibold tracking-[0.08em] uppercase text-stone-500 mb-1.5">
          Message *
        </label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="admin-input resize-none"
          rows={5}
          placeholder="How can we help you?"
          required
        />
      </div>

      {status === "error" && (
        <p className="text-sm text-red-600">{errorMsg}</p>
      )}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={status === "loading" || !name || !email || !message}
          className="bg-[#1a2744] hover:bg-[#1e3a5f] text-white font-ui font-semibold text-sm px-6 py-3.5 rounded-full transition-colors disabled:opacity-50"
        >
          {status === "loading" ? "Sending..." : "Send Message"}
        </button>
        <button
          type="submit"
          disabled={status === "loading" || !name || !email || !message}
          aria-label="Send message"
          className="w-12 h-12 shrink-0 rounded-full bg-[#1a2744] hover:bg-[#1e3a5f] flex items-center justify-center transition-colors disabled:opacity-50"
        >
          <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M7 17L17 7M17 7H8M17 7v9" />
          </svg>
        </button>
      </div>
    </form>
  )
}