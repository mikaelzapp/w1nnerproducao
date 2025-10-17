"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { AdminRoute } from "@/components/admin-route"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { db, storage } from "@/lib/firebase/config"
import { doc, getDoc, collection, query, where, getDocs, addDoc } from "firebase/firestore"
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"
import { ArrowLeft, FileText, Upload, Loader2, Plus, User, Mail, Calendar } from "lucide-react"
import Link from "next/link"
import { logActivity } from "@/lib/firebase/activity-logger"
import { useAuth } from "@/lib/firebase/auth-context"

interface UserData {
  id: string
  name: string
  email: string
  createdAt: string
}

interface Process {
  id: string
  title: string
  status: string
  createdAt: string
  documents: any[]
}

export default function UserDetailPage() {
  return (
    <AdminRoute>
      <UserDetailContent />
    </AdminRoute>
  )
}

function UserDetailContent() {
  const params = useParams()
  const router = useRouter()
  const { user: adminUser } = useAuth()
  const userId = params.id as string

  const [userData, setUserData] = useState<UserData | null>(null)
  const [processes, setProcesses] = useState<Process[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [selectedProcessId, setSelectedProcessId] = useState("")
  const [file, setFile] = useState<File | null>(null)

  useEffect(() => {
    fetchUserData()
    fetchUserProcesses()
  }, [userId])

  const fetchUserData = async () => {
    try {
      const userDoc = await getDoc(doc(db, "users", userId))
      if (userDoc.exists()) {
        setUserData({ id: userDoc.id, ...userDoc.data() } as UserData)
      }
    } catch (error) {
      console.error("Error fetching user:", error)
    }
  }

  const fetchUserProcesses = async () => {
    try {
      const q = query(collection(db, "processes"), where("userId", "==", userId))
      const querySnapshot = await getDocs(q)
      const processesData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Process[]
      setProcesses(processesData)
    } catch (error) {
      console.error("Error fetching processes:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleFileUpload = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file || !selectedProcessId) return

    const allowedTypes = ["application/pdf", "image/jpeg", "image/jpg", "image/png"]
    if (!allowedTypes.includes(file.type)) {
      alert("Tipo de arquivo não permitido. Use PDF, JPG, JPEG ou PNG.")
      return
    }

    if (file.size > 10 * 1024 * 1024) {
      alert("Arquivo muito grande. Tamanho máximo: 10MB")
      return
    }

    setUploading(true)

    try {
      const storageRef = ref(storage, `processes/${userId}/${selectedProcessId}/${file.name}`)
      await uploadBytes(storageRef, file)
      const downloadURL = await getDownloadURL(storageRef)

      const processDoc = await getDoc(doc(db, "processes", selectedProcessId))
      const currentDocuments = processDoc.data()?.documents || []

      await addDoc(collection(db, "processes", selectedProcessId, "documents"), {
        name: file.name,
        url: downloadURL,
        uploadedAt: new Date().toISOString(),
        uploadedBy: "admin",
        size: file.size,
        type: file.type,
      })

      await logActivity(
        "document_uploaded",
        `Admin adicionou documento ${file.name} ao processo`,
        adminUser?.uid || "admin",
        { processId: selectedProcessId, userId, fileName: file.name },
      )

      alert("Documento adicionado com sucesso!")
      setFile(null)
      setSelectedProcessId("")
      fetchUserProcesses()
    } catch (error) {
      console.error("Error uploading file:", error)
      alert("Erro ao fazer upload do documento.")
    } finally {
      setUploading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "concluido":
        return "text-green-600 bg-green-50"
      case "em_andamento":
        return "text-blue-600 bg-blue-50"
      case "pendente":
        return "text-yellow-600 bg-yellow-50"
      default:
        return "text-gray-600 bg-gray-50"
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-primary" size={48} />
      </div>
    )
  }

  if (!userData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Usuário não encontrado.</p>
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
              href="/admin/usuarios"
              className="inline-flex items-center text-primary-foreground/90 hover:text-primary-foreground mb-4"
            >
              <ArrowLeft className="mr-2" size={18} />
              Voltar aos Usuários
            </Link>
            <h1 className="text-3xl md:text-4xl font-serif font-bold">Detalhes do Usuário</h1>
          </div>
        </div>

        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* User Info */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle className="font-serif">Informações</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3">
                    <User className="text-muted-foreground" size={18} />
                    <div>
                      <p className="text-sm text-muted-foreground">Nome</p>
                      <p className="font-medium">{userData.name}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Mail className="text-muted-foreground" size={18} />
                    <div>
                      <p className="text-sm text-muted-foreground">Email</p>
                      <p className="font-medium">{userData.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Calendar className="text-muted-foreground" size={18} />
                    <div>
                      <p className="text-sm text-muted-foreground">Cadastrado em</p>
                      <p className="font-medium">{new Date(userData.createdAt).toLocaleDateString("pt-BR")}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Upload Document */}
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle className="font-serif">Adicionar Documento</CardTitle>
                  <CardDescription>Envie documentos para processos do usuário</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleFileUpload} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="process">Processo *</Label>
                      <select
                        id="process"
                        value={selectedProcessId}
                        onChange={(e) => setSelectedProcessId(e.target.value)}
                        className="w-full px-3 py-2 border border-border rounded-md"
                        required
                      >
                        <option value="">Selecione um processo</option>
                        {processes.map((process) => (
                          <option key={process.id} value={process.id}>
                            {process.title}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="file">Arquivo *</Label>
                      <Input
                        id="file"
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) => setFile(e.target.files?.[0] || null)}
                        required
                      />
                      <p className="text-xs text-muted-foreground">PDF, JPG, JPEG ou PNG (máx. 10MB)</p>
                    </div>

                    <Button
                      type="submit"
                      className="w-full bg-primary text-primary-foreground"
                      disabled={uploading || !file || !selectedProcessId}
                    >
                      {uploading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Enviando...
                        </>
                      ) : (
                        <>
                          <Upload className="mr-2" size={18} />
                          Enviar Documento
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* User Processes */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="font-serif">Processos do Usuário</CardTitle>
                      <CardDescription>Total: {processes.length} processo(s)</CardDescription>
                    </div>
                    <Link href={`/admin/processos/novo?userId=${userId}`}>
                      <Button className="bg-primary text-primary-foreground">
                        <Plus className="mr-2" size={18} />
                        Novo Processo
                      </Button>
                    </Link>
                  </div>
                </CardHeader>
                <CardContent>
                  {processes.length === 0 ? (
                    <div className="text-center py-12">
                      <FileText className="mx-auto mb-4 text-muted-foreground" size={48} />
                      <p className="text-muted-foreground mb-4">Nenhum processo encontrado.</p>
                      <Link href={`/admin/processos/novo?userId=${userId}`}>
                        <Button className="bg-primary text-primary-foreground">
                          <Plus className="mr-2" size={18} />
                          Criar Primeiro Processo
                        </Button>
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {processes.map((process) => (
                        <Link key={process.id} href={`/admin/processos/${process.id}`}>
                          <div className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-secondary/50 transition-colors cursor-pointer">
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                <FileText className="text-primary" size={20} />
                              </div>
                              <div>
                                <h3 className="font-semibold">{process.title}</h3>
                                <p className="text-sm text-muted-foreground">
                                  Criado em {new Date(process.createdAt).toLocaleDateString("pt-BR")}
                                </p>
                              </div>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-sm ${getStatusColor(process.status)}`}>
                              {getStatusLabel(process.status)}
                            </span>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
