export interface RegularizationMethod {
  id: string
  name: string
  description: string
  requirements: string[]
  averageTime: string
  complexity: "baixa" | "média" | "alta"
  applicableTo: ("urbana" | "rural")[]
}

export const regularizationMethods: RegularizationMethod[] = [
  {
    id: "reurb-s",
    name: "REURB-S (Social)",
    description:
      "Regularização Fundiária Urbana de Interesse Social, destinada a população de baixa renda. Gratuita e simplificada.",
    requirements: [
      "Área urbana consolidada",
      "População de baixa renda",
      "Ocupação até 22/12/2016",
      "Documentação básica",
    ],
    averageTime: "12 a 18 meses",
    complexity: "média",
    applicableTo: ["urbana"],
  },
  {
    id: "reurb-e",
    name: "REURB-E (Específica)",
    description:
      "Regularização Fundiária Urbana para áreas que não se enquadram como interesse social. Requer pagamento de taxas.",
    requirements: [
      "Área urbana consolidada",
      "Não enquadrada como baixa renda",
      "Ocupação até 22/12/2016",
      "Documentação completa",
    ],
    averageTime: "12 a 24 meses",
    complexity: "média",
    applicableTo: ["urbana"],
  },
  {
    id: "usucapiao-judicial",
    name: "Usucapião Judicial",
    description: "Processo judicial para aquisição de propriedade por posse prolongada. Requer ação judicial completa.",
    requirements: [
      "Posse mansa e pacífica",
      "Tempo mínimo de posse (5, 10 ou 15 anos)",
      "Sem oposição do proprietário",
      "Testemunhas",
    ],
    averageTime: "24 a 48 meses",
    complexity: "alta",
    applicableTo: ["urbana", "rural"],
  },
  {
    id: "usucapiao-extrajudicial",
    name: "Usucapião Extrajudicial",
    description:
      "Processo administrativo de usucapião realizado em cartório, mais rápido que o judicial quando não há contestação.",
    requirements: [
      "Posse mansa e pacífica",
      "Tempo mínimo de posse cumprido",
      "Anuência de confrontantes",
      "Planta e memorial descritivo",
    ],
    averageTime: "6 a 12 meses",
    complexity: "média",
    applicableTo: ["urbana", "rural"],
  },
  {
    id: "incra",
    name: "Titulação INCRA",
    description:
      "Regularização de terras rurais através do INCRA, para áreas de reforma agrária ou terras públicas federais.",
    requirements: [
      "Área rural",
      "Posse em terra pública federal",
      "Exploração agrícola",
      "Cadastro no INCRA",
      "Georreferenciamento",
    ],
    averageTime: "18 a 36 meses",
    complexity: "alta",
    applicableTo: ["rural"],
  },
  {
    id: "cdru",
    name: "CDRU (Concessão de Direito Real de Uso)",
    description: "Concessão de uso de terras públicas para fins de moradia ou atividades de interesse social.",
    requirements: [
      "Terra pública",
      "Finalidade social ou moradia",
      "Não ser proprietário de outro imóvel",
      "Documentação pessoal",
    ],
    averageTime: "6 a 12 meses",
    complexity: "baixa",
    applicableTo: ["urbana", "rural"],
  },
  {
    id: "ccu",
    name: "CCU (Concessão de Uso Especial)",
    description: "Concessão especial para quem ocupa área pública urbana para moradia há mais de 5 anos.",
    requirements: [
      "Ocupação de área pública urbana",
      "Posse há mais de 5 anos (até 30/06/2001)",
      "Área até 250m²",
      "Não ser proprietário de outro imóvel",
    ],
    averageTime: "6 a 12 meses",
    complexity: "baixa",
    applicableTo: ["urbana"],
  },
  {
    id: "georreferenciamento",
    name: "Georreferenciamento e Retificação",
    description: "Correção de dados cadastrais e georreferenciamento de imóveis rurais conforme normas do INCRA.",
    requirements: ["Imóvel rural", "Levantamento topográfico", "Memorial descritivo", "Certificação no INCRA"],
    averageTime: "3 a 6 meses",
    complexity: "média",
    applicableTo: ["rural"],
  },
  {
    id: "quilombola",
    name: "Territórios Quilombolas",
    description: "Regularização de terras de comunidades quilombolas reconhecidas, com titulação coletiva.",
    requirements: [
      "Certificação da Fundação Palmares",
      "Relatório antropológico",
      "Delimitação territorial",
      "Processo administrativo específico",
    ],
    averageTime: "36 a 60 meses",
    complexity: "alta",
    applicableTo: ["rural"],
  },
  {
    id: "indigena",
    name: "Demarcação Indígena",
    description: "Processo de demarcação e regularização de terras indígenas, conduzido pela FUNAI.",
    requirements: [
      "Reconhecimento pela FUNAI",
      "Estudos antropológicos",
      "Processo administrativo federal",
      "Homologação presidencial",
    ],
    averageTime: "60+ meses",
    complexity: "alta",
    applicableTo: ["rural"],
  },
]

export interface TerrainCharacteristics {
  type: "campo_aberto" | "mata_fechada" | "banhado" | "grota" | "morro" | "plano"
  rumoStatus: "ja_tem" | "precisa_abrir" | "nao_aplicavel"
  accessDifficulty: "facil" | "medio" | "dificil" | "muito_dificil"
}

export const terrainTypes = {
  campo_aberto: { name: "Campo Aberto", multiplier: 1.0, description: "Terreno plano e aberto, fácil acesso" },
  plano: { name: "Terreno Plano", multiplier: 1.1, description: "Terreno plano com vegetação baixa" },
  mata_fechada: {
    name: "Mata Fechada",
    multiplier: 1.5,
    description: "Vegetação densa, requer abertura de picadas",
  },
  banhado: { name: "Banhado/Alagado", multiplier: 1.8, description: "Área úmida ou alagada, acesso difícil" },
  grota: { name: "Grota/Vale", multiplier: 1.6, description: "Terreno acidentado com depressões" },
  morro: { name: "Morro/Encosta", multiplier: 1.7, description: "Terreno íngreme, acesso complicado" },
}

export const rumoStatusCosts = {
  ja_tem: { name: "Já tem rumo aberto", cost: 0, description: "Caminho de acesso já existe" },
  precisa_abrir: {
    name: "Precisa abrir rumo",
    cost: 2500,
    description: "Necessário abrir caminho de acesso e picadas",
  },
  nao_aplicavel: { name: "Não aplicável", cost: 0, description: "Área urbana ou com acesso direto" },
}

export const accessDifficultyCosts = {
  facil: { name: "Fácil", multiplier: 1.0, description: "Acesso direto por estrada" },
  medio: { name: "Médio", multiplier: 1.2, description: "Acesso por estrada de terra" },
  dificil: { name: "Difícil", multiplier: 1.5, description: "Acesso precário, requer veículo 4x4" },
  muito_dificil: {
    name: "Muito Difícil",
    multiplier: 2.0,
    description: "Acesso apenas a pé ou com equipamento especial",
  },
}

export const transportationCosts: Record<string, { cost: number; distance: string }> = {
  SC: { cost: 0, distance: "Base (Joinville)" },
  PR: { cost: 300, distance: "~100-200 km" },
  RS: { cost: 500, distance: "~300-400 km" },
  SP: { cost: 800, distance: "~400-500 km" },
  RJ: { cost: 1200, distance: "~700-800 km" },
  MG: { cost: 1000, distance: "~600-700 km" },
  ES: { cost: 1400, distance: "~900-1000 km" },
  MS: { cost: 1500, distance: "~1000-1200 km" },
  MT: { cost: 2000, distance: "~1500-1800 km" },
  GO: { cost: 1600, distance: "~1200-1400 km" },
  DF: { cost: 1700, distance: "~1300-1500 km" },
  BA: { cost: 2200, distance: "~1800-2000 km" },
  SE: { cost: 2500, distance: "~2000-2200 km" },
  AL: { cost: 2600, distance: "~2200-2400 km" },
  PE: { cost: 2700, distance: "~2300-2500 km" },
  PB: { cost: 2800, distance: "~2400-2600 km" },
  RN: { cost: 2900, distance: "~2500-2700 km" },
  CE: { cost: 3000, distance: "~2600-2800 km" },
  PI: { cost: 3100, distance: "~2700-2900 km" },
  MA: { cost: 3200, distance: "~2800-3000 km" },
  TO: { cost: 2400, distance: "~2000-2200 km" },
  PA: { cost: 3500, distance: "~3000-3200 km" },
  AP: { cost: 4000, distance: "~3500-3700 km" },
  AM: { cost: 4500, distance: "~4000-4200 km" },
  RR: { cost: 5000, distance: "~4500-4700 km" },
  RO: { cost: 3800, distance: "~3200-3400 km" },
  AC: { cost: 4200, distance: "~3800-4000 km" },
}

export interface CostEstimate {
  baseCost: number
  areaCost: number
  terrainCost: number
  rumoCost: number
  accessCost: number
  transportationCost: number
  totalCost: number
  averageTime: string
  complexity: "baixa" | "média" | "alta"
  observations: string[]
}

export function calculateRegularizationCost(
  areaType: "urbana" | "rural",
  size: number,
  state: string,
  methodId?: string,
  terrain?: TerrainCharacteristics,
): CostEstimate {
  let baseCost = 0
  let areaCost = 0
  let terrainCost = 0
  let rumoCost = 0
  let accessCost = 0
  let transportationCost = 0
  let averageTime = ""
  let complexity: "baixa" | "média" | "alta" = "média"
  const observations: string[] = []

  const transportInfo = transportationCosts[state] || transportationCosts["SC"]
  transportationCost = transportInfo.cost
  if (transportationCost > 0) {
    observations.push(`Locomoção para ${state}: ${transportInfo.distance} - R$ ${transportationCost.toFixed(2)}`)
  }

  let sizeMultiplier = 1.0
  if (size > 5000) {
    sizeMultiplier = 1.5 // 50% increase for properties above 5000 m²
    observations.push("Área acima de 5000m²: custo adicional aplicado devido ao tamanho")
  }

  if (areaType === "urbana") {
    baseCost = 2000 * sizeMultiplier
    areaCost = size * 0.3
    averageTime = "12 a 18 meses"
    observations.push("Custos podem variar conforme documentação necessária")
    observations.push("Taxas de cartório não incluídas")
    observations.push("Possível necessidade de regularização junto à prefeitura")

    if (terrain) {
      if (terrain.type !== "campo_aberto" && terrain.type !== "plano") {
        const terrainInfo = terrainTypes[terrain.type]
        terrainCost = baseCost * (terrainInfo.multiplier - 1)
        observations.push(`Terreno tipo ${terrainInfo.name}: ${terrainInfo.description}`)
      }
    }
  } else {
    // rural
    const hectares = size / 10000
    baseCost = 1500 * sizeMultiplier
    areaCost = hectares * 150
    averageTime = "18 a 24 meses"
    observations.push("Georreferenciamento obrigatório para áreas rurais")
    observations.push("Certificação no INCRA necessária")
    observations.push("Custos de levantamento topográfico incluídos")

    if (terrain) {
      // Terrain type cost
      const terrainInfo = terrainTypes[terrain.type]
      terrainCost = baseCost * (terrainInfo.multiplier - 1) + areaCost * (terrainInfo.multiplier - 1)
      observations.push(`Tipo de terreno: ${terrainInfo.name} - ${terrainInfo.description}`)

      // Rumo (survey path) cost
      const rumoInfo = rumoStatusCosts[terrain.rumoStatus]
      rumoCost = rumoInfo.cost
      if (rumoCost > 0) {
        observations.push(`${rumoInfo.name}: ${rumoInfo.description}`)
      }

      // Access difficulty cost
      const accessInfo = accessDifficultyCosts[terrain.accessDifficulty]
      accessCost = (baseCost + areaCost) * (accessInfo.multiplier - 1)
      if (accessInfo.multiplier > 1.0) {
        observations.push(`Dificuldade de acesso: ${accessInfo.name} - ${accessInfo.description}`)
      }

      // Adjust time based on terrain difficulty
      if (terrain.type === "banhado" || terrain.type === "grota" || terrain.accessDifficulty === "muito_dificil") {
        averageTime = "24 a 36 meses"
        observations.push("Prazo estendido devido às características do terreno")
      }
    }
  }

  // Adjust based on the specific method
  if (methodId) {
    const method = regularizationMethods.find((m) => m.id === methodId)
    if (method) {
      complexity = method.complexity
      averageTime = method.averageTime

      // Adjustments of cost by method
      if (methodId === "reurb-s") {
        baseCost *= 0.5
        observations.push("REURB-S: reduced costs for low-income population")
      } else if (methodId.includes("usucapiao-judicial")) {
        baseCost *= 2.5
        observations.push("Judicial process: includes legal costs and attorney fees")
      } else if (methodId === "incra" || methodId === "quilombola" || methodId === "indigena") {
        baseCost *= 2
        observations.push("Complex process with multiple administrative steps")
      }
    }
  }

  const totalCost = baseCost + areaCost + terrainCost + rumoCost + accessCost + transportationCost

  return {
    baseCost,
    areaCost,
    terrainCost,
    rumoCost,
    accessCost,
    transportationCost,
    totalCost,
    averageTime,
    complexity,
    observations,
  }
}
