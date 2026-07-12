"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import GuardianLinkSearch from "@/components/guardian-link-search"
import type { Teen, GuardianBlock, MemberRef } from "@/types"

const emptyGuardian: GuardianBlock = {
  firstName: "",
  lastName: "",
  otherName: "",
  dateOfBirth: "",
  relationship: "father",
  phone: "",
  homeAddress: "",
  memberId: "",
}

type TeenFormData = Omit<Teen, "id" | "createdAt" | "updatedAt" | "joinedAt">

const emptyForm: TeenFormData = {
  firstName: "",
  surname: "",
  otherName: "",
  dateOfBirth: "",
  gender: "male",
  grade: "",
  schoolName: "",
  personalPhone: "",
  memberStatus: "active",
  photoUrl: "",
  guardian1: { ...emptyGuardian },
  guardian2: { ...emptyGuardian },
}

interface TeenFormProps {
  initialData?: Partial<TeenFormData>
  teenId?: string
  mode: "new" | "edit"
}

export default function TeenForm({ initialData, teenId, mode }: TeenFormProps) {
  const router = useRouter()
  const [form, setForm] = useState<TeenFormData>({
    ...emptyForm,
    ...initialData,
    guardian1: { ...emptyGuardian, ...initialData?.guardian1 },
    guardian2: { ...emptyGuardian, ...initialData?.guardian2 },
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  function setField<K extends keyof TeenFormData>(key: K, value: TeenFormData[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  function setGuardian(
    which: "guardian1" | "guardian2",
    key: keyof GuardianBlock,
    value: string
  ) {
    setForm((prev) => ({
      ...prev,
      [which]: { ...prev[which], [key]: value },
    }))
  }

  function handleGuardianLink(which: "guardian1" | "guardian2", member: MemberRef) {
    const nameParts = member.name.split(" ")
    setForm((prev) => ({
      ...prev,
      [which]: {
        ...prev[which],
        firstName: nameParts[0] ?? "",
        lastName: nameParts[1] ?? "",
        phone: member.phone ?? prev[which].phone,
        memberId: member.id,
      },
    }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.firstName || !form.surname || !form.dateOfBirth) {
      setError("First name, surname, and date of birth are required.")
      return
    }
    setError("")
    setSaving(true)

    try {
      const url =
        mode === "new"
          ? "/api/admin/members/teens"
          : `/api/admin/members/teens/${teenId}`
      const res = await fetch(url, {
        method: mode === "new" ? "POST" : "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error((await res.json()).error ?? "Save failed")

      if (mode === "new") {
        const { id } = await res.json()
        router.push(`/admin/members/teens/${id}`)
      } else {
        setSuccess("Saved successfully.")
        setTimeout(() => setSuccess(""), 2500)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed")
    } finally {
      setSaving(false)
    }
  }

  const guardianFields = (which: "guardian1" | "guardian2", label: string) => (
    <>
      <p className="form-section-header">{label}</p>
      <GuardianLinkSearch
        onSelect={(m) => handleGuardianLink(which, m)}
        label={`Link ${label} to existing member`}
      />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
        {(["firstName", "lastName", "otherName"] as const).map((field) => (
          <div key={field}>
            <label className="block text-xs font-semibold tracking-[0.08em] uppercase text-stone-500 mb-1.5">
              {field === "firstName" ? "First Name" : field === "lastName" ? "Last Name" : "Other Name"}
            </label>
            <input
              value={form[which][field]}
              onChange={(e) => setGuardian(which, field, e.target.value)}
              className="admin-input"
            />
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
            <option value="father">Father</option>
            <option value="mother">Mother</option>
            <option value="uncle">Uncle</option>
            <option value="aunt">Aunt</option>
            <option value="grandfather">Grandfather</option>
            <option value="grandmother">Grandmother</option>
            <option value="sibling">Sibling</option>
            <option value="other">Other</option>
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
      <p className="form-section-header">Section 1 — Ward Information</p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-semibold tracking-[0.08em] uppercase text-stone-500 mb-1.5">First Name *</label>
          <input value={form.firstName} onChange={(e) => setField("firstName", e.target.value)} className="admin-input" />
        </div>
        <div>
          <label className="block text-xs font-semibold tracking-[0.08em] uppercase text-stone-500 mb-1.5">Surname *</label>
          <input value={form.surname} onChange={(e) => setField("surname", e.target.value)} className="admin-input" />
        </div>
        <div>
          <label className="block text-xs font-semibold tracking-[0.08em] uppercase text-stone-500 mb-1.5">Other Name</label>
          <input value={form.otherName} onChange={(e) => setField("otherName", e.target.value)} className="admin-input" />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-semibold tracking-[0.08em] uppercase text-stone-500 mb-1.5">Date of Birth *</label>
          <input type="date" value={form.dateOfBirth} onChange={(e) => setField("dateOfBirth", e.target.value)} className="admin-input" />
        </div>
        <div>
          <label className="block text-xs font-semibold tracking-[0.08em] uppercase text-stone-500 mb-1.5">Gender</label>
          <select value={form.gender} onChange={(e) => setField("gender", e.target.value as "male" | "female")} className="admin-input">
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold tracking-[0.08em] uppercase text-stone-500 mb-1.5">Status</label>
          <select value={form.memberStatus} onChange={(e) => setField("memberStatus", e.target.value as Teen["memberStatus"])} className="admin-input">
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="transferred">Transferred</option>
            <option value="deceased">Deceased</option>
          </select>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-semibold tracking-[0.08em] uppercase text-stone-500 mb-1.5">Grade</label>
          <input value={form.grade} onChange={(e) => setField("grade", e.target.value)} className="admin-input" placeholder="e.g. Form 2, JHS 3" />
        </div>
        <div>
          <label className="block text-xs font-semibold tracking-[0.08em] uppercase text-stone-500 mb-1.5">Name of School</label>
          <input value={form.schoolName} onChange={(e) => setField("schoolName", e.target.value)} className="admin-input" />
        </div>
        <div>
          <label className="block text-xs font-semibold tracking-[0.08em] uppercase text-stone-500 mb-1.5">Personal Phone (optional)</label>
          <input value={form.personalPhone ?? ""} onChange={(e) => setField("personalPhone", e.target.value)} className="admin-input" placeholder="+233 XX XXX XXXX" />
        </div>
      </div>

      {guardianFields("guardian1", "Section 2 — Parent / Guardian 1")}
      {guardianFields("guardian2", "Section 3 — Parent / Guardian 2")}

      {error && <p className="text-sm text-red-600 pt-2">{error}</p>}
      {success && <p className="text-sm text-green-600 pt-2">{success}</p>}

      <div className="flex gap-3 pt-4">
        <button type="submit" disabled={saving} className="admin-btn-primary">
          {saving ? "Saving..." : mode === "new" ? "Register Teen" : "Save Changes"}
        </button>
        <button type="button" onClick={() => router.back()} className="admin-btn-secondary">Cancel</button>
      </div>
    </form>
  )
}
