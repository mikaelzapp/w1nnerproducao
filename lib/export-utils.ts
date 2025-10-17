import { jsPDF } from "jspdf"
import autoTable from "jspdf-autotable"

// Extend jsPDF type to include autoTable
declare module "jspdf" {
  interface jsPDF {
    autoTable: (options: any) => jsPDF
  }
}

export interface ExportData {
  headers: string[]
  rows: (string | number)[][]
  filename: string
  title?: string
}

/**
 * Export data to CSV format
 */
export function exportToCSV(data: ExportData) {
  const { headers, rows, filename } = data

  // Create CSV content
  const csvContent = [
    headers.join(","),
    ...rows.map((row) =>
      row
        .map((cell) => {
          // Escape quotes and wrap in quotes if contains comma or newline
          const cellStr = String(cell)
          if (cellStr.includes(",") || cellStr.includes("\n") || cellStr.includes('"')) {
            return `"${cellStr.replace(/"/g, '""')}"`
          }
          return cellStr
        })
        .join(","),
    ),
  ].join("\n")

  // Create blob and download
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
  const link = document.createElement("a")
  const url = URL.createObjectURL(blob)

  link.setAttribute("href", url)
  link.setAttribute("download", `${filename}.csv`)
  link.style.visibility = "hidden"
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

/**
 * Export data to PDF format
 */
export function exportToPDF(data: ExportData) {
  const { headers, rows, filename, title } = data

  const doc = new jsPDF()

  // Add title if provided
  if (title) {
    doc.setFontSize(16)
    doc.text(title, 14, 15)
  }

  autoTable(doc, {
    head: [headers],
    body: rows,
    startY: title ? 25 : 15,
    styles: { fontSize: 8 },
    headStyles: { fillColor: [41, 128, 185] },
  })

  // Save PDF
  doc.save(`${filename}.pdf`)
}

/**
 * Export data to JSON format
 */
export function exportToJSON(data: any, filename: string) {
  const jsonContent = JSON.stringify(data, null, 2)
  const blob = new Blob([jsonContent], { type: "application/json" })
  const link = document.createElement("a")
  const url = URL.createObjectURL(blob)

  link.setAttribute("href", url)
  link.setAttribute("download", `${filename}.json`)
  link.style.visibility = "hidden"
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

/**
 * Format date for export
 */
export function formatDateForExport(date: any): string {
  if (!date) return ""

  try {
    if (date.toDate) {
      // Firestore Timestamp
      return date.toDate().toLocaleString("pt-BR")
    } else if (date instanceof Date) {
      return date.toLocaleString("pt-BR")
    } else {
      return String(date)
    }
  } catch (error) {
    return String(date)
  }
}

/**
 * Format process status for export
 */
export function formatStatusForExport(status: string): string {
  const statusMap: Record<string, string> = {
    pendente: "Pendente",
    "em-andamento": "Em Andamento",
    concluido: "Concluído",
    rejeitado: "Rejeitado",
  }
  return statusMap[status] || status
}
