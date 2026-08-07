export type UserRole = "platform_admin" | "super_admin" | "contributor" | "viewer"

export type MemberCategory = "lambs" | "teens" | "youth" | "congregation"

export type MemberStatus = "active" | "inactive" | "transferred" | "deceased"

export type Gender = "male" | "female"

export type GuardianRelationship =
  | "father"
  | "mother"
  | "uncle"
  | "aunt"
  | "grandfather"
  | "grandmother"
  | "sibling"
  | "other"

export type MaritalStatus = "single" | "married" | "widowed" | "divorced"

export type ServiceType =
  | "sunday_morning"
  | "sunday_evening"
  | "monday_bible"
  | "wednesday_prayer"
  | "special"

export type FinanceType = "income" | "expenditure"

export type PaymentMethod = "cash" | "mobile_money" | "bank_transfer" | "check"

// Finance category — stored in the `finance_categories` collection so
// super admins can add new ones at runtime instead of a fixed union.
export interface FinanceCategory {
  id: string // slug, e.g. "preachers_salary" — matches FinancialRecord.category
  name: string // display label, e.g. "Preacher's Salary"
  type: FinanceType
  isDefault: boolean
  active: boolean // false = retired/legacy — hidden from create dropdowns, still resolvable for old records
  createdAt: string
  createdBy?: string
}

export type ProgrammeCategory =
  | "sunday_service"
  | "prayer"
  | "bible_study"
  | "special"
  | "annual"

// Guardian block — shared across Lambs, Teens, Youth
export interface GuardianBlock {
  firstName: string
  lastName: string
  otherName: string
  dateOfBirth: string
  relationship: GuardianRelationship
  phone: string
  homeAddress: string
  memberId?: string // links to an existing adult member if found
}

// Lambs (age 4–10)
export interface Lamb {
  id: string
  firstName: string
  surname: string
  otherName: string
  dateOfBirth: string
  gender: Gender
  grade: string
  schoolName: string
  memberStatus: MemberStatus
  photoUrl?: string
  guardian1: GuardianBlock
  guardian2: GuardianBlock
  joinedAt: string
  updatedAt: string
  createdAt: string
}

// Teens (age 11–16) — same as Lamb plus personalPhone
export interface Teen extends Omit<Lamb, "id"> {
  id: string
  personalPhone?: string
}

// Youth (SHS/University)
export interface Youth {
  id: string
  firstName: string
  surname: string
  otherName: string
  dateOfBirth: string
  gender: Gender
  educationLevel: "SHS" | "University" | "Other"
  schoolName: string
  yearGroup: string
  phone: string
  homeAddress: string
  memberStatus: MemberStatus
  photoUrl?: string
  guardian1: GuardianBlock
  guardian2: GuardianBlock
  joinedAt: string
  updatedAt: string
  createdAt: string
}

// Congregation (main adult members)
export interface CongregationMember {
  id: string
  firstName: string
  surname: string
  otherName: string
  dateOfBirth: string
  gender: Gender
  maritalStatus: MaritalStatus
  occupation: string
  phone: string
  alternatePhone: string
  homeAddress: string
  email?: string
  memberStatus: MemberStatus
  baptismDate?: string
  photoUrl?: string
  // Spouse
  spouseFirstName?: string
  spouseLastName?: string
  spousePhone?: string
  spouseMemberId?: string
  // Emergency contact
  emergencyName: string
  emergencyRelation: string
  emergencyPhone: string
  joinedAt: string
  updatedAt: string
  createdAt: string
}

// Lightweight member reference used in attendance and search
export interface MemberRef {
  id: string
  category: MemberCategory
  name: string // "firstName surname"
  phone?: string
  status: MemberStatus
}

// Service session
export interface ServiceSession {
  id: string
  serviceType: ServiceType
  date: string
  title?: string
  notes?: string
  conductedBy: string
  totalPresent: number
  createdBy: string
  createdAt: string
}

// Individual attendance record
export interface AttendanceRecord {
  id: string
  sessionId: string
  memberId: string
  memberCategory: MemberCategory
  memberName: string
  present: boolean
  markedAt: string
  markedBy: string
}

// Attendance summary per member (computed)
export interface MemberAttendanceSummary {
  memberId: string
  memberName: string
  memberCategory: MemberCategory
  phone?: string
  lastSeen: string | null
  consecutiveAbsences: number
  totalThisMonth: number
  totalThisYear: number
}

// Financial record
export interface FinancialRecord {
  id: string
  type: FinanceType
  category: string // FinanceCategory.id
  amount: number
  description: string // shown/labeled as "Notes" in the UI — required for new records
  date: string
  paymentMethod?: PaymentMethod // optional only because pre-existing docs lack it; required for new writes
  recipient?: string // expenditure only — who received the money
  disbursedBy?: string // expenditure only — who handed the money over
  serviceSessionId?: string
  receiptUrl?: string
  recordedBy: string
  approved: boolean
  createdAt: string
  updatedAt: string
}

// Monthly financial period
export interface FinancialPeriod {
  id: string
  year: number
  month: number
  totalIncome: number
  totalExpenditure: number
  netBalance: number
  incomeBreakdown: Record<string, number>
  expenditureBreakdown: Record<string, number>
  closedAt: string
  closedBy: string
}

// Programme / event — internal planning only, no public listing in v1
export interface Programme {
  id: string
  title: string
  date: string
  endDate?: string
  time: string
  location: string
  description: string
  category: ProgrammeCategory
  flyer?: string
  status: "upcoming" | "ongoing" | "past"
  createdAt: string
}

// Tenant — one church's account on the platform
export interface Tenant {
  id: string
  churchName: string
  region: string
  contactEmail: string
  contactPhone?: string
  status: "active" | "suspended"
  publishedInDirectory: boolean
  createdAt: string
  createdBy: string
}

// Lead — interest submission from the public marketing site
export interface Lead {
  id: string
  churchName: string
  contactName: string
  email: string
  phone?: string
  region: string
  message?: string
  status: "new" | "contacted" | "approved" | "declined"
  createdAt: string
}

// Session user
export interface SessionUser {
  uid: string
  email: string
  role: UserRole
  tenantId: string | null
}

// Chart data shapes
export interface AttendanceChartPoint {
  label: string // "Week 1", "Jan", etc.
  lambs: number
  teens: number
  youth: number
  congregation: number
  total: number
}

export interface FinanceChartPoint {
  label: string // "Jan", "Feb", etc.
  income: number
  expenditure: number
  net: number
}

// Service type labels
export const SERVICE_TYPE_LABELS: Record<ServiceType, string> = {
  sunday_morning: "Sunday Morning",
  sunday_evening: "Sunday Evening",
  monday_bible: "Monday Bible Class",
  wednesday_prayer: "Wednesday Prayer",
  special: "Special Service",
}

export const MEMBER_CATEGORY_LABELS: Record<MemberCategory, string> = {
  lambs: "Lambs (4–10)",
  teens: "Teens (11–16)",
  youth: "Youth",
  congregation: "Congregation",
}
