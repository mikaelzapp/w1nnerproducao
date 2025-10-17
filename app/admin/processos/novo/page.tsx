"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { AdminRoute } from "@/components/admin-route"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { db } from "@/lib/firebase/config"
import { collection, addDoc, getDocs } from "firebase/firestore"
import { ArrowLeft, Loader2 } from "lucide-react"
import Link from "next/link"
import { logActivity } from "@/lib/firebase/activity-logger"
import { useAuth } from "@/lib/firebase/auth-context"

interface User {
  id: string
  name: string
  email: string
}

export default function NewProcessPage() {
  return (
    <AdminRoute>
      <NewProcessContent />
    </AdminRoute>
  )
}

function NewProcessContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user: adminUser } = useAuth()
  const preselectedUserId = searchParams.get("userId")

  const [users, setUsers] = useState<User[]>([])
  const [creating, setCreating] = useState(false)
  const [formData, setFormData] = useState({
    userId: preselectedUserId || "",
    title: "",
    description: "",
    status: "pendente",
  })

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "users"))
      const usersData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as User[]
      setUsers(usersData)
    } catch (error) {
      console.error("Error fetching users:", error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setCreating(true)

    try {
      const selectedUser = users.find((u) => u.id === formData.userId)
      if (!selectedUser) {
        alert("Usuário não encontrado")
        return
      }

      const processData = {
        ...formData,
        userName: selectedUser.name,
        userEmail: selectedUser.email,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        progress: 0,
        files: [],
        requirements: [],
        adminTasks: [],
        timeline: [
          {
            status: "pendente",
            message: "Processo criado pelo administrador",
            timestamp: new Date().toISOString(),
            actor: "admin",
            actorName: adminUser?.email || "Administrador",
          },
        ],
      }

      const docRef = await addDoc(collection(db, "processes"), processData)

      await logActivity("process_created", `Admin criou processo: ${formData.title}`, adminUser?.uid || "admin", {
        processId: docRef.id,
        userId: formData.userId,
      })

      alert("Processo criado com sucesso!")
      router.push(`/admin/processos/${docRef.id}`)
    } catch (error) {
      console.error("Error creating process:", error)
      alert("Erro ao criar processo.")
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />

      <main className="flex-1 pt-20">
        <div className="bg-primary text-primary-foreground py-12">
          <div className="container mx-auto px-4">
            <Link
              href="/admin/processos"
              className="inline-flex items-center text-primary-foreground/90 hover:text-primary-foreground mb-4"
            >
              <ArrowLeft className="mr-2" size={18} />
              Voltar aos Processos
            </Link>
            <h1 className="text-3xl md:text-4xl font-serif font-bold">Criar Novo Processo</h1>
          </div>
        </div>

        <div className="container mx-auto px-4 py-12 max-w-2xl">
          <Card>
            <CardHeader>
              <CardTitle className="font-serif">Dados do Processo</CardTitle>
              <CardDescription>Preencha as informações para criar um novo processo</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="userId">Cliente *</Label>
                  <select
                    id="userId"
                    value={formData.userId}
                    onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
                    className="w-full px-3 py-2 border border-border rounded-md"
                    required
                  >
                    <option value="">Selecione um cliente</option>
                    {users.map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.name} ({user.email})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="title">Título do Processo *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Ex: Levantamento Topográfico - Lote 123"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Descrição</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Descreva os detalhes do processo..."
                    rows={5}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">Status Inicial</Label>
                  <select
                    id="status"
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3 py-2 border border-border rounded-md"
                  >
                    <option value="pendente">Pendente</option>
                    <option value="em_andamento">Em Andamento</option>
                    <option value="concluido">Concluído</option>
                  </select>
                </div>

                <div className="flex gap-4">
                  <Button type="submit" className="flex-1 bg-primary text-primary-foreground" disabled={creating}>
                    {creating ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Criando...
                      </>
                    ) : (
                      "Criar Processo"
                    )}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => router.back()}>
                    Cancelar
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  )
}
