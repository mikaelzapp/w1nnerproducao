"use client"

import type React from "react"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Calculator,
  MapPin,
  FileText,
  Clock,
  AlertCircle,
  Download,
  MessageSquare,
  ChevronRight,
  Home,
  Users,
  TreePine,
  CheckCircle,
  Send,
  X,
  Mountain,
} from "lucide-react"
import {
  calculateRegularizationCost,
  regularizationMethods,
  type CostEstimate,
  type TerrainCharacteristics,
  terrainTypes,
  rumoStatusCosts,
  accessDifficultyCosts,
} from "@/lib/utils/regularization"
import { generateQuotePDF } from "@/lib/utils/pdf-generator"
import { db } from "@/lib/firebase/config"
import { collection, addDoc } from "firebase/firestore"

const estados = [
  "AC",
  "AL",
  "AP",
  "AM",
  "BA",
  "CE",
  "DF",
  "ES",
  "GO",
  "MA",
  "MT",
  "MS",
  "MG",
  "PA",
  "PB",
  "PR",
  "PE",
  "PI",
  "RJ",
  "RN",
  "RS",
  "RO",
  "RR",
  "SC",
  "SP",
  "SE",
  "TO",
]

export default function RegularizationQuotePage() {
  // Simulation form state
  const [areaType, setAreaType] = useState<"urbana" | "rural">("urbana")
  const [size, setSize] = useState("")
  const [state, setState] = useState("AC") // Updated default value
  const [city, setCity] = useState("")
  const [methodId, setMethodId] = useState("general") // Changed default value from empty string to "general"
  const [estimate, setEstimate] = useState<CostEstimate | null>(null)

  // Chat state
  const [chatOpen, setChatOpen] = useState(false)
  const [chatMessages, setChatMessages] = useState<{ role: "user" | "assistant"; content: string }[]>([])
  const [chatInput, setChatInput] = useState("")
  const [chatLoading, setChatLoading] = useState(false)

  // Contact form state
  const [showContactForm, setShowContactForm] = useState(false)
  const [contactData, setContactData] = useState({ name: "", email: "", phone: "" })
  const [contactLoading, setContactLoading] = useState(false)
  const [contactSuccess, setContactSuccess] = useState(false)

  // Selected method for details
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null)

  const [terrainType, setTerrainType] = useState<keyof typeof terrainTypes>("campo_aberto")
  const [rumoStatus, setRumoStatus] = useState<keyof typeof rumoStatusCosts>("nao_aplicavel")
  const [accessDifficulty, setAccessDifficulty] = useState<keyof typeof accessDifficultyCosts>("facil")

  const handleCalculate = () => {
    const sizeNum = Number.parseFloat(size)
    if (!sizeNum || sizeNum <= 0) {
      alert("Por favor, insira um tamanho válido")
      return
    }

    const terrain: TerrainCharacteristics = {
      type: terrainType,
      rumoStatus: rumoStatus,
      accessDifficulty: accessDifficulty,
    }

    const result = calculateRegularizationCost(
      areaType,
      sizeNum,
      state,
      methodId === "general" ? undefined : methodId,
      terrain,
    )
    setEstimate(result)
  }

  const handleChatSend = async () => {
    if (!chatInput.trim()) return

    const userMessage = chatInput.trim()
    setChatInput("")
    setChatMessages((prev) => [...prev, { role: "user", content: userMessage }])
    setChatLoading(true)

    try {
      const response = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage }),
      })

      const data = await response.json()
      setChatMessages((prev) => [...prev, { role: "assistant", content: data.response }])
    } catch (error) {
      console.error("Chat error:", error)
      setChatMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Desculpe, ocorreu um erro. Por favor, tente novamente ou entre em contato conosco.",
        },
      ])
    } finally {
      setChatLoading(false)
    }
  }

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setContactLoading(true)

    try {
      await addDoc(collection(db, "contact_requests"), {
        ...contactData,
        type: "regularization_quote",
        estimate: estimate,
        formData: { areaType, size, state, city, methodId },
        createdAt: new Date().toISOString(),
      })

      setContactSuccess(true)
      setContactData({ name: "", email: "", phone: "" })
    } catch (error) {
      console.error("Error submitting contact:", error)
      alert("Erro ao enviar solicitação. Por favor, tente novamente.")
    } finally {
      setContactLoading(false)
    }
  }

  const downloadPDF = () => {
    if (!estimate) return

    const terrainTypeLabel = terrainTypes[terrainType].name
    const rumoStatusLabel = rumoStatusCosts[rumoStatus].name
    const accessDifficultyLabel = accessDifficultyCosts[accessDifficulty].name

    const selectedMethodData = regularizationMethods.find((m) => m.id === methodId)
    const methodName =
      methodId === "general"
        ? "Estimativa Geral - Método a ser definido após análise"
        : selectedMethodData?.name || "Método não especificado"

    generateQuotePDF({
      areaType,
      size,
      state,
      city,
      methodId,
      methodName, // Added method name
      terrainType: terrainTypeLabel,
      rumoStatus: rumoStatusLabel,
      accessDifficulty: accessDifficultyLabel,
      estimate,
    })
  }

  const handleWhatsAppContact = () => {
    if (!estimate) return

    const selectedMethodData = regularizationMethods.find((m) => m.id === methodId)
    const methodName =
      methodId === "general"
        ? "Estimativa Geral (método a ser definido)"
        : selectedMethodData?.name || "Não especificado"

    const message = `Olá vim pelo site!

*SOLICITAÇÃO DE ORÇAMENTO*

*Dados do Imóvel:*
- Tipo: ${areaType === "urbana" ? "Urbana" : "Rural"}
- Tamanho Total: ${size} m²
- Localização: ${city} - ${state}
- Tipo de Terreno: ${terrainTypes[terrainType].name}
- Status do Rumo: ${rumoStatusCosts[rumoStatus].name}
- Dificuldade de Acesso: ${accessDifficultyCosts[accessDifficulty].name}

*Tipo de Regularização:*
${methodName}

*VALOR TOTAL DO ORÇAMENTO: R$ ${estimate.totalCost.toFixed(2)}*

Complexidade: ${estimate.complexity}

Gostaria de mais informações sobre este orçamento.`

    const encodedMessage = encodeURIComponent(message)
    window.open(`https://wa.me/5547996384548?text=${encodedMessage}`, "_blank")
  }

  const complexityColors = {
    baixa: "#10b981",
    média: "#f59e0b",
    alta: "#ef4444",
  }

  const chartData = estimate
    ? [
        { name: "Custo Base", value: estimate.baseCost },
        { name: "Custo por Área", value: estimate.areaCost },
        { name: "Terreno", value: estimate.terrainCost },
        { name: "Abertura Rumo", value: estimate.rumoCost },
        { name: "Acesso", value: estimate.accessCost },
        { name: "Locomoção", value: estimate.transportationCost },
      ].filter((item) => item.value > 0)
    : []

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navigation />

      <main className="flex-1 pt-20">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-primary via-primary/95 to-primary/90 text-primary-foreground py-12 md:py-16"
        >
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center space-y-4 md:space-y-6">
              <Badge variant="secondary" className="mb-2 md:mb-4">
                Orçamento Gratuito
              </Badge>
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-balance leading-tight">
                Simule seu Orçamento de Regularização
              </h1>
              <p className="text-base sm:text-lg md:text-xl text-primary-foreground/90 leading-relaxed max-w-2xl mx-auto">
                Calcule custos aproximados, entenda os métodos disponíveis e tire suas dúvidas com nosso assistente
                inteligente
              </p>
              <Alert className="bg-yellow-500/10 border-yellow-500/30 text-primary-foreground max-w-2xl mx-auto text-left">
                <AlertCircle className="h-4 w-4 md:h-5 md:w-5 flex-shrink-0" />
                <AlertDescription className="text-xs sm:text-sm font-medium">
                  <strong>Importante:</strong> Este é apenas um orçamento estimado. O valor real pode variar
                  significativamente e será definido após visita técnica de um profissional ao local.
                </AlertDescription>
              </Alert>
            </div>
          </div>
        </motion.div>

        {/* Welcome Section */}
        <div className="container mx-auto px-4 py-8 md:py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="max-w-3xl mx-auto text-center space-y-3 md:space-y-4 mb-8 md:mb-12"
          >
            <h2 className="text-xl sm:text-2xl md:text-3xl font-serif font-bold">Como funciona?</h2>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              Nossa ferramenta ajuda você a estimar os custos de regularização fundiária, seja para áreas urbanas ou
              rurais. Preencha os dados abaixo para receber uma estimativa personalizada e entender qual método é mais
              adequado para seu caso.
            </p>
          </motion.div>

          {/* Simulation Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="max-w-4xl mx-auto mb-12 md:mb-16"
          >
            <Card>
              <CardHeader>
                <CardTitle className="font-serif text-lg sm:text-xl md:text-2xl flex items-center gap-2">
                  <Calculator className="text-primary w-5 h-5 md:w-6 md:h-6" />
                  Simulador de Custos
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  Preencha os dados para calcular uma estimativa de custos
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 md:space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                  <div className="space-y-2">
                    <Label className="text-sm">Tipo de Área *</Label>
                    <Select value={areaType} onValueChange={(v) => setAreaType(v as "urbana" | "rural")}>
                      <SelectTrigger className="h-10 md:h-11">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="urbana">
                          <div className="flex items-center gap-2">
                            <Home className="w-4 h-4" />
                            Urbana
                          </div>
                        </SelectItem>
                        <SelectItem value="rural">
                          <div className="flex items-center gap-2">
                            <TreePine className="w-4 h-4" />
                            Rural
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="size" className="text-sm">
                      Tamanho * {areaType === "urbana" ? "(m²)" : "(m² ou hectares)"}
                    </Label>
                    <Input
                      id="size"
                      type="number"
                      placeholder={areaType === "urbana" ? "Ex: 250" : "Ex: 10000"}
                      value={size}
                      onChange={(e) => setSize(e.target.value)}
                      className="h-10 md:h-11"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="state" className="text-sm">
                      Estado *
                    </Label>
                    <Select value={state} onValueChange={setState}>
                      <SelectTrigger className="h-10 md:h-11">
                        <SelectValue placeholder="Selecione o estado" />
                      </SelectTrigger>
                      <SelectContent>
                        {estados.map((uf) => (
                          <SelectItem key={uf} value={uf}>
                            {uf}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="city" className="text-sm">
                      Município *
                    </Label>
                    <Input
                      id="city"
                      type="text"
                      placeholder="Nome do município"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="h-10 md:h-11"
                    />
                  </div>
                </div>

                <div className="border-t pt-4 md:pt-6 space-y-4">
                  <div className="flex items-center gap-2 mb-2 md:mb-4">
                    <Mountain className="text-primary w-5 h-5" />
                    <h3 className="font-semibold text-base md:text-lg">Análise do Terreno</h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="terrain-type" className="text-sm">
                        Tipo de Terreno *
                      </Label>
                      <Select value={terrainType} onValueChange={(v) => setTerrainType(v as keyof typeof terrainTypes)}>
                        <SelectTrigger className="h-10 md:h-11">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(terrainTypes).map(([key, info]) => (
                            <SelectItem key={key} value={key}>
                              {info.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground">{terrainTypes[terrainType].description}</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="rumo-status" className="text-sm">
                        Status do Rumo (Caminho de Acesso) *
                      </Label>
                      <Select
                        value={rumoStatus}
                        onValueChange={(v) => setRumoStatus(v as keyof typeof rumoStatusCosts)}
                      >
                        <SelectTrigger className="h-10 md:h-11">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(rumoStatusCosts).map(([key, info]) => (
                            <SelectItem key={key} value={key}>
                              {info.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground">{rumoStatusCosts[rumoStatus].description}</p>
                    </div>

                    <div className="space-y-2 sm:col-span-2">
                      <Label htmlFor="access-difficulty" className="text-sm">
                        Dificuldade de Acesso *
                      </Label>
                      <Select
                        value={accessDifficulty}
                        onValueChange={(v) => setAccessDifficulty(v as keyof typeof accessDifficultyCosts)}
                      >
                        <SelectTrigger className="h-10 md:h-11">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(accessDifficultyCosts).map(([key, info]) => (
                            <SelectItem key={key} value={key}>
                              <div className="flex items-center justify-between w-full gap-2">
                                <span className="text-sm">{info.name}</span>
                                <Badge variant="outline" className="ml-2 text-xs">
                                  {info.multiplier}x
                                </Badge>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground">
                        {accessDifficultyCosts[accessDifficulty].description}
                      </p>
                    </div>
                  </div>

                  <Alert>
                    <AlertCircle className="h-4 w-4 flex-shrink-0" />
                    <AlertDescription className="text-xs sm:text-sm">
                      As características do terreno afetam significativamente o custo e prazo da regularização. Terrenos
                      com difícil acesso ou que necessitam abertura de rumo podem ter custos adicionais de R$ 2.500 a R$
                      5.000.
                    </AlertDescription>
                  </Alert>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="method" className="text-sm">
                    Tipo de Regularização (opcional)
                  </Label>
                  <Select value={methodId} onValueChange={setMethodId}>
                    <SelectTrigger className="h-10 md:h-11">
                      <SelectValue placeholder="Selecione um método específico ou deixe em branco" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">Estimativa Geral</SelectItem>
                      {regularizationMethods
                        .filter((m) => m.applicableTo.includes(areaType))
                        .map((method) => (
                          <SelectItem key={method.id} value={method.id}>
                            {method.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button onClick={handleCalculate} className="w-full h-11 md:h-12 text-sm md:text-base" size="lg">
                  <Calculator className="mr-2 w-4 h-4 md:w-5 md:h-5" />
                  Calcular Orçamento
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          {/* Results */}
          <AnimatePresence>
            {estimate && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="max-w-4xl mx-auto mb-12 md:mb-16"
              >
                <Card className="border-primary/20">
                  <CardHeader>
                    <CardTitle className="font-serif text-lg sm:text-xl md:text-2xl flex items-center gap-2">
                      <FileText className="text-primary w-5 h-5 md:w-6 md:h-6" />
                      Resultado da Simulação
                    </CardTitle>
                    <Alert className="mt-4 bg-yellow-50 border-yellow-200">
                      <AlertCircle className="h-4 w-4 text-yellow-600 flex-shrink-0" />
                      <AlertDescription className="text-xs sm:text-sm text-yellow-800">
                        <strong>Atenção:</strong> Este orçamento é uma estimativa inicial. O valor final será
                        determinado após análise técnica presencial por nosso profissional, podendo variar
                        consideravelmente conforme as características específicas do imóvel e documentação necessária.
                      </AlertDescription>
                    </Alert>
                  </CardHeader>
                  <CardContent className="space-y-4 md:space-y-6">
                    {/* Cost Summary */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Card>
                        <CardContent className="pt-4 md:pt-6">
                          <div className="text-center space-y-2">
                            <p className="text-xs sm:text-sm text-muted-foreground">Área Total</p>
                            <p className="text-xl sm:text-2xl font-bold">{size} m²</p>
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardContent className="pt-4 md:pt-6">
                          <div className="text-center space-y-2">
                            <div className="flex items-center justify-center gap-2">
                              <AlertCircle className="w-4 h-4 text-muted-foreground" />
                              <p className="text-xs sm:text-sm text-muted-foreground">Complexidade</p>
                            </div>
                            <Badge
                              style={{
                                backgroundColor: complexityColors[estimate.complexity],
                                color: "white",
                              }}
                              className="text-sm sm:text-base px-3 sm:px-4 py-1"
                            >
                              {estimate.complexity.charAt(0).toUpperCase() + estimate.complexity.slice(1)}
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Show only total cost */}
                    <Card className="bg-primary/5 border-primary/20">
                      <CardContent className="pt-4 md:pt-6">
                        <div className="text-center space-y-2">
                          <p className="text-xs sm:text-sm text-muted-foreground uppercase tracking-wide">
                            Valor Total do Orçamento
                          </p>
                          <p className="text-3xl sm:text-4xl md:text-5xl font-bold text-primary break-words">
                            {estimate.totalCost.toLocaleString("pt-BR", {
                              style: "currency",
                              currency: "BRL",
                            })}
                          </p>
                          <p className="text-xs text-muted-foreground mt-2">
                            {methodId === "general"
                              ? "Estimativa geral - método a ser definido após análise"
                              : regularizationMethods.find((m) => m.id === methodId)?.name}
                          </p>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Action Buttons */}
                    <div className="flex flex-col gap-3 md:gap-4">
                      <Button
                        onClick={downloadPDF}
                        variant="outline"
                        className="w-full h-11 md:h-12 text-sm md:text-base bg-transparent"
                      >
                        <Download className="mr-2 w-4 h-4" />
                        Baixar Orçamento (PDF)
                      </Button>
                      <Button onClick={handleWhatsAppContact} className="w-full h-11 md:h-12 text-sm md:text-base">
                        <Users className="mr-2 w-4 h-4" />
                        Solicitar Atendimento Humano
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Regularization Methods */}
          <div className="max-w-6xl mx-auto mb-12 md:mb-16">
            <div className="text-center space-y-3 md:space-y-4 mb-8 md:mb-12">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold">Métodos de Regularização</h2>
              <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto">
                Conheça os principais métodos de regularização fundiária disponíveis no Brasil
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {regularizationMethods.map((method, index) => (
                <motion.div
                  key={method.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card
                    className="h-full hover:shadow-lg transition-shadow cursor-pointer"
                    onClick={() => setSelectedMethod(method.id)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-2">
                        <CardTitle className="font-serif text-base sm:text-lg">{method.name}</CardTitle>
                        <Badge
                          variant="outline"
                          className="text-xs flex-shrink-0"
                          style={{
                            borderColor: complexityColors[method.complexity],
                            color: complexityColors[method.complexity],
                          }}
                        >
                          {method.complexity}
                        </Badge>
                      </div>
                      <CardDescription className="line-clamp-3 text-xs sm:text-sm">
                        {method.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="space-y-2 md:space-y-3">
                        <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                          <Clock className="w-4 h-4 flex-shrink-0" />
                          <span className="truncate">{method.averageTime}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs sm:text-sm">
                          <MapPin className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                          <span className="text-muted-foreground truncate">
                            Aplicável:{" "}
                            {method.applicableTo.map((t) => t.charAt(0).toUpperCase() + t.slice(1)).join(", ")}
                          </span>
                        </div>
                        <Button variant="ghost" className="w-full justify-between text-xs sm:text-sm h-9" size="sm">
                          Saiba mais
                          <ChevronRight className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Method Details Modal */}
          <AnimatePresence>
            {selectedMethod && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
                onClick={() => setSelectedMethod(null)}
              >
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  onClick={(e) => e.stopPropagation()}
                  className="bg-background rounded-lg max-w-2xl w-full max-h-[85vh] overflow-y-auto"
                >
                  {(() => {
                    const method = regularizationMethods.find((m) => m.id === selectedMethod)
                    if (!method) return null

                    return (
                      <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <h3 className="text-xl sm:text-2xl font-serif font-bold mb-2 break-words">{method.name}</h3>
                            <Badge
                              className="text-xs"
                              style={{
                                backgroundColor: complexityColors[method.complexity],
                                color: "white",
                              }}
                            >
                              Complexidade {method.complexity}
                            </Badge>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setSelectedMethod(null)}
                            className="flex-shrink-0"
                          >
                            <X className="w-5 h-5" />
                          </Button>
                        </div>

                        <div className="space-y-4">
                          <div>
                            <h4 className="font-semibold mb-2 text-sm sm:text-base">Descrição</h4>
                            <p className="text-muted-foreground text-xs sm:text-sm">{method.description}</p>
                          </div>

                          <div>
                            <h4 className="font-semibold mb-2 flex items-center gap-2 text-sm sm:text-base">
                              <Clock className="w-4 h-4" />
                              Prazo Médio
                            </h4>
                            <p className="text-muted-foreground text-xs sm:text-sm">{method.averageTime}</p>
                          </div>

                          <div>
                            <h4 className="font-semibold mb-2 flex items-center gap-2 text-sm sm:text-base">
                              <CheckCircle className="w-4 h-4" />
                              Requisitos
                            </h4>
                            <ul className="list-disc list-inside space-y-1 text-muted-foreground text-xs sm:text-sm">
                              {method.requirements.map((req, idx) => (
                                <li key={idx} className="break-words">
                                  {req}
                                </li>
                              ))}
                            </ul>
                          </div>

                          <div>
                            <h4 className="font-semibold mb-2 flex items-center gap-2 text-sm sm:text-base">
                              <MapPin className="w-4 h-4" />
                              Aplicável a
                            </h4>
                            <p className="text-muted-foreground text-xs sm:text-sm">
                              Áreas {method.applicableTo.map((t) => t + "s").join(" e ")}
                            </p>
                          </div>
                        </div>

                        <Button
                          className="w-full h-11 text-sm sm:text-base"
                          onClick={() => {
                            setMethodId(method.id)
                            setSelectedMethod(null)
                            window.scrollTo({ top: 0, behavior: "smooth" })
                          }}
                        >
                          Simular com este método
                        </Button>
                      </div>
                    )
                  })()}
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Contact Form Modal */}
          <AnimatePresence>
            {showContactForm && !contactSuccess && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
                onClick={() => setShowContactForm(false)}
              >
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  onClick={(e) => e.stopPropagation()}
                  className="bg-background rounded-lg max-w-md w-full"
                >
                  <Card>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="font-serif">Solicitar Atendimento</CardTitle>
                          <CardDescription>Preencha seus dados para contato</CardDescription>
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => setShowContactForm(false)}>
                          <X className="w-5 h-5" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <form onSubmit={handleContactSubmit} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="contact-name">Nome Completo *</Label>
                          <Input
                            id="contact-name"
                            value={contactData.name}
                            onChange={(e) => setContactData({ ...contactData, name: e.target.value })}
                            required
                            disabled={contactLoading}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="contact-email">Email *</Label>
                          <Input
                            id="contact-email"
                            type="email"
                            value={contactData.email}
                            onChange={(e) => setContactData({ ...contactData, email: e.target.value })}
                            required
                            disabled={contactLoading}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="contact-phone">Telefone *</Label>
                          <Input
                            id="contact-phone"
                            type="tel"
                            value={contactData.phone}
                            onChange={(e) => setContactData({ ...contactData, phone: e.target.value })}
                            required
                            disabled={contactLoading}
                          />
                        </div>

                        <Button type="submit" className="w-full" disabled={contactLoading}>
                          {contactLoading ? "Enviando..." : "Enviar Solicitação"}
                        </Button>
                      </form>
                    </CardContent>
                  </Card>
                </motion.div>
              </motion.div>
            )}

            {contactSuccess && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
                onClick={() => {
                  setContactSuccess(false)
                  setShowContactForm(false)
                }}
              >
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  onClick={(e) => e.stopPropagation()}
                  className="bg-background rounded-lg max-w-md w-full p-8 text-center space-y-4"
                >
                  <CheckCircle className="w-16 h-16 text-green-600 mx-auto" />
                  <h3 className="text-2xl font-serif font-bold">Solicitação Enviada!</h3>
                  <p className="text-muted-foreground">
                    Recebemos sua solicitação. Nossa equipe entrará em contato em breve.
                  </p>
                  <Button
                    onClick={() => {
                      setContactSuccess(false)
                      setShowContactForm(false)
                    }}
                  >
                    Fechar
                  </Button>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* CTA Section */}
        <div className="bg-muted py-12 md:py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center space-y-4 md:space-y-6">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold">
                Pronto para regularizar seu imóvel?
              </h2>
              <p className="text-muted-foreground text-sm sm:text-base md:text-lg">
                Nossa equipe especializada está pronta para ajudar você em todo o processo
              </p>
              <div className="flex flex-col gap-3 md:gap-4">
                <a
                  href="https://wa.me/5547996384548?text=Ol%C3%A1%20vim%20pelo%20site"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full"
                >
                  <Button size="lg" className="w-full h-11 md:h-12 text-sm md:text-base">
                    <MessageSquare className="mr-2 w-4 h-4" />
                    Falar no WhatsApp
                  </Button>
                </a>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => (window.location.href = "/")}
                  className="w-full h-11 md:h-12 text-sm md:text-base bg-transparent"
                >
                  Voltar ao Site Principal
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* AI Assistant Chat */}
      <AnimatePresence>
        {chatOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-20 sm:bottom-24 right-2 sm:right-4 w-[calc(100vw-1rem)] sm:w-96 max-w-[calc(100vw-1rem)] z-50"
          >
            <Card className="shadow-2xl">
              <CardHeader className="bg-primary text-primary-foreground p-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="font-serif text-base sm:text-lg">Assistente Inteligente</CardTitle>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setChatOpen(false)}
                    className="text-primary-foreground hover:bg-primary-foreground/20 h-8 w-8"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                <CardDescription className="text-primary-foreground/80 text-xs sm:text-sm">
                  Tire suas dúvidas sobre regularização
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="h-64 sm:h-96 overflow-y-auto p-3 sm:p-4 space-y-3 sm:space-y-4">
                  {chatMessages.length === 0 && (
                    <div className="text-center text-muted-foreground py-6 sm:py-8">
                      <MessageSquare className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 sm:mb-4 opacity-50" />
                      <p className="text-xs sm:text-sm">Olá! Como posso ajudar você com regularização fundiária?</p>
                    </div>
                  )}
                  {chatMessages.map((msg, idx) => (
                    <div key={idx} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                      <div
                        className={`max-w-[85%] rounded-lg p-2.5 sm:p-3 text-xs sm:text-sm ${
                          msg.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"
                        }`}
                      >
                        {msg.content}
                      </div>
                    </div>
                  ))}
                  {chatLoading && (
                    <div className="flex justify-start">
                      <div className="bg-muted rounded-lg p-2.5 sm:p-3">
                        <div className="flex gap-1">
                          <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" />
                          <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce delay-100" />
                          <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce delay-200" />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                <div className="border-t p-3 sm:p-4">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Digite sua pergunta..."
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleChatSend()}
                      disabled={chatLoading}
                      className="h-9 sm:h-10 text-sm"
                    />
                    <Button
                      onClick={handleChatSend}
                      disabled={chatLoading || !chatInput.trim()}
                      size="icon"
                      className="h-9 w-9 sm:h-10 sm:w-10 flex-shrink-0"
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Button */}
      {!chatOpen && (
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="fixed bottom-4 right-4 z-50">
          <Button
            size="lg"
            className="rounded-full w-14 h-14 sm:w-16 sm:h-16 shadow-2xl"
            onClick={() => setChatOpen(true)}
          >
            <MessageSquare className="w-5 h-5 sm:w-6 sm:h-6" />
          </Button>
        </motion.div>
      )}

      <Footer />
    </div>
  )
}
