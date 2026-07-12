"use client"

import { useState, useEffect } from "react"
import dynamic from "next/dynamic"
import ImageUpload from "@/components/image-upload"
import type { TipTapDocument } from "@/types"

const TipTapEditor = dynamic(() => import("@/components/tiptap-editor"), { ssr: false })

const emptyDoc: TipTapDocument = { type: "doc", content: [{ type: "paragraph" }] }
type Tab = "hero" | "contact" | "about"

export default function SiteConfigPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState("")
  const [error, setError] = useState("")
  const [tab, setTab] = useState<Tab>("hero")

  const [churchName, setChurchName] = useState("Iron City Church of Christ")
  const [tagline, setTagline] = useState("")
  const [heroHeadline, setHeroHeadline] = useState("")
  const [heroSubline, setHeroSubline] = useState("")
  const [heroImageUrl, setHeroImageUrl] = useState("")
  const [phone, setPhone] = useState("")
  const [email, setEmail] = useState("")
  const [address, setAddress] = useState("")
  const [officeHours, setOfficeHours] = useState("")
  const [mapsEmbedUrl, setMapsEmbedUrl] = useState("")
  const [aboutMission, setAboutMission] = useState("")
  const [aboutVision, setAboutVision] = useState("")
  const [aboutValues, setAboutValues] = useState("")
  const [aboutHistory, setAboutHistory] = useState<TipTapDocument>(emptyDoc)
  const [aboutBelief, setAboutBelief] = useState<TipTapDocument>(emptyDoc)

  useEffect(() => {
    fetch("/api/admin/site-config")
      .then((r) => r.json())
      .then(({ config }) => {
        if (!config) return
        setChurchName(config.churchName ?? "")
        setTagline(config.tagline ?? "")
        setHeroHeadline(config.heroHeadline ?? "")
        setHeroSubline(config.heroSubline ?? "")
        setHeroImageUrl(config.heroImageUrl ?? "")
        setPhone(config.phone ?? "")
        setEmail(config.email ?? "")
        setAddress(config.address ?? "")
        setOfficeHours(config.officeHours ?? "")
        setMapsEmbedUrl(config.mapsEmbedUrl ?? "")
        setAboutMission(config.aboutMission ?? "")
        setAboutVision(config.aboutVision ?? "")
        setAboutValues((config.aboutValues ?? []).join("\n"))
        if (config.aboutHistory) setAboutHistory(config.aboutHistory)
        if (config.aboutBelief) setAboutBelief(config.aboutBelief)
      })
      .finally(() => setLoading(false))
  }, [])

  async function handleSave() {
    setError(""); setSuccess(""); setSaving(true)
    try {
      const res = await fetch("/api/admin/site-config", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          churchName, tagline, heroHeadline, heroSubline, heroImageUrl,
          phone, email, address, officeHours, mapsEmbedUrl,
          aboutMission, aboutVision,
          aboutValues: aboutValues.split("\n").map((v) => v.trim()).filter(Boolean),
          aboutHistory, aboutBelief,
        }),
      })
      if (!res.ok) throw new Error((await res.json()).error ?? "Save failed")
      setSuccess("Saved"); setTimeout(() => setSuccess(""), 2500)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed")
    } finally { setSaving(false) }
  }

  if (loading) return <div className="p-10"><p className="text-sm text-stone-400">Loading...</p></div>

  const tabs: { key: Tab; label: string }[] = [
    { key: "hero", label: "Hero & Identity" },
    { key: "contact", label: "Contact Info" },
    { key: "about", label: "About Pages" },
  ]

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display font-bold text-3xl text-[#1a2744]">Site Config</h1>
          <p className="text-sm text-stone-400 mt-1">Edit public-facing church information</p>
        </div>
        <div className="flex items-center gap-3">
          {error && <p className="text-xs text-red-500">{error}</p>}
          {success && <p className="text-xs text-green-600">{success}</p>}
          <button onClick={handleSave} disabled={saving} className="admin-btn-primary">
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>

      <div className="flex gap-1 mb-8">
        {tabs.map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === t.key ? "bg-[#1a2744] text-white" : "bg-white border border-stone-200 text-stone-600"}`}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === "hero" && (
        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold tracking-[0.08em] uppercase text-stone-500 mb-1.5">Church Name</label>
              <input value={churchName} onChange={(e) => setChurchName(e.target.value)} className="admin-input" />
            </div>
            <div>
              <label className="block text-xs font-semibold tracking-[0.08em] uppercase text-stone-500 mb-1.5">Tagline</label>
              <input value={tagline} onChange={(e) => setTagline(e.target.value)} className="admin-input" placeholder="A community of faith..." />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold tracking-[0.08em] uppercase text-stone-500 mb-1.5">Hero Headline</label>
            <input value={heroHeadline} onChange={(e) => setHeroHeadline(e.target.value)} className="admin-input" placeholder="Welcome to Iron City..." />
          </div>
          <div>
            <label className="block text-xs font-semibold tracking-[0.08em] uppercase text-stone-500 mb-1.5">Hero Subline</label>
            <textarea value={heroSubline} onChange={(e) => setHeroSubline(e.target.value)} className="admin-input resize-none" rows={2} />
          </div>
          <ImageUpload value={heroImageUrl} onChange={setHeroImageUrl} folder="hero" label="Hero Background Image" />
        </div>
      )}

      {tab === "contact" && (
        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold tracking-[0.08em] uppercase text-stone-500 mb-1.5">Phone</label>
              <input value={phone} onChange={(e) => setPhone(e.target.value)} className="admin-input" placeholder="+233 XX XXX XXXX" />
            </div>
            <div>
              <label className="block text-xs font-semibold tracking-[0.08em] uppercase text-stone-500 mb-1.5">Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="admin-input" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold tracking-[0.08em] uppercase text-stone-500 mb-1.5">Address</label>
            <textarea value={address} onChange={(e) => setAddress(e.target.value)} className="admin-input resize-none" rows={2} />
          </div>
          <div>
            <label className="block text-xs font-semibold tracking-[0.08em] uppercase text-stone-500 mb-1.5">Office Hours</label>
            <input value={officeHours} onChange={(e) => setOfficeHours(e.target.value)} className="admin-input" placeholder="Monday – Friday: 9AM – 5PM" />
          </div>
          <div>
            <label className="block text-xs font-semibold tracking-[0.08em] uppercase text-stone-500 mb-1.5">Google Maps Embed URL</label>
            <input value={mapsEmbedUrl} onChange={(e) => setMapsEmbedUrl(e.target.value)} className="admin-input font-mono text-xs" placeholder="https://www.google.com/maps/embed?pb=..." />
          </div>
        </div>
      )}

      {tab === "about" && (
        <div className="space-y-6">
          <div>
            <label className="block text-xs font-semibold tracking-[0.08em] uppercase text-stone-500 mb-1.5">Mission Statement</label>
            <textarea value={aboutMission} onChange={(e) => setAboutMission(e.target.value)} className="admin-input resize-none" rows={3} />
          </div>
          <div>
            <label className="block text-xs font-semibold tracking-[0.08em] uppercase text-stone-500 mb-1.5">Vision Statement</label>
            <textarea value={aboutVision} onChange={(e) => setAboutVision(e.target.value)} className="admin-input resize-none" rows={3} />
          </div>
          <div>
            <label className="block text-xs font-semibold tracking-[0.08em] uppercase text-stone-500 mb-1.5">Core Values (one per line)</label>
            <textarea value={aboutValues} onChange={(e) => setAboutValues(e.target.value)} className="admin-input resize-none font-mono text-sm" rows={5} placeholder={"Faith\nIntegrity\nService\nUnity"} />
          </div>
          <div>
            <label className="block text-xs font-semibold tracking-[0.08em] uppercase text-stone-500 mb-3">Church History</label>
            <TipTapEditor value={aboutHistory} onChange={(doc) => setAboutHistory(doc)} minHeight={250} />
          </div>
          <div>
            <label className="block text-xs font-semibold tracking-[0.08em] uppercase text-stone-500 mb-3">Statement of Faith</label>
            <TipTapEditor value={aboutBelief} onChange={(doc) => setAboutBelief(doc)} minHeight={250} />
          </div>
        </div>
      )}
    </div>
  )
}
