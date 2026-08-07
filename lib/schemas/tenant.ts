import { z } from "zod"

export const createTenantSchema = z.object({
  churchName: z.string().trim().min(2, "Church name is required"),
  region: z.string().trim().min(2, "Region is required"),
  contactEmail: z.string().trim().email("Enter a valid contact email"),
  contactPhone: z.string().trim().optional(),
  publishedInDirectory: z.boolean().default(false),
  adminEmail: z.string().trim().email("Enter a valid email for the first admin account"),
})
