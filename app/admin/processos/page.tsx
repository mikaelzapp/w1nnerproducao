"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { AdminRoute } from "@/components/admin-route"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { db } from "@/lib/firebase/config"
import { collection, getDocs, orderBy, query, deleteDoc, doc, updateDoc, addDoc } from "firebase/firestore"
import { FileText, Search, ArrowLeft, Plus, Download, Pencil, Trash2, User, X } from "lucide-react"
import Link from "next/link"
import { exportToCSV, exportToPDF, formatDateForExport, formatStatusForExport } from "@/lib/export-utils"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { logActivity } from "@/lib/firebase/activity-logger"

interface Process {
  id: string
  title: string
  description?: string
  userName: string
  userEmail: string
  userId: string
  status: string
  createdAt: string
  updatedAt: string
  requirements: Array<{
    id: string
    name: string
    description: string
    status: string
    files: string[]
    adminComments: string
    createdAt: string
    updatedAt: string
  }>
  deadline: string | null
}

interface ProcessUser {
  id: string
  name: string
  email: string
}

export default function AdminProcessesPage() {
  return (
    <AdminRoute>
      <AdminProcessesContent />
    </AdminRoute>
  )
}

function AdminProcessesContent() {
  const [processes, setProcesses] = useState<Process[]>([])
  const [filteredProcesses, setFilteredProcesses] = useState<Process[]>([])
  const [users, setUsers] = useState<ProcessUser[]>([])
  const [selectedUserId, setSelectedUserId] = useState<string>("all")
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [exporting, setExporting] = useState(false)

  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedProcess, setSelectedProcess] = useState<Process | null>(null)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    status: "pendente",
    deadline: "",
  })
  const [submitting, setSubmitting] = useState(false)

  const [requirements, setRequirements] = useState<Array<{ name: string; description: string }>>([])
  const [newRequirement, setNewRequirement] = useState({ name: "", description: "" })

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "users"))
        const usersData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as ProcessUser[]
        setUsers(usersData)
      } catch (error) {
        console.error("Error fetching users:", error)
      }
    }

    fetchUsers()
  }, [])

  useEffect(() => {
    const fetchProcesses = async () => {
      try {
        const q = query(collection(db, "processes"), orderBy("createdAt", "desc"))
        const querySnapshot = await getDocs(q)
        const processesData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Process[]
        setProcesses(processesData)
        setFilteredProcesses(processesData)
      } catch (error) {
        console.error("Error fetching processes:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchProcesses()
  }, [])

  useEffect(() => {
    let filtered = processes

    if (selectedUserId !== "all") {
      filtered = filtered.filter((process) => process.userId === selectedUserId)
    }

    if (searchTerm) {
      filtered = filtered.filter(
        (process) =>
          process.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          process.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          process.userEmail?.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    setFilteredProcesses(filtered)
  }, [searchTerm, processes, selectedUserId])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "concluido":
        return "text-green-600 bg-green-50 dark:bg-green-950"
      case "em_andamento":
        return "text-blue-600 bg-blue-50 dark:bg-blue-950"
      case "pendente":
        return "text-yellow-600 bg-yellow-50 dark:bg-yellow-950"
      default:
        return "text-gray-600 bg-gray-50 dark:bg-gray-950"
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
      default:
        return status
    }
  }

  const handleExportProcesses = async (format: "csv" | "pdf") => {
    setExporting(true)
    try {
      const headers = [
        "ID",
        "Título",
        "Cliente",
        "Email",
        "Status",
        "Data de Criação",
        "Última Atualização",
        "Prazo de Entrega",
      ]
      const rows = filteredProcesses.map((process) => [
        process.id,
        process.title || "",
        process.userName || "",
        process.userEmail || "",
        formatStatusForExport(process.status),
        formatDateForExport(process.createdAt),
        formatDateForExport(process.updatedAt),
        process.deadline ? new Date(process.deadline).toLocaleDateString("pt-BR") : "Sem prazo definido",
      ])

      const exportData = {
        headers,
        rows,
        filename: `processos_${new Date().toISOString().split("T")[0]}`,
        title: "Relatório de Processos - W1nner Engenharia",
      }

      if (format === "csv") {
        exportToCSV(exportData)
      } else {
        exportToPDF(exportData)
      }
    } catch (error) {
      console.error("Error exporting processes:", error)
      alert("Erro ao exportar processos.")
    } finally {
      setExporting(false)
    }
  }

  const handleCreateProcess = () => {
    if (selectedUserId === "all") {
      alert("Por favor, selecione um usuário para criar o processo.")
      return
    }
    setFormData({ title: "", description: "", status: "pendente", deadline: "" })
    setRequirements([])
    setCreateDialogOpen(true)
  }

  const handleEditProcess = (process: Process, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setSelectedProcess(process)
    setFormData({
      title: process.title,
      description: process.description || "",
      status: process.status,
      deadline: process.deadline || "",
    })
    setEditDialogOpen(true)
  }

  const handleDeleteProcess = (process: Process, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setSelectedProcess(process)
    setDeleteDialogOpen(true)
  }

  const handleAddRequirement = () => {
    if (!newRequirement.name.trim()) {
      alert("Por favor, preencha o nome do tópico.")
      return
    }
    setRequirements([...requirements, { ...newRequirement }])
    setNewRequirement({ name: "", description: "" })
  }

  const handleRemoveRequirement = (index: number) => {
    setRequirements(requirements.filter((_, i) => i !== index))
  }

  const handleSubmitCreate = async () => {
    if (!formData.title.trim()) {
      alert("Por favor, preencha o título do processo.")
      return
    }

    const selectedUser = users.find((u) => u.id === selectedUserId)
    if (!selectedUser) {
      alert("Usuário não encontrado.")
      return
    }

    if (!selectedUser.name || !selectedUser.email) {
      alert("Dados do usuário incompletos. Por favor, verifique o cadastro do usuário.")
      return
    }

    setSubmitting(true)
    try {
      const processRequirements = requirements.map((req, index) => ({
        id: `req_${Date.now()}_${index}`,
        name: req.name,
        description: req.description,
        status: "pendente",
        files: [],
        adminComments: "",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }))

      const newProcess = {
        title: formData.title,
        description: formData.description,
        status: formData.status,
        deadline: formData.deadline || null,
        userId: selectedUser.id,
        userName: selectedUser.name,
        userEmail: selectedUser.email,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        documents: [],
        requirements: processRequirements,
        timeline: [
          {
            date: new Date().toISOString(),
            status: formData.status,
            description: formData.deadline
              ? `Processo criado com prazo de entrega até ${new Date(formData.deadline).toLocaleDateString("pt-BR")}`
              : "Processo criado",
          },
        ],
      }

      const docRef = await addDoc(collection(db, "processes"), newProcess)

      await logActivity("process_created", {
        processId: docRef.id,
        processTitle: formData.title,
        userId: selectedUser.id,
        userName: selectedUser.name,
        deadline: formData.deadline || "Sem prazo definido",
      })

      const q = query(collection(db, "processes"), orderBy("createdAt", "desc"))
      const querySnapshot = await getDocs(q)
      const processesData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Process[]
      setProcesses(processesData)

      setCreateDialogOpen(false)
      setFormData({ title: "", description: "", status: "pendente", deadline: "" })
      setRequirements([])
      alert("Processo criado com sucesso!")
    } catch (error) {
      console.error("Error creating process:", error)
      alert("Erro ao criar processo. Por favor, tente novamente.")
    } finally {
      setSubmitting(false)
    }
  }

  const handleSubmitEdit = async () => {
    if (!selectedProcess || !formData.title.trim()) {
      alert("Por favor, preencha o título do processo.")
      return
    }

    setSubmitting(true)
    try {
      const updates = {
        title: formData.title,
        description: formData.description,
        status: formData.status,
        updatedAt: new Date().toISOString(),
        deadline: formData.deadline || null,
      }

      await updateDoc(doc(db, "processes", selectedProcess.id), updates)

      await logActivity("process_updated", {
        processId: selectedProcess.id,
        processTitle: formData.title,
        changes: updates,
      })

      const q = query(collection(db, "processes"), orderBy("createdAt", "desc"))
      const querySnapshot = await getDocs(q)
      const processesData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Process[]
      setProcesses(processesData)

      setEditDialogOpen(false)
      alert("Processo atualizado com sucesso!")
    } catch (error) {
      console.error("Error updating process:", error)
      alert("Erro ao atualizar processo.")
    } finally {
      setSubmitting(false)
    }
  }

  const handleSubmitDelete = async () => {
    if (!selectedProcess) return

    setSubmitting(true)
    try {
      await deleteDoc(doc(db, "processes", selectedProcess.id))

      await logActivity("process_deleted", {
        processId: selectedProcess.id,
        processTitle: selectedProcess.title,
        userId: selectedProcess.userId,
        userName: selectedProcess.userName,
      })

      const q = query(collection(db, "processes"), orderBy("createdAt", "desc"))
      const querySnapshot = await getDocs(q)
      const processesData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Process[]
      setProcesses(processesData)

      setDeleteDialogOpen(false)
      alert("Processo excluído com sucesso!")
    } catch (error) {
      console.error("Error deleting process:", error)
      alert("Erro ao excluir processo.")
    } finally {
      setSubmitting(false)
    }
  }

  const selectedUser = users.find((u) => u.id === selectedUserId)

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />

      <main className="flex-1 pt-20">
        <div className="bg-primary text-primary-foreground py-12">
          <div className="container mx-auto px-4">
            <Link
              href="/admin"
              className="inline-flex items-center text-primary-foreground/90 hover:text-primary-foreground mb-4"
            >
              <ArrowLeft className="mr-2" size={18} />
              Voltar ao Painel
            </Link>
            <h1 className="text-3xl md:text-4xl font-serif font-bold">Gerenciar Processos</h1>
          </div>
        </div>

        <div className="container mx-auto px-4 py-12">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="font-serif">Todos os Processos</CardTitle>
                  <CardDescription>Visualize e gerencie todos os processos dos clientes</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleExportProcesses("csv")}
                    disabled={exporting || filteredProcesses.length === 0}
                  >
                    <Download className="mr-2" size={16} />
                    CSV
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleExportProcesses("pdf")}
                    disabled={exporting || filteredProcesses.length === 0}
                  >
                    <Download className="mr-2" size={16} />
                    PDF
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="mb-6 flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <Label htmlFor="user-select" className="mb-2 block">
                    Selecionar Usuário
                  </Label>
                  <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                    <SelectTrigger id="user-select">
                      <SelectValue placeholder="Selecione um usuário" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os Usuários</SelectItem>
                      {users.map((user) => (
                        <SelectItem key={user.id} value={user.id}>
                          {user.name} ({user.email})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-end">
                  <Button
                    onClick={handleCreateProcess}
                    disabled={selectedUserId === "all"}
                    className="bg-primary text-primary-foreground"
                  >
                    <Plus className="mr-2" size={18} />
                    Novo Processo
                  </Button>
                </div>
              </div>

              {selectedUserId !== "all" && selectedUser && (
                <div className="mb-6 p-4 bg-secondary/50 rounded-lg border border-border">
                  <div className="flex items-center gap-3">
                    <User className="text-primary" size={20} />
                    <div>
                      <p className="font-semibold">{selectedUser.name}</p>
                      <p className="text-sm text-muted-foreground">{selectedUser.email}</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="mb-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                  <Input
                    type="text"
                    placeholder="Buscar por título, usuário ou email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {loading ? (
                <div className="text-center py-12 text-muted-foreground">Carregando processos...</div>
              ) : filteredProcesses.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="mx-auto mb-4 text-muted-foreground" size={48} />
                  <p className="text-muted-foreground">
                    {searchTerm
                      ? "Nenhum processo encontrado."
                      : selectedUserId !== "all"
                        ? "Este usuário ainda não possui processos."
                        : "Nenhum processo cadastrado."}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredProcesses.map((process) => (
                    <div
                      key={process.id}
                      className="flex flex-col md:flex-row items-start md:items-center justify-between p-6 rounded-lg border border-border hover:bg-secondary/50 transition-colors gap-4"
                    >
                      <Link href={`/admin/processos/${process.id}`} className="flex items-start gap-4 flex-1 min-w-0">
                        <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <FileText className="text-primary" size={24} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-lg mb-1">{process.title}</h3>
                          <p className="text-sm text-muted-foreground mb-2">
                            Cliente: {process.userName} ({process.userEmail})
                          </p>
                          <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                            <span>Criado: {new Date(process.createdAt).toLocaleDateString("pt-BR")}</span>
                            <span>Atualizado: {new Date(process.updatedAt).toLocaleDateString("pt-BR")}</span>
                            <span>
                              Prazo:{" "}
                              {process.deadline
                                ? new Date(process.deadline).toLocaleDateString("pt-BR")
                                : "Sem prazo definido"}
                            </span>
                          </div>
                        </div>
                      </Link>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span
                          className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${getStatusColor(process.status)}`}
                        >
                          {getStatusLabel(process.status)}
                        </span>
                        <Button size="sm" variant="outline" onClick={(e) => handleEditProcess(process, e)}>
                          <Pencil size={16} />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => handleDeleteProcess(process, e)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Criar Novo Processo</DialogTitle>
            <DialogDescription>
              Criar processo para {selectedUser?.name} ({selectedUser?.email})
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="title">Título do Processo</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Ex: Regularização de Imóvel"
              />
            </div>
            <div>
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Descreva os detalhes do processo..."
                rows={4}
              />
            </div>
            <div>
              <Label htmlFor="status">Status Inicial</Label>
              <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                <SelectTrigger id="status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pendente">Pendente</SelectItem>
                  <SelectItem value="em_andamento">Em Andamento</SelectItem>
                  <SelectItem value="concluido">Concluído</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="deadline">Prazo de Entrega (Opcional)</Label>
              <Input
                id="deadline"
                type="date"
                value={formData.deadline}
                onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                min={new Date().toISOString().split("T")[0]}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Se o prazo não for cumprido, o processo será encerrado automaticamente
              </p>
            </div>

            <div className="border-t pt-4">
              <Label className="text-base font-semibold mb-3 block">Tópicos/Documentos Necessários</Label>
              <p className="text-sm text-muted-foreground mb-4">
                Adicione os documentos que o cliente precisa enviar (ex: RG, CPF, Comprovante de Residência)
              </p>

              <div className="space-y-3 mb-4">
                {requirements.map((req, index) => (
                  <div key={index} className="flex items-start gap-2 p-3 bg-secondary/50 rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium">{req.name}</p>
                      {req.description && <p className="text-sm text-muted-foreground">{req.description}</p>}
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleRemoveRequirement(index)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <X size={16} />
                    </Button>
                  </div>
                ))}
              </div>

              <div className="space-y-3 p-4 bg-secondary/30 rounded-lg">
                <div>
                  <Label htmlFor="req-name">Nome do Tópico</Label>
                  <Input
                    id="req-name"
                    value={newRequirement.name}
                    onChange={(e) => setNewRequirement({ ...newRequirement, name: e.target.value })}
                    placeholder="Ex: RG, CPF, Comprovante de Residência"
                  />
                </div>
                <div>
                  <Label htmlFor="req-description">Descrição (opcional)</Label>
                  <Input
                    id="req-description"
                    value={newRequirement.description}
                    onChange={(e) => setNewRequirement({ ...newRequirement, description: e.target.value })}
                    placeholder="Ex: Frente e verso do documento"
                  />
                </div>
                <Button
                  type="button"
                  onClick={handleAddRequirement}
                  variant="outline"
                  className="w-full bg-transparent"
                >
                  <Plus className="mr-2" size={16} />
                  Adicionar Tópico
                </Button>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialogOpen(false)} disabled={submitting}>
              Cancelar
            </Button>
            <Button onClick={handleSubmitCreate} disabled={submitting}>
              {submitting ? "Criando..." : "Criar Processo"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Processo</DialogTitle>
            <DialogDescription>Editar informações do processo</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="edit-title">Título do Processo</Label>
              <Input
                id="edit-title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="edit-description">Descrição</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
              />
            </div>
            <div>
              <Label htmlFor="edit-status">Status</Label>
              <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                <SelectTrigger id="edit-status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pendente">Pendente</SelectItem>
                  <SelectItem value="em_andamento">Em Andamento</SelectItem>
                  <SelectItem value="concluido">Concluído</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="edit-deadline">Prazo de Entrega (Opcional)</Label>
              <Input
                id="edit-deadline"
                type="date"
                value={formData.deadline}
                onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                min={new Date().toISOString().split("T")[0]}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Se o prazo não for cumprido, o processo será encerrado automaticamente
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)} disabled={submitting}>
              Cancelar
            </Button>
            <Button onClick={handleSubmitEdit} disabled={submitting}>
              {submitting ? "Salvando..." : "Salvar Alterações"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir Processo</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir o processo "{selectedProcess?.title}"? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)} disabled={submitting}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleSubmitDelete} disabled={submitting}>
              {submitting ? "Excluindo..." : "Excluir Processo"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  )
}
