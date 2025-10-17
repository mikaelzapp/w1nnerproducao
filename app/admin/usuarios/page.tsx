"use client"

import { useEffect, useState } from "react"
import { AdminRoute } from "@/components/admin-route"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { db } from "@/lib/firebase/config"
import { collection, getDocs } from "firebase/firestore"
import { Users, Search, ArrowLeft, Mail, Calendar, Eye, Download } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { exportToCSV, exportToPDF, formatDateForExport } from "@/lib/export-utils"

interface User {
  id: string
  name: string
  email: string
  createdAt: string
  role: string
}

export default function AdminUsersPage() {
  return (
    <AdminRoute>
      <AdminUsersContent />
    </AdminRoute>
  )
}

function AdminUsersContent() {
  const [users, setUsers] = useState<User[]>([])
  const [filteredUsers, setFilteredUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [exporting, setExporting] = useState(false)

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "users"))
        const usersData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as User[]
        setUsers(usersData)
        setFilteredUsers(usersData)
      } catch (error) {
        console.error("Error fetching users:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchUsers()
  }, [])

  useEffect(() => {
    const filtered = users.filter(
      (user) =>
        user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase()),
    )
    setFilteredUsers(filtered)
  }, [searchTerm, users])

  const handleExportUsers = async (format: "csv" | "pdf") => {
    setExporting(true)
    try {
      const headers = ["ID", "Nome", "Email", "Data de Cadastro", "Função"]
      const rows = filteredUsers.map((user) => [
        user.id,
        user.name || "",
        user.email || "",
        formatDateForExport(user.createdAt),
        user.role || "Cliente",
      ])

      const exportData = {
        headers,
        rows,
        filename: `usuarios_${new Date().toISOString().split("T")[0]}`,
        title: "Relatório de Usuários - W1nner Engenharia",
      }

      if (format === "csv") {
        exportToCSV(exportData)
      } else {
        exportToPDF(exportData)
      }
    } catch (error) {
      console.error("Error exporting users:", error)
      alert("Erro ao exportar usuários.")
    } finally {
      setExporting(false)
    }
  }

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
            <h1 className="text-3xl md:text-4xl font-serif font-bold">Gerenciar Usuários</h1>
          </div>
        </div>

        <div className="container mx-auto px-4 py-12">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="font-serif">Todos os Usuários</CardTitle>
                  <CardDescription>Visualize informações dos usuários cadastrados</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleExportUsers("csv")}
                    disabled={exporting || filteredUsers.length === 0}
                  >
                    <Download className="mr-2" size={16} />
                    CSV
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleExportUsers("pdf")}
                    disabled={exporting || filteredUsers.length === 0}
                  >
                    <Download className="mr-2" size={16} />
                    PDF
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="mb-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                  <Input
                    type="text"
                    placeholder="Buscar por nome ou email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {loading ? (
                <div className="text-center py-12 text-muted-foreground">Carregando usuários...</div>
              ) : filteredUsers.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="mx-auto mb-4 text-muted-foreground" size={48} />
                  <p className="text-muted-foreground">
                    {searchTerm ? "Nenhum usuário encontrado." : "Nenhum usuário cadastrado."}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredUsers.map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center justify-between p-6 rounded-lg border border-border hover:bg-secondary/50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                          <Users className="text-primary" size={24} />
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg">{user.name}</h3>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                            <div className="flex items-center gap-1">
                              <Mail size={14} />
                              <span>{user.email}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar size={14} />
                              <span>Desde {new Date(user.createdAt).toLocaleDateString("pt-BR")}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <Link href={`/admin/usuarios/${user.id}`}>
                        <Button className="bg-primary text-primary-foreground">
                          <Eye className="mr-2" size={18} />
                          Ver Detalhes
                        </Button>
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  )
}
