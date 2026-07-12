import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  addDoc,
  updateDoc,
  deleteDoc,
  setDoc,
  serverTimestamp,
  Timestamp,
  writeBatch,
  getCountFromServer,
} from "firebase/firestore"
import { db } from "./firebase"
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
    getCountFromServer(query(collection(db, "lambs"), where("memberStatus", "==", "active"))),
    getCountFromServer(query(collection(db, "teens"), where("memberStatus", "==", "active"))),
    getCountFromServer(query(collection(db, "youth"), where("memberStatus", "==", "active"))),
    getCountFromServer(query(collection(db, "congregation"), where("memberStatus", "==", "active"))),
  ])
  return {
    lambs: lambs.data().count,
    teens: teens.data().count,
    youth: youth.data().count,
    congregation: congregation.data().count,
  }
}

// ─────────────────────────────────────────────
// LAMBS
// ─────────────────────────────────────────────

export async function getLambs(statusFilter?: MemberStatus): Promise<Lamb[]> {
  const constraints = statusFilter
    ? [where("memberStatus", "==", statusFilter), orderBy("surname", "asc")]
    : [orderBy("surname", "asc")]
  const snap = await getDocs(query(collection(db, "lambs"), ...constraints))
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Lamb))
}

export async function getLambById(id: string): Promise<Lamb | null> {
  const snap = await getDoc(doc(db, "lambs", id))
  if (!snap.exists()) return null
  return { id: snap.id, ...snap.data() } as Lamb
}

export async function createLamb(data: Omit<Lamb, "id" | "createdAt" | "updatedAt">): Promise<string> {
  const ref = await addDoc(collection(db, "lambs"), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
  return ref.id
}

export async function updateLamb(id: string, data: Partial<Lamb>): Promise<void> {
  const { id: _id, ...rest } = data
  await updateDoc(doc(db, "lambs", id), { ...rest, updatedAt: serverTimestamp() })
}

export async function deleteLamb(id: string): Promise<void> {
  await deleteDoc(doc(db, "lambs", id))
}

// ─────────────────────────────────────────────
// TEENS
// ─────────────────────────────────────────────

export async function getTeens(statusFilter?: MemberStatus): Promise<Teen[]> {
  const constraints = statusFilter
    ? [where("memberStatus", "==", statusFilter), orderBy("surname", "asc")]
    : [orderBy("surname", "asc")]
  const snap = await getDocs(query(collection(db, "teens"), ...constraints))
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Teen))
}

export async function getTeenById(id: string): Promise<Teen | null> {
  const snap = await getDoc(doc(db, "teens", id))
  if (!snap.exists()) return null
  return { id: snap.id, ...snap.data() } as Teen
}

export async function createTeen(data: Omit<Teen, "id" | "createdAt" | "updatedAt">): Promise<string> {
  const ref = await addDoc(collection(db, "teens"), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
  return ref.id
}

export async function updateTeen(id: string, data: Partial<Teen>): Promise<void> {
  const { id: _id, ...rest } = data
  await updateDoc(doc(db, "teens", id), { ...rest, updatedAt: serverTimestamp() })
}

export async function deleteTeen(id: string): Promise<void> {
  await deleteDoc(doc(db, "teens", id))
}

// ─────────────────────────────────────────────
// YOUTH
// ─────────────────────────────────────────────

export async function getYouth(statusFilter?: MemberStatus): Promise<Youth[]> {
  const constraints = statusFilter
    ? [where("memberStatus", "==", statusFilter), orderBy("surname", "asc")]
    : [orderBy("surname", "asc")]
  const snap = await getDocs(query(collection(db, "youth"), ...constraints))
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Youth))
}

export async function getYouthById(id: string): Promise<Youth | null> {
  const snap = await getDoc(doc(db, "youth", id))
  if (!snap.exists()) return null
  return { id: snap.id, ...snap.data() } as Youth
}

export async function createYouth(data: Omit<Youth, "id" | "createdAt" | "updatedAt">): Promise<string> {
  const ref = await addDoc(collection(db, "youth"), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
  return ref.id
}

export async function updateYouth(id: string, data: Partial<Youth>): Promise<void> {
  const { id: _id, ...rest } = data
  await updateDoc(doc(db, "youth", id), { ...rest, updatedAt: serverTimestamp() })
}

export async function deleteYouth(id: string): Promise<void> {
  await deleteDoc(doc(db, "youth", id))
}

// ─────────────────────────────────────────────
// CONGREGATION
// ─────────────────────────────────────────────

export async function getCongregation(statusFilter?: MemberStatus): Promise<CongregationMember[]> {
  const constraints = statusFilter
    ? [where("memberStatus", "==", statusFilter), orderBy("surname", "asc")]
    : [orderBy("surname", "asc")]
  const snap = await getDocs(query(collection(db, "congregation"), ...constraints))
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as CongregationMember))
}

export async function getCongregationMemberById(id: string): Promise<CongregationMember | null> {
  const snap = await getDoc(doc(db, "congregation", id))
  if (!snap.exists()) return null
  return { id: snap.id, ...snap.data() } as CongregationMember
}

export async function createCongregationMember(
  data: Omit<CongregationMember, "id" | "createdAt" | "updatedAt">
): Promise<string> {
  const ref = await addDoc(collection(db, "congregation"), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
  return ref.id
}

export async function updateCongregationMember(
  id: string,
  data: Partial<CongregationMember>
): Promise<void> {
  const { id: _id, ...rest } = data
  await updateDoc(doc(db, "congregation", id), { ...rest, updatedAt: serverTimestamp() })
}

export async function deleteCongregationMember(id: string): Promise<void> {
  await deleteDoc(doc(db, "congregation", id))
}

// ─────────────────────────────────────────────
// MEMBER SEARCH (for guardian linking)
// ─────────────────────────────────────────────

export async function searchAdultMembers(searchTerm: string): Promise<MemberRef[]> {
  const term = searchTerm.trim().toLowerCase()
  const results: MemberRef[] = []

  const [youth, congregation] = await Promise.all([
    getDocs(query(collection(db, "youth"), where("memberStatus", "==", "active"), orderBy("surname"))),
    getDocs(query(collection(db, "congregation"), where("memberStatus", "==", "active"), orderBy("surname"))),
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
    getDocs(
      query(
        collection(db, "lambs"),
        where("guardian1.memberId", "==", memberId)
      )
    ),
    getDocs(
      query(
        collection(db, "teens"),
        where("guardian1.memberId", "==", memberId)
      )
    ),
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
  const q = query(
    collection(db, "service_sessions"),
    orderBy("date", "desc"),
    limit(limitCount)
  )
  const snap = await getDocs(q)
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
  const snap = await getDoc(doc(db, "service_sessions", id))
  if (!snap.exists()) return null
  const data = snap.data()
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
  data: Omit<ServiceSession, "id" | "totalPresent" | "createdAt">,
  createdBy: string
): Promise<string> {
  const ref = await addDoc(collection(db, "service_sessions"), {
    ...data,
    totalPresent: 0,
    createdBy,
    createdAt: serverTimestamp(),
  })
  return ref.id
}

// ─────────────────────────────────────────────
// ATTENDANCE RECORDS
// ─────────────────────────────────────────────

export async function getAttendanceForSession(sessionId: string): Promise<AttendanceRecord[]> {
  const q = query(
    collection(db, "attendance_records"),
    where("sessionId", "==", sessionId)
  )
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({
    id: d.id,
    ...d.data(),
    markedAt: ts(d.data().markedAt),
  } as AttendanceRecord))
}

export async function saveAttendanceBatch(
  sessionId: string,
  records: Omit<AttendanceRecord, "id" | "markedAt">[],
  markedBy: string
): Promise<void> {
  const batch = writeBatch(db)
  let presentCount = 0

  for (const record of records) {
    const ref = doc(collection(db, "attendance_records"))
    batch.set(ref, {
      ...record,
      sessionId,
      markedBy,
      markedAt: serverTimestamp(),
    })
    if (record.present) presentCount++
  }

  batch.update(doc(db, "service_sessions", sessionId), {
    totalPresent: presentCount,
  })

  await batch.commit()
}

export async function getMemberLastAttendance(
  memberId: string,
  category: MemberCategory
): Promise<string | null> {
  const q = query(
    collection(db, "attendance_records"),
    where("memberId", "==", memberId),
    where("memberCategory", "==", category),
    where("present", "==", true),
    orderBy("markedAt", "desc"),
    limit(1)
  )
  const snap = await getDocs(q)
  if (snap.empty) return null
  return ts(snap.docs[0].data().markedAt)
}

// Get Sunday morning sessions from the last N weeks
export async function getRecentSundaySessions(weeksBack: number): Promise<ServiceSession[]> {
  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - weeksBack * 7)
  const cutoffStr = cutoff.toISOString().slice(0, 10)

  const q = query(
    collection(db, "service_sessions"),
    where("serviceType", "==", "sunday_morning"),
    where("date", ">=", cutoffStr),
    orderBy("date", "desc")
  )
  const snap = await getDocs(q)
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

  const q = query(
    collection(db, "service_sessions"),
    where("date", ">=", cutoffStr),
    orderBy("date", "asc")
  )
  const snap = await getDocs(q)
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
  const constraints = type
    ? [where("type", "==", type), orderBy("date", "desc"), limit(limitCount)]
    : [orderBy("date", "desc"), limit(limitCount)]

  const snap = await getDocs(query(collection(db, "financial_records"), ...constraints))
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

  const q = query(
    collection(db, "financial_records"),
    where("date", ">=", startDate),
    where("date", "<", endDate),
    orderBy("date", "asc")
  )
  const snap = await getDocs(q)
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
  const ref = await addDoc(collection(db, "financial_records"), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
  return ref.id
}

export async function updateFinancialRecord(
  id: string,
  data: Partial<FinancialRecord>
): Promise<void> {
  const { id: _id, ...rest } = data
  await updateDoc(doc(db, "financial_records", id), {
    ...rest,
    updatedAt: serverTimestamp(),
  })
}

export async function deleteFinancialRecord(id: string): Promise<void> {
  await deleteDoc(doc(db, "financial_records", id))
}

export async function getFinancialPeriods(): Promise<FinancialPeriod[]> {
  const q = query(
    collection(db, "financial_periods"),
    orderBy("year", "desc"),
    orderBy("month", "desc")
  )
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as FinancialPeriod))
}

export async function saveFinancialPeriod(
  data: Omit<FinancialPeriod, "id">
): Promise<void> {
  const periodId = `${data.year}-${String(data.month).padStart(2, "0")}`
  await setDoc(doc(db, "financial_periods", periodId), data)
}

// ─────────────────────────────────────────────
// PROGRAMMES
// ─────────────────────────────────────────────

export async function getUpcomingProgrammes(limitCount = 10): Promise<Programme[]> {
  const today = new Date().toISOString().slice(0, 10)
  const q = query(
    collection(db, "programmes"),
    where("publishedOnSite", "==", true),
    where("date", ">=", today),
    orderBy("date", "asc"),
    limit(limitCount)
  )
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Programme))
}

export async function getAllProgrammesAdmin(): Promise<Programme[]> {
  const q = query(collection(db, "programmes"), orderBy("date", "desc"))
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Programme))
}

export async function getProgrammeById(id: string): Promise<Programme | null> {
  const snap = await getDoc(doc(db, "programmes", id))
  if (!snap.exists()) return null
  return { id: snap.id, ...snap.data() } as Programme
}

export async function createProgramme(
  data: Omit<Programme, "id" | "createdAt">
): Promise<string> {
  const ref = await addDoc(collection(db, "programmes"), {
    ...data,
    createdAt: serverTimestamp(),
  })
  return ref.id
}

export async function updateProgramme(id: string, data: Partial<Programme>): Promise<void> {
  const { id: _id, ...rest } = data
  await updateDoc(doc(db, "programmes", id), rest)
}

export async function deleteProgramme(id: string): Promise<void> {
  await deleteDoc(doc(db, "programmes", id))
}

// ─────────────────────────────────────────────
// SERMONS
// ─────────────────────────────────────────────

export async function getPublishedSermons(limitCount = 12): Promise<Sermon[]> {
  const q = query(
    collection(db, "sermons"),
    where("status", "==", "published"),
    orderBy("publishedAt", "desc"),
    limit(limitCount)
  )
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({
    id: d.id,
    ...d.data(),
    publishedAt: d.data().publishedAt ? ts(d.data().publishedAt) : null,
    createdAt: ts(d.data().createdAt),
  } as Sermon))
}

export async function getSermonBySlug(slug: string): Promise<Sermon | null> {
  const q = query(
    collection(db, "sermons"),
    where("slug", "==", slug),
    where("status", "==", "published"),
    limit(1)
  )
  const snap = await getDocs(q)
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
  const q = query(collection(db, "sermons"), orderBy("createdAt", "desc"))
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({
    id: d.id,
    ...d.data(),
    publishedAt: d.data().publishedAt ? ts(d.data().publishedAt) : null,
    createdAt: ts(d.data().createdAt),
  } as Sermon))
}

export async function getSermonById(id: string): Promise<Sermon | null> {
  const snap = await getDoc(doc(db, "sermons", id))
  if (!snap.exists()) return null
  const data = snap.data()
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
  const ref = await addDoc(collection(db, "sermons"), {
    ...data,
    status: "draft",
    publishedAt: null,
    createdAt: serverTimestamp(),
  })
  return ref.id
}

export async function updateSermon(id: string, data: Partial<Sermon>): Promise<void> {
  const { id: _id, ...rest } = data
  await updateDoc(doc(db, "sermons", id), rest)
}

export async function publishSermon(id: string): Promise<void> {
  await updateDoc(doc(db, "sermons", id), {
    status: "published",
    publishedAt: serverTimestamp(),
  })
}

export async function deleteSermon(id: string): Promise<void> {
  await deleteDoc(doc(db, "sermons", id))
}

// ─────────────────────────────────────────────
// BLOG POSTS
// ─────────────────────────────────────────────

export async function getPublishedBlogPosts(limitCount = 12): Promise<BlogPost[]> {
  const q = query(
    collection(db, "blog_posts"),
    where("status", "==", "published"),
    orderBy("publishedAt", "desc"),
    limit(limitCount)
  )
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({
    id: d.id,
    ...d.data(),
    publishedAt: d.data().publishedAt ? ts(d.data().publishedAt) : null,
    createdAt: ts(d.data().createdAt),
  } as BlogPost))
}

export async function getAllBlogPostsAdmin(): Promise<BlogPost[]> {
  const q = query(collection(db, "blog_posts"), orderBy("createdAt", "desc"))
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({
    id: d.id,
    ...d.data(),
    publishedAt: d.data().publishedAt ? ts(d.data().publishedAt) : null,
    createdAt: ts(d.data().createdAt),
  } as BlogPost))
}

export async function getBlogPostById(id: string): Promise<BlogPost | null> {
  const snap = await getDoc(doc(db, "blog_posts", id))
  if (!snap.exists()) return null
  const data = snap.data()
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
  const ref = await addDoc(collection(db, "blog_posts"), {
    ...data,
    status: "draft",
    publishedAt: null,
    createdAt: serverTimestamp(),
  })
  return ref.id
}

export async function updateBlogPost(id: string, data: Partial<BlogPost>): Promise<void> {
  const { id: _id, ...rest } = data
  await updateDoc(doc(db, "blog_posts", id), rest)
}

export async function publishBlogPost(id: string): Promise<void> {
  await updateDoc(doc(db, "blog_posts", id), {
    status: "published",
    publishedAt: serverTimestamp(),
  })
}

export async function deleteBlogPost(id: string): Promise<void> {
  await deleteDoc(doc(db, "blog_posts", id))
}

// ─────────────────────────────────────────────
// SITE CONFIG
// ─────────────────────────────────────────────

export async function getSiteConfig(): Promise<SiteConfig | null> {
  const snap = await getDoc(doc(db, "site_config", "main"))
  if (!snap.exists()) return null
  const data = snap.data()
  return {
    ...data,
    updatedAt: ts(data.updatedAt),
  } as SiteConfig
}

export async function updateSiteConfig(data: Partial<SiteConfig>): Promise<void> {
  await setDoc(
    doc(db, "site_config", "main"),
    { ...data, updatedAt: serverTimestamp() },
    { merge: true }
  )
}
