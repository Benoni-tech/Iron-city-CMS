export type UserRole = "super_admin" | "contributor" | "viewer"

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

export type IncomeCategory =
  | "tithe"
  | "offering"
  | "special_collection"
  | "building_fund"
  | "missions"
  | "other"

export type ExpenditureCategory =
  | "utilities"
  | "maintenance"
  | "staff"
  | "missions_support"
  | "programmes"
  | "other"

export type ProgrammeCategory =
  | "sunday_service"
  | "prayer"
  | "bible_study"
  | "special"
  | "annual"

export type ContentStatus = "draft" | "published"

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
  category: IncomeCategory | ExpenditureCategory
  amount: number
  description: string
  date: string
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
  incomeBreakdown: Record<IncomeCategory, number>
  expenditureBreakdown: Record<ExpenditureCategory, number>
  closedAt: string
  closedBy: string
}

// Programme / event
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
  publishedOnSite: boolean
  status: "upcoming" | "ongoing" | "past"
  createdAt: string
}

// Sermon
export interface Sermon {
  id: string
  title: string
  slug: string
  speaker: string
  series?: string
  date: string
  scripture: string
  body: TipTapDocument
  tags: string[]
  status: ContentStatus
  publishedAt: string | null
  createdAt: string
}

// Blog post
export interface BlogPost {
  id: string
  title: string
  slug: string
  excerpt: string
  body: TipTapDocument
  featuredImage: string
  category: "news" | "announcement" | "devotional"
  status: ContentStatus
  publishedAt: string | null
  createdAt: string
}

// Site config
export interface SiteConfig {
  churchName: string
  tagline: string
  phone: string
  email: string
  address: string
  officeHours: string
  mapsEmbedUrl: string
  aboutHistory: TipTapDocument | null
  aboutMission: string
  aboutVision: string
  aboutValues: string[]
  aboutBelief: TipTapDocument | null
  heroHeadline: string
  heroSubline: string
  heroImageUrl: string
  updatedAt: string
}

// Session user
export interface SessionUser {
  uid: string
  email: string
  role: UserRole
}

// TipTap types
export interface TipTapDocument {
  type: "doc"
  content: TipTapNode[]
}

export interface TipTapNode {
  type: string
  attrs?: Record<string, unknown>
  content?: TipTapNode[]
  marks?: TipTapMark[]
  text?: string
}

export interface TipTapMark {
  type: string
  attrs?: Record<string, unknown>
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
