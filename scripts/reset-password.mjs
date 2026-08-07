// One-off script to set/reset a Firebase Auth user's password directly,
// bypassing the old one. Useful when sign-in fails and it's unclear whether
// the account even has a password credential set.
//
// Usage:
//   node --env-file=.env.local scripts/reset-password.mjs you@example.com "NewStrongPassword123!"

import { initializeApp, cert } from "firebase-admin/app"
import { getAuth } from "firebase-admin/auth"

const [, , email, password] = process.argv
if (!email || !password) {
  console.error('Usage: node --env-file=.env.local scripts/reset-password.mjs <email> <newPassword>')
  process.exit(1)
}

const app = initializeApp({
  credential: cert({
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
  }),
})
const auth = getAuth(app)

const user = await auth.getUserByEmail(email)
console.log(`Found ${user.uid}`)
console.log(`Existing sign-in providers: ${user.providerData.map((p) => p.providerId).join(", ") || "(none — password-only account)"}`)

await auth.updateUser(user.uid, { password })
console.log(`Password set for ${email}. Sign in at /login with the new password.`)
