import { FieldValue, Timestamp } from "firebase-admin/firestore"
import { adminDb } from "./firebase-admin"
import type { Tenant, Lead } from "@/types"

function ts(value: unknown): string {
  if (value instanceof Timestamp) return value.toDate().toISOString()
  if (typeof value === "string") return value
  return new Date().toISOString()
}

// ─────────────────────────────────────────────
// TENANTS — root collection, managed by platform admins only
// ─────────────────────────────────────────────

export async function getTenants(): Promise<Tenant[]> {
  const snap = await adminDb.collection("tenants").orderBy("createdAt", "desc").get()
  return snap.docs.map(
    (d) => ({ id: d.id, ...d.data(), createdAt: ts(d.data().createdAt) } as Tenant)
  )
}

export async function getTenantById(id: string): Promise<Tenant | null> {
  const snap = await adminDb.collection("tenants").doc(id).get()
  if (!snap.exists) return null
  const data = snap.data()!
  return { id: snap.id, ...data, createdAt: ts(data.createdAt) } as Tenant
}

// Public directory — only churches that opted in, minimal fields only.
export async function getDirectoryTenants(): Promise<Pick<Tenant, "id" | "churchName" | "region">[]> {
  const snap = await adminDb
    .collection("tenants")
    .where("publishedInDirectory", "==", true)
    .where("status", "==", "active")
    .get()
  return snap.docs
    .map((d) => ({ id: d.id, churchName: d.data().churchName, region: d.data().region }))
    .sort((a, b) => a.region.localeCompare(b.region) || a.churchName.localeCompare(b.churchName))
}

export async function createTenant(
  data: Omit<Tenant, "id" | "createdAt">
): Promise<string> {
  const ref = await adminDb.collection("tenants").add({
    ...data,
    createdAt: FieldValue.serverTimestamp(),
  })
  return ref.id
}

// ─────────────────────────────────────────────
// LEADS — interest submissions from the public marketing site
// ─────────────────────────────────────────────

export async function createLead(data: Omit<Lead, "id" | "status" | "createdAt">): Promise<string> {
  const ref = await adminDb.collection("leads").add({
    ...data,
    status: "new",
    createdAt: FieldValue.serverTimestamp(),
  })
  return ref.id
}

export async function getLeads(): Promise<Lead[]> {
  const snap = await adminDb.collection("leads").orderBy("createdAt", "desc").get()
  return snap.docs.map(
    (d) => ({ id: d.id, ...d.data(), createdAt: ts(d.data().createdAt) } as Lead)
  )
}

export async function updateLeadStatus(id: string, status: Lead["status"]): Promise<void> {
  await adminDb.collection("leads").doc(id).update({ status })
}
