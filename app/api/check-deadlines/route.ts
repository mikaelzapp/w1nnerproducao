import { NextResponse } from "next/server"
import { db } from "@/lib/firebase/config"
import { collection, getDocs, query, where, updateDoc, doc, arrayUnion } from "firebase/firestore"

export async function GET(request: Request) {
  try {
    // Verificar autorização (pode adicionar um token secreto aqui)
    const authHeader = request.headers.get("authorization")
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const now = new Date()
    let closedProcesses = 0

    // Buscar todos os processos ativos
    const processesQuery = query(collection(db, "processes"), where("status", "in", ["pendente", "em_andamento"]))

    const processesSnapshot = await getDocs(processesQuery)

    for (const processDoc of processesSnapshot.docs) {
      const processData = processDoc.data()
      let shouldClose = false
      const expiredItems: string[] = []

      if (processData.deadline) {
        const processDeadline = new Date(processData.deadline)
        if (processDeadline < now) {
          shouldClose = true
          expiredItems.push(`Prazo geral do processo`)
        }
      }

      // Verificar deadlines de requirements
      if (processData.requirements) {
        for (const req of processData.requirements) {
          if (req.deadline && req.status !== "aprovado" && req.status !== "concluido") {
            const deadline = new Date(req.deadline)
            if (deadline < now) {
              shouldClose = true
              expiredItems.push(`Documento: ${req.name}`)
            }
          }
        }
      }

      // Verificar deadlines de tasks
      if (processData.adminTasks) {
        for (const task of processData.adminTasks) {
          if (task.deadline && task.status !== "concluido") {
            const deadline = new Date(task.deadline)
            if (deadline < now) {
              shouldClose = true
              expiredItems.push(`Tarefa: ${task.title}`)
            }
          }
        }
      }

      // Encerrar processo se houver deadlines vencidos
      if (shouldClose) {
        const processRef = doc(db, "processes", processDoc.id)
        await updateDoc(processRef, {
          status: "cancelado",
          closedAt: now.toISOString(),
          closedReason: "Prazo de entrega não cumprido",
          updatedAt: now.toISOString(),
          timeline: arrayUnion({
            status: "cancelado",
            message: `Processo encerrado automaticamente por prazo vencido. Itens vencidos: ${expiredItems.join(", ")}`,
            timestamp: now.toISOString(),
            actor: "system",
            actorName: "Sistema Automático",
          }),
        })

        closedProcesses++
      }
    }

    return NextResponse.json({
      success: true,
      message: `Verificação concluída. ${closedProcesses} processo(s) encerrado(s) por prazo vencido.`,
      closedProcesses,
      timestamp: now.toISOString(),
    })
  } catch (error) {
    console.error("Error checking deadlines:", error)
    return NextResponse.json(
      { error: "Internal server error", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}
