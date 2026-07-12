"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import type { CongregationMember, MemberRef } from "@/types"

type FormData = Omit<CongregationMember, "id" | "createdAt" | "updatedAt" | "joinedAt">

const emptyForm: FormData = {
  firstName: "", surname: "", otherName: "", dateOfBirth: "",
  gender: "male", maritalStatus: "single", occupation: "",
  phone: "", alternatePhone: "", homeAddress: "", email: "",
  memberStatus: "active", baptismDate: "", photoUrl: "",
  spouseFirstName: "", spouseLastName: "", spousePhone: "", spouseMemberId: "",
  emergencyName: "", emergencyRelation: "", emergencyPhone: "",
}

interface Props {
  initialData?: Partial<FormData>
  memberId?: string
  mode: "new" | "edit"
}

export default function CongregationForm({ initialData, memberId, mode }: Props) {
  const router = useRouter()
  const [form, setForm] = useState<FormData>({ ...emptyForm, ...initialData })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  function setField<K extends keyof FormData>(key: K, value: FormData[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.firstName || !form.surname || !form.phone) {
      setError("First name, surname, and phone are required.")
      return
    }
    if (!form.emergencyName || !form.emergencyPhone) {
      setError("Emergency contact name and phone are required.")
      return
    }
    setError(""); setSaving(true)
    try {
      const url = mode === "new"
        ? "/api/admin/members/congregation"
        : `/api/admin/members/congregation/${memberId}`
      const res = await fetch(url, {
        method: mode === "new" ? "POST" : "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error((await res.json()).error ?? "Save failed")
      if (mode === "new") {
        const { id } = await res.json()
        router.push(`/admin/members/congregation/${id}`)
      } else { setSuccess("Saved."); setTimeout(() => setSuccess(""), 2500) }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed")
    } finally { setSaving(false) }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl space-y-2">

      {/* SECTION 1 — Personal Information */}
      <p className="form-section-header">Section 1 — Personal Information</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-semibold tracking-[0.08em] uppercase text-stone-500 mb-1.5">First Name <span className="text-red-500">*</span></label>
          <input value={form.firstName} onChange={(e) => setField("firstName", e.target.value)} className="admin-input" />
        </div>
        <div>
          <label className="block text-xs font-semibold tracking-[0.08em] uppercase text-stone-500 mb-1.5">Surname <span className="text-red-500">*</span></label>
          <input value={form.surname} onChange={(e) => setField("surname", e.target.value)} className="admin-input" />
        </div>
        <div>
          <label className="block text-xs font-semibold tracking-[0.08em] uppercase text-stone-500 mb-1.5">Other Name</label>
          <input value={form.otherName} onChange={(e) => setField("otherName", e.target.value)} className="admin-input" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-semibold tracking-[0.08em] uppercase text-stone-500 mb-1.5">Date of Birth</label>
          <input type="date" value={form.dateOfBirth} onChange={(e) => setField("dateOfBirth", e.target.value)} className="admin-input" />
        </div>
        <div>
          <label className="block text-xs font-semibold tracking-[0.08em] uppercase text-stone-500 mb-1.5">Gender</label>
          <select value={form.gender} onChange={(e) => setField("gender", e.target.value as "male"|"female")} className="admin-input">
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold tracking-[0.08em] uppercase text-stone-500 mb-1.5">Marital Status</label>
          <select value={form.maritalStatus} onChange={(e) => setField("maritalStatus", e.target.value as CongregationMember["maritalStatus"])} className="admin-input">
            <option value="single">Single</option>
            <option value="married">Married</option>
            <option value="widowed">Widowed</option>
            <option value="divorced">Divorced</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold tracking-[0.08em] uppercase text-stone-500 mb-1.5">Occupation</label>
          <input value={form.occupation} onChange={(e) => setField("occupation", e.target.value)} className="admin-input" />
        </div>
        <div>
          <label className="block text-xs font-semibold tracking-[0.08em] uppercase text-stone-500 mb-1.5">Email</label>
          <input type="email" value={form.email ?? ""} onChange={(e) => setField("email", e.target.value)} className="admin-input" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold tracking-[0.08em] uppercase text-stone-500 mb-1.5">Phone <span className="text-red-500">*</span></label>
          <input value={form.phone} onChange={(e) => setField("phone", e.target.value)} className="admin-input" placeholder="+233 XX XXX XXXX" />
        </div>
        <div>
          <label className="block text-xs font-semibold tracking-[0.08em] uppercase text-stone-500 mb-1.5">Alternate Phone</label>
          <input value={form.alternatePhone} onChange={(e) => setField("alternatePhone", e.target.value)} className="admin-input" placeholder="+233 XX XXX XXXX" />
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold tracking-[0.08em] uppercase text-stone-500 mb-1.5">Home Address</label>
        <textarea value={form.homeAddress} onChange={(e) => setField("homeAddress", e.target.value)} className="admin-input resize-none" rows={2} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold tracking-[0.08em] uppercase text-stone-500 mb-1.5">Baptism Date</label>
          <input type="date" value={form.baptismDate ?? ""} onChange={(e) => setField("baptismDate", e.target.value)} className="admin-input" />
        </div>
        <div>
          <label className="block text-xs font-semibold tracking-[0.08em] uppercase text-stone-500 mb-1.5">Member Status</label>
          <select value={form.memberStatus} onChange={(e) => setField("memberStatus", e.target.value as CongregationMember["memberStatus"])} className="admin-input">
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="transferred">Transferred</option>
            <option value="deceased">Deceased</option>
          </select>
        </div>
      </div>

      {/* SECTION 2 — Spouse */}
      <p className="form-section-header">Section 2 — Spouse (if married)</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-semibold tracking-[0.08em] uppercase text-stone-500 mb-1.5">Spouse First Name</label>
          <input value={form.spouseFirstName ?? ""} onChange={(e) => setField("spouseFirstName", e.target.value)} className="admin-input" />
        </div>
        <div>
          <label className="block text-xs font-semibold tracking-[0.08em] uppercase text-stone-500 mb-1.5">Spouse Last Name</label>
          <input value={form.spouseLastName ?? ""} onChange={(e) => setField("spouseLastName", e.target.value)} className="admin-input" />
        </div>
        <div>
          <label className="block text-xs font-semibold tracking-[0.08em] uppercase text-stone-500 mb-1.5">Spouse Phone</label>
          <input value={form.spousePhone ?? ""} onChange={(e) => setField("spousePhone", e.target.value)} className="admin-input" placeholder="+233 XX XXX XXXX" />
        </div>
      </div>

      {/* SECTION 3 — Emergency Contact */}
      <p className="form-section-header">Section 3 — Emergency Contact</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-semibold tracking-[0.08em] uppercase text-stone-500 mb-1.5">Full Name <span className="text-red-500">*</span></label>
          <input value={form.emergencyName} onChange={(e) => setField("emergencyName", e.target.value)} className="admin-input" />
        </div>
        <div>
          <label className="block text-xs font-semibold tracking-[0.08em] uppercase text-stone-500 mb-1.5">Relationship</label>
          <input value={form.emergencyRelation} onChange={(e) => setField("emergencyRelation", e.target.value)} className="admin-input" placeholder="e.g. Sibling, Spouse" />
        </div>
        <div>
          <label className="block text-xs font-semibold tracking-[0.08em] uppercase text-stone-500 mb-1.5">Phone <span className="text-red-500">*</span></label>
          <input value={form.emergencyPhone} onChange={(e) => setField("emergencyPhone", e.target.value)} className="admin-input" placeholder="+233 XX XXX XXXX" />
        </div>
      </div>

      {error && <p className="text-sm text-red-600 pt-2">{error}</p>}
      {success && <p className="text-sm text-green-600 pt-2">{success}</p>}

      <div className="flex gap-3 pt-4">
        <button type="submit" disabled={saving} className="admin-btn-primary">
          {saving ? "Saving..." : mode === "new" ? "Register Member" : "Save Changes"}
        </button>
        <button type="button" onClick={() => router.back()} className="admin-btn-secondary">Cancel</button>
      </div>
    </form>
  )
}
