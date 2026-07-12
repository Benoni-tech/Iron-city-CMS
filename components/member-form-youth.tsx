"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import GuardianLinkSearch from "@/components/guardian-link-search"
import type { Youth, GuardianBlock, MemberRef } from "@/types"

const emptyGuardian: GuardianBlock = {
  firstName: "", lastName: "", otherName: "", dateOfBirth: "",
  relationship: "father", phone: "", homeAddress: "", memberId: "",
}

type YouthFormData = Omit<Youth, "id" | "createdAt" | "updatedAt" | "joinedAt">

const emptyForm: YouthFormData = {
  firstName: "", surname: "", otherName: "", dateOfBirth: "",
  gender: "male", educationLevel: "SHS", schoolName: "", yearGroup: "",
  phone: "", homeAddress: "", memberStatus: "active", photoUrl: "",
  guardian1: { ...emptyGuardian }, guardian2: { ...emptyGuardian },
}

interface YouthFormProps {
  initialData?: Partial<YouthFormData>
  youthId?: string
  mode: "new" | "edit"
}

export default function YouthForm({ initialData, youthId, mode }: YouthFormProps) {
  const router = useRouter()
  const [form, setForm] = useState<YouthFormData>({
    ...emptyForm, ...initialData,
    guardian1: { ...emptyGuardian, ...initialData?.guardian1 },
    guardian2: { ...emptyGuardian, ...initialData?.guardian2 },
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  function setField<K extends keyof YouthFormData>(key: K, value: YouthFormData[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  function setGuardian(which: "guardian1" | "guardian2", key: keyof GuardianBlock, value: string) {
    setForm((prev) => ({ ...prev, [which]: { ...prev[which], [key]: value } }))
  }

  function handleGuardianLink(which: "guardian1" | "guardian2", member: MemberRef) {
    const parts = member.name.split(" ")
    setForm((prev) => ({
      ...prev,
      [which]: { ...prev[which], firstName: parts[0] ?? "", lastName: parts[1] ?? "", phone: member.phone ?? prev[which].phone, memberId: member.id },
    }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.firstName || !form.surname || !form.dateOfBirth || !form.phone) {
      setError("First name, surname, date of birth and phone are required.")
      return
    }
    setError(""); setSaving(true)
    try {
      const url = mode === "new" ? "/api/admin/members/youth" : `/api/admin/members/youth/${youthId}`
      const res = await fetch(url, {
        method: mode === "new" ? "POST" : "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error((await res.json()).error ?? "Save failed")
      if (mode === "new") {
        const { id } = await res.json()
        router.push(`/admin/members/youth/${id}`)
      } else { setSuccess("Saved."); setTimeout(() => setSuccess(""), 2500) }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed")
    } finally { setSaving(false) }
  }

  const guardianSection = (which: "guardian1" | "guardian2", num: number) => (
    <>
      <p className="form-section-header">Section {num} — Parent / Guardian {num - 1}</p>
      <GuardianLinkSearch onSelect={(m) => handleGuardianLink(which, m)} label={`Link Guardian ${num - 1} to existing member`} />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
        {(["firstName","lastName","otherName"] as const).map((f) => (
          <div key={f}>
            <label className="block text-xs font-semibold tracking-[0.08em] uppercase text-stone-500 mb-1.5">
              {f === "firstName" ? "First Name" : f === "lastName" ? "Last Name" : "Other Name"}
            </label>
            <input value={form[which][f]} onChange={(e) => setGuardian(which, f, e.target.value)} className="admin-input" />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-semibold tracking-[0.08em] uppercase text-stone-500 mb-1.5">Date of Birth</label>
          <input type="date" value={form[which].dateOfBirth} onChange={(e) => setGuardian(which, "dateOfBirth", e.target.value)} className="admin-input" />
        </div>
        <div>
          <label className="block text-xs font-semibold tracking-[0.08em] uppercase text-stone-500 mb-1.5">Relationship</label>
          <select value={form[which].relationship} onChange={(e) => setGuardian(which, "relationship", e.target.value)} className="admin-input">
            {["father","mother","uncle","aunt","grandfather","grandmother","sibling","other"].map((r) => (
              <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold tracking-[0.08em] uppercase text-stone-500 mb-1.5">Telephone</label>
          <input value={form[which].phone} onChange={(e) => setGuardian(which, "phone", e.target.value)} className="admin-input" placeholder="+233 XX XXX XXXX" />
        </div>
      </div>
      <div>
        <label className="block text-xs font-semibold tracking-[0.08em] uppercase text-stone-500 mb-1.5">Home Address</label>
        <textarea value={form[which].homeAddress} onChange={(e) => setGuardian(which, "homeAddress", e.target.value)} className="admin-input resize-none" rows={2} />
      </div>
    </>
  )

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl space-y-2">
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
          <label className="block text-xs font-semibold tracking-[0.08em] uppercase text-stone-500 mb-1.5">Date of Birth <span className="text-red-500">*</span></label>
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
          <label className="block text-xs font-semibold tracking-[0.08em] uppercase text-stone-500 mb-1.5">Education Level</label>
          <select value={form.educationLevel} onChange={(e) => setField("educationLevel", e.target.value as Youth["educationLevel"])} className="admin-input">
            <option value="SHS">SHS</option>
            <option value="University">University</option>
            <option value="Other">Other</option>
          </select>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-semibold tracking-[0.08em] uppercase text-stone-500 mb-1.5">School Name</label>
          <input value={form.schoolName} onChange={(e) => setField("schoolName", e.target.value)} className="admin-input" />
        </div>
        <div>
          <label className="block text-xs font-semibold tracking-[0.08em] uppercase text-stone-500 mb-1.5">Year / Form</label>
          <input value={form.yearGroup} onChange={(e) => setField("yearGroup", e.target.value)} className="admin-input" placeholder="e.g. Year 2, Form 3" />
        </div>
        <div>
          <label className="block text-xs font-semibold tracking-[0.08em] uppercase text-stone-500 mb-1.5">Phone <span className="text-red-500">*</span></label>
          <input value={form.phone} onChange={(e) => setField("phone", e.target.value)} className="admin-input" placeholder="+233 XX XXX XXXX" />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold tracking-[0.08em] uppercase text-stone-500 mb-1.5">Home Address</label>
          <textarea value={form.homeAddress} onChange={(e) => setField("homeAddress", e.target.value)} className="admin-input resize-none" rows={2} />
        </div>
        <div>
          <label className="block text-xs font-semibold tracking-[0.08em] uppercase text-stone-500 mb-1.5">Member Status</label>
          <select value={form.memberStatus} onChange={(e) => setField("memberStatus", e.target.value as Youth["memberStatus"])} className="admin-input">
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="transferred">Transferred</option>
            <option value="deceased">Deceased</option>
          </select>
        </div>
      </div>
      {guardianSection("guardian1", 2)}
      {guardianSection("guardian2", 3)}
      {error && <p className="text-sm text-red-600 pt-2">{error}</p>}
      {success && <p className="text-sm text-green-600 pt-2">{success}</p>}
      <div className="flex gap-3 pt-4">
        <button type="submit" disabled={saving} className="admin-btn-primary">
          {saving ? "Saving..." : mode === "new" ? "Register Youth" : "Save Changes"}
        </button>
        <button type="button" onClick={() => router.back()} className="admin-btn-secondary">Cancel</button>
      </div>
    </form>
  )
}
