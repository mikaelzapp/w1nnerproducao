"use client"

import { useEffect, useState } from "react"
import { ProtectedRoute } from "@/components/protected-route"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/lib/firebase/auth-context"
import { db } from "@/lib/firebase/config"
import { collection, query, where, getDocs } from "firebase/firestore"
import { FileText, Search, ArrowLeft } from "lucide-react"
import Link from "next/link"

interface Process {
  id: string
  title: string
  description: string
  status: string
  createdAt: string
  updatedAt: string
}

export default function ProcessesPage() {
  return (
    <ProtectedRoute>
      <ProcessesContent />
    </ProtectedRoute>
  )
}

function ProcessesContent() {
  const { user } = useAuth()
  const [processes, setProcesses] = useState<Process[]>([])
  const [filteredProcesses, setFilteredProcesses] = useState<Process[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    const fetchProcesses = async () => {
      if (!user) return

      try {
        const q = query(collection(db, "processes"), where("userId", "==", user.uid))
        const querySnapshot = await getDocs(q)
        const processesData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Process[]

        const sortedProcesses = processesData.sort((a, b) => {
          const dateA = new Date(a.createdAt).getTime()
          const dateB = new Date(b.createdAt).getTime()
          return dateB - dateA // desc order (newest first)
        })

        setProcesses(sortedProcesses)
        setFilteredProcesses(sortedProcesses)
      } catch (error) {
        console.error("Error fetching processes:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchProcesses()
  }, [user])

  useEffect(() => {
    const filtered = processes.filter(
      (process) =>
        process.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        process.description?.toLowerCase().includes(searchTerm.toLowerCase()),
    )
    setFilteredProcesses(filtered)
  }, [searchTerm, processes])

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
            <h1 className="text-3xl md:text-4xl font-serif font-bold">Meus Processos</h1>
          </div>
        </div>

        <div className="container mx-auto px-4 py-12">
          <Card>
            <CardHeader>
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                  <CardTitle className="font-serif">Todos os Processos</CardTitle>
                  <CardDescription>Gerencie e acompanhe seus projetos</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Search */}
              <div className="mb-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                  <Input
                    type="text"
                    placeholder="Buscar processos..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Processes List */}
              {loading ? (
                <div className="text-center py-12 text-muted-foreground">Carregando processos...</div>
              ) : filteredProcesses.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="mx-auto mb-4 text-muted-foreground" size={48} />
                  <p className="text-muted-foreground mb-4">
                    {searchTerm
                      ? "Nenhum processo encontrado."
                      : "Você ainda não possui processos. Os processos são criados pelo administrador."}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredProcesses.map((process) => (
                    <Link key={process.id} href={`/portal/processos/${process.id}`}>
                      <div className="flex flex-col md:flex-row items-start md:items-center justify-between p-6 rounded-lg border border-border hover:bg-secondary/50 transition-colors cursor-pointer gap-4">
                        <div className="flex items-start gap-4 flex-1">
                          <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <FileText className="text-primary" size={24} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-lg mb-1">{process.title}</h3>
                            {process.description && (
                              <p className="text-sm text-muted-foreground mb-2 line-clamp-2">{process.description}</p>
                            )}
                            <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                              <span>Criado: {new Date(process.createdAt).toLocaleDateString("pt-BR")}</span>
                              <span>Atualizado: {new Date(process.updatedAt).toLocaleDateString("pt-BR")}</span>
                            </div>
                          </div>
                        </div>
                        <span
                          className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${getStatusColor(process.status)}`}
                        >
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
      </main>

      <Footer />
    </div>
  )
}
