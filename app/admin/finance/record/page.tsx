import { getFinanceCategories } from "@/lib/firestore"
import RecordForm from "./RecordForm"

export default async function NewFinanceRecordPage() {
  const [incomeCategories, expenditureCategories] = await Promise.all([
    getFinanceCategories("income"),
    getFinanceCategories("expenditure"),
  ])

  return (
    <RecordForm
      initialIncomeCategories={incomeCategories}
      initialExpenditureCategories={expenditureCategories}
    />
  )
}
