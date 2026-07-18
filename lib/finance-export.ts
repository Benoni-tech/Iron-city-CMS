import ExcelJS from "exceljs"
import type { FinancialRecord, FinanceCategory, PaymentMethod } from "@/types"

export interface FinanceExportRange {
  startDate: string // "YYYY-MM-DD", inclusive
  endDate: string // "YYYY-MM-DD", inclusive
}

// Sunday–Saturday, matching how church services/collections run.
export function resolveThisWeekRange(reference: Date = new Date()): FinanceExportRange {
  const toISO = (d: Date) => d.toISOString().slice(0, 10)
  const sunday = new Date(reference)
  sunday.setDate(reference.getDate() - reference.getDay())
  const saturday = new Date(sunday)
  saturday.setDate(sunday.getDate() + 6)
  return { startDate: toISO(sunday), endDate: toISO(saturday) }
}

const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  cash: "Cash",
  mobile_money: "Mobile Money",
  bank_transfer: "Bank Transfer",
  check: "Check",
}

const NAVY = "FF1A2744"
const WHITE = "FFFFFFFF"
const LIGHT_GRAY = "FFF3F1EC"
const GREEN = "FF16A34A"
const YELLOW = "FFFDE68A"
const PEACH = "FFFBD5B5"

export interface FinanceWorkbookOptions {
  churchName: string
  churchAddress: string
  range: FinanceExportRange
  generatedByEmail: string
}

const COLUMN_WIDTHS = [12, 20, 32, 16, 20, 20, 16]
const LAST_COL = 7 // G

function fillRow(row: ExcelJS.Row, argb: string, fontColor = WHITE, bold = true) {
  for (let i = 1; i <= LAST_COL; i++) {
    const cell = row.getCell(i)
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb } }
    cell.font = { bold, color: { argb: fontColor } }
  }
}

function addBand(sheet: ExcelJS.Worksheet, text: string, argb: string) {
  const row = sheet.addRow([text])
  sheet.mergeCells(row.number, 1, row.number, LAST_COL)
  fillRow(row, argb)
  row.getCell(1).alignment = { vertical: "middle" }
  row.height = 20
  return row
}

function categoryLabel(id: string, categories: FinanceCategory[]): string {
  return categories.find((c) => c.id === id)?.name ?? id
}

function addRecordSection(
  sheet: ExcelJS.Worksheet,
  records: FinancialRecord[],
  categories: FinanceCategory[],
  type: "income" | "expenditure"
): number {
  const headerRow = sheet.addRow(
    type === "income"
      ? ["Date", "Category", "Notes", "Payment Method", "", "", "Amount"]
      : ["Date", "Category", "Notes", "Payment Method", "Recipient", "Disbursed By", "Amount"]
  )
  fillRow(headerRow, LIGHT_GRAY, NAVY)

  const byCategory = new Map<string, FinancialRecord[]>()
  for (const record of records) {
    const list = byCategory.get(record.category) ?? []
    list.push(record)
    byCategory.set(record.category, list)
  }

  let total = 0
  const categoryIds = [...byCategory.keys()].sort((a, b) =>
    categoryLabel(a, categories).localeCompare(categoryLabel(b, categories))
  )

  for (const categoryId of categoryIds) {
    const items = byCategory.get(categoryId)!
    for (const item of items) {
      sheet.addRow([
        item.date,
        categoryLabel(item.category, categories),
        item.description,
        item.paymentMethod ? PAYMENT_METHOD_LABELS[item.paymentMethod] : "—",
        item.recipient ?? "",
        item.disbursedBy ?? "",
        item.amount,
      ]).getCell(7).numFmt = "GHS #,##0.00"
    }
    const subtotal = items.reduce((sum, r) => sum + r.amount, 0)
    total += subtotal
    const subtotalRow = sheet.addRow([
      "", `Subtotal — ${categoryLabel(categoryId, categories)}`, "", "", "", "", subtotal,
    ])
    fillRow(subtotalRow, LIGHT_GRAY, NAVY, true)
    subtotalRow.getCell(7).numFmt = "GHS #,##0.00"
  }

  const totalRow = sheet.addRow([
    "", `TOTAL ${type === "income" ? "INCOME" : "EXPENDITURE"}`, "", "", "", "", total,
  ])
  fillRow(totalRow, type === "income" ? GREEN : YELLOW, type === "income" ? WHITE : NAVY)
  totalRow.getCell(7).numFmt = "GHS #,##0.00"

  return total
}

export async function buildFinanceWorkbook(
  records: FinancialRecord[],
  categories: FinanceCategory[],
  options: FinanceWorkbookOptions
) {
  const workbook = new ExcelJS.Workbook()
  const sheet = workbook.addWorksheet("Finance Report")
  sheet.columns = COLUMN_WIDTHS.map((width) => ({ width }))

  const nameRow = sheet.addRow([options.churchName])
  sheet.mergeCells(nameRow.number, 1, nameRow.number, LAST_COL)
  nameRow.getCell(1).font = { bold: true, size: 16, color: { argb: NAVY } }

  const addressRow = sheet.addRow([options.churchAddress])
  sheet.mergeCells(addressRow.number, 1, addressRow.number, LAST_COL)
  addressRow.getCell(1).font = { color: { argb: "FF6B7280" } }

  sheet.addRow([])

  const periodRow = sheet.addRow([
    `Period: ${options.range.startDate} to ${options.range.endDate}`,
  ])
  sheet.mergeCells(periodRow.number, 1, periodRow.number, 4)
  periodRow.getCell(1).font = { bold: true }

  const generatedRow = sheet.addRow([
    `Generated: ${new Date().toISOString().slice(0, 10)} by ${options.generatedByEmail}`,
  ])
  sheet.mergeCells(generatedRow.number, 1, generatedRow.number, LAST_COL)
  generatedRow.getCell(1).font = { italic: true, color: { argb: "FF6B7280" } }

  sheet.addRow([])

  const incomeRecords = records.filter((r) => r.type === "income")
  const expenditureRecords = records.filter((r) => r.type === "expenditure")

  addBand(sheet, "INCOME", NAVY)
  const totalIncome = addRecordSection(sheet, incomeRecords, categories, "income")

  sheet.addRow([])

  addBand(sheet, "EXPENDITURE", NAVY)
  const totalExpenditure = addRecordSection(sheet, expenditureRecords, categories, "expenditure")

  sheet.addRow([])

  const netRow = sheet.addRow(["", "NET BALANCE", "", "", "", "", totalIncome - totalExpenditure])
  fillRow(netRow, PEACH, NAVY)
  netRow.getCell(7).numFmt = "GHS #,##0.00"
  netRow.height = 22

  return workbook.xlsx.writeBuffer()
}

export function financeExportFilename(range: FinanceExportRange): string {
  return `finance-report-${range.startDate}-to-${range.endDate}.xlsx`
}
