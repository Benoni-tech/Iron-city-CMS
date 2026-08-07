import { Resend } from "resend"

interface ContactParams {
  name: string
  email: string
  phone?: string
  message: string
}

export async function sendContactNotification(data: ContactParams): Promise<void> {
  if (!process.env.RESEND_API_KEY) {
    throw new Error("Contact form is not configured yet (RESEND_API_KEY is not set)")
  }
  const resend = new Resend(process.env.RESEND_API_KEY)
  const platformEmail = process.env.PLATFORM_ADMIN_EMAIL
  if (!platformEmail) {
    throw new Error("Contact form is not configured yet (PLATFORM_ADMIN_EMAIL is not set)")
  }

  const { error } = await resend.emails.send({
    from: "Church Platform <onboarding@resend.dev>",
    to: platformEmail,
    replyTo: data.email,
    subject: `New contact message from ${data.name}`,
    html: `
      <p><strong>Name:</strong> ${data.name}</p>
      <p><strong>Email:</strong> ${data.email}</p>
      ${data.phone ? `<p><strong>Phone:</strong> ${data.phone}</p>` : ""}
      <hr />
      <p>${data.message.replace(/\n/g, "<br />")}</p>
    `,
    text: `Name: ${data.name}\nEmail: ${data.email}${data.phone ? `\nPhone: ${data.phone}` : ""}\n\n${data.message}`,
  })

  if (error) throw new Error(`Resend error: ${error.message}`)
}

interface LeadNotificationParams {
  churchName: string
  contactName: string
  email: string
  phone?: string
  region: string
  message?: string
}

export async function sendLeadNotification(data: LeadNotificationParams): Promise<void> {
  if (!process.env.RESEND_API_KEY) return // lead is already saved to Firestore either way

  const resend = new Resend(process.env.RESEND_API_KEY)
  const platformEmail = process.env.PLATFORM_ADMIN_EMAIL
  if (!platformEmail) return

  await resend.emails.send({
    from: "Platform <onboarding@resend.dev>",
    to: platformEmail,
    replyTo: data.email,
    subject: `New interest: ${data.churchName}`,
    html: `
      <p><strong>Church:</strong> ${data.churchName}</p>
      <p><strong>Contact:</strong> ${data.contactName} (${data.email})</p>
      ${data.phone ? `<p><strong>Phone:</strong> ${data.phone}</p>` : ""}
      <p><strong>Region:</strong> ${data.region}</p>
      ${data.message ? `<hr /><p>${data.message.replace(/\n/g, "<br />")}</p>` : ""}
    `,
  })
}

interface TenantInviteParams {
  toEmail: string
  churchName: string
  tempPassword: string
}

// Returns whether the email actually sent, so the caller can fall back to
// showing the temp password in the UI instead of silently losing it.
export async function sendTenantInviteEmail(data: TenantInviteParams): Promise<boolean> {
  if (!process.env.RESEND_API_KEY) return false

  const resend = new Resend(process.env.RESEND_API_KEY)
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? ""

  const { error } = await resend.emails.send({
    from: "Platform <onboarding@resend.dev>",
    to: data.toEmail,
    subject: `${data.churchName} is set up — sign in to get started`,
    html: `
      <p>${data.churchName}'s account has been created.</p>
      <p><strong>Email:</strong> ${data.toEmail}</p>
      <p><strong>Temporary password:</strong> ${data.tempPassword}</p>
      <p>Sign in${appUrl ? ` at <a href="${appUrl}/login">${appUrl}/login</a>` : ""} and change your password from account settings.</p>
    `,
  })

  return !error
}
