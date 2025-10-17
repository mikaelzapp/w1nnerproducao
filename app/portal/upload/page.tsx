"use client"

import { useState, useEffect } from "react"
import { ProtectedRoute } from "@/components/protected-route"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useAuth } from "@/lib/firebase/auth-context"
import { storage, db } from "@/lib/firebase/config"
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage"
import { collection, query, where, getDocs, doc, updateDoc, arrayUnion } from "firebase/firestore"
import { Upload, FileText, Loader2, ArrowLeft, X, Download, CheckCircle2, Clock } from "lucide-react"
import Link from "next/link"
import { Input } from "@/components/ui/input"

interface TaskFile {
  id: string
  name: string
  url: string
  type: string
  size: number
  uploadedAt: string
  uploadedBy: string
}

interface AdminTask {
  id: string
  title: string
  description?: string
  status: string
  files: TaskFile[]
  createdAt: string
  completedAt?: string | null
  createdBy: string
}

interface Requirement {
  id: string
  name: string
  description?: string
  status: string
  files: TaskFile[]
  deadline?: string
  adminComments?: string
}

interface Process {
  id: string
  title: string
  description?: string
  status: string
  adminTasks?: AdminTask[]
  requirements?: Requirement[]
  createdAt: string
  completedAt?: string | null
  createdBy: string
}

export default function UploadPage() {
  return (
    <ProtectedRoute>
      <UploadContent />
    </ProtectedRoute>
  )
}

function UploadContent() {
  const { user } = useAuth()
  const [processes, setProcesses] = useState<Process[]>([])
  const [loading, setLoading] = useState(true)
  const [uploadingTaskId, setUploadingTaskId] = useState<string | null>(null)
  const [uploadingRequirementId, setUploadingRequirementId] = useState<string | null>(null)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  useEffect(() => {
    fetchProcessesWithTasks()
  }, [user])

  const fetchProcessesWithTasks = async () => {
    if (!user) return

    try {
      const q = query(collection(db, "processes"), where("userId", "==", user.uid))
      const querySnapshot = await getDocs(q)
      const processesData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Process[]

      setProcesses(processesData)
    } catch (error) {
      console.error("Error fetching processes:", error)
      setError("Erro ao carregar tarefas")
    } finally {
      setLoading(false)
    }
  }

  const handleFileUpload = async (processId: string, taskId: string, files: FileList) => {
    if (!user || !files || files.length === 0) return

    setUploadingTaskId(taskId)
    setError("")
    setSuccess("")

    try {
      const validTypes = ["application/pdf", "image/jpeg", "image/jpg", "image/png"]
      const maxSize = 5 * 1024 * 1024 // 5MB

      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        if (!validTypes.includes(file.type)) {
          setError("Apenas arquivos PDF, JPG, JPEG e PNG são permitidos.")
          return
        }
        if (file.size > maxSize) {
          setError("Cada arquivo deve ter no máximo 5MB.")
          return
        }
      }

      const uploadedFiles: TaskFile[] = []
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        const timestamp = Date.now()
        const storageRef = ref(storage, `tasks/${processId}/${taskId}/${timestamp}_${file.name}`)
        await uploadBytes(storageRef, file)
        const downloadURL = await getDownloadURL(storageRef)

        uploadedFiles.push({
          id: `${timestamp}_${i}`,
          name: file.name,
          url: downloadURL,
          type: file.type,
          size: file.size,
          uploadedAt: new Date().toISOString(),
          uploadedBy: user.uid,
        })
      }

      const processRef = doc(db, "processes", processId)
      const process = processes.find((p) => p.id === processId)
      if (!process) return

      const updatedTasks = (process.adminTasks || []).map((task) => {
        if (task.id === taskId) {
          return {
            ...task,
            files: [...(task.files || []), ...uploadedFiles],
            status: "enviado",
          }
        }
        return task
      })

      await updateDoc(processRef, {
        adminTasks: updatedTasks,
        updatedAt: new Date().toISOString(),
      })

      setSuccess("Documentos enviados com sucesso!")
      await fetchProcessesWithTasks()
    } catch (err) {
      console.error("Upload error:", err)
      setError("Erro ao enviar documentos. Por favor, tente novamente.")
    } finally {
      setUploadingTaskId(null)
    }
  }

  const handleRequirementFileUpload = async (processId: string, requirementId: string, files: FileList) => {
    if (!user || !files || files.length === 0) return

    setUploadingRequirementId(requirementId)
    setError("")
    setSuccess("")

    try {
      const validTypes = ["application/pdf", "image/jpeg", "image/jpg", "image/png"]
      const maxSize = 10 * 1024 * 1024 // 10MB

      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        if (!validTypes.includes(file.type)) {
          setError("Apenas arquivos PDF, JPG, JPEG e PNG são permitidos.")
          return
        }
        if (file.size > maxSize) {
          setError("Cada arquivo deve ter no máximo 10MB.")
          return
        }
      }

      const uploadedFiles: TaskFile[] = []
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        const timestamp = Date.now()
        const storageRef = ref(
          storage,
          `processes/${user.uid}/${processId}/requirements/${requirementId}/${timestamp}_${file.name}`,
        )
        await uploadBytes(storageRef, file)
        const downloadURL = await getDownloadURL(storageRef)

        uploadedFiles.push({
          id: `${timestamp}_${i}`,
          name: file.name,
          url: downloadURL,
          type: file.type,
          size: file.size,
          uploadedAt: new Date().toISOString(),
          uploadedBy: user.uid,
        })
      }

      const processRef = doc(db, "processes", processId)
      const process = processes.find((p) => p.id === processId)
      if (!process) return

      const requirement = process.requirements?.find((r) => r.id === requirementId)

      const updatedRequirements = (process.requirements || []).map((req) => {
        if (req.id === requirementId) {
          return {
            ...req,
            files: [...(req.files || []), ...uploadedFiles],
            status: "enviado",
            updatedAt: new Date().toISOString(),
          }
        }
        return req
      })

      await updateDoc(processRef, {
        requirements: updatedRequirements,
        updatedAt: new Date().toISOString(),
        timeline: arrayUnion({
          status: "enviado",
          message: `Documento enviado para "${requirement?.name}"`,
          timestamp: new Date().toISOString(),
          actor: "user",
          actorName: user.email || "Cliente",
        }),
      })

      setSuccess("Documentos enviados com sucesso!")
      await fetchProcessesWithTasks()
    } catch (err) {
      console.error("Upload error:", err)
      setError("Erro ao enviar documentos. Por favor, tente novamente.")
    } finally {
      setUploadingRequirementId(null)
    }
  }

  const handleDeleteFile = async (processId: string, taskId: string, fileId: string, fileUrl: string) => {
    if (!user) return

    try {
      const storageRef = ref(storage, fileUrl)
      await deleteObject(storageRef)

      const processRef = doc(db, "processes", processId)
      const process = processes.find((p) => p.id === processId)
      if (!process) return

      const updatedTasks = (process.adminTasks || []).map((task) => {
        if (task.id === taskId) {
          const updatedFiles = task.files.filter((f) => f.id !== fileId)
          return {
            ...task,
            files: updatedFiles,
            status: updatedFiles.length === 0 ? "pendente" : task.status,
          }
        }
        return task
      })

      await updateDoc(processRef, {
        adminTasks: updatedTasks,
        updatedAt: new Date().toISOString(),
      })

      setSuccess("Documento removido com sucesso!")
      await fetchProcessesWithTasks()
    } catch (err) {
      console.error("Delete error:", err)
      setError("Erro ao remover documento.")
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "concluido":
        return "text-green-600 bg-green-50 dark:bg-green-950"
      case "enviado":
        return "text-blue-600 bg-blue-50 dark:bg-blue-950"
      case "pendente":
        return "text-yellow-600 bg-yellow-50 dark:bg-yellow-950"
      case "rejeitado":
        return "text-red-600 bg-red-50 dark:bg-red-950"
      default:
        return "text-gray-600 bg-gray-50 dark:bg-gray-950"
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "concluido":
        return "Aprovado"
      case "enviado":
        return "Enviado"
      case "pendente":
        return "Pendente"
      case "rejeitado":
        return "Rejeitado"
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
        color: "text-red-600 bg-red-50 dark:bg-red-950 border-red-200",
      }
    } else if (daysUntilDeadline <= 3) {
      return {
        status: "urgent",
        days: daysUntilDeadline,
        color: "text-orange-600 bg-orange-50 dark:bg-orange-950 border-orange-200",
      }
    } else if (daysUntilDeadline <= 7) {
      return {
        status: "approaching",
        days: daysUntilDeadline,
        color: "text-yellow-600 bg-yellow-50 dark:bg-yellow-950 border-yellow-200",
      }
    }

    return {
      status: "ok",
      days: daysUntilDeadline,
      color: "text-green-600 bg-green-50 dark:bg-green-950 border-green-200",
    }
  }

  const allTasks = processes.flatMap((process) =>
    (process.adminTasks || []).map((task) => ({
      ...task,
      processId: process.id,
      processTitle: process.title,
      type: "task" as const,
    })),
  )

  const allRequirements = processes.flatMap((process) =>
    (process.requirements || [])
      .filter((req) => req.status === "pendente" || req.status === "rejeitado")
      .map((req) => ({
        ...req,
        processId: process.id,
        processTitle: process.title,
        type: "requirement" as const,
      })),
  )

  const allItems = [...allRequirements, ...allTasks].sort((a, b) => {
    const aDeadline = a.deadline ? getDeadlineStatus(a.deadline) : null
    const bDeadline = b.deadline ? getDeadlineStatus(b.deadline) : null

    if (aDeadline && bDeadline) {
      const urgencyOrder = { expired: 0, urgent: 1, approaching: 2, ok: 3 }
      return urgencyOrder[aDeadline.status] - urgencyOrder[bDeadline.status]
    }
    if (aDeadline) return -1
    if (bDeadline) return 1
    return 0
  })

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />

      <main className="flex-1 pt-20">
        <div className="bg-primary text-primary-foreground py-12">
          <div className="container mx-auto px-4">
            <Link
              href="/portal"
              className="inline-flex items-center text-primary-foreground/90 hover:text-primary-foreground mb-4"
            >
              <ArrowLeft className="mr-2" size={18} />
              Voltar ao Portal
            </Link>
            <h1 className="text-3xl md:text-4xl font-serif font-bold">Enviar Documentos</h1>
            <p className="text-primary-foreground/90 mt-2">Envie os documentos solicitados para suas tarefas</p>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8 md:py-12">
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="mb-6 border-green-600 bg-green-50 dark:bg-green-950">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-600">{success}</AlertDescription>
            </Alert>
          )}

          {loading ? (
            <div className="text-center py-12">
              <Loader2 className="mx-auto mb-4 animate-spin text-muted-foreground" size={48} />
              <p className="text-muted-foreground">Carregando documentos...</p>
            </div>
          ) : allItems.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <FileText className="mx-auto mb-4 text-muted-foreground" size={64} />
                <h2 className="text-xl font-semibold mb-2">Nenhum Documento Pendente</h2>
                <p className="text-muted-foreground">
                  Todos os documentos foram enviados! Verifique seus processos para mais informações.
                </p>
                <Link href="/portal/processos">
                  <Button className="mt-6 bg-primary text-primary-foreground">Ver Meus Processos</Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {allItems.map((item) => (
                <Card key={`${item.processId}-${item.type}-${item.id}`}>
                  <CardHeader>
                    <div className="flex items-start justify-between gap-4 flex-col sm:flex-row">
                      <div className="flex-1">
                        <CardTitle className="font-serif text-lg md:text-xl">
                          {item.type === "requirement" ? item.name : item.title}
                        </CardTitle>
                        <CardDescription className="mt-1 text-sm">
                          Processo: {item.processTitle}
                          {item.description && ` • ${item.description}`}
                        </CardDescription>
                      </div>
                      <div className="flex flex-col gap-2 items-start sm:items-end">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                          {getStatusLabel(item.status)}
                        </span>
                        {item.deadline && (
                          <div>
                            {(() => {
                              const deadlineStatus = getDeadlineStatus(item.deadline)
                              if (!deadlineStatus) return null

                              return (
                                <div
                                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border ${deadlineStatus.color}`}
                                >
                                  <Clock size={12} />
                                  {deadlineStatus.status === "expired" ? (
                                    <span>Vencido há {deadlineStatus.days}d</span>
                                  ) : deadlineStatus.status === "urgent" ? (
                                    <span>🔥 {deadlineStatus.days}d restante(s)</span>
                                  ) : (
                                    <span>{deadlineStatus.days} dias</span>
                                  )}
                                </div>
                              )
                            })()}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {item.type === "requirement" && item.adminComments && (
                      <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
                        <p className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-1">
                          Comentários do Admin:
                        </p>
                        <p className="text-sm text-blue-800 dark:text-blue-200">{item.adminComments}</p>
                      </div>
                    )}

                    {item.files && item.files.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium">Documentos Enviados:</h4>
                        <div className="space-y-2">
                          {item.files.map((file) => (
                            <div
                              key={file.id}
                              className="flex items-center justify-between p-3 rounded-lg border border-border bg-secondary/30"
                            >
                              <div className="flex items-center gap-3 flex-1 min-w-0">
                                <FileText className="text-primary flex-shrink-0" size={20} />
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium truncate">{file.name}</p>
                                  <p className="text-xs text-muted-foreground">
                                    {new Date(file.uploadedAt).toLocaleDateString("pt-BR")} •{" "}
                                    {(file.size / 1024).toFixed(0)} KB
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => window.open(file.url, "_blank")}
                                  className="h-8 w-8 p-0"
                                >
                                  <Download size={16} />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    if (item.type === "requirement") {
                                      // Handle requirement file delete
                                      // You can implement this similar to handleDeleteFile
                                    } else {
                                      handleDeleteFile(item.processId, item.id, file.id, file.url)
                                    }
                                  }}
                                  className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                                >
                                  <X size={16} />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="border-2 border-dashed border-border rounded-lg p-4 md:p-6 text-center hover:border-primary transition-colors">
                      <Upload className="mx-auto mb-3 text-muted-foreground" size={32} />
                      <Input
                        id={`file-${item.processId}-${item.type}-${item.id}`}
                        type="file"
                        multiple
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) => {
                          if (e.target.files) {
                            if (item.type === "requirement") {
                              handleRequirementFileUpload(item.processId, item.id, e.target.files)
                            } else {
                              handleFileUpload(item.processId, item.id, e.target.files)
                            }
                            e.target.value = ""
                          }
                        }}
                        disabled={
                          item.type === "requirement" ? uploadingRequirementId === item.id : uploadingTaskId === item.id
                        }
                        className="hidden"
                      />
                      <label htmlFor={`file-${item.processId}-${item.type}-${item.id}`} className="cursor-pointer">
                        {(
                          item.type === "requirement"
                            ? uploadingRequirementId === item.id
                            : uploadingTaskId === item.id
                        ) ? (
                          <div className="flex items-center justify-center gap-2">
                            <Loader2 className="animate-spin" size={18} />
                            <span className="text-sm text-muted-foreground">Enviando...</span>
                          </div>
                        ) : (
                          <>
                            <span className="text-primary font-medium text-sm md:text-base">
                              Clique para adicionar documentos
                            </span>
                            <p className="text-xs text-muted-foreground mt-1">PDF, JPG, JPEG ou PNG (máx. 10MB cada)</p>
                          </>
                        )}
                      </label>
                    </div>

                    <Link href={`/portal/processos/${item.processId}`}>
                      <Button variant="outline" className="w-full bg-transparent text-sm">
                        Ver Detalhes do Processo
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}
