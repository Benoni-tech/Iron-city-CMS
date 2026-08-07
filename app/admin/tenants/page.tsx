"use client"

import { useEffect, useState } from "react"
import type { Tenant } from "@/types"

export default function TenantsPage() {
  const [tenants, setTenants] = useState<Tenant[]>([])
  const [loading, setLoading] = useState(true)

  const [churchName, setChurchName] = useState("")
  const [region, setRegion] = useState("")
  const [contactEmail, setContactEmail] = useState("")
  const [contactPhone, setContactPhone] = useState("")
  const [adminEmail, setAdminEmail] = useState("")
  const [publishedInDirectory, setPublishedInDirectory] = useState(true)
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [credentials, setCredentials] = useState<{ email: string; password: string } | null>(null)

  function loadTenants() {
    fetch("/api/admin/tenants")
      .then((r) => r.json())
      .then((data) => setTenants(data.tenants ?? []))
      .finally(() => setLoading(false))
  }

  useEffect(loadTenants, [])

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!churchName || !region || !contactEmail || !adminEmail) {
      setError("Church name, region, contact email, and admin email are required.")
      return
    }
    setError("")
    setSuccess("")
    setCredentials(null)
    setCreating(true)
    try {
      const res = await fetch("/api/admin/tenants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ churchName, region, contactEmail, contactPhone, adminEmail, publishedInDirectory }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? "Failed to create tenant")
      if (data.warning) {
        setSuccess(data.warning)
      } else if (data.emailed) {
        setSuccess(`${churchName} created — invite sent to ${adminEmail}`)
      } else {
        setSuccess(`${churchName} created — email wasn't sent, so share this login with them yourself:`)
        setCredentials({ email: data.adminEmail, password: data.tempPassword })
      }
      setChurchName(""); setRegion(""); setContactEmail(""); setContactPhone(""); setAdminEmail("")
      loadTenants()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed")
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="font-display font-bold text-3xl text-[#1a2744]">Tenants</h1>
        <p className="text-sm text-stone-400 mt-1">Churches onboarded onto the platform</p>
      </div>

      <div className="bg-white border border-stone-200 rounded-xl p-6 mb-8">
        <h2 className="font-semibold text-[#1a2744] text-sm mb-5">Create New Tenant</h2>
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold tracking-[0.08em] uppercase text-stone-500 mb-1.5">Church Name *</label>
              <input value={churchName} onChange={(e) => setChurchName(e.target.value)} className="admin-input" placeholder="Grace Chapel" />
            </div>
            <div>
              <label className="block text-xs font-semibold tracking-[0.08em] uppercase text-stone-500 mb-1.5">Region *</label>
              <input value={region} onChange={(e) => setRegion(e.target.value)} className="admin-input" placeholder="Greater Accra" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold tracking-[0.08em] uppercase text-stone-500 mb-1.5">Church Contact Email *</label>
              <input type="email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} className="admin-input" placeholder="office@church.org" />
            </div>
            <div>
              <label className="block text-xs font-semibold tracking-[0.08em] uppercase text-stone-500 mb-1.5">Church Contact Phone</label>
              <input value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} className="admin-input" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold tracking-[0.08em] uppercase text-stone-500 mb-1.5">First Admin Email *</label>
            <input type="email" value={adminEmail} onChange={(e) => setAdminEmail(e.target.value)} className="admin-input" placeholder="staff@church.org" />
            <p className="text-xs text-stone-400 mt-1">A Super Admin account is created and an invite with a temporary password is emailed here.</p>
          </div>
          <div className="flex items-center justify-between p-4 bg-stone-50 border border-stone-200 rounded-xl">
            <div>
              <p className="text-sm font-medium text-stone-900">List in public directory</p>
              <p className="text-xs text-stone-400 mt-0.5">Show this church on the public /directory page</p>
            </div>
            <button
              type="button"
              onClick={() => setPublishedInDirectory(!publishedInDirectory)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${publishedInDirectory ? "bg-[#1a2744]" : "bg-stone-200"}`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${publishedInDirectory ? "translate-x-6" : "translate-x-1"}`} />
            </button>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}
          {success && <p className="text-sm text-green-600">{success}</p>}
          {credentials && (
            <div className="bg-stone-50 border border-stone-200 rounded-lg p-3 text-xs font-mono text-stone-700 space-y-1">
              <p>Email: {credentials.email}</p>
              <p>Password: {credentials.password}</p>
            </div>
          )}

          <button type="submit" disabled={creating} className="admin-btn-primary">
            {creating ? "Creating..." : "Create Tenant"}
          </button>
        </form>
      </div>

      <h2 className="font-semibold text-[#1a2744] text-sm mb-4">Existing Tenants</h2>
      {loading ? (
        <p className="text-sm text-stone-400">Loading...</p>
      ) : tenants.length === 0 ? (
        <p className="text-sm text-stone-400 italic">No tenants yet.</p>
      ) : (
        <div className="bg-white border border-stone-200 rounded-xl overflow-hidden">
          {tenants.map((t, i) => (
            <div key={t.id} className={`flex items-center justify-between px-5 py-3.5 ${i > 0 ? "border-t border-stone-100" : ""}`}>
              <div>
                <p className="text-sm font-medium text-stone-900">{t.churchName}</p>
                <p className="text-xs text-stone-400">{t.region}</p>
              </div>
              <div className="flex items-center gap-2">
                {t.publishedInDirectory && <span className="status-badge status-active">In directory</span>}
                <span className={`status-badge ${t.status === "active" ? "status-active" : "status-inactive"}`}>{t.status}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
