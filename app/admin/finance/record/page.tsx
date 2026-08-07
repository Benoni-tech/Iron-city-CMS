import { getFinanceCategories } from "@/lib/firestore"
import { getTenantSession } from "@/lib/auth"
import RecordForm from "./RecordForm"

export default async function NewFinanceRecordPage() {
  const { tenantId } = await getTenantSession()
  const [incomeCategories, expenditureCategories] = await Promise.all([
    getFinanceCategories(tenantId, "income"),
    getFinanceCategories(tenantId, "expenditure"),
  ])

  return (
    <RecordForm
      initialIncomeCategories={incomeCategories}
      initialExpenditureCategories={expenditureCategories}
    />
  )
}
