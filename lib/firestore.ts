import { FieldValue, Timestamp, type CollectionReference, type Query } from "firebase-admin/firestore"
import { adminDb } from "./firebase-admin"
import { generateSlug } from "./slug"
import { DEFAULT_FINANCE_CATEGORIES } from "./finance-category-defaults"
import type {
  Lamb,
  Teen,
  Youth,
  CongregationMember,
  MemberRef,
  MemberCategory,
  MemberStatus,
  ServiceSession,
  ServiceType,
  AttendanceRecord,
  FinancialRecord,
  FinancialPeriod,
  FinanceCategory,
  FinanceType,
  Programme,
} from "@/types"

function ts(value: unknown): string {
  if (value instanceof Timestamp) return value.toDate().toISOString()
  if (typeof value === "string") return value
  return new Date().toISOString()
}

// Every tenant's data lives under tenants/{tenantId}/{collection} — this is
// the single place that builds that path, so every query function below
// takes a tenantId instead of touching a root collection directly.
function tenantCollection(tenantId: string, name: string): CollectionReference {
  return adminDb.collection("tenants").doc(tenantId).collection(name)
}

// ─────────────────────────────────────────────
// MEMBER COUNTS
// ─────────────────────────────────────────────

export async function getMemberCounts(tenantId: string): Promise<Record<MemberCategory, number>> {
  const [lambs, teens, youth, congregation] = await Promise.all([
    tenantCollection(tenantId, "lambs").where("memberStatus", "==", "active").count().get(),
    tenantCollection(tenantId, "teens").where("memberStatus", "==", "active").count().get(),
    tenantCollection(tenantId, "youth").where("memberStatus", "==", "active").count().get(),
    tenantCollection(tenantId, "congregation").where("memberStatus", "==", "active").count().get(),
  ])
  return {
    lambs: lambs.data().count,
    teens: teens.data().count,
    youth: youth.data().count,
    congregation: congregation.data().count,
  }
}

// Counts active members per category as of a cutoff date, so the dashboard
// can compare "members now" vs "members as of last month" for a trend %.
//
// One caveat worth knowing: this uses `createdAt` (when the record was
// added to the system) as the cutoff field, since that's what's available.
// It measures growth in *recorded* members, not necessarily actual
// join/baptism dates — if you track a separate membership date field
// somewhere, swap `createdAt` below for that field instead.
//
// Note: combining a `where("memberStatus", "==", ...)` equality filter with
// a `where("createdAt", "<=", ...)` range filter on a different field
// requires a Firestore composite index. If it's missing, Firestore will
// throw an error in your server logs with a direct link to create it —
// just click that link once and it'll work from then on.
export async function getMemberCountsAsOf(
  tenantId: string,
  cutoff: Date
): Promise<Record<MemberCategory, number>> {
  const cutoffTimestamp = Timestamp.fromDate(cutoff)
  const categories: MemberCategory[] = ["lambs", "teens", "youth", "congregation"]

  const counts = await Promise.all(
    categories.map((category) =>
      tenantCollection(tenantId, category)
        .where("memberStatus", "==", "active")
        .where("createdAt", "<=", cutoffTimestamp)
        .count()
        .get()
    )
  )

  return {
    lambs: counts[0].data().count,
    teens: counts[1].data().count,
    youth: counts[2].data().count,
    congregation: counts[3].data().count,
  }
}

// ─────────────────────────────────────────────
// LAMBS
// ─────────────────────────────────────────────

export async function getLambs(tenantId: string, statusFilter?: MemberStatus): Promise<Lamb[]> {
  let q: Query = tenantCollection(tenantId, "lambs")
  if (statusFilter) q = q.where("memberStatus", "==", statusFilter)
  q = q.orderBy("surname", "asc")
  const snap = await q.get()
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Lamb))
}

export async function getLambById(tenantId: string, id: string): Promise<Lamb | null> {
  const snap = await tenantCollection(tenantId, "lambs").doc(id).get()
  if (!snap.exists) return null
  return { id: snap.id, ...snap.data() } as Lamb
}

export async function createLamb(
  tenantId: string,
  data: Omit<Lamb, "id" | "createdAt" | "updatedAt">
): Promise<string> {
  const ref = await tenantCollection(tenantId, "lambs").add({
    ...data,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  })
  return ref.id
}

export async function updateLamb(tenantId: string, id: string, data: Partial<Lamb>): Promise<void> {
  const { id: _id, ...rest } = data
  await tenantCollection(tenantId, "lambs")
    .doc(id)
    .update({ ...rest, updatedAt: FieldValue.serverTimestamp() })
}

export async function deleteLamb(tenantId: string, id: string): Promise<void> {
  await tenantCollection(tenantId, "lambs").doc(id).delete()
}

// ─────────────────────────────────────────────
// TEENS
// ─────────────────────────────────────────────

export async function getTeens(tenantId: string, statusFilter?: MemberStatus): Promise<Teen[]> {
  let q: Query = tenantCollection(tenantId, "teens")
  if (statusFilter) q = q.where("memberStatus", "==", statusFilter)
  q = q.orderBy("surname", "asc")
  const snap = await q.get()
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Teen))
}

export async function getTeenById(tenantId: string, id: string): Promise<Teen | null> {
  const snap = await tenantCollection(tenantId, "teens").doc(id).get()
  if (!snap.exists) return null
  return { id: snap.id, ...snap.data() } as Teen
}

export async function createTeen(
  tenantId: string,
  data: Omit<Teen, "id" | "createdAt" | "updatedAt">
): Promise<string> {
  const ref = await tenantCollection(tenantId, "teens").add({
    ...data,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  })
  return ref.id
}

export async function updateTeen(tenantId: string, id: string, data: Partial<Teen>): Promise<void> {
  const { id: _id, ...rest } = data
  await tenantCollection(tenantId, "teens")
    .doc(id)
    .update({ ...rest, updatedAt: FieldValue.serverTimestamp() })
}

export async function deleteTeen(tenantId: string, id: string): Promise<void> {
  await tenantCollection(tenantId, "teens").doc(id).delete()
}

// ─────────────────────────────────────────────
// YOUTH
// ─────────────────────────────────────────────

export async function getYouth(tenantId: string, statusFilter?: MemberStatus): Promise<Youth[]> {
  let q: Query = tenantCollection(tenantId, "youth")
  if (statusFilter) q = q.where("memberStatus", "==", statusFilter)
  q = q.orderBy("surname", "asc")
  const snap = await q.get()
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Youth))
}

export async function getYouthById(tenantId: string, id: string): Promise<Youth | null> {
  const snap = await tenantCollection(tenantId, "youth").doc(id).get()
  if (!snap.exists) return null
  return { id: snap.id, ...snap.data() } as Youth
}

export async function createYouth(
  tenantId: string,
  data: Omit<Youth, "id" | "createdAt" | "updatedAt">
): Promise<string> {
  const ref = await tenantCollection(tenantId, "youth").add({
    ...data,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  })
  return ref.id
}

export async function updateYouth(tenantId: string, id: string, data: Partial<Youth>): Promise<void> {
  const { id: _id, ...rest } = data
  await tenantCollection(tenantId, "youth")
    .doc(id)
    .update({ ...rest, updatedAt: FieldValue.serverTimestamp() })
}

export async function deleteYouth(tenantId: string, id: string): Promise<void> {
  await tenantCollection(tenantId, "youth").doc(id).delete()
}

// ─────────────────────────────────────────────
// CONGREGATION
// ─────────────────────────────────────────────

export async function getCongregation(
  tenantId: string,
  statusFilter?: MemberStatus
): Promise<CongregationMember[]> {
  let q: Query = tenantCollection(tenantId, "congregation")
  if (statusFilter) q = q.where("memberStatus", "==", statusFilter)
  q = q.orderBy("surname", "asc")
  const snap = await q.get()
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as CongregationMember))
}

export async function getCongregationMemberById(
  tenantId: string,
  id: string
): Promise<CongregationMember | null> {
  const snap = await tenantCollection(tenantId, "congregation").doc(id).get()
  if (!snap.exists) return null
  return { id: snap.id, ...snap.data() } as CongregationMember
}

export async function createCongregationMember(
  tenantId: string,
  data: Omit<CongregationMember, "id" | "createdAt" | "updatedAt">
): Promise<string> {
  const ref = await tenantCollection(tenantId, "congregation").add({
    ...data,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  })
  return ref.id
}

export async function updateCongregationMember(
  tenantId: string,
  id: string,
  data: Partial<CongregationMember>
): Promise<void> {
  const { id: _id, ...rest } = data
  await tenantCollection(tenantId, "congregation")
    .doc(id)
    .update({ ...rest, updatedAt: FieldValue.serverTimestamp() })
}

export async function deleteCongregationMember(tenantId: string, id: string): Promise<void> {
  await tenantCollection(tenantId, "congregation").doc(id).delete()
}

// ─────────────────────────────────────────────
// MEMBER SEARCH (for guardian linking)
// ─────────────────────────────────────────────

export async function searchAdultMembers(tenantId: string, searchTerm: string): Promise<MemberRef[]> {
  const term = searchTerm.trim().toLowerCase()
  const results: MemberRef[] = []

  const [youth, congregation] = await Promise.all([
    tenantCollection(tenantId, "youth").where("memberStatus", "==", "active").orderBy("surname").get(),
    tenantCollection(tenantId, "congregation")
      .where("memberStatus", "==", "active")
      .orderBy("surname")
      .get(),
  ])

  youth.docs.forEach((d) => {
    const data = d.data()
    const name = `${data.firstName} ${data.surname}`.toLowerCase()
    if (name.includes(term) || (data.phone as string)?.includes(term)) {
      results.push({
        id: d.id,
        category: "youth",
        name: `${data.firstName} ${data.surname}`,
        phone: data.phone,
        status: data.memberStatus,
      })
    }
  })

  congregation.docs.forEach((d) => {
    const data = d.data()
    const name = `${data.firstName} ${data.surname}`.toLowerCase()
    if (name.includes(term) || (data.phone as string)?.includes(term)) {
      results.push({
        id: d.id,
        category: "congregation",
        name: `${data.firstName} ${data.surname}`,
        phone: data.phone,
        status: data.memberStatus,
      })
    }
  })

  return results.slice(0, 10)
}

// Get all children linked to a guardian by memberId
export async function getLinkedChildren(
  tenantId: string,
  memberId: string
): Promise<{ id: string; name: string; category: "lambs" | "teens"; dob: string }[]> {
  const results: { id: string; name: string; category: "lambs" | "teens"; dob: string }[] = []

  const [lambsSnap, teensSnap] = await Promise.all([
    tenantCollection(tenantId, "lambs").where("guardian1.memberId", "==", memberId).get(),
    tenantCollection(tenantId, "teens").where("guardian1.memberId", "==", memberId).get(),
  ])

  lambsSnap.docs.forEach((d) => {
    const data = d.data()
    results.push({
      id: d.id,
      name: `${data.firstName} ${data.surname}`,
      category: "lambs",
      dob: data.dateOfBirth,
    })
  })

  teensSnap.docs.forEach((d) => {
    const data = d.data()
    results.push({
      id: d.id,
      name: `${data.firstName} ${data.surname}`,
      category: "teens",
      dob: data.dateOfBirth,
    })
  })

  return results
}

// ─────────────────────────────────────────────
// SERVICE SESSIONS
// ─────────────────────────────────────────────

export async function getServiceSessions(tenantId: string, limitCount = 20): Promise<ServiceSession[]> {
  const snap = await tenantCollection(tenantId, "service_sessions")
    .orderBy("date", "desc")
    .limit(limitCount)
    .get()
  return snap.docs.map((d) => {
    const data = d.data()
    return {
      id: d.id,
      serviceType: data.serviceType,
      date: data.date,
      title: data.title,
      notes: data.notes,
      conductedBy: data.conductedBy,
      totalPresent: data.totalPresent ?? 0,
      createdBy: data.createdBy,
      createdAt: ts(data.createdAt),
    } as ServiceSession
  })
}

export async function getServiceSessionById(tenantId: string, id: string): Promise<ServiceSession | null> {
  const snap = await tenantCollection(tenantId, "service_sessions").doc(id).get()
  if (!snap.exists) return null
  const data = snap.data()!
  return {
    id: snap.id,
    serviceType: data.serviceType,
    date: data.date,
    title: data.title,
    notes: data.notes,
    conductedBy: data.conductedBy,
    totalPresent: data.totalPresent ?? 0,
    createdBy: data.createdBy,
    createdAt: ts(data.createdAt),
  }
}

export async function createServiceSession(
  tenantId: string,
  data: Omit<ServiceSession, "id" | "totalPresent" | "createdAt" | "createdBy">,
  createdBy: string
): Promise<string> {
  const ref = await tenantCollection(tenantId, "service_sessions").add({
    ...data,
    totalPresent: 0,
    createdBy,
    createdAt: FieldValue.serverTimestamp(),
  })
  return ref.id
}

// ─────────────────────────────────────────────
// ATTENDANCE RECORDS
// ─────────────────────────────────────────────

export async function getAttendanceForSession(
  tenantId: string,
  sessionId: string
): Promise<AttendanceRecord[]> {
  const snap = await tenantCollection(tenantId, "attendance_records")
    .where("sessionId", "==", sessionId)
    .get()
  return snap.docs.map(
    (d) =>
      ({
        id: d.id,
        ...d.data(),
        markedAt: ts(d.data().markedAt),
      } as AttendanceRecord)
  )
}

export async function saveAttendanceBatch(
  tenantId: string,
  sessionId: string,
  records: Omit<AttendanceRecord, "id" | "markedAt" | "sessionId" | "markedBy">[],
  markedBy: string
): Promise<void> {
  const batch = adminDb.batch()
  let presentCount = 0

  for (const record of records) {
    const ref = tenantCollection(tenantId, "attendance_records").doc()
    batch.set(ref, {
      ...record,
      sessionId,
      markedBy,
      markedAt: FieldValue.serverTimestamp(),
    })
    if (record.present) presentCount++
  }

  batch.update(tenantCollection(tenantId, "service_sessions").doc(sessionId), {
    totalPresent: presentCount,
  })

  await batch.commit()
}

export async function getMemberLastAttendance(
  tenantId: string,
  memberId: string,
  category: MemberCategory
): Promise<string | null> {
  const snap = await tenantCollection(tenantId, "attendance_records")
    .where("memberId", "==", memberId)
    .where("memberCategory", "==", category)
    .where("present", "==", true)
    .orderBy("markedAt", "desc")
    .limit(1)
    .get()
  if (snap.empty) return null
  return ts(snap.docs[0].data().markedAt)
}

// Get Sunday morning sessions from the last N weeks
export async function getRecentSundaySessions(
  tenantId: string,
  weeksBack: number
): Promise<ServiceSession[]> {
  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - weeksBack * 7)
  const cutoffStr = cutoff.toISOString().slice(0, 10)

  const snap = await tenantCollection(tenantId, "service_sessions")
    .where("serviceType", "==", "sunday_morning")
    .where("date", ">=", cutoffStr)
    .orderBy("date", "desc")
    .get()
  return snap.docs.map(
    (d) =>
      ({
        id: d.id,
        ...d.data(),
        createdAt: ts(d.data().createdAt),
      } as ServiceSession)
  )
}

// Attendance stats for charts
export async function getWeeklyAttendanceStats(
  tenantId: string,
  weeksBack = 8
): Promise<{ date: string; serviceType: ServiceType; total: number }[]> {
  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - weeksBack * 7)
  const cutoffStr = cutoff.toISOString().slice(0, 10)

  const snap = await tenantCollection(tenantId, "service_sessions")
    .where("date", ">=", cutoffStr)
    .orderBy("date", "asc")
    .get()
  return snap.docs.map((d) => ({
    date: d.data().date,
    serviceType: d.data().serviceType,
    total: d.data().totalPresent ?? 0,
  }))
}

// ─────────────────────────────────────────────
// FINANCIAL RECORDS
// ─────────────────────────────────────────────

export async function getFinancialRecords(
  tenantId: string,
  type?: "income" | "expenditure",
  limitCount = 50
): Promise<FinancialRecord[]> {
  let q: Query = tenantCollection(tenantId, "financial_records")
  if (type) q = q.where("type", "==", type)
  q = q.orderBy("date", "desc").limit(limitCount)

  const snap = await q.get()
  return snap.docs.map(
    (d) =>
      ({
        id: d.id,
        ...d.data(),
        createdAt: ts(d.data().createdAt),
        updatedAt: ts(d.data().updatedAt),
      } as FinancialRecord)
  )
}

export async function getFinancialRecordsByMonth(
  tenantId: string,
  year: number,
  month: number
): Promise<FinancialRecord[]> {
  const startDate = `${year}-${String(month).padStart(2, "0")}-01`
  const endMonth = month === 12 ? 1 : month + 1
  const endYear = month === 12 ? year + 1 : year
  const endDate = `${endYear}-${String(endMonth).padStart(2, "0")}-01`

  const snap = await tenantCollection(tenantId, "financial_records")
    .where("date", ">=", startDate)
    .where("date", "<", endDate)
    .orderBy("date", "asc")
    .get()
  return snap.docs.map(
    (d) =>
      ({
        id: d.id,
        ...d.data(),
        createdAt: ts(d.data().createdAt),
        updatedAt: ts(d.data().updatedAt),
      } as FinancialRecord)
  )
}

export async function getFinancialRecordsByDateRange(
  tenantId: string,
  startDate: string,
  endDate: string
): Promise<FinancialRecord[]> {
  const snap = await tenantCollection(tenantId, "financial_records")
    .where("date", ">=", startDate)
    .where("date", "<=", endDate)
    .orderBy("date", "asc")
    .get()
  return snap.docs.map(
    (d) =>
      ({
        id: d.id,
        ...d.data(),
        createdAt: ts(d.data().createdAt),
        updatedAt: ts(d.data().updatedAt),
      } as FinancialRecord)
  )
}

export async function createFinancialRecord(
  tenantId: string,
  data: Omit<FinancialRecord, "id" | "createdAt" | "updatedAt">
): Promise<string> {
  const ref = await tenantCollection(tenantId, "financial_records").add({
    ...data,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  })
  return ref.id
}

export async function updateFinancialRecord(
  tenantId: string,
  id: string,
  data: Partial<FinancialRecord>
): Promise<void> {
  const { id: _id, ...rest } = data
  await tenantCollection(tenantId, "financial_records")
    .doc(id)
    .update({
      ...rest,
      updatedAt: FieldValue.serverTimestamp(),
    })
}

export async function deleteFinancialRecord(tenantId: string, id: string): Promise<void> {
  await tenantCollection(tenantId, "financial_records").doc(id).delete()
}

export async function getFinancialPeriods(tenantId: string): Promise<FinancialPeriod[]> {
  const snap = await tenantCollection(tenantId, "financial_periods")
    .orderBy("year", "desc")
    .orderBy("month", "desc")
    .get()
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as FinancialPeriod))
}

export async function saveFinancialPeriod(
  tenantId: string,
  data: Omit<FinancialPeriod, "id">
): Promise<void> {
  const periodId = `${data.year}-${String(data.month).padStart(2, "0")}`
  await tenantCollection(tenantId, "financial_periods").doc(periodId).set(data)
}

// ─────────────────────────────────────────────
// FINANCE CATEGORIES
// ─────────────────────────────────────────────

async function ensureFinanceCategoriesSeeded(tenantId: string): Promise<void> {
  const snap = await tenantCollection(tenantId, "finance_categories").get()
  if (!snap.empty) return

  const batch = adminDb.batch()
  for (const category of DEFAULT_FINANCE_CATEGORIES) {
    batch.set(tenantCollection(tenantId, "finance_categories").doc(category.id), {
      ...category,
      createdAt: FieldValue.serverTimestamp(),
    })
  }
  await batch.commit()
}

export async function getFinanceCategories(
  tenantId: string,
  type?: FinanceType,
  activeOnly = true
): Promise<FinanceCategory[]> {
  await ensureFinanceCategoriesSeeded(tenantId)

  let q: Query = tenantCollection(tenantId, "finance_categories")
  if (type) q = q.where("type", "==", type)
  if (activeOnly) q = q.where("active", "==", true)

  const snap = await q.get()
  const categories = snap.docs.map(
    (d) =>
      ({
        id: d.id,
        ...d.data(),
        createdAt: ts(d.data().createdAt),
      } as FinanceCategory)
  )

  return categories.sort((a, b) => a.name.localeCompare(b.name))
}

export async function createFinanceCategory(
  tenantId: string,
  data: {
    name: string
    type: FinanceType
    createdBy: string
  }
): Promise<string> {
  const id = generateSlug(data.name)
  await tenantCollection(tenantId, "finance_categories")
    .doc(id)
    .set({
      id,
      name: data.name,
      type: data.type,
      isDefault: false,
      active: true,
      createdBy: data.createdBy,
      createdAt: FieldValue.serverTimestamp(),
    })
  return id
}

export async function deactivateFinanceCategory(tenantId: string, id: string): Promise<void> {
  await tenantCollection(tenantId, "finance_categories").doc(id).update({ active: false })
}

// ─────────────────────────────────────────────
// PROGRAMMES — internal planning only, no public listing
// ─────────────────────────────────────────────

export async function getUpcomingProgrammes(tenantId: string, limitCount = 10): Promise<Programme[]> {
  const today = new Date().toISOString().slice(0, 10)
  const snap = await tenantCollection(tenantId, "programmes")
    .where("date", ">=", today)
    .orderBy("date", "asc")
    .limit(limitCount)
    .get()
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Programme))
}

export async function getAllProgrammesAdmin(tenantId: string): Promise<Programme[]> {
  const snap = await tenantCollection(tenantId, "programmes").orderBy("date", "desc").get()
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Programme))
}

export async function getProgrammeById(tenantId: string, id: string): Promise<Programme | null> {
  const snap = await tenantCollection(tenantId, "programmes").doc(id).get()
  if (!snap.exists) return null
  return { id: snap.id, ...snap.data() } as Programme
}

export async function createProgramme(
  tenantId: string,
  data: Omit<Programme, "id" | "createdAt">
): Promise<string> {
  const ref = await tenantCollection(tenantId, "programmes").add({
    ...data,
    createdAt: FieldValue.serverTimestamp(),
  })
  return ref.id
}

export async function updateProgramme(
  tenantId: string,
  id: string,
  data: Partial<Programme>
): Promise<void> {
  const { id: _id, ...rest } = data
  await tenantCollection(tenantId, "programmes").doc(id).update(rest)
}

export async function deleteProgramme(tenantId: string, id: string): Promise<void> {
  await tenantCollection(tenantId, "programmes").doc(id).delete()
}
