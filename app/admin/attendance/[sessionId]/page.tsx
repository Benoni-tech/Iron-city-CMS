import { notFound } from "next/navigation"
import {
  getServiceSessionById,
  getLambs,
  getTeens,
  getYouth,
  getCongregation,
  getAttendanceForSession,
} from "@/lib/firestore"
import { getTenantSession } from "@/lib/auth"
import AttendanceSheet from "@/components/attendance-sheet"
import { SERVICE_TYPE_LABELS } from "@/types"
import type { MemberCategory, MemberRef } from "@/types"

interface PageProps {
  params: Promise<{ sessionId: string }>
}

export default async function SessionAttendancePage({ params }: PageProps) {
  const { tenantId } = await getTenantSession()
  const { sessionId } = await params
  const session = await getServiceSessionById(tenantId, sessionId)
  if (!session) notFound()

  const [lambs, teens, youth, congregation, existingRecords] = await Promise.all([
    getLambs(tenantId, "active"),
    getTeens(tenantId, "active"),
    getYouth(tenantId, "active"),
    getCongregation(tenantId, "active"),
    getAttendanceForSession(tenantId, sessionId),
  ])

  const membersByCategory: Record<MemberCategory, MemberRef[]> = {
    lambs: lambs.map((m) => ({ id: m.id, category: "lambs", name: `${m.firstName} ${m.surname}`, status: m.memberStatus })),
    teens: teens.map((m) => ({ id: m.id, category: "teens", name: `${m.firstName} ${m.surname}`, status: m.memberStatus })),
    youth: youth.map((m) => ({ id: m.id, category: "youth", name: `${m.firstName} ${m.surname}`, phone: m.phone, status: m.memberStatus })),
    congregation: congregation.map((m) => ({ id: m.id, category: "congregation", name: `${m.firstName} ${m.surname}`, phone: m.phone, status: m.memberStatus })),
  }

  const existingPresent = new Set(
    existingRecords.filter((r) => r.present).map((r) => r.memberId)
  )

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="font-display font-bold text-3xl text-[#1a2744]">
          {session.title || SERVICE_TYPE_LABELS[session.serviceType]}
        </h1>
        <p className="text-sm text-stone-400 mt-1">
          {new Date(session.date).toLocaleDateString("en-GB", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
          {session.conductedBy && ` · ${session.conductedBy}`}
        </p>
      </div>

      <AttendanceSheet
        sessionId={sessionId}
        membersByCategory={membersByCategory}
        existingPresent={existingPresent}
      />
    </div>
  )
}
