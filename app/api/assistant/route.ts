import { type NextRequest, NextResponse } from "next/server"

const MAX_MESSAGE_LENGTH = 500
const knowledgeBase: Record<string, string> = {
  saudacao:
    "Olá! Seja bem-vindo à W1nner Engenharia e Topografia! 👋 Sou seu assistente virtual e estou aqui para ajudar com informações sobre regularização fundiária. Como posso ajudá-lo hoje?",

  despedida:
    "Foi um prazer ajudá-lo! Se tiver mais dúvidas sobre regularização fundiária, estou sempre por aqui. Tenha um ótimo dia! 😊",

  agradecimento:
    "Por nada! Fico feliz em poder ajudar. Se precisar de mais informações sobre regularização de terras, é só perguntar!",

  apresentacao:
    "Sou o assistente virtual da W1nner Engenharia e Topografia, especializada em regularização fundiária urbana e rural. Posso ajudá-lo com informações sobre REURB, Usucapião, INCRA, custos, prazos e documentação necessária. O que gostaria de saber?",

  reurb:
    "REURB (Regularização Fundiária Urbana) é dividida em REURB-S (Social) para população de baixa renda e REURB-E (Específica) para demais casos. A REURB-S é gratuita e simplificada, enquanto a REURB-E requer pagamento de taxas. Ambas são aplicáveis a áreas urbanas consolidadas ocupadas até 22/12/2016.",

  usucapiao:
    "Usucapião é a aquisição de propriedade por posse prolongada. Pode ser judicial (mais demorado, 2-4 anos) ou extrajudicial (mais rápido, 6-12 meses). Requer posse mansa, pacífica e ininterrupta por período mínimo que varia de 5 a 15 anos conforme o tipo.",

  incra:
    "A titulação pelo INCRA é para áreas rurais em terras públicas federais. Requer cadastro no INCRA, comprovação de exploração agrícola e georreferenciamento. O processo pode levar de 18 a 36 meses.",

  diferenca:
    "As principais diferenças entre os métodos são: REURB é para áreas urbanas consolidadas; Usucapião requer tempo de posse; INCRA é para terras rurais públicas federais; CDRU/CCU são concessões de uso (não propriedade); Georreferenciamento é obrigatório para imóveis rurais.",

  custo:
    "Os custos variam conforme o método e complexidade. REURB-S é gratuita para baixa renda. Usucapião judicial é mais caro (honorários advocatícios). Processos rurais incluem georreferenciamento. Nossa simulação fornece estimativas baseadas em médias de mercado. Importante: o orçamento online é apenas uma estimativa, o valor real será definido após visita técnica ao local.",

  prazo:
    "Os prazos variam: CDRU/CCU (6-12 meses), Usucapião Extrajudicial (6-12 meses), REURB (12-24 meses), INCRA (18-36 meses), Usucapião Judicial (24-48 meses), Quilombola/Indígena (36+ meses).",

  documentos:
    "Documentos geralmente necessários: RG, CPF, comprovante de residência, certidões negativas, planta/memorial descritivo do imóvel, comprovação de posse, fotos do local. Documentos específicos variam conforme o método escolhido.",

  localizacao:
    "A W1nner Engenharia e Topografia está localizada em Joinville, SC. Atendemos todo o Brasil com custos de locomoção variáveis conforme o estado. Entre em contato para um orçamento personalizado!",

  contato:
    "Você pode entrar em contato conosco pelo WhatsApp: +55 47 99638-4548. Nossa equipe terá prazer em atendê-lo e fornecer um orçamento detalhado após visita técnica ao seu terreno.",
}

function sanitizeInput(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, "") // Remove caracteres HTML perigosos
    .substring(0, MAX_MESSAGE_LENGTH) // Limita tamanho
}

export async function POST(request: NextRequest) {
  try {
    const { message } = await request.json()

    if (!message || typeof message !== "string") {
      return NextResponse.json({ error: "Mensagem inválida" }, { status: 400 })
    }

    if (message.length > MAX_MESSAGE_LENGTH) {
      return NextResponse.json(
        { error: `Mensagem muito longa. Máximo ${MAX_MESSAGE_LENGTH} caracteres.` },
        { status: 400 },
      )
    }

    const sanitizedMessage = sanitizeInput(message)
    const messageLower = sanitizedMessage.toLowerCase()

    // Saudações
    if (
      /^(oi|olá|ola|hey|opa|e aí|eai|bom dia|boa tarde|boa noite|alô|alo)$/i.test(messageLower) ||
      messageLower.includes("olá") ||
      messageLower.includes("oi") ||
      messageLower.includes("bom dia") ||
      messageLower.includes("boa tarde") ||
      messageLower.includes("boa noite")
    ) {
      return NextResponse.json({ response: knowledgeBase.saudacao })
    }

    // Despedidas
    if (
      messageLower.includes("tchau") ||
      messageLower.includes("até logo") ||
      messageLower.includes("até mais") ||
      messageLower.includes("obrigado") ||
      messageLower.includes("obrigada") ||
      messageLower.includes("valeu")
    ) {
      return NextResponse.json({ response: knowledgeBase.despedida })
    }

    // Agradecimentos
    if (
      messageLower.includes("obrigado") ||
      messageLower.includes("obrigada") ||
      messageLower.includes("valeu") ||
      messageLower.includes("agradeço")
    ) {
      return NextResponse.json({ response: knowledgeBase.agradecimento })
    }

    // Apresentação
    if (
      messageLower.includes("quem é você") ||
      messageLower.includes("o que você faz") ||
      messageLower.includes("quem e voce") ||
      messageLower.includes("se apresente") ||
      messageLower.includes("você é")
    ) {
      return NextResponse.json({ response: knowledgeBase.apresentacao })
    }

    // Localização
    if (
      messageLower.includes("onde fica") ||
      messageLower.includes("localização") ||
      messageLower.includes("endereço") ||
      messageLower.includes("onde vocês estão") ||
      messageLower.includes("onde estão")
    ) {
      return NextResponse.json({ response: knowledgeBase.localizacao })
    }

    // Contato
    if (
      messageLower.includes("contato") ||
      messageLower.includes("telefone") ||
      messageLower.includes("whatsapp") ||
      messageLower.includes("falar com") ||
      messageLower.includes("ligar")
    ) {
      return NextResponse.json({ response: knowledgeBase.contato })
    }

    // Buscar resposta no knowledge base técnico
    let response =
      "Desculpe, não entendi sua pergunta. Você pode perguntar sobre: REURB, Usucapião, INCRA, diferenças entre métodos, custos, prazos, documentos necessários, nossa localização ou como entrar em contato. Como posso ajudá-lo?"

    for (const [key, value] of Object.entries(knowledgeBase)) {
      if (messageLower.includes(key)) {
        response = value
        break
      }
    }

    // Respostas para perguntas comuns
    if (messageLower.includes("quanto custa") || messageLower.includes("preço") || messageLower.includes("valor")) {
      response = knowledgeBase.custo
    } else if (
      messageLower.includes("quanto tempo") ||
      messageLower.includes("prazo") ||
      messageLower.includes("demora")
    ) {
      response = knowledgeBase.prazo
    } else if (
      messageLower.includes("documento") ||
      messageLower.includes("preciso") ||
      messageLower.includes("necessário")
    ) {
      response = knowledgeBase.documentos
    } else if (
      messageLower.includes("diferença") ||
      messageLower.includes("qual escolher") ||
      messageLower.includes("melhor método")
    ) {
      response = knowledgeBase.diferenca
    }

    return NextResponse.json({ response })
  } catch (error) {
    console.error("Assistant API error:", error)
    return NextResponse.json({ error: "Erro ao processar mensagem" }, { status: 500 })
  }
}
