import { FieldValue, Timestamp, type Query } from "firebase-admin/firestore"
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
  Sermon,
  BlogPost,
  SiteConfig,
  TipTapDocument,
} from "@/types"

function ts(value: unknown): string {
  if (value instanceof Timestamp) return value.toDate().toISOString()
  if (typeof value === "string") return value
  return new Date().toISOString()
}

// ─────────────────────────────────────────────
// MEMBER COUNTS
// ─────────────────────────────────────────────

export async function getMemberCounts(): Promise<Record<MemberCategory, number>> {
  const [lambs, teens, youth, congregation] = await Promise.all([
    adminDb.collection("lambs").where("memberStatus", "==", "active").count().get(),
    adminDb.collection("teens").where("memberStatus", "==", "active").count().get(),
    adminDb.collection("youth").where("memberStatus", "==", "active").count().get(),
    adminDb.collection("congregation").where("memberStatus", "==", "active").count().get(),
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
  cutoff: Date
): Promise<Record<MemberCategory, number>> {
  const cutoffTimestamp = Timestamp.fromDate(cutoff)
  const categories: MemberCategory[] = ["lambs", "teens", "youth", "congregation"]

  const counts = await Promise.all(
    categories.map((category) =>
      adminDb
        .collection(category)
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

export async function getLambs(statusFilter?: MemberStatus): Promise<Lamb[]> {
  let q: Query = adminDb.collection("lambs")
  if (statusFilter) q = q.where("memberStatus", "==", statusFilter)
  q = q.orderBy("surname", "asc")
  const snap = await q.get()
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Lamb))
}

export async function getLambById(id: string): Promise<Lamb | null> {
  const snap = await adminDb.collection("lambs").doc(id).get()
  if (!snap.exists) return null
  return { id: snap.id, ...snap.data() } as Lamb
}

export async function createLamb(data: Omit<Lamb, "id" | "createdAt" | "updatedAt">): Promise<string> {
  const ref = await adminDb.collection("lambs").add({
    ...data,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  })
  return ref.id
}

export async function updateLamb(id: string, data: Partial<Lamb>): Promise<void> {
  const { id: _id, ...rest } = data
  await adminDb.collection("lambs").doc(id).update({ ...rest, updatedAt: FieldValue.serverTimestamp() })
}

export async function deleteLamb(id: string): Promise<void> {
  await adminDb.collection("lambs").doc(id).delete()
}

// ─────────────────────────────────────────────
// TEENS
// ─────────────────────────────────────────────

export async function getTeens(statusFilter?: MemberStatus): Promise<Teen[]> {
  let q: Query = adminDb.collection("teens")
  if (statusFilter) q = q.where("memberStatus", "==", statusFilter)
  q = q.orderBy("surname", "asc")
  const snap = await q.get()
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Teen))
}

export async function getTeenById(id: string): Promise<Teen | null> {
  const snap = await adminDb.collection("teens").doc(id).get()
  if (!snap.exists) return null
  return { id: snap.id, ...snap.data() } as Teen
}

export async function createTeen(data: Omit<Teen, "id" | "createdAt" | "updatedAt">): Promise<string> {
  const ref = await adminDb.collection("teens").add({
    ...data,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  })
  return ref.id
}

export async function updateTeen(id: string, data: Partial<Teen>): Promise<void> {
  const { id: _id, ...rest } = data
  await adminDb.collection("teens").doc(id).update({ ...rest, updatedAt: FieldValue.serverTimestamp() })
}

export async function deleteTeen(id: string): Promise<void> {
  await adminDb.collection("teens").doc(id).delete()
}

// ─────────────────────────────────────────────
// YOUTH
// ─────────────────────────────────────────────

export async function getYouth(statusFilter?: MemberStatus): Promise<Youth[]> {
  let q: Query = adminDb.collection("youth")
  if (statusFilter) q = q.where("memberStatus", "==", statusFilter)
  q = q.orderBy("surname", "asc")
  const snap = await q.get()
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Youth))
}

export async function getYouthById(id: string): Promise<Youth | null> {
  const snap = await adminDb.collection("youth").doc(id).get()
  if (!snap.exists) return null
  return { id: snap.id, ...snap.data() } as Youth
}

export async function createYouth(data: Omit<Youth, "id" | "createdAt" | "updatedAt">): Promise<string> {
  const ref = await adminDb.collection("youth").add({
    ...data,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  })
  return ref.id
}

export async function updateYouth(id: string, data: Partial<Youth>): Promise<void> {
  const { id: _id, ...rest } = data
  await adminDb.collection("youth").doc(id).update({ ...rest, updatedAt: FieldValue.serverTimestamp() })
}

export async function deleteYouth(id: string): Promise<void> {
  await adminDb.collection("youth").doc(id).delete()
}

// ─────────────────────────────────────────────
// CONGREGATION
// ─────────────────────────────────────────────

export async function getCongregation(statusFilter?: MemberStatus): Promise<CongregationMember[]> {
  let q: Query = adminDb.collection("congregation")
  if (statusFilter) q = q.where("memberStatus", "==", statusFilter)
  q = q.orderBy("surname", "asc")
  const snap = await q.get()
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as CongregationMember))
}

export async function getCongregationMemberById(id: string): Promise<CongregationMember | null> {
  const snap = await adminDb.collection("congregation").doc(id).get()
  if (!snap.exists) return null
  return { id: snap.id, ...snap.data() } as CongregationMember
}

export async function createCongregationMember(
  data: Omit<CongregationMember, "id" | "createdAt" | "updatedAt">
): Promise<string> {
  const ref = await adminDb.collection("congregation").add({
    ...data,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  })
  return ref.id
}

export async function updateCongregationMember(
  id: string,
  data: Partial<CongregationMember>
): Promise<void> {
  const { id: _id, ...rest } = data
  await adminDb.collection("congregation").doc(id).update({ ...rest, updatedAt: FieldValue.serverTimestamp() })
}

export async function deleteCongregationMember(id: string): Promise<void> {
  await adminDb.collection("congregation").doc(id).delete()
}

// ─────────────────────────────────────────────
// MEMBER SEARCH (for guardian linking)
// ─────────────────────────────────────────────

export async function searchAdultMembers(searchTerm: string): Promise<MemberRef[]> {
  const term = searchTerm.trim().toLowerCase()
  const results: MemberRef[] = []

  const [youth, congregation] = await Promise.all([
    adminDb.collection("youth").where("memberStatus", "==", "active").orderBy("surname").get(),
    adminDb.collection("congregation").where("memberStatus", "==", "active").orderBy("surname").get(),
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
export async function getLinkedChildren(memberId: string): Promise<
  { id: string; name: string; category: "lambs" | "teens"; dob: string }[]
> {
  const results: { id: string; name: string; category: "lambs" | "teens"; dob: string }[] = []

  const [lambsSnap, teensSnap] = await Promise.all([
    adminDb.collection("lambs").where("guardian1.memberId", "==", memberId).get(),
    adminDb.collection("teens").where("guardian1.memberId", "==", memberId).get(),
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

export async function getServiceSessions(limitCount = 20): Promise<ServiceSession[]> {
  const snap = await adminDb
    .collection("service_sessions")
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

export async function getServiceSessionById(id: string): Promise<ServiceSession | null> {
  const snap = await adminDb.collection("service_sessions").doc(id).get()
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
  data: Omit<ServiceSession, "id" | "totalPresent" | "createdAt" | "createdBy">,
  createdBy: string
): Promise<string> {
  const ref = await adminDb.collection("service_sessions").add({
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

export async function getAttendanceForSession(sessionId: string): Promise<AttendanceRecord[]> {
  const snap = await adminDb.collection("attendance_records").where("sessionId", "==", sessionId).get()
  return snap.docs.map((d) => ({
    id: d.id,
    ...d.data(),
    markedAt: ts(d.data().markedAt),
  } as AttendanceRecord))
}

export async function saveAttendanceBatch(
  sessionId: string,
  records: Omit<AttendanceRecord, "id" | "markedAt" | "sessionId" | "markedBy">[],
  markedBy: string
): Promise<void> {
  const batch = adminDb.batch()
  let presentCount = 0

  for (const record of records) {
    const ref = adminDb.collection("attendance_records").doc()
    batch.set(ref, {
      ...record,
      sessionId,
      markedBy,
      markedAt: FieldValue.serverTimestamp(),
    })
    if (record.present) presentCount++
  }

  batch.update(adminDb.collection("service_sessions").doc(sessionId), {
    totalPresent: presentCount,
  })

  await batch.commit()
}

export async function getMemberLastAttendance(
  memberId: string,
  category: MemberCategory
): Promise<string | null> {
  const snap = await adminDb
    .collection("attendance_records")
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
export async function getRecentSundaySessions(weeksBack: number): Promise<ServiceSession[]> {
  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - weeksBack * 7)
  const cutoffStr = cutoff.toISOString().slice(0, 10)

  const snap = await adminDb
    .collection("service_sessions")
    .where("serviceType", "==", "sunday_morning")
    .where("date", ">=", cutoffStr)
    .orderBy("date", "desc")
    .get()
  return snap.docs.map((d) => ({
    id: d.id,
    ...d.data(),
    createdAt: ts(d.data().createdAt),
  } as ServiceSession))
}

// Attendance stats for charts
export async function getWeeklyAttendanceStats(
  weeksBack = 8
): Promise<{ date: string; serviceType: ServiceType; total: number }[]> {
  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - weeksBack * 7)
  const cutoffStr = cutoff.toISOString().slice(0, 10)

  const snap = await adminDb
    .collection("service_sessions")
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
  type?: "income" | "expenditure",
  limitCount = 50
): Promise<FinancialRecord[]> {
  let q: Query = adminDb.collection("financial_records")
  if (type) q = q.where("type", "==", type)
  q = q.orderBy("date", "desc").limit(limitCount)

  const snap = await q.get()
  return snap.docs.map((d) => ({
    id: d.id,
    ...d.data(),
    createdAt: ts(d.data().createdAt),
    updatedAt: ts(d.data().updatedAt),
  } as FinancialRecord))
}

export async function getFinancialRecordsByMonth(
  year: number,
  month: number
): Promise<FinancialRecord[]> {
  const startDate = `${year}-${String(month).padStart(2, "0")}-01`
  const endMonth = month === 12 ? 1 : month + 1
  const endYear = month === 12 ? year + 1 : year
  const endDate = `${endYear}-${String(endMonth).padStart(2, "0")}-01`

  const snap = await adminDb
    .collection("financial_records")
    .where("date", ">=", startDate)
    .where("date", "<", endDate)
    .orderBy("date", "asc")
    .get()
  return snap.docs.map((d) => ({
    id: d.id,
    ...d.data(),
    createdAt: ts(d.data().createdAt),
    updatedAt: ts(d.data().updatedAt),
  } as FinancialRecord))
}

export async function getFinancialRecordsByDateRange(
  startDate: string,
  endDate: string
): Promise<FinancialRecord[]> {
  const snap = await adminDb
    .collection("financial_records")
    .where("date", ">=", startDate)
    .where("date", "<=", endDate)
    .orderBy("date", "asc")
    .get()
  return snap.docs.map((d) => ({
    id: d.id,
    ...d.data(),
    createdAt: ts(d.data().createdAt),
    updatedAt: ts(d.data().updatedAt),
  } as FinancialRecord))
}

export async function createFinancialRecord(
  data: Omit<FinancialRecord, "id" | "createdAt" | "updatedAt">
): Promise<string> {
  const ref = await adminDb.collection("financial_records").add({
    ...data,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  })
  return ref.id
}

export async function updateFinancialRecord(
  id: string,
  data: Partial<FinancialRecord>
): Promise<void> {
  const { id: _id, ...rest } = data
  await adminDb.collection("financial_records").doc(id).update({
    ...rest,
    updatedAt: FieldValue.serverTimestamp(),
  })
}

export async function deleteFinancialRecord(id: string): Promise<void> {
  await adminDb.collection("financial_records").doc(id).delete()
}

export async function getFinancialPeriods(): Promise<FinancialPeriod[]> {
  const snap = await adminDb
    .collection("financial_periods")
    .orderBy("year", "desc")
    .orderBy("month", "desc")
    .get()
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as FinancialPeriod))
}

export async function saveFinancialPeriod(
  data: Omit<FinancialPeriod, "id">
): Promise<void> {
  const periodId = `${data.year}-${String(data.month).padStart(2, "0")}`
  await adminDb.collection("financial_periods").doc(periodId).set(data)
}

// ─────────────────────────────────────────────
// FINANCE CATEGORIES
// ─────────────────────────────────────────────

async function ensureFinanceCategoriesSeeded(): Promise<void> {
  const snap = await adminDb.collection("finance_categories").get()
  if (!snap.empty) return

  const batch = adminDb.batch()
  for (const category of DEFAULT_FINANCE_CATEGORIES) {
    batch.set(adminDb.collection("finance_categories").doc(category.id), {
      ...category,
      createdAt: FieldValue.serverTimestamp(),
    })
  }
  await batch.commit()
}

export async function getFinanceCategories(
  type?: FinanceType,
  activeOnly = true
): Promise<FinanceCategory[]> {
  await ensureFinanceCategoriesSeeded()

  let q: Query = adminDb.collection("finance_categories")
  if (type) q = q.where("type", "==", type)
  if (activeOnly) q = q.where("active", "==", true)

  const snap = await q.get()
  const categories = snap.docs.map((d) => ({
    id: d.id,
    ...d.data(),
    createdAt: ts(d.data().createdAt),
  } as FinanceCategory))

  return categories.sort((a, b) => a.name.localeCompare(b.name))
}

export async function createFinanceCategory(data: {
  name: string
  type: FinanceType
  createdBy: string
}): Promise<string> {
  const id = generateSlug(data.name)
  await adminDb.collection("finance_categories").doc(id).set({
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

export async function deactivateFinanceCategory(id: string): Promise<void> {
  await adminDb.collection("finance_categories").doc(id).update({ active: false })
}

// ─────────────────────────────────────────────
// PROGRAMMES
// ─────────────────────────────────────────────

export async function getUpcomingProgrammes(limitCount = 10): Promise<Programme[]> {
  const today = new Date().toISOString().slice(0, 10)
  const snap = await adminDb
    .collection("programmes")
    .where("publishedOnSite", "==", true)
    .where("date", ">=", today)
    .orderBy("date", "asc")
    .limit(limitCount)
    .get()
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Programme))
}

export async function getAllProgrammesAdmin(): Promise<Programme[]> {
  const snap = await adminDb.collection("programmes").orderBy("date", "desc").get()
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Programme))
}

export async function getProgrammeById(id: string): Promise<Programme | null> {
  const snap = await adminDb.collection("programmes").doc(id).get()
  if (!snap.exists) return null
  return { id: snap.id, ...snap.data() } as Programme
}

export async function createProgramme(
  data: Omit<Programme, "id" | "createdAt">
): Promise<string> {
  const ref = await adminDb.collection("programmes").add({
    ...data,
    createdAt: FieldValue.serverTimestamp(),
  })
  return ref.id
}

export async function updateProgramme(id: string, data: Partial<Programme>): Promise<void> {
  const { id: _id, ...rest } = data
  await adminDb.collection("programmes").doc(id).update(rest)
}

export async function deleteProgramme(id: string): Promise<void> {
  await adminDb.collection("programmes").doc(id).delete()
}

// ─────────────────────────────────────────────
// SERMONS
// ─────────────────────────────────────────────

export async function getPublishedSermons(limitCount = 12): Promise<Sermon[]> {
  const snap = await adminDb
    .collection("sermons")
    .where("status", "==", "published")
    .orderBy("publishedAt", "desc")
    .limit(limitCount)
    .get()
  return snap.docs.map((d) => ({
    id: d.id,
    ...d.data(),
    publishedAt: d.data().publishedAt ? ts(d.data().publishedAt) : null,
    createdAt: ts(d.data().createdAt),
  } as Sermon))
}

export async function getSermonBySlug(slug: string): Promise<Sermon | null> {
  const snap = await adminDb
    .collection("sermons")
    .where("slug", "==", slug)
    .where("status", "==", "published")
    .limit(1)
    .get()
  if (snap.empty) return null
  const d = snap.docs[0]
  return {
    id: d.id,
    ...d.data(),
    publishedAt: d.data().publishedAt ? ts(d.data().publishedAt) : null,
    createdAt: ts(d.data().createdAt),
  } as Sermon
}

export async function getAllSermonsAdmin(): Promise<Sermon[]> {
  const snap = await adminDb.collection("sermons").orderBy("createdAt", "desc").get()
  return snap.docs.map((d) => ({
    id: d.id,
    ...d.data(),
    publishedAt: d.data().publishedAt ? ts(d.data().publishedAt) : null,
    createdAt: ts(d.data().createdAt),
  } as Sermon))
}

export async function getSermonById(id: string): Promise<Sermon | null> {
  const snap = await adminDb.collection("sermons").doc(id).get()
  if (!snap.exists) return null
  const data = snap.data()!
  return {
    id: snap.id,
    ...data,
    publishedAt: data.publishedAt ? ts(data.publishedAt) : null,
    createdAt: ts(data.createdAt),
  } as Sermon
}

export async function createSermon(
  data: Omit<Sermon, "id" | "createdAt" | "publishedAt">
): Promise<string> {
  const ref = await adminDb.collection("sermons").add({
    ...data,
    status: "draft",
    publishedAt: null,
    createdAt: FieldValue.serverTimestamp(),
  })
  return ref.id
}

export async function updateSermon(id: string, data: Partial<Sermon>): Promise<void> {
  const { id: _id, ...rest } = data
  await adminDb.collection("sermons").doc(id).update(rest)
}

export async function publishSermon(id: string): Promise<void> {
  await adminDb.collection("sermons").doc(id).update({
    status: "published",
    publishedAt: FieldValue.serverTimestamp(),
  })
}

export async function deleteSermon(id: string): Promise<void> {
  await adminDb.collection("sermons").doc(id).delete()
}

// ─────────────────────────────────────────────
// BLOG POSTS
// ─────────────────────────────────────────────

export async function getPublishedBlogPosts(limitCount = 12): Promise<BlogPost[]> {
  const snap = await adminDb
    .collection("blog_posts")
    .where("status", "==", "published")
    .orderBy("publishedAt", "desc")
    .limit(limitCount)
    .get()
  return snap.docs.map((d) => ({
    id: d.id,
    ...d.data(),
    publishedAt: d.data().publishedAt ? ts(d.data().publishedAt) : null,
    createdAt: ts(d.data().createdAt),
  } as BlogPost))
}

export async function getAllBlogPostsAdmin(): Promise<BlogPost[]> {
  const snap = await adminDb.collection("blog_posts").orderBy("createdAt", "desc").get()
  return snap.docs.map((d) => ({
    id: d.id,
    ...d.data(),
    publishedAt: d.data().publishedAt ? ts(d.data().publishedAt) : null,
    createdAt: ts(d.data().createdAt),
  } as BlogPost))
}

export async function getBlogPostById(id: string): Promise<BlogPost | null> {
  const snap = await adminDb.collection("blog_posts").doc(id).get()
  if (!snap.exists) return null
  const data = snap.data()!
  return {
    id: snap.id,
    ...data,
    publishedAt: data.publishedAt ? ts(data.publishedAt) : null,
    createdAt: ts(data.createdAt),
  } as BlogPost
}

export async function createBlogPost(
  data: Omit<BlogPost, "id" | "createdAt" | "publishedAt">
): Promise<string> {
  const ref = await adminDb.collection("blog_posts").add({
    ...data,
    status: "draft",
    publishedAt: null,
    createdAt: FieldValue.serverTimestamp(),
  })
  return ref.id
}

export async function updateBlogPost(id: string, data: Partial<BlogPost>): Promise<void> {
  const { id: _id, ...rest } = data
  await adminDb.collection("blog_posts").doc(id).update(rest)
}

export async function publishBlogPost(id: string): Promise<void> {
  await adminDb.collection("blog_posts").doc(id).update({
    status: "published",
    publishedAt: FieldValue.serverTimestamp(),
  })
}

export async function deleteBlogPost(id: string): Promise<void> {
  await adminDb.collection("blog_posts").doc(id).delete()
}

// ─────────────────────────────────────────────
// SITE CONFIG
// ─────────────────────────────────────────────

export async function getSiteConfig(): Promise<SiteConfig | null> {
  const snap = await adminDb.collection("site_config").doc("main").get()
  if (!snap.exists) return null
  const data = snap.data()!
  return {
    ...data,
    updatedAt: ts(data.updatedAt),
  } as SiteConfig
}

export async function updateSiteConfig(data: Partial<SiteConfig>): Promise<void> {
  await adminDb.collection("site_config").doc("main").set(
    { ...data, updatedAt: FieldValue.serverTimestamp() },
    { merge: true }
  )
}
