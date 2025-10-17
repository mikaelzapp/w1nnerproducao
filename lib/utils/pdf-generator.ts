import jsPDF from "jspdf"
import type { CostEstimate } from "./regularization"

export interface QuoteData {
  areaType: "urbana" | "rural"
  size: string
  state: string
  city: string
  methodId: string
  methodName: string
  terrainType: string
  rumoStatus: string
  accessDifficulty: string
  estimate: CostEstimate
}

export function generateQuotePDF(data: QuoteData): void {
  const doc = new jsPDF()

  let yPos = 20
  const lineHeight = 7
  const pageWidth = doc.internal.pageSize.getWidth()

  // Header
  doc.setFontSize(18)
  doc.setFont("helvetica", "bold")
  doc.text("ORÇAMENTO DE REGULARIZAÇÃO FUNDIÁRIA", pageWidth / 2, yPos, { align: "center" })
  yPos += lineHeight + 3

  doc.setFontSize(12)
  doc.setFont("helvetica", "normal")
  doc.text("W1nner Engenharia e Topografia", pageWidth / 2, yPos, { align: "center" })
  yPos += lineHeight + 5

  doc.setFontSize(10)
  doc.text(`Data: ${new Date().toLocaleDateString("pt-BR")}`, 20, yPos)
  yPos += lineHeight + 5

  // Dados do Imóvel
  doc.setFontSize(14)
  doc.setFont("helvetica", "bold")
  doc.text("DADOS DO IMÓVEL", 20, yPos)
  yPos += lineHeight

  doc.setFontSize(10)
  doc.setFont("helvetica", "normal")
  doc.text(`Tipo de Área: ${data.areaType === "urbana" ? "Urbana" : "Rural"}`, 20, yPos)
  yPos += lineHeight
  doc.text(`Tamanho Total: ${data.size} m²`, 20, yPos)
  yPos += lineHeight
  doc.text(`Localização: ${data.city} - ${data.state}`, 20, yPos)
  yPos += lineHeight
  doc.text(`Tipo de Terreno: ${data.terrainType}`, 20, yPos)
  yPos += lineHeight
  doc.text(`Status do Rumo: ${data.rumoStatus}`, 20, yPos)
  yPos += lineHeight
  doc.text(`Dificuldade de Acesso: ${data.accessDifficulty}`, 20, yPos)
  yPos += lineHeight + 5

  // Tipo de Regularização
  doc.setFontSize(14)
  doc.setFont("helvetica", "bold")
  doc.text("TIPO DE REGULARIZAÇÃO", 20, yPos)
  yPos += lineHeight

  doc.setFontSize(10)
  doc.setFont("helvetica", "normal")
  doc.text(data.methodName, 20, yPos)
  yPos += lineHeight + 5

  // Valor Total
  doc.setFontSize(14)
  doc.setFont("helvetica", "bold")
  doc.text("VALOR TOTAL DO ORÇAMENTO", 20, yPos)
  yPos += lineHeight + 2

  doc.setFontSize(20)
  doc.setTextColor(0, 100, 0)
  doc.text(
    `R$ ${data.estimate.totalCost.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
    20,
    yPos,
  )
  doc.setTextColor(0, 0, 0)
  yPos += lineHeight + 8

  // Informações Adicionais
  doc.setFontSize(10)
  doc.setFont("helvetica", "normal")
  doc.text(
    `Complexidade: ${data.estimate.complexity.charAt(0).toUpperCase() + data.estimate.complexity.slice(1)}`,
    20,
    yPos,
  )
  yPos += lineHeight + 5

  // Observações
  doc.setFontSize(14)
  doc.setFont("helvetica", "bold")
  doc.text("OBSERVAÇÕES IMPORTANTES", 20, yPos)
  yPos += lineHeight

  doc.setFontSize(9)
  doc.setFont("helvetica", "normal")

  data.estimate.observations.forEach((obs, idx) => {
    const lines = doc.splitTextToSize(`${idx + 1}. ${obs}`, pageWidth - 40)
    lines.forEach((line: string) => {
      if (yPos > 270) {
        doc.addPage()
        yPos = 20
      }
      doc.text(line, 20, yPos)
      yPos += lineHeight - 1
    })
  })

  yPos += 5

  if (yPos > 240) {
    doc.addPage()
    yPos = 20
  }

  doc.setFillColor(255, 243, 205)
  doc.rect(15, yPos - 5, pageWidth - 30, 25, "F")
  doc.setDrawColor(255, 193, 7)
  doc.rect(15, yPos - 5, pageWidth - 30, 25, "S")

  doc.setFontSize(11)
  doc.setFont("helvetica", "bold")
  doc.text("⚠️ IMPORTANTE - LEIA COM ATENÇÃO", 20, yPos)
  yPos += lineHeight

  doc.setFontSize(9)
  doc.setFont("helvetica", "bold")
  const disclaimerText =
    "Este é um ORÇAMENTO ESTIMADO baseado nas informações fornecidas. O valor REAL pode variar SIGNIFICATIVAMENTE do apresentado neste documento. Um profissional qualificado deverá realizar uma visita técnica ao local para elaborar o orçamento definitivo, considerando todas as particularidades do imóvel e da documentação necessária."
  const disclaimerLines = doc.splitTextToSize(disclaimerText, pageWidth - 50)
  disclaimerLines.forEach((line: string) => {
    doc.text(line, 20, yPos)
    yPos += lineHeight - 1
  })

  yPos += 8

  // Nota final
  if (yPos > 250) {
    doc.addPage()
    yPos = 20
  }

  doc.setFontSize(9)
  doc.setFont("helvetica", "italic")
  const finalNote =
    "Para um orçamento preciso e personalizado, entre em contato conosco para agendar uma visita técnica gratuita."
  const noteLines = doc.splitTextToSize(finalNote, pageWidth - 40)
  noteLines.forEach((line: string) => {
    doc.text(line, 20, yPos)
    yPos += lineHeight - 1
  })

  yPos += 5

  // Contato
  doc.setFontSize(10)
  doc.setFont("helvetica", "bold")
  doc.text("Contato:", 20, yPos)
  yPos += lineHeight
  doc.setFont("helvetica", "normal")
  doc.text("Telefone/WhatsApp: +55 47 99638-4548", 20, yPos)

  // Save PDF
  doc.save(`orcamento-regularizacao-${data.city}-${Date.now()}.pdf`)
}
