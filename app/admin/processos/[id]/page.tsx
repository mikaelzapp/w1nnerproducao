"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { AdminRoute } from "@/components/admin-route"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { db, storage } from "@/lib/firebase/config"
import { doc, getDoc, updateDoc, arrayUnion, deleteDoc } from "firebase/firestore"
import { ref, deleteObject, listAll } from "firebase/storage"
import {
  FileText,
  Download,
  ArrowLeft,
  Loader2,
  Edit2,
  Trash2,
  CheckCircle,
  X,
  FileDown,
  AlertCircle,
  Plus,
  Check,
  Clock,
  ListTodo,
  XCircle,
} from "lucide-react"
import Link from "next/link"
import { logActivity } from "@/lib/firebase/activity-logger"
import { useAuth } from "@/lib/firebase/auth-context"
import { exportToPDF, formatDateForExport, formatStatusForExport } from "@/lib/export-utils"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface Requirement {
  id: string
  name: string
  description?: string
  status: "pendente" | "enviado" | "aprovado" | "rejeitado" | "nao_tenho"
  files: Array<{ id: string; name: string; url: string; type: string; size: number; uploadedAt: string }> // Added id to files
  adminComments?: string
  userNote?: string
  deadline?: string // ISO 8601 date string
  createdAt: string
  updatedAt: string
}

interface AdminTask {
  id: string
  title: string
  description?: string
  status: "pendente" | "em_andamento" | "concluido"
  files: Array<{ id: string; name: string; url: string; type: string; size: number; uploadedAt: string }> // Added id to files
  deadline?: string // ISO 8601 date string
  createdAt: string
  completedAt?: string
  createdBy: string
}

interface ProcessData {
  id: string
  title: string
  description: string
  userName: string
  userEmail: string
  userId: string
  status: string
  createdAt: string
  updatedAt: string
  timeline: Array<{ status: string; message: string; timestamp: string; actor?: string; actorName?: string }> // Added actor and actorName
  files: Array<{ id: string; name: string; url: string; type: string; size: number; uploadedAt: string }> // Added id to files
  notes?: string
  requirements?: Requirement[]
  adminTasks?: AdminTask[] // Added admin tasks field
}

export default function AdminProcessDetailPage() {
  return (
    <AdminRoute>
      <AdminProcessDetailContent />
    </AdminRoute>
  )
}

function AdminProcessDetailContent() {
  const params = useParams()
  const router = useRouter()
  const { user: adminUser } = useAuth()
  const [process, setProcess] = useState<ProcessData | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [editing, setEditing] = useState(false)
  const [newStatus, setNewStatus] = useState("")
  const [updateMessage, setUpdateMessage] = useState("")

  const [editForm, setEditForm] = useState({
    title: "",
    description: "",
    notes: "",
  })

  const [exporting, setExporting] = useState(false)

  const [requirementDialogOpen, setRequirementDialogOpen] = useState(false)
  const [selectedRequirement, setSelectedRequirement] = useState<Requirement | null>(null)
  const [requirementForm, setRequirementForm] = useState({
    status: "pendente",
    adminComments: "",
  })

  const [newRequirementDialogOpen, setNewRequirementDialogOpen] = useState(false)
  const [newRequirementForm, setNewRequirementForm] = useState({
    name: "",
    description: "",
    deadline: "",
  })

  const [rejectFileDialogOpen, setRejectFileDialogOpen] = useState(false)
  const [fileToReject, setFileToReject] = useState<{
    requirementId: string
    fileId: string
    fileName: string
  } | null>(null)
  const [rejectionReason, setRejectionReason] = useState("")

  const [taskDialogOpen, setTaskDialogOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<AdminTask | null>(null)
  const [taskForm, setTaskForm] = useState({
    title: "",
    description: "",
    status: "pendente" as "pendente" | "em_andamento" | "concluido",
    deadline: "",
  })

  useEffect(() => {
    const fetchProcess = async () => {
      if (!params.id) return

      try {
        const docRef = doc(db, "processes", params.id as string)
        const docSnap = await getDoc(docRef)

        if (docSnap.exists()) {
          const data = { id: docSnap.id, ...docSnap.data() } as ProcessData
          setProcess(data)
          setNewStatus(data.status)
          setEditForm({
            title: data.title,
            description: data.description || "",
            notes: data.notes || "",
          })
        }
      } catch (error) {
        console.error("Error fetching process:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchProcess()
  }, [params.id])

  const handleOpenRejectFileDialog = (requirementId: string, fileId: string, fileName: string) => {
    setFileToReject({ requirementId, fileId, fileName })
    setRejectionReason("")
    setRejectFileDialogOpen(true)
  }

  const handleRejectFile = async () => {
    if (!process || !fileToReject || !rejectionReason.trim()) {
      alert("Por favor, forneça um motivo para a rejeição.")
      return
    }

    setUpdating(true)
    try {
      const updatedRequirements = process.requirements?.map((req) => {
        if (req.id === fileToReject.requirementId) {
          const updatedFiles = req.files.filter((f) => f.id !== fileToReject.fileId)
          return {
            ...req,
            files: updatedFiles,
            status: "rejeitado" as const,
            adminComments: `Arquivo "${fileToReject.fileName}" rejeitado: ${rejectionReason}`,
            updatedAt: new Date().toISOString(),
          }
        }
        return req
      })

      const docRef = doc(db, "processes", process.id)
      await updateDoc(docRef, {
        requirements: updatedRequirements,
        updatedAt: new Date().toISOString(),
        timeline: arrayUnion({
          status: "rejeitado",
          message: `Documento "${fileToReject.fileName}" rejeitado: ${rejectionReason}`,
          timestamp: new Date().toISOString(),
          actor: "admin",
          actorName: adminUser?.email || "Administrador",
        }),
      })

      await logActivity(
        "document_rejected",
        `Documento rejeitado: ${fileToReject.fileName}`,
        adminUser?.uid || "admin",
        {
          processId: process.id,
          requirementId: fileToReject.requirementId,
          fileName: fileToReject.fileName,
          reason: rejectionReason,
        },
      )

      alert("Documento rejeitado com sucesso!")
      setRejectFileDialogOpen(false)
      setFileToReject(null)
      setRejectionReason("")
      window.location.reload()
    } catch (error) {
      console.error("Error rejecting file:", error)
      alert("Erro ao rejeitar documento.")
    } finally {
      setUpdating(false)
    }
  }

  const handleAddNewRequirement = async () => {
    if (!process || !newRequirementForm.name.trim()) {
      alert("Por favor, forneça um nome para o documento.")
      return
    }

    setUpdating(true)
    try {
      const newRequirement: Requirement = {
        id: Date.now().toString(),
        name: newRequirementForm.name,
        description: newRequirementForm.description,
        status: "pendente",
        files: [],
        deadline: newRequirementForm.deadline || undefined,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      const updatedRequirements = [...(process.requirements || []), newRequirement]

      const docRef = doc(db, "processes", process.id)
      await updateDoc(docRef, {
        requirements: updatedRequirements,
        updatedAt: new Date().toISOString(),
        timeline: arrayUnion({
          status: "em_andamento",
          message: `Novo documento solicitado: ${newRequirementForm.name}`,
          timestamp: new Date().toISOString(),
          actor: "admin",
          actorName: adminUser?.email || "Administrador",
        }),
      })

      await logActivity(
        "requirement_added",
        `Novo documento adicionado: ${newRequirementForm.name}`,
        adminUser?.uid || "admin",
        {
          processId: process.id,
          requirementName: newRequirementForm.name,
        },
      )

      alert("Documento adicionado com sucesso!")
      setNewRequirementDialogOpen(false)
      setNewRequirementForm({ name: "", description: "", deadline: "" })
      window.location.reload()
    } catch (error) {
      console.error("Error adding requirement:", error)
      alert("Erro ao adicionar documento.")
    } finally {
      setUpdating(false)
    }
  }

  const handleOpenTaskDialog = (task?: AdminTask) => {
    if (task) {
      setEditingTask(task)
      setTaskForm({
        title: task.title,
        description: task.description || "",
        status: task.status,
        deadline: task.deadline || "",
      })
    } else {
      setEditingTask(null)
      setTaskForm({
        title: "",
        description: "",
        status: "pendente",
        deadline: "",
      })
    }
    setTaskDialogOpen(true)
  }

  const handleSaveTask = async () => {
    if (!process || !taskForm.title.trim()) return

    setUpdating(true)
    try {
      let updatedTasks: AdminTask[]
      let timelineMessage = ""

      if (editingTask) {
        // Editing existing task
        updatedTasks =
          process.adminTasks?.map((task) =>
            task.id === editingTask.id
              ? {
                  ...task,
                  title: taskForm.title,
                  description: taskForm.description,
                  status: taskForm.status,
                  deadline: taskForm.deadline || undefined,
                  completedAt: taskForm.status === "concluido" ? new Date().toISOString() : task.completedAt,
                }
              : task,
          ) || []
        timelineMessage = `Tarefa atualizada: ${taskForm.title} - Status: ${taskForm.status === "concluido" ? "Concluída" : taskForm.status === "em_andamento" ? "Em Andamento" : "Pendente"}`
      } else {
        // Creating new task
        const newTask: AdminTask = {
          id: Date.now().toString(),
          title: taskForm.title,
          description: taskForm.description,
          status: taskForm.status,
          files: [],
          deadline: taskForm.deadline || undefined,
          createdAt: new Date().toISOString(),
          createdBy: adminUser?.uid || "admin",
        }
        updatedTasks = [...(process.adminTasks || []), newTask]
        timelineMessage = `Nova tarefa criada: ${taskForm.title}`
      }

      const docRef = doc(db, "processes", process.id)
      await updateDoc(docRef, {
        adminTasks: updatedTasks,
        updatedAt: new Date().toISOString(),
        timeline: arrayUnion({
          status: "em_andamento",
          message: timelineMessage,
          timestamp: new Date().toISOString(),
          actor: "admin",
          actorName: adminUser?.email || "Administrador",
        }),
      })

      await logActivity(
        editingTask ? "admin_task_updated" : "admin_task_created",
        `Tarefa administrativa ${editingTask ? "atualizada" : "criada"}: ${taskForm.title}`,
        adminUser?.uid || "admin",
        { processId: process.id, taskTitle: taskForm.title },
      )

      alert(`Tarefa ${editingTask ? "atualizada" : "criada"} com sucesso!`)
      setTaskDialogOpen(false)
      window.location.reload()
    } catch (error) {
      console.error("Error saving task:", error)
      alert("Erro ao salvar tarefa.")
    } finally {
      setUpdating(false)
    }
  }

  const handleDeleteTask = async (taskId: string) => {
    if (!process) return

    const confirmed = confirm("Tem certeza que deseja deletar esta tarefa?")
    if (!confirmed) return

    setUpdating(true)
    try {
      const taskToDelete = process.adminTasks?.find((task) => task.id === taskId)
      const updatedTasks = process.adminTasks?.filter((task) => task.id !== taskId) || []

      const docRef = doc(db, "processes", process.id)
      await updateDoc(docRef, {
        adminTasks: updatedTasks,
        updatedAt: new Date().toISOString(),
        timeline: arrayUnion({
          status: "em_andamento",
          message: `Tarefa deletada: ${taskToDelete?.title || "Tarefa"}`,
          timestamp: new Date().toISOString(),
          actor: "admin",
          actorName: adminUser?.email || "Administrador",
        }),
      })

      await logActivity("admin_task_deleted", "Tarefa administrativa deletada", adminUser?.uid || "admin", {
        processId: process.id,
        taskId,
      })

      alert("Tarefa deletada com sucesso!")
      window.location.reload()
    } catch (error) {
      console.error("Error deleting task:", error)
      alert("Erro ao deletar tarefa.")
    } finally {
      setUpdating(false)
    }
  }

  const handleToggleTaskStatus = async (task: AdminTask) => {
    if (!process) return

    const newStatus = task.status === "concluido" ? "pendente" : "concluido"

    setUpdating(true)
    try {
      const updatedTasks =
        process.adminTasks?.map((t) =>
          t.id === task.id
            ? {
                ...t,
                status: newStatus,
                completedAt: newStatus === "concluido" ? new Date().toISOString() : null,
              }
            : t,
        ) || []

      const docRef = doc(db, "processes", process.id)
      await updateDoc(docRef, {
        adminTasks: updatedTasks,
        updatedAt: new Date().toISOString(),
        timeline: arrayUnion({
          status: newStatus === "concluido" ? "concluido" : "em_andamento",
          message: `Tarefa "${task.title}" marcada como ${newStatus === "concluido" ? "concluída" : "pendente"}`,
          timestamp: new Date().toISOString(),
          actor: "admin",
          actorName: adminUser?.email || "Administrador",
        }),
      })

      await logActivity(
        "admin_task_status_changed",
        `Status da tarefa alterado para ${newStatus}`,
        adminUser?.uid || "admin",
        { processId: process.id, taskId: task.id, newStatus },
      )

      window.location.reload()
    } catch (error) {
      console.error("Error toggling task status:", error)
      alert("Erro ao atualizar status da tarefa.")
    } finally {
      setUpdating(false)
    }
  }

  const getTaskStats = () => {
    if (!process?.adminTasks) return null

    const stats = {
      total: process.adminTasks.length,
      concluido: 0,
      em_andamento: 0,
      pendente: 0,
    }

    process.adminTasks.forEach((task) => {
      stats[task.status]++
    })

    return stats
  }

  const taskStats = getTaskStats()

  const getDeadlineStatus = (deadline?: string) => {
    if (!deadline) return null

    const deadlineDate = new Date(deadline)
    const now = new Date()
    const daysUntilDeadline = Math.ceil((deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

    if (daysUntilDeadline < 0) {
      return { status: "expired", days: Math.abs(daysUntilDeadline), color: "text-red-600 bg-red-50 dark:bg-red-950" }
    } else if (daysUntilDeadline <= 3) {
      return { status: "urgent", days: daysUntilDeadline, color: "text-orange-600 bg-orange-50 dark:bg-orange-950" }
    } else if (daysUntilDeadline <= 7) {
      return {
        status: "approaching",
        days: daysUntilDeadline,
        color: "text-yellow-600 bg-yellow-50 dark:bg-yellow-950",
      }
    }

    return { status: "ok", days: daysUntilDeadline, color: "text-green-600 bg-green-50 dark:bg-green-950" }
  }

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!process || !updateMessage.trim()) return

    setUpdating(true)

    try {
      const docRef = doc(db, "processes", process.id)
      await updateDoc(docRef, {
        status: newStatus,
        updatedAt: new Date().toISOString(),
        timeline: arrayUnion({
          status: newStatus,
          message: updateMessage,
          timestamp: new Date().toISOString(),
          actor: "admin",
          actorName: adminUser?.email || "Administrador",
        }),
      })

      await logActivity(
        "process_updated",
        `Status do processo atualizado para ${newStatus}`,
        adminUser?.uid || "admin",
        { processId: process.id, newStatus },
      )

      router.refresh()
      setUpdateMessage("")
      alert("Status atualizado com sucesso!")
      window.location.reload()
    } catch (error) {
      console.error("Error updating process:", error)
      alert("Erro ao atualizar status.")
    } finally {
      setUpdating(false)
    }
  }

  const handleEditProcess = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!process) return

    setUpdating(true)

    try {
      const docRef = doc(db, "processes", process.id)
      await updateDoc(docRef, {
        title: editForm.title,
        description: editForm.description,
        notes: editForm.notes,
        updatedAt: new Date().toISOString(),
        timeline: arrayUnion({
          status: "em_andamento",
          message: `Informações do processo atualizadas`,
          timestamp: new Date().toISOString(),
          actor: "admin",
          actorName: adminUser?.email || "Administrador",
        }),
      })

      await logActivity("process_edited", `Processo editado: ${editForm.title}`, adminUser?.uid || "admin", {
        processId: process.id,
      })

      alert("Processo atualizado com sucesso!")
      setEditing(false)
      window.location.reload()
    } catch (error) {
      console.error("Error editing process:", error)
      alert("Erro ao editar processo.")
    } finally {
      setUpdating(false)
    }
  }

  const handleCloseProcess = async () => {
    if (!process) return

    const notes = prompt("Adicione observações finais (opcional):")
    if (notes === null) return

    setUpdating(true)

    try {
      const docRef = doc(db, "processes", process.id)
      await updateDoc(docRef, {
        status: "concluido",
        notes: notes || process.notes,
        updatedAt: new Date().toISOString(),
        closedAt: new Date().toISOString(),
        timeline: arrayUnion({
          status: "concluido",
          message: notes || "Processo encerrado pelo administrador",
          timestamp: new Date().toISOString(),
          actor: "admin",
          actorName: adminUser?.email || "Administrador",
        }),
      })

      await logActivity("process_closed", `Processo encerrado: ${process.title}`, adminUser?.uid || "admin", {
        processId: process.id,
      })

      alert("Processo encerrado com sucesso!")
      window.location.reload()
    } catch (error) {
      console.error("Error closing process:", error)
      alert("Erro ao encerrar processo.")
    } finally {
      setUpdating(false)
    }
  }

  const handleDeleteProcess = async () => {
    if (!process) return

    const confirmed = confirm(
      `Tem certeza que deseja deletar o processo "${process.title}"? Esta ação não pode ser desfeita e todos os arquivos serão removidos.`,
    )
    if (!confirmed) return

    setDeleting(true)

    try {
      const storageRef = ref(storage, `processes/${process.userId}/${process.id}`)
      try {
        const filesList = await listAll(storageRef)
        await Promise.all(filesList.items.map((item) => deleteObject(item)))
      } catch (storageError) {
        console.error("Error deleting storage files:", storageError)
      }

      await deleteDoc(doc(db, "processes", process.id))

      await logActivity("process_deleted", `Processo deletado: ${process.title}`, adminUser?.uid || "admin", {
        processId: process.id,
        userId: process.userId,
      })

      alert("Processo deletado com sucesso!")
      router.push("/admin/processos")
    } catch (error) {
      console.error("Error deleting process:", error)
      alert("Erro ao deletar processo.")
    } finally {
      setDeleting(false)
    }
  }

  const handleExportProcess = async () => {
    if (!process) return

    setExporting(true)
    try {
      const headers = ["Campo", "Valor"]
      const rows = [
        ["ID", process.id],
        ["Título", process.title],
        ["Cliente", process.userName],
        ["Email", process.userEmail],
        ["Status", formatStatusForExport(process.status)],
        ["Descrição", process.description || "N/A"],
        ["Observações", process.notes || "N/A"],
        ["Data de Criação", formatDateForExport(process.createdAt)],
        ["Última Atualização", formatDateForExport(process.updatedAt)],
        ["Total de Documentos", String(process.files?.length || 0)],
      ]

      if (process.timeline && process.timeline.length > 0) {
        rows.push(["", ""])
        rows.push(["HISTÓRICO DE ATUALIZAÇÕES", ""])
        process.timeline.forEach((item, index) => {
          rows.push([formatDateForExport(item.timestamp), `${formatStatusForExport(item.status)}: ${item.message}`])
        })
      }

      if (process.files && process.files.length > 0) {
        rows.push(["", ""])
        rows.push(["DOCUMENTOS ANEXADOS", ""])
        process.files.forEach((file) => {
          rows.push([file.name, `${(file.size / 1024).toFixed(0)} KB - ${formatDateForExport(file.uploadedAt)}`])
        })
      }

      const exportData = {
        headers,
        rows,
        filename: `processo_${process.id}_${new Date().toISOString().split("T")[0]}`,
        title: `Relatório do Processo: ${process.title}`,
      }

      exportToPDF(exportData)
    } catch (error) {
      console.error("Error exporting process:", error)
      alert("Erro ao exportar processo.")
    } finally {
      setExporting(false)
    }
  }

  const handleUpdateRequirement = async () => {
    if (!process || !selectedRequirement) return

    setUpdating(true)
    try {
      const updatedRequirements = process.requirements?.map((req) =>
        req.id === selectedRequirement.id
          ? {
              ...req,
              status: requirementForm.status as "pendente" | "enviado" | "aprovado" | "rejeitado" | "nao_tenho",
              adminComments: requirementForm.adminComments,
              updatedAt: new Date().toISOString(),
            }
          : req,
      )

      const docRef = doc(db, "processes", process.id)
      await updateDoc(docRef, {
        requirements: updatedRequirements,
        updatedAt: new Date().toISOString(),
        timeline: arrayUnion({
          status: requirementForm.status,
          message: `Documento "${selectedRequirement.name}" atualizado para: ${getRequirementStatusLabel(requirementForm.status)}`,
          timestamp: new Date().toISOString(),
          actor: "admin",
          actorName: adminUser?.email || "Administrador",
        }),
      })

      await logActivity("requirement_updated", {
        processId: process.id,
        requirementId: selectedRequirement.id,
        requirementName: selectedRequirement.name,
        newStatus: requirementForm.status,
      })

      alert("Tópico atualizado com sucesso!")
      setRequirementDialogOpen(false)
      window.location.reload()
    } catch (error) {
      console.error("Error updating requirement:", error)
      alert("Erro ao atualizar tópico.")
    } finally {
      setUpdating(false)
    }
  }

  const handleOpenRequirementDialog = (requirement: Requirement) => {
    setSelectedRequirement(requirement)
    setRequirementForm({
      status: requirement.status,
      adminComments: requirement.adminComments || "",
    })
    setRequirementDialogOpen(true)
  }

  const getRequirementStatusColor = (status: string) => {
    switch (status) {
      case "aprovado":
        return "text-green-600 bg-green-50 dark:bg-green-950"
      case "enviado":
        return "text-blue-600 bg-blue-50 dark:bg-blue-950"
      case "rejeitado":
        return "text-red-600 bg-red-50 dark:bg-red-950"
      case "nao_tenho":
        return "text-orange-600 bg-orange-50 dark:bg-orange-950"
      case "pendente":
        return "text-yellow-600 bg-yellow-50 dark:bg-yellow-950"
      default:
        return "text-gray-600 bg-gray-50 dark:bg-gray-950"
    }
  }

  const getRequirementStatusLabel = (status: string) => {
    switch (status) {
      case "aprovado":
        return "Aprovado"
      case "enviado":
        return "Enviado"
      case "rejeitado":
        return "Rejeitado"
      case "nao_tenho":
        return "Não Possui"
      case "pendente":
        return "Pendente"
      default:
        return status
    }
  }

  const getRequirementStats = () => {
    if (!process?.requirements) return null

    const stats = {
      total: process.requirements.length,
      aprovado: 0,
      enviado: 0,
      rejeitado: 0,
      nao_tenho: 0,
      pendente: 0,
    }

    process.requirements.forEach((req) => {
      stats[req.status]++
    })

    return stats
  }

  const requirementStats = getRequirementStats()

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navigation />
        <main className="flex-1 pt-20 flex items-center justify-center">
          <p className="text-muted-foreground">Carregando...</p>
        </main>
        <Footer />
      </div>
    )
  }

  if (!process) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navigation />
        <main className="flex-1 pt-20 flex items-center justify-center">
          <div className="text-center">
            <p className="text-muted-foreground mb-4">Processo não encontrado.</p>
            <Link href="/admin/processos">
              <Button variant="outline">Voltar aos Processos</Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />

      <main className="flex-1 pt-20">
        <div className="bg-primary text-primary-foreground py-8 md:py-12">
          <div className="container mx-auto px-4">
            <Link
              href="/admin/processos"
              className="inline-flex items-center text-primary-foreground/90 hover:text-primary-foreground mb-4 text-sm md:text-base"
            >
              <ArrowLeft className="mr-2" size={18} />
              Voltar aos Processos
            </Link>
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-serif font-bold">{process.title}</h1>
              <div className="flex flex-wrap gap-2">
                <Button
                  onClick={handleExportProcess}
                  variant="outline"
                  className="bg-primary-foreground text-primary text-sm"
                  disabled={exporting}
                  size="sm"
                >
                  {exporting ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <FileDown className="mr-2" size={16} />
                  )}
                  <span className="hidden sm:inline">Exportar PDF</span>
                  <span className="sm:hidden">PDF</span>
                </Button>
                <Button
                  onClick={() => setEditing(!editing)}
                  variant="outline"
                  className="bg-primary-foreground text-primary text-sm"
                  size="sm"
                >
                  {editing ? <X className="mr-2" size={16} /> : <Edit2 className="mr-2" size={16} />}
                  {editing ? "Cancelar" : "Editar"}
                </Button>
                {process.status !== "concluido" && (
                  <Button
                    onClick={handleCloseProcess}
                    variant="outline"
                    className="bg-green-600 text-white hover:bg-green-700 text-sm"
                    disabled={updating}
                    size="sm"
                  >
                    <CheckCircle className="mr-2" size={16} />
                    <span className="hidden sm:inline">Encerrar</span>
                    <span className="sm:hidden">✓</span>
                  </Button>
                )}
                <Button
                  onClick={handleDeleteProcess}
                  variant="outline"
                  className="bg-red-600 text-white hover:bg-red-700 text-sm"
                  disabled={deleting}
                  size="sm"
                >
                  {deleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2" size={16} />}
                  <span className="hidden sm:inline">Deletar</span>
                  <span className="sm:hidden">🗑</span>
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8 md:py-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              {editing ? (
                <Card>
                  <CardHeader>
                    <CardTitle className="font-serif text-lg md:text-xl">Editar Processo</CardTitle>
                    <CardDescription className="text-sm">Atualize as informações do processo</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleEditProcess} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="title" className="text-sm">
                          Título *
                        </Label>
                        <Input
                          id="title"
                          value={editForm.title}
                          onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                          required
                          className="text-sm md:text-base"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="description" className="text-sm">
                          Descrição
                        </Label>
                        <Textarea
                          id="description"
                          value={editForm.description}
                          onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                          rows={5}
                          className="text-sm md:text-base"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="notes" className="text-sm">
                          Observações
                        </Label>
                        <Textarea
                          id="notes"
                          value={editForm.notes}
                          onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                          rows={3}
                          className="text-sm md:text-base"
                        />
                      </div>

                      <Button type="submit" className="w-full bg-primary text-primary-foreground" disabled={updating}>
                        {updating ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Salvando...
                          </>
                        ) : (
                          "Salvar Alterações"
                        )}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              ) : (
                <>
                  <Card>
                    <CardHeader>
                      <CardTitle className="font-serif text-lg md:text-xl">Informações do Cliente</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div>
                        <p className="text-sm text-muted-foreground">Nome</p>
                        <p className="font-medium">{process.userName}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Email</p>
                        <p className="font-medium">{process.userEmail}</p>
                      </div>
                    </CardContent>
                  </Card>

                  {process.description && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="font-serif text-lg md:text-xl">Descrição</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-muted-foreground leading-relaxed text-sm md:text-base">
                          {process.description}
                        </p>
                      </CardContent>
                    </Card>
                  )}

                  {process.notes && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="font-serif text-lg md:text-xl">Observações</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-muted-foreground leading-relaxed text-sm md:text-base">{process.notes}</p>
                      </CardContent>
                    </Card>
                  )}

                  <Card>
                    <CardHeader>
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div>
                          <CardTitle className="font-serif flex items-center gap-2 text-lg md:text-xl">
                            <ListTodo className="text-primary" size={20} />
                            Checklist Administrativo
                          </CardTitle>
                          <CardDescription className="text-sm">
                            Tarefas internas para gerenciar este processo
                          </CardDescription>
                        </div>
                        <Button
                          onClick={() => handleOpenTaskDialog()}
                          size="sm"
                          className="bg-primary w-full sm:w-auto"
                        >
                          <Plus size={16} className="mr-1" />
                          Nova Tarefa
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {taskStats && taskStats.total > 0 && (
                        <div className="mb-4 p-4 bg-secondary/30 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-sm font-semibold">Progresso</p>
                            <p className="text-sm text-muted-foreground">
                              {taskStats.concluido} de {taskStats.total} concluídas
                            </p>
                          </div>
                          <div className="w-full bg-secondary rounded-full h-2">
                            <div
                              className="bg-green-600 h-2 rounded-full transition-all"
                              style={{ width: `${(taskStats.concluido / taskStats.total) * 100}%` }}
                            />
                          </div>
                        </div>
                      )}

                      {process.adminTasks && process.adminTasks.length > 0 ? (
                        <div className="space-y-3">
                          {process.adminTasks.map((task) => (
                            <div
                              key={task.id}
                              className={`p-3 md:p-4 rounded-lg border-2 transition-all ${
                                task.status === "concluido"
                                  ? "border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-950/30"
                                  : "border-border hover:border-primary/50 bg-card"
                              }`}
                            >
                              <div className="flex items-start gap-3">
                                <button
                                  onClick={() => handleToggleTaskStatus(task)}
                                  className={`mt-1 flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                                    task.status === "concluido"
                                      ? "bg-green-600 border-green-600"
                                      : "border-gray-300 hover:border-primary"
                                  }`}
                                  disabled={updating}
                                >
                                  {task.status === "concluido" && <Check size={14} className="text-white" />}
                                </button>

                                <div className="flex-1 min-w-0">
                                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                                    <div className="flex-1 min-w-0">
                                      <h4
                                        className={`font-semibold text-sm md:text-base ${task.status === "concluido" ? "line-through text-muted-foreground" : ""}`}
                                      >
                                        {task.title}
                                      </h4>
                                      {task.description && (
                                        <p className="text-xs md:text-sm text-muted-foreground mt-1">
                                          {task.description}
                                        </p>
                                      )}

                                      {task.deadline && (
                                        <div className="mt-2">
                                          {(() => {
                                            const deadlineStatus = getDeadlineStatus(task.deadline)
                                            if (!deadlineStatus) return null

                                            return (
                                              <div
                                                className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${deadlineStatus.color}`}
                                              >
                                                <Clock size={12} />
                                                {deadlineStatus.status === "expired" ? (
                                                  <span>Vencido há {deadlineStatus.days} dia(s)</span>
                                                ) : (
                                                  <span>
                                                    Prazo: {deadlineStatus.days} dia(s) -{" "}
                                                    {new Date(task.deadline).toLocaleDateString("pt-BR")}
                                                  </span>
                                                )}
                                              </div>
                                            )
                                          })()}
                                        </div>
                                      )}

                                      {task.files && task.files.length > 0 && (
                                        <div className="mt-3 space-y-2">
                                          <p className="text-xs font-semibold text-primary flex items-center gap-1">
                                            <FileText size={14} />
                                            Documentos enviados pelo cliente ({task.files.length})
                                          </p>
                                          <div className="space-y-1">
                                            {task.files.map((file) => (
                                              <div
                                                key={file.id}
                                                className="flex items-center justify-between p-2 bg-secondary/50 rounded text-xs"
                                              >
                                                <div className="flex items-center gap-2 flex-1 min-w-0">
                                                  <FileText className="text-primary flex-shrink-0" size={14} />
                                                  <div className="flex-1 min-w-0">
                                                    <p className="font-medium truncate">{file.name}</p>
                                                    <p className="text-muted-foreground">
                                                      {(file.size / 1024).toFixed(0)} KB •{" "}
                                                      {new Date(file.uploadedAt).toLocaleDateString("pt-BR")}
                                                    </p>
                                                  </div>
                                                </div>
                                                <a href={file.url} download target="_blank" rel="noopener noreferrer">
                                                  <Button size="sm" variant="ghost" className="h-7 w-7 p-0">
                                                    <Download size={14} />
                                                  </Button>
                                                </a>
                                              </div>
                                            ))}
                                          </div>
                                        </div>
                                      )}

                                      <div className="flex flex-wrap items-center gap-2 md:gap-3 mt-2 text-xs text-muted-foreground">
                                        <span className="flex items-center gap-1">
                                          <Clock size={12} />
                                          {new Date(task.createdAt).toLocaleDateString("pt-BR")}
                                        </span>
                                        {task.completedAt && (
                                          <span className="text-green-600 dark:text-green-400">
                                            Concluída em {new Date(task.completedAt).toLocaleDateString("pt-BR")}
                                          </span>
                                        )}
                                      </div>
                                    </div>

                                    <div className="flex gap-1 flex-shrink-0">
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => handleOpenTaskDialog(task)}
                                        disabled={updating}
                                        className="h-8 w-8 p-0"
                                      >
                                        <Edit2 size={14} />
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => handleDeleteTask(task.id)}
                                        disabled={updating}
                                        className="text-red-600 hover:text-red-700 h-8 w-8 p-0"
                                      >
                                        <Trash2 size={14} />
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-muted-foreground">
                          <ListTodo size={48} className="mx-auto mb-3 opacity-30" />
                          <p>Nenhuma tarefa criada ainda</p>
                          <p className="text-sm mt-1">Clique em "Nova Tarefa" para começar</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {process.requirements && process.requirements.length > 0 && (
                    <Card>
                      <CardHeader>
                        <div className="flex flex-col gap-3">
                          <div>
                            <CardTitle className="font-serif text-lg md:text-xl">
                              Documentos Solicitados por Tópico
                            </CardTitle>
                            <CardDescription className="text-sm">
                              Visualização organizada dos documentos necessários
                            </CardDescription>
                          </div>
                          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                            <Button
                              onClick={() => setNewRequirementDialogOpen(true)}
                              size="sm"
                              className="bg-primary w-full sm:w-auto"
                            >
                              <Plus size={16} className="mr-1" />
                              Adicionar Documento
                            </Button>
                            {requirementStats && (
                              <div className="flex flex-wrap gap-2 text-xs">
                                <span className="px-2 py-1 rounded bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300">
                                  ✓ {requirementStats.aprovado}
                                </span>
                                <span className="px-2 py-1 rounded bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300">
                                  ↑ {requirementStats.enviado}
                                </span>
                                <span className="px-2 py-1 rounded bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300">
                                  ⏳ {requirementStats.pendente}
                                </span>
                                <span className="px-2 py-1 rounded bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300">
                                  ✗ {requirementStats.rejeitado}
                                </span>
                                <span className="px-2 py-1 rounded bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300">
                                  ∅ {requirementStats.nao_tenho}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {process.requirements.map((requirement) => (
                            <div
                              key={requirement.id}
                              className="p-4 md:p-5 rounded-lg border-2 border-border hover:border-primary/50 transition-all bg-card"
                            >
                              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
                                <div className="flex-1 min-w-0">
                                  <div className="flex flex-wrap items-center gap-2 md:gap-3 mb-2">
                                    <h4 className="font-bold text-base md:text-lg">{requirement.name}</h4>
                                    <span
                                      className={`px-2 md:px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${getRequirementStatusColor(requirement.status)}`}
                                    >
                                      {getRequirementStatusLabel(requirement.status)}
                                    </span>
                                  </div>
                                  {requirement.description && (
                                    <p className="text-xs md:text-sm text-muted-foreground mb-2">
                                      {requirement.description}
                                    </p>
                                  )}
                                  <p className="text-xs text-muted-foreground">
                                    Atualizado em: {new Date(requirement.updatedAt).toLocaleString("pt-BR")}
                                  </p>
                                </div>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleOpenRequirementDialog(requirement)}
                                  className="w-full sm:w-auto"
                                >
                                  <Edit2 size={14} className="mr-1" />
                                  Gerenciar
                                </Button>
                              </div>

                              {requirement.deadline && (
                                <div className="mb-3">
                                  {(() => {
                                    const deadlineStatus = getDeadlineStatus(requirement.deadline)
                                    if (!deadlineStatus) return null

                                    return (
                                      <div
                                        className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg font-medium text-sm ${deadlineStatus.color}`}
                                      >
                                        <Clock size={16} />
                                        {deadlineStatus.status === "expired" ? (
                                          <span>⚠️ Prazo vencido há {deadlineStatus.days} dia(s)</span>
                                        ) : deadlineStatus.status === "urgent" ? (
                                          <span>
                                            🔥 Urgente: {deadlineStatus.days} dia(s) restante(s) -{" "}
                                            {new Date(requirement.deadline).toLocaleDateString("pt-BR")}
                                          </span>
                                        ) : (
                                          <span>
                                            📅 Prazo: {new Date(requirement.deadline).toLocaleDateString("pt-BR")} (
                                            {deadlineStatus.days} dias)
                                          </span>
                                        )}
                                      </div>
                                    )
                                  })()}
                                </div>
                              )}

                              {requirement.files && requirement.files.length > 0 ? (
                                <div className="mb-4">
                                  <p className="text-xs md:text-sm font-semibold mb-3 flex items-center gap-2">
                                    <FileText size={16} className="text-primary" />
                                    Arquivos Enviados ({requirement.files.length})
                                  </p>
                                  <div className="grid grid-cols-1 gap-3">
                                    {requirement.files.map((file, fileIndex) => (
                                      <div
                                        key={fileIndex}
                                        className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg border border-border hover:bg-secondary transition-colors"
                                      >
                                        <div className="flex items-center gap-3 flex-1 min-w-0">
                                          <FileText className="text-primary flex-shrink-0" size={20} />
                                          <div className="min-w-0 flex-1">
                                            <p className="text-xs md:text-sm font-medium truncate">{file.name}</p>
                                            <p className="text-xs text-muted-foreground">
                                              {(file.size / 1024).toFixed(0)} KB •{" "}
                                              {new Date(file.uploadedAt).toLocaleDateString("pt-BR")}
                                            </p>
                                          </div>
                                        </div>
                                        <div className="flex items-center gap-1 flex-shrink-0">
                                          <a href={file.url} download target="_blank" rel="noopener noreferrer">
                                            <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                                              <Download size={16} />
                                            </Button>
                                          </a>
                                          {requirement.status !== "aprovado" && (
                                            <Button
                                              size="sm"
                                              variant="ghost"
                                              onClick={() =>
                                                handleOpenRejectFileDialog(requirement.id, file.id, file.name)
                                              }
                                              className="text-red-600 hover:text-red-700 hover:bg-red-50 h-8 w-8 p-0"
                                              title="Rejeitar documento"
                                            >
                                              <XCircle size={16} />
                                            </Button>
                                          )}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              ) : (
                                <div className="mb-4 p-4 bg-secondary/30 rounded-lg border border-dashed border-border">
                                  <p className="text-sm text-muted-foreground text-center flex items-center justify-center gap-2">
                                    <AlertCircle size={16} />
                                    Nenhum arquivo enviado ainda
                                  </p>
                                </div>
                              )}

                              {requirement.status === "nao_tenho" && requirement.userNote && (
                                <div className="mb-3 p-4 bg-orange-50 dark:bg-orange-950/50 rounded-lg border-2 border-orange-200 dark:border-orange-800">
                                  <p className="text-sm font-semibold text-orange-900 dark:text-orange-100 mb-2 flex items-center gap-2">
                                    <AlertCircle size={16} />
                                    Cliente não possui este documento
                                  </p>
                                  <p className="text-sm text-orange-800 dark:text-orange-200 italic">
                                    "{requirement.userNote}"
                                  </p>
                                </div>
                              )}

                              {requirement.adminComments && (
                                <div className="p-4 bg-blue-50 dark:bg-blue-950/50 rounded-lg border border-blue-200 dark:border-blue-800">
                                  <p className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-2">
                                    Comentários do Administrador:
                                  </p>
                                  <p className="text-sm text-blue-800 dark:text-blue-200">
                                    {requirement.adminComments}
                                  </p>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {process.files && process.files.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="font-serif text-lg md:text-xl">Documentos Gerais</CardTitle>
                        <CardDescription className="text-sm">
                          Arquivos não vinculados a tópicos específicos
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {process.files.map((file, index) => (
                            <div
                              key={index}
                              className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-secondary/50 transition-colors"
                            >
                              <div className="flex items-center gap-3">
                                <FileText className="text-primary" size={24} />
                                <div>
                                  <p className="font-medium text-sm md:text-base">{file.name}</p>
                                  <p className="text-sm text-muted-foreground">
                                    {(file.size / 1024).toFixed(0)} KB •{" "}
                                    {new Date(file.uploadedAt).toLocaleDateString("pt-BR")}
                                  </p>
                                </div>
                              </div>
                              <a href={file.url} download target="_blank" rel="noopener noreferrer">
                                <Button size="sm" variant="outline" className="bg-transparent">
                                  <Download size={16} />
                                </Button>
                              </a>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </>
              )}
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="font-serif text-lg md:text-xl">Atualizar Status</CardTitle>
                  <CardDescription className="text-sm">Atualize o status e adicione uma mensagem</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleUpdateStatus} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="status" className="text-sm">
                        Novo Status
                      </Label>
                      <Select value={newStatus} onValueChange={setNewStatus}>
                        <SelectTrigger id="status" className="text-sm md:text-base">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pendente">Pendente</SelectItem>
                          <SelectItem value="em_andamento">Em Andamento</SelectItem>
                          <SelectItem value="concluido">Concluído</SelectItem>
                          <SelectItem value="nao_tenho">Não Possui</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="message" className="text-sm">
                        Mensagem de Atualização
                      </Label>
                      <Textarea
                        id="message"
                        placeholder="Descreva a atualização..."
                        value={updateMessage}
                        onChange={(e) => setUpdateMessage(e.target.value)}
                        required
                        rows={4}
                        className="text-sm md:text-base"
                      />
                    </div>

                    <Button type="submit" className="w-full bg-primary text-primary-foreground" disabled={updating}>
                      {updating ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Atualizando...
                        </>
                      ) : (
                        "Atualizar Status"
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {process.requirements && process.requirements.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="font-serif text-lg md:text-xl">Resumo Rápido</CardTitle>
                    <CardDescription className="text-sm">Status dos tópicos solicitados</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {process.requirements.map((requirement) => (
                        <div
                          key={requirement.id}
                          className="flex items-center justify-between p-3 rounded-lg bg-secondary/30"
                        >
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <div
                              className={`w-2 h-2 rounded-full flex-shrink-0 ${
                                requirement.status === "aprovado"
                                  ? "bg-green-500"
                                  : requirement.status === "enviado"
                                    ? "bg-blue-500"
                                    : requirement.status === "rejeitado"
                                      ? "bg-red-500"
                                      : requirement.status === "nao_tenho"
                                        ? "bg-orange-500"
                                        : "bg-yellow-500"
                              }`}
                            />
                            <div className="min-w-0 flex-1">
                              <p className="font-medium text-sm truncate">{requirement.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {requirement.files?.length || 0} arquivo(s)
                              </p>
                            </div>
                          </div>
                          <span
                            className={`text-xs font-medium px-2 py-1 rounded ${getRequirementStatusColor(requirement.status)}`}
                          >
                            {getRequirementStatusLabel(requirement.status)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              <Card>
                <CardHeader>
                  <CardTitle className="font-serif text-lg md:text-xl">Linha do Tempo</CardTitle>
                  <CardDescription className="text-sm">
                    Histórico completo de todas as atividades do processo
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {process.timeline && process.timeline.length > 0 ? (
                    <div className="space-y-4">
                      {process.timeline
                        .slice()
                        .reverse()
                        .map((item, index) => (
                          <div key={index} className="flex gap-3 md:gap-4">
                            <div className="flex flex-col items-center">
                              <div
                                className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                                  item.status === "concluido"
                                    ? "bg-green-100 dark:bg-green-900"
                                    : item.status === "rejeitado"
                                      ? "bg-red-100 dark:bg-red-900"
                                      : item.status === "aprovado"
                                        ? "bg-green-100 dark:bg-green-900"
                                        : item.status === "em_andamento"
                                          ? "bg-blue-100 dark:bg-blue-900"
                                          : "bg-yellow-100 dark:bg-yellow-900"
                                }`}
                              >
                                {item.status === "concluido" ? (
                                  <CheckCircle className="text-green-600 dark:text-green-400" size={18} />
                                ) : item.status === "rejeitado" ? (
                                  <XCircle className="text-red-600 dark:text-red-400" size={18} />
                                ) : item.status === "aprovado" ? (
                                  <Check className="text-green-600 dark:text-green-400" size={18} />
                                ) : item.status === "em_andamento" ? (
                                  <Clock className="text-blue-600 dark:text-blue-400" size={18} />
                                ) : (
                                  <AlertCircle className="text-yellow-600 dark:text-yellow-400" size={18} />
                                )}
                              </div>
                              {index < process.timeline.length - 1 && (
                                <div className="w-0.5 flex-1 bg-border mt-2 min-h-[40px]" />
                              )}
                            </div>
                            <div className="flex-1 pb-4 min-w-0">
                              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-1">
                                <p className="font-medium leading-relaxed text-sm md:text-base">{item.message}</p>
                                <span
                                  className={`px-2 py-1 rounded text-xs font-medium whitespace-nowrap flex-shrink-0 self-start ${
                                    item.status === "concluido"
                                      ? "bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300"
                                      : item.status === "rejeitado"
                                        ? "bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300"
                                        : item.status === "aprovado"
                                          ? "bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300"
                                          : item.status === "em_andamento"
                                            ? "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300"
                                            : "bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300"
                                  }`}
                                >
                                  {item.status === "concluido"
                                    ? "Concluído"
                                    : item.status === "rejeitado"
                                      ? "Rejeitado"
                                      : item.status === "aprovado"
                                        ? "Aprovado"
                                        : item.status === "em_andamento"
                                          ? "Em Andamento"
                                          : "Pendente"}
                                </span>
                              </div>
                              <div className="flex flex-wrap items-center gap-2 text-xs md:text-sm text-muted-foreground">
                                <Clock size={14} />
                                <span>{new Date(item.timestamp).toLocaleString("pt-BR")}</span>
                                {item.actorName && (
                                  <>
                                    <span>•</span>
                                    <span className="text-primary font-medium">
                                      {item.actor === "admin" ? "👤 Admin" : "👤 Cliente"}: {item.actorName}
                                    </span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Clock size={48} className="mx-auto mb-3 opacity-30" />
                      <p>Nenhuma atividade registrada ainda</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <Dialog open={taskDialogOpen} onOpenChange={setTaskDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingTask ? "Editar Tarefa" : "Nova Tarefa"}</DialogTitle>
            <DialogDescription>
              {editingTask ? "Atualize as informações da tarefa" : "Adicione uma nova tarefa ao checklist"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="task-title">Título *</Label>
              <Input
                id="task-title"
                value={taskForm.title}
                onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                placeholder="Ex: Analisar documentos, Entrar em contato com cliente..."
              />
            </div>
            <div>
              <Label htmlFor="task-description">Descrição</Label>
              <Textarea
                id="task-description"
                value={taskForm.description}
                onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                placeholder="Detalhes adicionais sobre a tarefa..."
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="task-deadline">Prazo de Entrega</Label>
              <Input
                id="task-deadline"
                type="date"
                value={taskForm.deadline}
                onChange={(e) => setTaskForm({ ...taskForm, deadline: e.target.value })}
                min={new Date().toISOString().split("T")[0]}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Se o prazo não for cumprido, o processo será encerrado automaticamente
              </p>
            </div>
            <div>
              <Label htmlFor="task-status">Status</Label>
              <Select
                value={taskForm.status}
                onValueChange={(value) =>
                  setTaskForm({ ...taskForm, status: value as "pendente" | "em_andamento" | "concluido" })
                }
              >
                <SelectTrigger id="task-status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pendente">Pendente</SelectItem>
                  <SelectItem value="em_andamento">Em Andamento</SelectItem>
                  <SelectItem value="concluido">Concluído</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTaskDialogOpen(false)} disabled={updating}>
              Cancelar
            </Button>
            <Button onClick={handleSaveTask} disabled={updating || !taskForm.title.trim()}>
              {updating ? "Salvando..." : editingTask ? "Salvar" : "Criar Tarefa"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={requirementDialogOpen} onOpenChange={setRequirementDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Atualizar Tópico</DialogTitle>
            <DialogDescription>{selectedRequirement?.name}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="req-status">Status</Label>
              <Select
                value={requirementForm.status}
                onValueChange={(value) => setRequirementForm({ ...requirementForm, status: value })}
              >
                <SelectTrigger id="req-status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pendente">Pendente</SelectItem>
                  <SelectItem value="enviado">Enviado</SelectItem>
                  <SelectItem value="aprovado">Aprovado</SelectItem>
                  <SelectItem value="rejeitado">Rejeitado</SelectItem>
                  <SelectItem value="nao_tenho">Não Possui</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="req-comments">Comentários do Admin</Label>
              <Textarea
                id="req-comments"
                value={requirementForm.adminComments}
                onChange={(e) => setRequirementForm({ ...requirementForm, adminComments: e.target.value })}
                placeholder="Adicione comentários ou instruções para o cliente..."
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRequirementDialogOpen(false)} disabled={updating}>
              Cancelar
            </Button>
            <Button onClick={handleUpdateRequirement} disabled={updating}>
              {updating ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={newRequirementDialogOpen} onOpenChange={setNewRequirementDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar Novo Documento</DialogTitle>
            <DialogDescription>Solicite um novo documento ao cliente</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="new-req-name">Nome do Documento *</Label>
              <Input
                id="new-req-name"
                value={newRequirementForm.name}
                onChange={(e) => setNewRequirementForm({ ...newRequirementForm, name: e.target.value })}
                placeholder="Ex: Certidão de Matrícula do Imóvel"
              />
            </div>
            <div>
              <Label htmlFor="new-req-description">Descrição (opcional)</Label>
              <Textarea
                id="new-req-description"
                value={newRequirementForm.description}
                onChange={(e) => setNewRequirementForm({ ...newRequirementForm, description: e.target.value })}
                placeholder="Adicione detalhes sobre o documento necessário..."
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="new-req-deadline">Prazo de Entrega</Label>
              <Input
                id="new-req-deadline"
                type="date"
                value={newRequirementForm.deadline}
                onChange={(e) => setNewRequirementForm({ ...newRequirementForm, deadline: e.target.value })}
                min={new Date().toISOString().split("T")[0]}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Se o prazo não for cumprido, o processo será encerrado automaticamente
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setNewRequirementDialogOpen(false)} disabled={updating}>
              Cancelar
            </Button>
            <Button onClick={handleAddNewRequirement} disabled={updating || !newRequirementForm.name.trim()}>
              {updating ? "Adicionando..." : "Adicionar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={rejectFileDialogOpen} onOpenChange={setRejectFileDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rejeitar Documento</DialogTitle>
            <DialogDescription>{fileToReject?.fileName}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="p-3 bg-red-50 dark:bg-red-950 rounded-lg border border-red-200 dark:border-red-800">
              <p className="text-sm text-red-800 dark:text-red-200">
                O arquivo será removido e o cliente será notificado sobre a rejeição.
              </p>
            </div>
            <div>
              <Label htmlFor="rejection-reason">Motivo da Rejeição *</Label>
              <Textarea
                id="rejection-reason"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Ex: Documento ilegível, formato incorreto, informações incompletas..."
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectFileDialogOpen(false)} disabled={updating}>
              Cancelar
            </Button>
            <Button
              onClick={handleRejectFile}
              disabled={updating || !rejectionReason.trim()}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {updating ? "Rejeitando..." : "Rejeitar Documento"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  )
}
