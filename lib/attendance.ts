import {
  collection,
  query,
  where,
  getDocs,
  orderBy,
} from "firebase/firestore"
import { db } from "./firebase"
import type { MemberCategory, MemberAttendanceSummary } from "@/types"
import { getLambs, getTeens, getYouth, getCongregation } from "./firestore"

const ABSENCE_THRESHOLD = 3 // consecutive Sundays

// Get all Sunday morning session IDs from the last N weeks
async function getRecentSundaySessionIds(weeksBack: number): Promise<string[]> {
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
  return snap.docs.map((d) => d.id)
}

// Get set of memberIds present across a list of sessions
async function getPresentMemberIds(
  sessionIds: string[],
  category: MemberCategory
): Promise<Set<string>> {
  const presentIds = new Set<string>()
  if (sessionIds.length === 0) return presentIds

  for (const sessionId of sessionIds) {
    const q = query(
      collection(db, "attendance_records"),
      where("sessionId", "==", sessionId),
      where("memberCategory", "==", category),
      where("present", "==", true)
    )
    const snap = await getDocs(q)
    snap.docs.forEach((d) => presentIds.add(d.data().memberId))
  }

  return presentIds
}

// Get last attendance date for a member
async function getMemberLastSeen(
  memberId: string,
  category: MemberCategory
): Promise<string | null> {
  const q = query(
    collection(db, "attendance_records"),
    where("memberId", "==", memberId),
    where("memberCategory", "==", category),
    where("present", "==", true),
    orderBy("markedAt", "desc")
  )
  const snap = await getDocs(q)
  if (snap.empty) return null
  const ts = snap.docs[0].data().markedAt
  if (!ts) return null
  return ts.toDate ? ts.toDate().toISOString() : String(ts)
}

// Count Sunday attendances this month for a member
async function getMonthlyCount(
  memberId: string,
  category: MemberCategory
): Promise<number> {
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    .toISOString()
    .slice(0, 10)

  const sundaySessionsSnap = await getDocs(
    query(
      collection(db, "service_sessions"),
      where("serviceType", "==", "sunday_morning"),
      where("date", ">=", startOfMonth)
    )
  )
  const sessionIds = sundaySessionsSnap.docs.map((d) => d.id)
  if (sessionIds.length === 0) return 0

  const q = query(
    collection(db, "attendance_records"),
    where("memberId", "==", memberId),
    where("memberCategory", "==", category),
    where("present", "==", true),
    where("sessionId", "in", sessionIds.slice(0, 10))
  )
  const snap = await getDocs(q)
  return snap.size
}

export interface AbsentMember {
  id: string
  name: string
  category: MemberCategory
  phone?: string
  lastSeen: string | null
  consecutiveAbsences: number
}

// Main absence detection — returns members absent for ABSENCE_THRESHOLD consecutive Sundays
export async function getAbsentMembers(): Promise<AbsentMember[]> {
  const sessionIds = await getRecentSundaySessionIds(ABSENCE_THRESHOLD)
  const absent: AbsentMember[] = []

  const categories: MemberCategory[] = ["lambs", "teens", "youth", "congregation"]

  for (const category of categories) {
    const presentIds = await getPresentMemberIds(sessionIds, category)

    let members: { id: string; firstName: string; surname: string; phone?: string; memberStatus: string }[] = []

    if (category === "lambs") {
      const all = await getLambs("active")
      members = all.map((m) => ({
        id: m.id,
        firstName: m.firstName,
        surname: m.surname,
        memberStatus: m.memberStatus,
      }))
    } else if (category === "teens") {
      const all = await getTeens("active")
      members = all.map((m) => ({
        id: m.id,
        firstName: m.firstName,
        surname: m.surname,
        phone: m.personalPhone,
        memberStatus: m.memberStatus,
      }))
    } else if (category === "youth") {
      const all = await getYouth("active")
      members = all.map((m) => ({
        id: m.id,
        firstName: m.firstName,
        surname: m.surname,
        phone: m.phone,
        memberStatus: m.memberStatus,
      }))
    } else {
      const all = await getCongregation("active")
      members = all.map((m) => ({
        id: m.id,
        firstName: m.firstName,
        surname: m.surname,
        phone: m.phone,
        memberStatus: m.memberStatus,
      }))
    }

    for (const member of members) {
      if (!presentIds.has(member.id)) {
        const lastSeen = await getMemberLastSeen(member.id, category)
        absent.push({
          id: member.id,
          name: `${member.firstName} ${member.surname}`,
          category,
          phone: member.phone,
          lastSeen,
          consecutiveAbsences: sessionIds.length,
        })
      }
    }
  }

  return absent
}

// Full attendance summary per member for reports page
export async function getMemberAttendanceSummaries(
  category: MemberCategory
): Promise<MemberAttendanceSummary[]> {
  const summaries: MemberAttendanceSummary[] = []
  const sessionIds = await getRecentSundaySessionIds(ABSENCE_THRESHOLD)
  const presentIds = await getPresentMemberIds(sessionIds, category)

  let members: { id: string; firstName: string; surname: string; phone?: string }[] = []

  if (category === "lambs") {
    const all = await getLambs("active")
    members = all
  } else if (category === "teens") {
    const all = await getTeens("active")
    members = all.map((m) => ({ ...m, phone: m.personalPhone }))
  } else if (category === "youth") {
    const all = await getYouth("active")
    members = all
  } else {
    const all = await getCongregation("active")
    members = all
  }

  for (const member of members) {
    const lastSeen = await getMemberLastSeen(member.id, category)
    const monthlyCount = await getMonthlyCount(member.id, category)
    summaries.push({
      memberId: member.id,
      memberName: `${member.firstName} ${member.surname}`,
      memberCategory: category,
      phone: member.phone,
      lastSeen,
      consecutiveAbsences: presentIds.has(member.id) ? 0 : sessionIds.length,
      totalThisMonth: monthlyCount,
      totalThisYear: 0,
    })
  }

  return summaries
}
