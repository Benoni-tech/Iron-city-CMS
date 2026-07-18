import type { FinanceCategory } from "@/types"

// Seeded once into the `finance_categories` collection the first time
// getFinanceCategories() runs against an empty collection. `active: false`
// entries are legacy — never selectable for new records, but kept so old
// FinancialRecord docs still resolve to a readable category name.
export const DEFAULT_FINANCE_CATEGORIES: Omit<FinanceCategory, "createdAt">[] = [
  // Income — active
  { id: "offering", name: "Offering", type: "income", isDefault: true, active: true },
  { id: "special_collection", name: "Special Collection", type: "income", isDefault: true, active: true },
  { id: "building_fund", name: "Building Fund", type: "income", isDefault: true, active: true },
  { id: "missions", name: "Missions", type: "income", isDefault: true, active: true },
  { id: "other_income", name: "Other", type: "income", isDefault: true, active: true },
  // Income — legacy
  { id: "tithe", name: "Tithe", type: "income", isDefault: true, active: false },
  // Legacy shared id — old records (income or expenditure) saved before categories
  // were split by type used the bare "other" category id.
  { id: "other", name: "Other", type: "income", isDefault: true, active: false },

  // Expenditure — active
  { id: "preachers_salary", name: "Preacher's Salary", type: "expenditure", isDefault: true, active: true },
  { id: "benevolence", name: "Benevolence", type: "expenditure", isDefault: true, active: true },
  { id: "donations", name: "Donations", type: "expenditure", isDefault: true, active: true },
  { id: "building", name: "Building", type: "expenditure", isDefault: true, active: true },
  { id: "funeral", name: "Funeral", type: "expenditure", isDefault: true, active: true },
  { id: "wedding", name: "Wedding", type: "expenditure", isDefault: true, active: true },
  { id: "office_expenses", name: "Office Expenses", type: "expenditure", isDefault: true, active: true },
  { id: "lords_supper", name: "Lord's Supper", type: "expenditure", isDefault: true, active: true },
  { id: "water", name: "Water", type: "expenditure", isDefault: true, active: true },
  { id: "electricity", name: "Electricity", type: "expenditure", isDefault: true, active: true },
  { id: "other_expenditure", name: "Other", type: "expenditure", isDefault: true, active: true },
  // Expenditure — legacy
  { id: "utilities", name: "Utilities", type: "expenditure", isDefault: true, active: false },
  { id: "maintenance", name: "Maintenance", type: "expenditure", isDefault: true, active: false },
  { id: "staff", name: "Staff", type: "expenditure", isDefault: true, active: false },
  { id: "missions_support", name: "Missions Support", type: "expenditure", isDefault: true, active: false },
  { id: "programmes", name: "Programmes", type: "expenditure", isDefault: true, active: false },
]
