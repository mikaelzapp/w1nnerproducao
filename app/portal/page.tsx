"use client"

import { ProtectedRoute } from "@/components/protected-route"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/lib/firebase/auth-context"
import { signOut } from "firebase/auth"
import { auth, db } from "@/lib/firebase/config"
import { useRouter } from "next/navigation"
import { FileText, Upload, LogOut, User } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"
import { collection, query, where, getDocs } from "firebase/firestore"

interface Process {
  id: string
  title: string
  status: string
  createdAt: string
  updatedAt: string
}

export default function PortalPage() {
  return (
    <ProtectedRoute>
      <PortalContent />
    </ProtectedRoute>
  )
}

function PortalContent() {
  const { user } = useAuth()
  const router = useRouter()
  const [processes, setProcesses] = useState<Process[]>([])
  const [loading, setLoading] = useState(true)

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

        processesData.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

        setProcesses(processesData)
      } catch (error) {
        console.error("Error fetching processes:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchProcesses()
  }, [user])

  const handleLogout = async () => {
    await signOut(auth)
    router.push("/")
  }

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
        {/* Header */}
        <div className="bg-primary text-primary-foreground py-12">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl md:text-4xl font-serif font-bold mb-2">Portal do Cliente</h1>
                <p className="text-primary-foreground/90">Bem-vindo, {user?.displayName || user?.email}</p>
              </div>
              <Button
                variant="secondary"
                onClick={handleLogout}
                className="bg-background text-foreground hover:bg-background/90"
              >
                <LogOut className="mr-2" size={18} />
                Sair
              </Button>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <Link href="/portal/upload">
              <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer border-border">
                <CardContent className="p-6 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Upload className="text-primary" size={24} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">Enviar Documentos</h3>
                    <p className="text-sm text-muted-foreground">Envie documentos das tarefas</p>
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link href="/portal/processos">
              <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer border-border">
                <CardContent className="p-6 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <FileText className="text-primary" size={24} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">Meus Processos</h3>
                    <p className="text-sm text-muted-foreground">Acompanhe seus projetos</p>
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link href="/portal/perfil">
              <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer border-border">
                <CardContent className="p-6 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <User className="text-primary" size={24} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">Meu Perfil</h3>
                    <p className="text-sm text-muted-foreground">Gerenciar conta</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>

          {/* Recent Processes */}
          <Card>
            <CardHeader>
              <CardTitle className="font-serif">Processos Recentes</CardTitle>
              <CardDescription>Acompanhe o status dos seus projetos</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8 text-muted-foreground">Carregando...</div>
              ) : processes.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="mx-auto mb-4 text-muted-foreground" size={48} />
                  <p className="text-muted-foreground mb-4">
                    Você ainda não possui processos. Os processos são criados pelo administrador.
                  </p>
                  <Link href="/portal/upload">
                    <Button className="bg-primary text-primary-foreground">
                      <Upload className="mr-2" size={18} />
                      Ver Tarefas Pendentes
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {processes.slice(0, 5).map((process) => (
                    <Link key={process.id} href={`/portal/processos/${process.id}`}>
                      <div className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-secondary/50 transition-colors cursor-pointer">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                            <FileText className="text-primary" size={20} />
                          </div>
                          <div>
                            <h4 className="font-medium">{process.title}</h4>
                            <p className="text-sm text-muted-foreground">
                              Criado em {new Date(process.createdAt).toLocaleDateString("pt-BR")}
                            </p>
                          </div>
                        </div>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(process.status)}`}
                        >
                          {getStatusLabel(process.status)}
                        </span>
                      </div>
                    </Link>
                  ))}
                  {processes.length > 5 && (
                    <Link href="/portal/processos">
                      <Button variant="outline" className="w-full bg-transparent">
                        Ver Todos os Processos
                      </Button>
                    </Link>
                  )}
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
