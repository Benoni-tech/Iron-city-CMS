import { adminDb } from "./firebase-admin"
import type { MemberCategory, MemberAttendanceSummary } from "@/types"
import { getLambs, getTeens, getYouth, getCongregation } from "./firestore"

const ABSENCE_THRESHOLD = 3 // consecutive Sundays

function tenantCollection(tenantId: string, name: string) {
  return adminDb.collection("tenants").doc(tenantId).collection(name)
}

// Get all Sunday morning session IDs from the last N weeks
async function getRecentSundaySessionIds(tenantId: string, weeksBack: number): Promise<string[]> {
  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - weeksBack * 7)
  const cutoffStr = cutoff.toISOString().slice(0, 10)

  const snap = await tenantCollection(tenantId, "service_sessions")
    .where("serviceType", "==", "sunday_morning")
    .where("date", ">=", cutoffStr)
    .orderBy("date", "desc")
    .get()
  return snap.docs.map((d) => d.id)
}

// Get set of memberIds present across a list of sessions
async function getPresentMemberIds(
  tenantId: string,
  sessionIds: string[],
  category: MemberCategory
): Promise<Set<string>> {
  const presentIds = new Set<string>()
  if (sessionIds.length === 0) return presentIds

  for (const sessionId of sessionIds) {
    const snap = await tenantCollection(tenantId, "attendance_records")
      .where("sessionId", "==", sessionId)
      .where("memberCategory", "==", category)
      .where("present", "==", true)
      .get()
    snap.docs.forEach((d) => presentIds.add(d.data().memberId))
  }

  return presentIds
}

// Get last attendance date for a member
async function getMemberLastSeen(
  tenantId: string,
  memberId: string,
  category: MemberCategory
): Promise<string | null> {
  const snap = await tenantCollection(tenantId, "attendance_records")
    .where("memberId", "==", memberId)
    .where("memberCategory", "==", category)
    .where("present", "==", true)
    .orderBy("markedAt", "desc")
    .get()
  if (snap.empty) return null
  const ts = snap.docs[0].data().markedAt
  if (!ts) return null
  return ts.toDate ? ts.toDate().toISOString() : String(ts)
}

// Count Sunday attendances this month for a member
async function getMonthlyCount(
  tenantId: string,
  memberId: string,
  category: MemberCategory
): Promise<number> {
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    .toISOString()
    .slice(0, 10)

  const sundaySessionsSnap = await tenantCollection(tenantId, "service_sessions")
    .where("serviceType", "==", "sunday_morning")
    .where("date", ">=", startOfMonth)
    .get()
  const sessionIds = sundaySessionsSnap.docs.map((d) => d.id)
  if (sessionIds.length === 0) return 0

  const snap = await tenantCollection(tenantId, "attendance_records")
    .where("memberId", "==", memberId)
    .where("memberCategory", "==", category)
    .where("present", "==", true)
    .where("sessionId", "in", sessionIds.slice(0, 10))
    .get()
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
export async function getAbsentMembers(tenantId: string): Promise<AbsentMember[]> {
  const sessionIds = await getRecentSundaySessionIds(tenantId, ABSENCE_THRESHOLD)
  const absent: AbsentMember[] = []

  const categories: MemberCategory[] = ["lambs", "teens", "youth", "congregation"]

  for (const category of categories) {
    const presentIds = await getPresentMemberIds(tenantId, sessionIds, category)

    let members: { id: string; firstName: string; surname: string; phone?: string; memberStatus: string }[] = []

    if (category === "lambs") {
      const all = await getLambs(tenantId, "active")
      members = all.map((m) => ({
        id: m.id,
        firstName: m.firstName,
        surname: m.surname,
        memberStatus: m.memberStatus,
      }))
    } else if (category === "teens") {
      const all = await getTeens(tenantId, "active")
      members = all.map((m) => ({
        id: m.id,
        firstName: m.firstName,
        surname: m.surname,
        phone: m.personalPhone,
        memberStatus: m.memberStatus,
      }))
    } else if (category === "youth") {
      const all = await getYouth(tenantId, "active")
      members = all.map((m) => ({
        id: m.id,
        firstName: m.firstName,
        surname: m.surname,
        phone: m.phone,
        memberStatus: m.memberStatus,
      }))
    } else {
      const all = await getCongregation(tenantId, "active")
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
        const lastSeen = await getMemberLastSeen(tenantId, member.id, category)
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
  tenantId: string,
  category: MemberCategory
): Promise<MemberAttendanceSummary[]> {
  const summaries: MemberAttendanceSummary[] = []
  const sessionIds = await getRecentSundaySessionIds(tenantId, ABSENCE_THRESHOLD)
  const presentIds = await getPresentMemberIds(tenantId, sessionIds, category)

  let members: { id: string; firstName: string; surname: string; phone?: string }[] = []

  if (category === "lambs") {
    const all = await getLambs(tenantId, "active")
    members = all
  } else if (category === "teens") {
    const all = await getTeens(tenantId, "active")
    members = all.map((m) => ({ ...m, phone: m.personalPhone }))
  } else if (category === "youth") {
    const all = await getYouth(tenantId, "active")
    members = all
  } else {
    const all = await getCongregation(tenantId, "active")
    members = all
  }

  for (const member of members) {
    const lastSeen = await getMemberLastSeen(tenantId, member.id, category)
    const monthlyCount = await getMonthlyCount(tenantId, member.id, category)
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
