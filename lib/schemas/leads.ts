import { z } from "zod"

export const leadSchema = z.object({
  churchName: z.string().trim().min(2, "Church name is required"),
  contactName: z.string().trim().min(2, "Your name is required"),
  email: z.string().trim().email("Enter a valid email address"),
  phone: z.string().trim().optional(),
  region: z.string().trim().min(2, "Region is required"),
  message: z.string().trim().max(1000).optional(),
})
