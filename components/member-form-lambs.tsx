"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import GuardianLinkSearch from "@/components/guardian-link-search"
import type { Lamb, GuardianBlock, MemberRef } from "@/types"

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

type LambFormData = Omit<Lamb, "id" | "createdAt" | "updatedAt" | "joinedAt">

const emptyForm: LambFormData = {
  firstName: "",
  surname: "",
  otherName: "",
  dateOfBirth: "",
  gender: "male",
  grade: "",
  schoolName: "",
  memberStatus: "active",
  photoUrl: "",
  guardian1: { ...emptyGuardian },
  guardian2: { ...emptyGuardian },
}

interface LambFormProps {
  initialData?: Partial<LambFormData>
  lambId?: string
  mode: "new" | "edit"
}

export default function LambForm({ initialData, lambId, mode }: LambFormProps) {
  const router = useRouter()
  const [form, setForm] = useState<LambFormData>({
    ...emptyForm,
    ...initialData,
    guardian1: { ...emptyGuardian, ...initialData?.guardian1 },
    guardian2: { ...emptyGuardian, ...initialData?.guardian2 },
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  function setField<K extends keyof LambFormData>(key: K, value: LambFormData[K]) {
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
          ? "/api/admin/members/lambs"
          : `/api/admin/members/lambs/${lambId}`
      const method = mode === "new" ? "POST" : "PATCH"

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })

      if (!res.ok) throw new Error((await res.json()).error ?? "Save failed")

      if (mode === "new") {
        const { id } = await res.json()
        router.push(`/admin/members/lambs/${id}`)
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

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl space-y-2">
      {/* SECTION 1 — Ward Information */}
      <p className="form-section-header">Section 1 — Ward Information</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-semibold tracking-[0.08em] uppercase text-stone-500 mb-1.5">
            First Name <span className="text-red-500">*</span>
          </label>
          <input
            value={form.firstName}
            onChange={(e) => setField("firstName", e.target.value)}
            className="admin-input"
            placeholder="First name"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold tracking-[0.08em] uppercase text-stone-500 mb-1.5">
            Surname <span className="text-red-500">*</span>
          </label>
          <input
            value={form.surname}
            onChange={(e) => setField("surname", e.target.value)}
            className="admin-input"
            placeholder="Surname"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold tracking-[0.08em] uppercase text-stone-500 mb-1.5">
            Other Name
          </label>
          <input
            value={form.otherName}
            onChange={(e) => setField("otherName", e.target.value)}
            className="admin-input"
            placeholder="Other name"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-semibold tracking-[0.08em] uppercase text-stone-500 mb-1.5">
            Date of Birth <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            value={form.dateOfBirth}
            onChange={(e) => setField("dateOfBirth", e.target.value)}
            className="admin-input"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold tracking-[0.08em] uppercase text-stone-500 mb-1.5">
            Gender
          </label>
          <select
            value={form.gender}
            onChange={(e) => setField("gender", e.target.value as "male" | "female")}
            className="admin-input"
          >
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold tracking-[0.08em] uppercase text-stone-500 mb-1.5">
            Member Status
          </label>
          <select
            value={form.memberStatus}
            onChange={(e) => setField("memberStatus", e.target.value as Lamb["memberStatus"])}
            className="admin-input"
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="transferred">Transferred</option>
            <option value="deceased">Deceased</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold tracking-[0.08em] uppercase text-stone-500 mb-1.5">
            Grade
          </label>
          <input
            value={form.grade}
            onChange={(e) => setField("grade", e.target.value)}
            className="admin-input"
            placeholder="e.g. Primary 3, KG 2"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold tracking-[0.08em] uppercase text-stone-500 mb-1.5">
            Name of School
          </label>
          <input
            value={form.schoolName}
            onChange={(e) => setField("schoolName", e.target.value)}
            className="admin-input"
            placeholder="School name"
          />
        </div>
      </div>

      {/* SECTION 2 — Guardian 1 */}
      <p className="form-section-header">Section 2 — Parent / Guardian 1</p>

      <GuardianLinkSearch
        onSelect={(member) => handleGuardianLink("guardian1", member)}
        label="Link Guardian 1 to existing member"
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
        <div>
          <label className="block text-xs font-semibold tracking-[0.08em] uppercase text-stone-500 mb-1.5">
            First Name
          </label>
          <input
            value={form.guardian1.firstName}
            onChange={(e) => setGuardian("guardian1", "firstName", e.target.value)}
            className="admin-input"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold tracking-[0.08em] uppercase text-stone-500 mb-1.5">
            Last Name
          </label>
          <input
            value={form.guardian1.lastName}
            onChange={(e) => setGuardian("guardian1", "lastName", e.target.value)}
            className="admin-input"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold tracking-[0.08em] uppercase text-stone-500 mb-1.5">
            Other Name
          </label>
          <input
            value={form.guardian1.otherName}
            onChange={(e) => setGuardian("guardian1", "otherName", e.target.value)}
            className="admin-input"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-semibold tracking-[0.08em] uppercase text-stone-500 mb-1.5">
            Date of Birth
          </label>
          <input
            type="date"
            value={form.guardian1.dateOfBirth}
            onChange={(e) => setGuardian("guardian1", "dateOfBirth", e.target.value)}
            className="admin-input"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold tracking-[0.08em] uppercase text-stone-500 mb-1.5">
            Relationship
          </label>
          <select
            value={form.guardian1.relationship}
            onChange={(e) => setGuardian("guardian1", "relationship", e.target.value)}
            className="admin-input"
          >
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
          <label className="block text-xs font-semibold tracking-[0.08em] uppercase text-stone-500 mb-1.5">
            Telephone Number
          </label>
          <input
            value={form.guardian1.phone}
            onChange={(e) => setGuardian("guardian1", "phone", e.target.value)}
            className="admin-input"
            placeholder="+233 XX XXX XXXX"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold tracking-[0.08em] uppercase text-stone-500 mb-1.5">
          Home Address
        </label>
        <textarea
          value={form.guardian1.homeAddress}
          onChange={(e) => setGuardian("guardian1", "homeAddress", e.target.value)}
          className="admin-input resize-none"
          rows={2}
          placeholder="Guardian 1 home address"
        />
      </div>

      {/* SECTION 3 — Guardian 2 */}
      <p className="form-section-header">Section 3 — Parent / Guardian 2</p>

      <GuardianLinkSearch
        onSelect={(member) => handleGuardianLink("guardian2", member)}
        label="Link Guardian 2 to existing member"
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
        <div>
          <label className="block text-xs font-semibold tracking-[0.08em] uppercase text-stone-500 mb-1.5">
            First Name
          </label>
          <input
            value={form.guardian2.firstName}
            onChange={(e) => setGuardian("guardian2", "firstName", e.target.value)}
            className="admin-input"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold tracking-[0.08em] uppercase text-stone-500 mb-1.5">
            Last Name
          </label>
          <input
            value={form.guardian2.lastName}
            onChange={(e) => setGuardian("guardian2", "lastName", e.target.value)}
            className="admin-input"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold tracking-[0.08em] uppercase text-stone-500 mb-1.5">
            Other Name
          </label>
          <input
            value={form.guardian2.otherName}
            onChange={(e) => setGuardian("guardian2", "otherName", e.target.value)}
            className="admin-input"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-semibold tracking-[0.08em] uppercase text-stone-500 mb-1.5">
            Date of Birth
          </label>
          <input
            type="date"
            value={form.guardian2.dateOfBirth}
            onChange={(e) => setGuardian("guardian2", "dateOfBirth", e.target.value)}
            className="admin-input"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold tracking-[0.08em] uppercase text-stone-500 mb-1.5">
            Relationship
          </label>
          <select
            value={form.guardian2.relationship}
            onChange={(e) => setGuardian("guardian2", "relationship", e.target.value)}
            className="admin-input"
          >
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
          <label className="block text-xs font-semibold tracking-[0.08em] uppercase text-stone-500 mb-1.5">
            Telephone Number
          </label>
          <input
            value={form.guardian2.phone}
            onChange={(e) => setGuardian("guardian2", "phone", e.target.value)}
            className="admin-input"
            placeholder="+233 XX XXX XXXX"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold tracking-[0.08em] uppercase text-stone-500 mb-1.5">
          Home Address
        </label>
        <textarea
          value={form.guardian2.homeAddress}
          onChange={(e) => setGuardian("guardian2", "homeAddress", e.target.value)}
          className="admin-input resize-none"
          rows={2}
          placeholder="Guardian 2 home address"
        />
      </div>

      {error && <p className="text-sm text-red-600 pt-2">{error}</p>}
      {success && <p className="text-sm text-green-600 pt-2">{success}</p>}

      <div className="flex gap-3 pt-4">
        <button type="submit" disabled={saving} className="admin-btn-primary">
          {saving ? "Saving..." : mode === "new" ? "Register Lamb" : "Save Changes"}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="admin-btn-secondary"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}
