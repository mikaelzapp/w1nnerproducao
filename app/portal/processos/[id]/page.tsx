"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { ProtectedRoute } from "@/components/protected-route"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/lib/firebase/auth-context"
import { db, storage } from "@/lib/firebase/config"
import { doc, getDoc, updateDoc, arrayUnion } from "firebase/firestore"
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage"
import {
  FileText,
  Download,
  ArrowLeft,
  Clock,
  CheckCircle,
  AlertCircle,
  Upload,
  Loader2,
  XCircle,
  Check,
  Trash2,
  FileX,
} from "lucide-react"
import Link from "next/link"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface FileItem {
  id: string
  name: string
  url: string
  type: string
  size: number
  uploadedAt: string
}

interface Requirement {
  id: string
  name: string
  description?: string
  status: "pendente" | "enviado" | "aprovado" | "rejeitado" | "nao_tenho"
  files: FileItem[]
  adminComments?: string
  userNote?: string
  createdAt: string
  updatedAt: string
  deadline?: string // Added requirement-level deadline
}

interface AdminTask {
  id: string
  title: string
  description?: string
  status: "pendente" | "em_andamento" | "concluido"
  files: FileItem[]
  createdAt: string
  completedAt?: string
  createdBy: string
  deadline?: string // Added task-level deadline
}

interface TimelineItem {
  status: string
  message: string
  timestamp: string
  actor: string
  actorName: string
}

interface ProcessData {
  id: string
  title: string
  description: string
  status: string
  createdAt: string
  updatedAt: string
  deadline?: string // Added process-level deadline
  timeline: TimelineItem[]
  files: FileItem[]
  requirements?: Requirement[]
  adminTasks?: AdminTask[]
}

export default function ProcessDetailPage() {
  return (
    <ProtectedRoute>
      <ProcessDetailContent />
    </ProtectedRoute>
  )
}

function ProcessDetailContent() {
  const params = useParams()
  const { user } = useAuth()
  const [process, setProcess] = useState<ProcessData | null>(null)
  const [loading, setLoading] = useState(true)
  const [uploadingRequirementId, setUploadingRequirementId] = useState<string | null>(null)
  const [deletingFileId, setDeletingFileId] = useState<string | null>(null)
  const [noDocDialogOpen, setNoDocDialogOpen] = useState(false)
  const [selectedRequirement, setSelectedRequirement] = useState<Requirement | null>(null)
  const [userNote, setUserNote] = useState("")
  const [submittingNoDoc, setSubmittingNoDoc] = useState(false)
  const [uploadingTaskId, setUploadingTaskId] = useState<string | null>(null)
  const [deletingTaskFileId, setDeletingTaskFileId] = useState<string | null>(null)

  useEffect(() => {
    const fetchProcess = async () => {
      if (!user || !params.id) return

      try {
        const docRef = doc(db, "processes", params.id as string)
        const docSnap = await getDoc(docRef)

        if (docSnap.exists()) {
          const data = docSnap.data()
          if (data.userId === user.uid) {
            console.log("[v0] Process data:", data)
            console.log("[v0] Requirements:", data.requirements)
            console.log("[v0] Requirements length:", data.requirements?.length || 0)
            setProcess({ id: docSnap.id, ...data } as ProcessData)
          }
        }
      } catch (error) {
        console.error("Error fetching process:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchProcess()
  }, [user, params.id])

  const handleRequirementFileUpload = async (requirementId: string, event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || !event.target.files[0] || !process || !user) return

    const file = event.target.files[0]
    const maxSize = 10 * 1024 * 1024 // 10MB
    const allowedTypes = ["application/pdf", "image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"]

    if (!allowedTypes.includes(file.type)) {
      alert("Por favor, envie apenas arquivos PDF ou imagens (JPG, PNG, GIF, WEBP).")
      return
    }

    if (file.size > maxSize) {
      alert("O arquivo deve ter no máximo 10MB.")
      return
    }

    setUploadingRequirementId(requirementId)

    try {
      const fileId = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      const storageRef = ref(
        storage,
        `processes/${user.uid}/${process.id}/requirements/${requirementId}/${fileId}_${file.name}`,
      )
      await uploadBytes(storageRef, file)
      const downloadURL = await getDownloadURL(storageRef)

      const newFile: FileItem = {
        id: fileId,
        name: file.name,
        url: downloadURL,
        type: file.type,
        size: file.size,
        uploadedAt: new Date().toISOString(),
      }

      const requirement = process.requirements?.find((req) => req.id === requirementId)

      const updatedRequirements = (process.requirements || []).map((req) =>
        req.id === requirementId
          ? {
              ...req,
              files: [...(req.files || []), newFile],
              status: "enviado" as const,
              updatedAt: new Date().toISOString(),
            }
          : req,
      )

      const docRef = doc(db, "processes", process.id)
      await updateDoc(docRef, {
        requirements: updatedRequirements,
        updatedAt: new Date().toISOString(),
        timeline: arrayUnion({
          status: "enviado",
          message: `Documento enviado para "${requirement?.name}": ${file.name}`,
          timestamp: new Date().toISOString(),
          actor: "user",
          actorName: user.email || "Cliente",
        }),
      })

      alert("Arquivo enviado com sucesso!")
      window.location.reload()
    } catch (error) {
      console.error("Error uploading file:", error)
      alert("Erro ao enviar arquivo. Por favor, tente novamente.")
    } finally {
      setUploadingRequirementId(null)
    }
  }

  const handleDeleteFile = async (requirementId: string, fileId: string, fileUrl: string) => {
    if (!process || !user) return

    const confirmed = confirm("Tem certeza que deseja excluir este arquivo?")
    if (!confirmed) return

    setDeletingFileId(fileId)

    try {
      const fileRef = ref(storage, fileUrl)
      await deleteObject(fileRef)

      const requirement = process.requirements?.find((req) => req.id === requirementId)
      const fileToDelete = requirement?.files.find((f) => f.id === fileId)

      const updatedRequirements = (process.requirements || []).map((req) => {
        if (req.id === requirementId) {
          const updatedFiles = req.files.filter((f) => f.id !== fileId)
          return {
            ...req,
            files: updatedFiles,
            status: updatedFiles.length === 0 ? ("pendente" as const) : req.status,
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
          status: "em_andamento",
          message: `Documento removido de "${requirement?.name}": ${fileToDelete?.name}`,
          timestamp: new Date().toISOString(),
          actor: "user",
          actorName: user.email || "Cliente",
        }),
      })

      alert("Arquivo excluído com sucesso!")
      window.location.reload()
    } catch (error) {
      console.error("Error deleting file:", error)
      alert("Erro ao excluir arquivo. Por favor, tente novamente.")
    } finally {
      setDeletingFileId(null)
    }
  }

  const handleNoDocument = (requirement: Requirement) => {
    setSelectedRequirement(requirement)
    setUserNote(requirement.userNote || "")
    setNoDocDialogOpen(true)
  }

  const handleSubmitNoDocument = async () => {
    if (!process || !selectedRequirement || !userNote.trim()) {
      alert("Por favor, explique por que você não possui este documento.")
      return
    }

    setSubmittingNoDoc(true)

    try {
      const updatedRequirements = (process.requirements || []).map((req) =>
        req.id === selectedRequirement.id
          ? {
              ...req,
              status: "nao_tenho" as const,
              userNote: userNote,
              updatedAt: new Date().toISOString(),
            }
          : req,
      )

      const docRef = doc(db, "processes", process.id)
      await updateDoc(docRef, {
        requirements: updatedRequirements,
        updatedAt: new Date().toISOString(),
        timeline: arrayUnion({
          status: "nao_tenho",
          message: `Cliente informou não possuir o documento "${selectedRequirement.name}": ${userNote}`,
          timestamp: new Date().toISOString(),
          actor: "user",
          actorName: user?.email || "Cliente",
        }),
      })

      alert("Informação registrada com sucesso!")
      setNoDocDialogOpen(false)
      setUserNote("")
      window.location.reload()
    } catch (error) {
      console.error("Error updating requirement:", error)
      alert("Erro ao registrar informação. Por favor, tente novamente.")
    } finally {
      setSubmittingNoDoc(false)
    }
  }

  const handleTaskFileUpload = async (taskId: string, event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || !event.target.files[0] || !process || !user) return

    const file = event.target.files[0]
    const maxSize = 10 * 1024 * 1024 // 10MB
    const allowedTypes = ["application/pdf", "image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"]

    if (!allowedTypes.includes(file.type)) {
      alert("Por favor, envie apenas arquivos PDF ou imagens (JPG, PNG, GIF, WEBP).")
      return
    }

    if (file.size > maxSize) {
      alert("O arquivo deve ter no máximo 10MB.")
      return
    }

    setUploadingTaskId(taskId)

    try {
      const fileId = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      const storageRef = ref(storage, `processes/${user.uid}/${process.id}/tasks/${taskId}/${fileId}_${file.name}`)
      await uploadBytes(storageRef, file)
      const downloadURL = await getDownloadURL(storageRef)

      const newFile: FileItem = {
        id: fileId,
        name: file.name,
        url: downloadURL,
        type: file.type,
        size: file.size,
        uploadedAt: new Date().toISOString(),
      }

      const task = process.adminTasks?.find((t) => t.id === taskId)

      const updatedTasks = (process.adminTasks || []).map((task) =>
        task.id === taskId
          ? {
              ...task,
              files: [...(task.files || []), newFile],
            }
          : task,
      )

      const docRef = doc(db, "processes", process.id)
      await updateDoc(docRef, {
        adminTasks: updatedTasks,
        updatedAt: new Date().toISOString(),
        timeline: arrayUnion({
          status: "em_andamento",
          message: `Documento enviado para tarefa "${task?.title}": ${file.name}`,
          timestamp: new Date().toISOString(),
          actor: "user",
          actorName: user.email || "Cliente",
        }),
      })

      alert("Arquivo enviado com sucesso!")
      window.location.reload()
    } catch (error) {
      console.error("Error uploading task file:", error)
      alert("Erro ao enviar arquivo. Por favor, tente novamente.")
    } finally {
      setUploadingTaskId(null)
    }
  }

  const handleDeleteTaskFile = async (taskId: string, fileId: string, fileUrl: string) => {
    if (!process || !user) return

    const confirmed = confirm("Tem certeza que deseja excluir este arquivo?")
    if (!confirmed) return

    setDeletingTaskFileId(fileId)

    try {
      const fileRef = ref(storage, fileUrl)
      await deleteObject(fileRef)

      const task = process.adminTasks?.find((t) => t.id === taskId)
      const fileToDelete = task?.files.find((f) => f.id === fileId)

      const updatedTasks = (process.adminTasks || []).map((task) => {
        if (task.id === taskId) {
          const updatedFiles = task.files.filter((f) => f.id !== fileId)
          return {
            ...task,
            files: updatedFiles,
          }
        }
        return task
      })

      const docRef = doc(db, "processes", process.id)
      await updateDoc(docRef, {
        adminTasks: updatedTasks,
        updatedAt: new Date().toISOString(),
        timeline: arrayUnion({
          status: "em_andamento",
          message: `Documento removido da tarefa "${task?.title}": ${fileToDelete?.name}`,
          timestamp: new Date().toISOString(),
          actor: "user",
          actorName: user.email || "Cliente",
        }),
      })

      alert("Arquivo excluído com sucesso!")
      window.location.reload()
    } catch (error) {
      console.error("Error deleting task file:", error)
      alert("Erro ao excluir arquivo. Por favor, tente novamente.")
    } finally {
      setDeletingTaskFileId(null)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "concluido":
        return <CheckCircle className="text-green-600" size={20} />
      case "em_andamento":
        return <Clock className="text-blue-600" size={20} />
      case "pendente":
        return <AlertCircle className="text-yellow-600" size={20} />
      case "aprovado":
        return <Check className="text-green-600" size={20} />
      case "rejeitado":
        return <XCircle className="text-red-600" size={20} />
      case "nao_tenho":
        return <FileX className="text-orange-600" size={20} />
      default:
        return <Clock className="text-gray-600" size={20} />
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "concluido":
        return "Concluído"
      case "em_andamento":
        return "Em Andamento"
      case "pendente":
        return "Pendente"
      case "aprovado":
        return "Aprovado"
      case "rejeitado":
        return "Rejeitado"
      case "nao_tenho":
        return "Não Possuo"
      default:
        return status
    }
  }

  const getRequirementStatusIcon = (status: string) => {
    switch (status) {
      case "aprovado":
        return <Check className="text-green-600" size={18} />
      case "enviado":
        return <Clock className="text-blue-600" size={18} />
      case "rejeitado":
        return <XCircle className="text-red-600" size={18} />
      case "nao_tenho":
        return <FileX className="text-orange-600" size={18} />
      case "pendente":
        return <AlertCircle className="text-yellow-600" size={18} />
      default:
        return <Clock className="text-gray-600" size={18} />
    }
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
        return "Aguardando Análise"
      case "rejeitado":
        return "Rejeitado"
      case "nao_tenho":
        return "Não Possuo"
      case "pendente":
        return "Pendente"
      default:
        return status
    }
  }

  const getDeadlineStatus = (deadline?: string) => {
    if (!deadline) return null

    const deadlineDate = new Date(deadline)
    const now = new Date()
    const daysUntilDeadline = Math.ceil((deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

    if (daysUntilDeadline < 0) {
      return {
        status: "expired",
        days: Math.abs(daysUntilDeadline),
        color: "text-red-600 bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800",
      }
    } else if (daysUntilDeadline <= 3) {
      return {
        status: "urgent",
        days: daysUntilDeadline,
        color: "text-orange-600 bg-orange-50 dark:bg-orange-950 border-orange-200 dark:border-orange-800",
      }
    } else if (daysUntilDeadline <= 7) {
      return {
        status: "approaching",
        days: daysUntilDeadline,
        color: "text-yellow-600 bg-yellow-50 dark:bg-yellow-950 border-yellow-200 dark:border-yellow-800",
      }
    }

    return {
      status: "ok",
      days: daysUntilDeadline,
      color: "text-green-600 bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800",
    }
  }

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
            <Link href="/portal/processos">
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
        <div className="bg-primary text-primary-foreground py-12">
          <div className="container mx-auto px-4">
            <Link
              href="/portal/processos"
              className="inline-flex items-center text-primary-foreground/90 hover:text-primary-foreground mb-4"
            >
              <ArrowLeft className="mr-2" size={18} />
              Voltar aos Processos
            </Link>
            <h1 className="text-3xl md:text-4xl font-serif font-bold">{process.title}</h1>
          </div>
        </div>

        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              {process.deadline && (
                <Card className={`border-2 ${getDeadlineStatus(process.deadline)?.color || ""}`}>
                  <CardContent className="pt-6">
                    {(() => {
                      const deadlineStatus = getDeadlineStatus(process.deadline)
                      if (!deadlineStatus) return null

                      return (
                        <div className="flex items-start gap-4">
                          <div className="flex-shrink-0">
                            {deadlineStatus.status === "expired" ? (
                              <AlertCircle size={32} className="text-red-600" />
                            ) : deadlineStatus.status === "urgent" ? (
                              <AlertCircle size={32} className="text-orange-600" />
                            ) : (
                              <Clock
                                size={32}
                                className={
                                  deadlineStatus.status === "approaching" ? "text-yellow-600" : "text-green-600"
                                }
                              />
                            )}
                          </div>
                          <div className="flex-1">
                            <h3 className="font-bold text-lg mb-2">
                              {deadlineStatus.status === "expired"
                                ? "⚠️ Prazo Vencido"
                                : deadlineStatus.status === "urgent"
                                  ? "🔥 Prazo Urgente"
                                  : deadlineStatus.status === "approaching"
                                    ? "⏰ Prazo Próximo"
                                    : "📅 Prazo do Processo"}
                            </h3>
                            <p className="text-sm md:text-base mb-2">
                              {deadlineStatus.status === "expired" ? (
                                <>
                                  O prazo para entrega dos documentos venceu há{" "}
                                  <strong>{deadlineStatus.days} dia(s)</strong>. Entre em contato com o administrador.
                                </>
                              ) : deadlineStatus.status === "urgent" ? (
                                <>
                                  Você tem apenas <strong>{deadlineStatus.days} dia(s)</strong> para enviar todos os
                                  documentos! Envie o mais rápido possível.
                                </>
                              ) : deadlineStatus.status === "approaching" ? (
                                <>
                                  Você tem <strong>{deadlineStatus.days} dias</strong> para enviar todos os documentos.
                                  Não deixe para a última hora!
                                </>
                              ) : (
                                <>
                                  Você tem <strong>{deadlineStatus.days} dias</strong> para enviar todos os documentos.
                                </>
                              )}
                            </p>
                            <p className="text-sm font-semibold">
                              Data limite:{" "}
                              {new Date(process.deadline).toLocaleDateString("pt-BR", {
                                weekday: "long",
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              })}
                            </p>
                            {deadlineStatus.status !== "expired" && (
                              <p className="text-xs mt-2 opacity-75">
                                ⚠️ Se os documentos não forem enviados até esta data, o processo será encerrado
                                automaticamente.
                              </p>
                            )}
                          </div>
                        </div>
                      )
                    })()}
                  </CardContent>
                </Card>
              )}

              {process.description && (
                <Card>
                  <CardHeader>
                    <CardTitle className="font-serif">Descrição</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground leading-relaxed">{process.description}</p>
                  </CardContent>
                </Card>
              )}

              {process.requirements && process.requirements.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="font-serif">Documentos Necessários</CardTitle>
                    <CardDescription>Envie os documentos solicitados para cada tópico</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {process.requirements.map((requirement) => (
                        <div key={requirement.id} className="p-4 rounded-lg border border-border">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                {getRequirementStatusIcon(requirement.status)}
                                <h4 className="font-semibold text-lg">{requirement.name}</h4>
                              </div>
                              {requirement.description && (
                                <p className="text-sm text-muted-foreground mb-2">{requirement.description}</p>
                              )}
                              <span
                                className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getRequirementStatusColor(requirement.status)}`}
                              >
                                {getRequirementStatusLabel(requirement.status)}
                              </span>

                              {requirement.deadline && (
                                <div className="mt-2">
                                  {(() => {
                                    const deadlineStatus = getDeadlineStatus(requirement.deadline)
                                    if (!deadlineStatus) return null

                                    return (
                                      <div
                                        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium border ${deadlineStatus.color}`}
                                      >
                                        <Clock size={14} />
                                        {deadlineStatus.status === "expired" ? (
                                          <span>Vencido há {deadlineStatus.days} dia(s)</span>
                                        ) : deadlineStatus.status === "urgent" ? (
                                          <span>🔥 Urgente: {deadlineStatus.days} dia(s) restante(s)</span>
                                        ) : (
                                          <span>
                                            Prazo: {new Date(requirement.deadline).toLocaleDateString("pt-BR")} (
                                            {deadlineStatus.days} dias)
                                          </span>
                                        )}
                                      </div>
                                    )
                                  })()}
                                </div>
                              )}
                            </div>
                          </div>

                          {requirement.adminComments && (
                            <div className="mb-3 p-3 bg-blue-50 dark:bg-blue-950 rounded border border-blue-200 dark:border-blue-800">
                              <p className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-1">
                                Comentários do Admin:
                              </p>
                              <p className="text-sm text-blue-800 dark:text-blue-200">{requirement.adminComments}</p>
                            </div>
                          )}

                          {requirement.status === "nao_tenho" && requirement.userNote && (
                            <div className="mb-3 p-3 bg-orange-50 dark:bg-orange-950 rounded border border-orange-200 dark:border-orange-800">
                              <p className="text-sm font-medium text-orange-900 dark:text-orange-100 mb-1">
                                Sua justificativa:
                              </p>
                              <p className="text-sm text-orange-800 dark:text-orange-200">{requirement.userNote}</p>
                            </div>
                          )}

                          {requirement.files && requirement.files.length > 0 && (
                            <div className="mb-3 space-y-2">
                              <p className="text-sm font-medium">Arquivos enviados:</p>
                              {requirement.files.map((file) => (
                                <div
                                  key={file.id}
                                  className="flex items-center justify-between p-2 bg-secondary/50 rounded"
                                >
                                  <div className="flex items-center gap-2 flex-1 min-w-0">
                                    <FileText className="text-primary flex-shrink-0" size={18} />
                                    <div className="flex-1 min-w-0">
                                      <p className="text-sm font-medium truncate">{file.name}</p>
                                      <p className="text-xs text-muted-foreground">
                                        {(file.size / 1024).toFixed(0)} KB
                                      </p>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-1 flex-shrink-0">
                                    <a href={file.url} download target="_blank" rel="noopener noreferrer">
                                      <Button size="sm" variant="ghost">
                                        <Download size={14} />
                                      </Button>
                                    </a>
                                    {requirement.status !== "aprovado" && (
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => handleDeleteFile(requirement.id, file.id, file.url)}
                                        disabled={deletingFileId === file.id}
                                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                      >
                                        {deletingFileId === file.id ? (
                                          <Loader2 className="animate-spin" size={14} />
                                        ) : (
                                          <Trash2 size={14} />
                                        )}
                                      </Button>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}

                          {requirement.status !== "aprovado" && (
                            <div className="mt-3 space-y-2">
                              <Label htmlFor={`file-${requirement.id}`} className="cursor-pointer">
                                <div className="flex items-center justify-center gap-2 p-3 border-2 border-dashed border-border rounded-lg hover:bg-secondary/50 transition-colors">
                                  {uploadingRequirementId === requirement.id ? (
                                    <>
                                      <Loader2 className="animate-spin" size={18} />
                                      <span className="text-sm font-medium">Enviando...</span>
                                    </>
                                  ) : (
                                    <>
                                      <Upload size={18} />
                                      <span className="text-sm font-medium">Enviar Arquivo (PDF ou Foto)</span>
                                    </>
                                  )}
                                </div>
                              </Label>
                              <Input
                                id={`file-${requirement.id}`}
                                type="file"
                                className="hidden"
                                accept=".pdf,image/*"
                                onChange={(e) => handleRequirementFileUpload(requirement.id, e)}
                                disabled={uploadingRequirementId === requirement.id}
                              />
                              <p className="text-xs text-muted-foreground text-center">
                                Tamanho máximo: 10MB • Formatos: PDF, JPG, PNG
                              </p>

                              {requirement.status !== "nao_tenho" && (
                                <Button
                                  variant="outline"
                                  className="w-full text-orange-600 border-orange-300 hover:bg-orange-50 bg-transparent"
                                  onClick={() => handleNoDocument(requirement)}
                                >
                                  <FileX className="mr-2" size={18} />
                                  Não Tenho Este Documento
                                </Button>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {process.adminTasks && process.adminTasks.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="font-serif">Tarefas Solicitadas</CardTitle>
                    <CardDescription>Envie os documentos necessários para cada tarefa</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {process.adminTasks.map((task) => (
                        <div key={task.id} className="p-4 rounded-lg border border-border">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                {task.status === "concluido" ? (
                                  <CheckCircle className="text-green-600" size={18} />
                                ) : (
                                  <Clock className="text-blue-600" size={18} />
                                )}
                                <h4 className="font-semibold text-lg">{task.title}</h4>
                              </div>
                              {task.description && (
                                <p className="text-sm text-muted-foreground mb-2">{task.description}</p>
                              )}
                              <span
                                className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                                  task.status === "concluido"
                                    ? "text-green-600 bg-green-50 dark:bg-green-950"
                                    : "text-blue-600 bg-blue-50 dark:bg-blue-950"
                                }`}
                              >
                                {task.status === "concluido" ? "Concluída" : "Em Andamento"}
                              </span>

                              {task.deadline && (
                                <div className="mt-2">
                                  {(() => {
                                    const deadlineStatus = getDeadlineStatus(task.deadline)
                                    if (!deadlineStatus) return null

                                    return (
                                      <div
                                        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium border ${deadlineStatus.color}`}
                                      >
                                        <Clock size={14} />
                                        {deadlineStatus.status === "expired" ? (
                                          <span>Vencido há {deadlineStatus.days} dia(s)</span>
                                        ) : deadlineStatus.status === "urgent" ? (
                                          <span>🔥 Urgente: {deadlineStatus.days} dia(s) restante(s)</span>
                                        ) : (
                                          <span>
                                            Prazo: {new Date(task.deadline).toLocaleDateString("pt-BR")} (
                                            {deadlineStatus.days} dias)
                                          </span>
                                        )}
                                      </div>
                                    )
                                  })()}
                                </div>
                              )}
                            </div>
                          </div>

                          {task.files && task.files.length > 0 && (
                            <div className="mb-3 space-y-2">
                              <p className="text-sm font-medium">Arquivos enviados:</p>
                              {task.files.map((file) => (
                                <div
                                  key={file.id}
                                  className="flex items-center justify-between p-2 bg-secondary/50 rounded"
                                >
                                  <div className="flex items-center gap-2 flex-1 min-w-0">
                                    <FileText className="text-primary flex-shrink-0" size={18} />
                                    <div className="flex-1 min-w-0">
                                      <p className="text-sm font-medium truncate">{file.name}</p>
                                      <p className="text-xs text-muted-foreground">
                                        {(file.size / 1024).toFixed(0)} KB
                                      </p>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-1 flex-shrink-0">
                                    <a href={file.url} download target="_blank" rel="noopener noreferrer">
                                      <Button size="sm" variant="ghost">
                                        <Download size={14} />
                                      </Button>
                                    </a>
                                    {task.status !== "concluido" && (
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => handleDeleteTaskFile(task.id, file.id, file.url)}
                                        disabled={deletingTaskFileId === file.id}
                                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                      >
                                        {deletingTaskFileId === file.id ? (
                                          <Loader2 className="animate-spin" size={14} />
                                        ) : (
                                          <Trash2 size={14} />
                                        )}
                                      </Button>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}

                          {task.status !== "concluido" && (
                            <div className="mt-3 space-y-2">
                              <Label htmlFor={`task-file-${task.id}`} className="cursor-pointer">
                                <div className="flex items-center justify-center gap-2 p-3 border-2 border-dashed border-border rounded-lg hover:bg-secondary/50 transition-colors">
                                  {uploadingTaskId === task.id ? (
                                    <>
                                      <Loader2 className="animate-spin" size={18} />
                                      <span className="text-sm font-medium">Enviando...</span>
                                    </>
                                  ) : (
                                    <>
                                      <Upload size={18} />
                                      <span className="text-sm font-medium">Enviar Arquivo (PDF ou Foto)</span>
                                    </>
                                  )}
                                </div>
                              </Label>
                              <Input
                                id={`task-file-${task.id}`}
                                type="file"
                                className="hidden"
                                accept=".pdf,image/*"
                                onChange={(e) => handleTaskFileUpload(task.id, e)}
                                disabled={uploadingTaskId === task.id}
                              />
                              <p className="text-xs text-muted-foreground text-center">
                                Tamanho máximo: 10MB • Formatos: PDF, JPG, PNG
                              </p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              <Card>
                <CardHeader>
                  <CardTitle className="font-serif">Linha do Tempo</CardTitle>
                  <CardDescription>Acompanhe o andamento do processo</CardDescription>
                </CardHeader>
                <CardContent>
                  {process.timeline && process.timeline.length > 0 ? (
                    <div className="space-y-4">
                      {process.timeline
                        .slice()
                        .reverse()
                        .map((item, index) => (
                          <div key={index} className="flex gap-4">
                            <div className="flex flex-col items-center">
                              <div
                                className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                                  item.status === "concluido"
                                    ? "bg-green-100 dark:bg-green-900"
                                    : item.status === "rejeitado"
                                      ? "bg-red-100 dark:bg-red-900"
                                      : item.status === "aprovado"
                                        ? "bg-green-100 dark:bg-green-900"
                                        : item.status === "em_andamento" || item.status === "enviado"
                                          ? "bg-blue-100 dark:bg-blue-900"
                                          : "bg-yellow-100 dark:bg-yellow-900"
                                }`}
                              >
                                {getStatusIcon(item.status)}
                              </div>
                              {index < process.timeline.length - 1 && (
                                <div className="w-0.5 flex-1 bg-border mt-2 min-h-[40px]" />
                              )}
                            </div>
                            <div className="flex-1 pb-4">
                              <div className="flex items-start justify-between gap-2 mb-1">
                                <p className="font-medium leading-relaxed">{item.message}</p>
                                <span
                                  className={`px-2 py-1 rounded text-xs font-medium whitespace-nowrap flex-shrink-0 ${
                                    item.status === "concluido"
                                      ? "bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300"
                                      : item.status === "rejeitado"
                                        ? "bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300"
                                        : item.status === "aprovado"
                                          ? "bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300"
                                          : item.status === "em_andamento" || item.status === "enviado"
                                            ? "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300"
                                            : "bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300"
                                  }`}
                                >
                                  {getStatusLabel(item.status)}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Clock size={14} />
                                <span>{new Date(item.timestamp).toLocaleString("pt-BR")}</span>
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

              <Card>
                <CardHeader>
                  <CardTitle className="font-serif">Documentos Gerais</CardTitle>
                  <CardDescription>Outros arquivos relacionados ao processo</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {(process.files || []).map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-secondary/50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <FileText className="text-primary" size={24} />
                          <div>
                            <p className="font-medium">{file.name}</p>
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
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="font-serif">Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-3 mb-4">
                    {getStatusIcon(process.status)}
                    <span className="font-medium text-lg">{getStatusLabel(process.status)}</span>
                  </div>
                  <div className="space-y-3 text-sm">
                    <div>
                      <p className="text-muted-foreground">Criado em</p>
                      <p className="font-medium">{new Date(process.createdAt).toLocaleDateString("pt-BR")}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Última atualização</p>
                      <p className="font-medium">{new Date(process.updatedAt).toLocaleDateString("pt-BR")}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <Dialog open={noDocDialogOpen} onOpenChange={setNoDocDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Não Possuo Este Documento</DialogTitle>
            <DialogDescription>{selectedRequirement?.name}</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="user-note" className="mb-2 block">
              Por favor, explique por que você não possui este documento:
            </Label>
            <Textarea
              id="user-note"
              value={userNote}
              onChange={(e) => setUserNote(e.target.value)}
              placeholder="Ex: Não possuo este documento no momento, mas posso providenciar em até 15 dias..."
              rows={5}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground mt-2">
              O administrador será notificado e poderá entrar em contato com você.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setNoDocDialogOpen(false)} disabled={submittingNoDoc}>
              Cancelar
            </Button>
            <Button onClick={handleSubmitNoDocument} disabled={submittingNoDoc || !userNote.trim()}>
              {submittingNoDoc ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enviando...
                </>
              ) : (
                "Confirmar"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  )
}
