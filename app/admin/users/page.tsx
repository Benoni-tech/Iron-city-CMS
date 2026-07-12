"use client"

import { useState } from "react"
import type { UserRole } from "@/types"

interface AdminUser {
  uid: string
  email: string
  role: UserRole
  displayName?: string
}

const roleLabels: Record<UserRole, string> = {
  super_admin: "Super Admin",
  contributor: "Contributor",
  viewer: "Viewer",
}

const roleColors: Record<UserRole, string> = {
  super_admin: "bg-red-100 text-red-800",
  contributor: "bg-blue-100 text-blue-800",
  viewer: "bg-stone-100 text-stone-600",
}

export default function UsersAdminPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [role, setRole] = useState<UserRole>("contributor")
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!email || !password) { setError("Email and password are required."); return }
    setError(""); setSaving(true)
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, role }),
      })
      if (!res.ok) throw new Error((await res.json()).error ?? "Failed to create user")
      setSuccess(`Account created for ${email}`)
      setEmail(""); setPassword("")
      setTimeout(() => setSuccess(""), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed")
    } finally { setSaving(false) }
  }

  function setSaving(v: boolean) { setCreating(v) }

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="font-display font-bold text-3xl text-[#1a2744]">User Management</h1>
        <p className="text-sm text-stone-400 mt-1">Create and manage admin accounts</p>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-8">
        <p className="text-sm text-amber-800 font-medium">Role permissions</p>
        <ul className="text-xs text-amber-700 mt-2 space-y-1">
          <li><strong>Super Admin</strong> — full access including finance, site config, and user management</li>
          <li><strong>Contributor</strong> — membership, attendance, programmes, sermons, and blog</li>
          <li><strong>Viewer</strong> — read-only access to reports and the dashboard</li>
        </ul>
      </div>

      <div className="bg-white border border-stone-200 rounded-xl p-6 mb-8">
        <h2 className="font-semibold text-[#1a2744] text-sm mb-5">Create New Account</h2>

        <form onSubmit={handleCreate} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold tracking-[0.08em] uppercase text-stone-500 mb-1.5">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="admin-input"
                placeholder="staff@church.org"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold tracking-[0.08em] uppercase text-stone-500 mb-1.5">
                Temporary Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="admin-input"
                placeholder="Min. 8 characters"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold tracking-[0.08em] uppercase text-stone-500 mb-1.5">
              Role
            </label>
            <select value={role} onChange={(e) => setRole(e.target.value as UserRole)} className="admin-input">
              <option value="contributor">Contributor</option>
              <option value="viewer">Viewer</option>
              <option value="super_admin">Super Admin</option>
            </select>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}
          {success && <p className="text-sm text-green-600">{success}</p>}

          <button type="submit" disabled={creating} className="admin-btn-primary">
            {creating ? "Creating..." : "Create Account"}
          </button>
        </form>
      </div>

      <div className="bg-stone-50 border border-stone-200 rounded-xl p-5">
        <p className="text-xs text-stone-500 leading-relaxed">
          New accounts are created in Firebase Authentication. The staff member should sign in at{" "}
          <span className="font-mono bg-stone-100 px-1 rounded">/login</span> with the temporary password
          and change it from their account settings. To remove a user, disable their account in the
          Firebase Console under Authentication → Users.
        </p>
      </div>
    </div>
  )
}
