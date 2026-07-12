import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

interface ContactParams {
  name: string
  email: string
  phone?: string
  message: string
}

export async function sendContactNotification(data: ContactParams): Promise<void> {
  const churchEmail = process.env.CHURCH_EMAIL ?? "church@ironcitychurchofchrist.org"

  const { error } = await resend.emails.send({
    from: "Iron City Website <onboarding@resend.dev>",
    to: churchEmail,
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
