import { initializeApp, getApps, cert, App } from "firebase-admin/app"
import { getAuth } from "firebase-admin/auth"
import { getFirestore } from "firebase-admin/firestore"

function getAdminApp(): App {
  const existing = getApps().find((a) => a.name === "iron-city-admin")
  if (existing) return existing

  const privateKey = process.env.FIREBASE_PRIVATE_KEY
  if (!privateKey) throw new Error("FIREBASE_PRIVATE_KEY is not set")

  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL
  if (!clientEmail) throw new Error("FIREBASE_CLIENT_EMAIL is not set")

  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
  if (!projectId) throw new Error("NEXT_PUBLIC_FIREBASE_PROJECT_ID is not set")

  return initializeApp(
    {
      credential: cert({
        projectId,
        clientEmail,
        privateKey: privateKey.replace(/\\n/g, "\n"),
      }),
    },
    "iron-city-admin"
  )
}

export const adminAuth = getAuth(getAdminApp())
export const adminDb = getFirestore(getAdminApp())
