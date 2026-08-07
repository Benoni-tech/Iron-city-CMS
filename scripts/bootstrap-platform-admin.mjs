// One-off script to create (or promote) the first platform_admin account.
// There's no UI for this by design — platform_admin is the root role that
// creates every tenant, so it has to be bootstrapped outside the app.
//
// Usage:
//   node --env-file=.env.local scripts/bootstrap-platform-admin.mjs you@example.com "SomePassword123!"

import { initializeApp, cert } from "firebase-admin/app"
import { getAuth } from "firebase-admin/auth"

const [, , email, password] = process.argv
if (!email || !password) {
  console.error('Usage: node --env-file=.env.local scripts/bootstrap-platform-admin.mjs <email> <password>')
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

let user
try {
  user = await auth.getUserByEmail(email)
  console.log(`Found existing user ${user.uid}`)
} catch {
  user = await auth.createUser({ email, password })
  console.log(`Created user ${user.uid}`)
}

await auth.setCustomUserClaims(user.uid, { role: "platform_admin" })
console.log(`${email} is now a platform_admin. Sign in at /login.`)
