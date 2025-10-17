"use client"

import { useEffect, useState } from "react"
import { AdminRoute } from "@/components/admin-route"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { db } from "@/lib/firebase/config"
import { collection, getDocs, query, orderBy } from "firebase/firestore"
import { Users, FileText, BookOpen, TrendingUp, AlertTriangle, ExternalLink, Download, DollarSign } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { exportToCSV, exportToPDF, exportToJSON, formatDateForExport, formatStatusForExport } from "@/lib/export-utils"

export default function AdminPage() {
  return (
    <AdminRoute>
      <AdminContent />
    </AdminRoute>
  )
}

function AdminContent() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProcesses: 0,
    totalPosts: 0,
    pendingProcesses: 0,
  })
  const [loading, setLoading] = useState(true)
  const [permissionError, setPermissionError] = useState(false)
  const [exporting, setExporting] = useState(false)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const usersSnapshot = await getDocs(collection(db, "users"))
        const processesSnapshot = await getDocs(collection(db, "processes"))
        const postsSnapshot = await getDocs(collection(db, "blog_posts"))

        const pendingProcesses = processesSnapshot.docs.filter((doc) => doc.data().status === "pendente").length

        setStats({
          totalUsers: usersSnapshot.size,
          totalProcesses: processesSnapshot.size,
          totalPosts: postsSnapshot.size,
          pendingProcesses,
        })
        setPermissionError(false)
      } catch (error: any) {
        console.error("Error fetching stats:", error)
        if (error?.code === "permission-denied" || error?.message?.includes("permission")) {
          setPermissionError(true)
        }
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  const handleExportProcesses = async (format: "csv" | "pdf") => {
    setExporting(true)
    try {
      const processesSnapshot = await getDocs(query(collection(db, "processes"), orderBy("createdAt", "desc")))
      const usersSnapshot = await getDocs(collection(db, "users"))

      // Create user map for quick lookup
      const userMap = new Map()
      usersSnapshot.docs.forEach((doc) => {
        userMap.set(doc.id, doc.data())
      })

      const headers = [
        "ID",
        "Título",
        "Usuário",
        "Email",
        "Status",
        "Progresso",
        "Data de Criação",
        "Última Atualização",
      ]
      const rows = processesSnapshot.docs.map((doc) => {
        const data = doc.data()
        const user = userMap.get(data.userId)
        return [
          doc.id,
          data.title || "",
          user?.name || "N/A",
          user?.email || "N/A",
          formatStatusForExport(data.status),
          `${data.progress || 0}%`,
          formatDateForExport(data.createdAt),
          formatDateForExport(data.updatedAt),
        ]
      })

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
      alert("Erro ao exportar processos. Verifique as permissões do Firebase.")
    } finally {
      setExporting(false)
    }
  }

  const handleExportUsers = async (format: "csv" | "pdf") => {
    setExporting(true)
    try {
      const usersSnapshot = await getDocs(collection(db, "users"))
      const processesSnapshot = await getDocs(collection(db, "processes"))

      // Count processes per user
      const processCount = new Map()
      processesSnapshot.docs.forEach((doc) => {
        const userId = doc.data().userId
        processCount.set(userId, (processCount.get(userId) || 0) + 1)
      })

      const headers = ["ID", "Nome", "Email", "Telefone", "Total de Processos", "Data de Cadastro"]
      const rows = usersSnapshot.docs.map((doc) => {
        const data = doc.data()
        return [
          doc.id,
          data.name || "",
          data.email || "",
          data.phone || "",
          processCount.get(doc.id) || 0,
          formatDateForExport(data.createdAt),
        ]
      })

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
      alert("Erro ao exportar usuários. Verifique as permissões do Firebase.")
    } finally {
      setExporting(false)
    }
  }

  const handleExportActivityLogs = async (format: "csv" | "pdf") => {
    setExporting(true)
    try {
      const logsSnapshot = await getDocs(query(collection(db, "activity_logs"), orderBy("timestamp", "desc")))

      const headers = ["Data/Hora", "Ação", "Detalhes", "Admin ID"]
      const rows = logsSnapshot.docs.map((doc) => {
        const data = doc.data()
        return [formatDateForExport(data.timestamp), data.action || "", data.details || "", data.adminId || ""]
      })

      const exportData = {
        headers,
        rows,
        filename: `logs_atividade_${new Date().toISOString().split("T")[0]}`,
        title: "Logs de Atividade - W1nner Engenharia",
      }

      if (format === "csv") {
        exportToCSV(exportData)
      } else {
        exportToPDF(exportData)
      }
    } catch (error) {
      console.error("Error exporting activity logs:", error)
      alert("Erro ao exportar logs. Verifique as permissões do Firebase.")
    } finally {
      setExporting(false)
    }
  }

  const handleExportAllData = async () => {
    setExporting(true)
    try {
      const [usersSnapshot, processesSnapshot, postsSnapshot, logsSnapshot] = await Promise.all([
        getDocs(collection(db, "users")),
        getDocs(collection(db, "processes")),
        getDocs(collection(db, "blog_posts")),
        getDocs(query(collection(db, "activity_logs"), orderBy("timestamp", "desc"))),
      ])

      const allData = {
        exportDate: new Date().toISOString(),
        users: usersSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })),
        processes: processesSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })),
        blogPosts: postsSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })),
        activityLogs: logsSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })),
      }

      exportToJSON(allData, `backup_completo_${new Date().toISOString().split("T")[0]}`)
    } catch (error) {
      console.error("Error exporting all data:", error)
      alert("Erro ao exportar dados. Verifique as permissões do Firebase.")
    } finally {
      setExporting(false)
    }
  }

  const statCards = [
    {
      title: "Usuários",
      value: stats.totalUsers,
      icon: Users,
      href: "/admin/usuarios",
      color: "text-blue-600",
      bgColor: "bg-blue-50 dark:bg-blue-950",
    },
    {
      title: "Processos",
      value: stats.totalProcesses,
      icon: FileText,
      href: "/admin/processos",
      color: "text-green-600",
      bgColor: "bg-green-50 dark:bg-green-950",
    },
    {
      title: "Posts do Blog",
      value: stats.totalPosts,
      icon: BookOpen,
      href: "/admin/blog",
      color: "text-purple-600",
      bgColor: "bg-purple-50 dark:bg-purple-950",
    },
    {
      title: "Processos Pendentes",
      value: stats.pendingProcesses,
      icon: TrendingUp,
      href: "/admin/processos",
      color: "text-yellow-600",
      bgColor: "bg-yellow-50 dark:bg-yellow-950",
    },
  ]

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />

      <main className="flex-1 pt-20">
        <div className="bg-primary text-primary-foreground py-12">
          <div className="container mx-auto px-4">
            <h1 className="text-3xl md:text-4xl font-serif font-bold">Painel Administrativo</h1>
            <p className="text-primary-foreground/90 mt-2">Gerencie usuários, processos e conteúdo</p>
          </div>
        </div>

        <div className="container mx-auto px-4 py-12">
          {permissionError && (
            <Alert variant="destructive" className="mb-8">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Configuração do Firebase Necessária</AlertTitle>
              <AlertDescription className="mt-2 space-y-3">
                <p>
                  As regras de segurança do Firestore precisam ser configuradas no Console do Firebase para que o painel
                  administrativo funcione corretamente.
                </p>
                <div className="bg-destructive/10 p-4 rounded-md">
                  <p className="font-semibold mb-2">Passos para configurar:</p>
                  <ol className="list-decimal list-inside space-y-1 text-sm">
                    <li>Acesse o Console do Firebase</li>
                    <li>Vá para Firestore Database → Regras</li>
                    <li>Cole as regras do arquivo FIREBASE_SETUP.md</li>
                    <li>Clique em Publicar</li>
                  </ol>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" asChild>
                    <a
                      href="https://console.firebase.google.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2"
                    >
                      Abrir Console do Firebase
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
                    Recarregar Página
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {!permissionError && (
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="font-serif flex items-center gap-2">
                  <Download className="h-5 w-5" />
                  Exportar Dados
                </CardTitle>
                <CardDescription>Exporte relatórios e dados do sistema em diferentes formatos</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm">Processos</h4>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleExportProcesses("csv")}
                        disabled={exporting}
                      >
                        CSV
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleExportProcesses("pdf")}
                        disabled={exporting}
                      >
                        PDF
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm">Usuários</h4>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => handleExportUsers("csv")} disabled={exporting}>
                        CSV
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleExportUsers("pdf")} disabled={exporting}>
                        PDF
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm">Logs de Atividade</h4>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleExportActivityLogs("csv")}
                        disabled={exporting}
                      >
                        CSV
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleExportActivityLogs("pdf")}
                        disabled={exporting}
                      >
                        PDF
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm">Backup Completo</h4>
                    <Button size="sm" variant="outline" onClick={handleExportAllData} disabled={exporting}>
                      JSON
                    </Button>
                  </div>
                </div>
                {exporting && <p className="text-sm text-muted-foreground mt-4">Exportando dados...</p>}
              </CardContent>
            </Card>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {statCards.map((stat, index) => {
              const Icon = stat.icon
              return (
                <Link key={index} href={stat.href}>
                  <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer border-border">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className={`w-12 h-12 rounded-lg ${stat.bgColor} flex items-center justify-center`}>
                          <Icon className={stat.color} size={24} />
                        </div>
                        <div className={`text-3xl font-bold ${stat.color}`}>
                          {loading ? "..." : permissionError ? "-" : stat.value}
                        </div>
                      </div>
                      <h3 className="font-semibold text-muted-foreground">{stat.title}</h3>
                    </CardContent>
                  </Card>
                </Link>
              )
            })}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
            <Link href="/admin/processos">
              <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer border-border">
                <CardHeader>
                  <CardTitle className="font-serif">Gerenciar Processos</CardTitle>
                  <CardDescription>Visualize e atualize o status dos processos</CardDescription>
                </CardHeader>
              </Card>
            </Link>

            <Link href="/admin/blog">
              <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer border-border">
                <CardHeader>
                  <CardTitle className="font-serif">Gerenciar Blog</CardTitle>
                  <CardDescription>Crie e edite posts do blog</CardDescription>
                </CardHeader>
              </Card>
            </Link>

            <Link href="/admin/usuarios">
              <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer border-border">
                <CardHeader>
                  <CardTitle className="font-serif">Gerenciar Usuários</CardTitle>
                  <CardDescription>Visualize informações dos usuários</CardDescription>
                </CardHeader>
              </Card>
            </Link>

            <Link href="/admin/faturamento">
              <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer border-border bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950">
                <CardHeader>
                  <CardTitle className="font-serif flex items-center gap-2">
                    <DollarSign className="text-green-600" size={20} />
                    Faturamento
                  </CardTitle>
                  <CardDescription>Gerencie planos e parcelas de pagamento</CardDescription>
                </CardHeader>
              </Card>
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
