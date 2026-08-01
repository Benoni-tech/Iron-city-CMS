import { z } from "zod"

export const financialRecordSchema = z.object({
  type: z.enum(["income", "expenditure"]),
  category: z.string().min(1),
  amount: z.number().positive(),
  description: z.string().trim().min(10, "Notes must be at least 10 characters"),
  date: z.string().min(1),
  paymentMethod: z.enum(["cash", "mobile_money", "bank_transfer", "check"]),
  serviceSessionId: z.string().optional(),
  recipient: z.string().trim().optional(),
  disbursedBy: z.string().trim().optional(),
})
