"use client"

import { useState, useEffect } from "react"
import { AdminRoute } from "@/components/admin-route"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/lib/firebase/auth-context"
import { db } from "@/lib/firebase/config"
import { collection, getDocs, addDoc, doc, updateDoc, query, orderBy } from "firebase/firestore"
import { ArrowLeft, Plus, DollarSign, Calendar, User, CreditCard, Loader2, Eye, Trash2 } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"
import type { PaymentPlan, PaymentInstallment } from "@/lib/asaas/types"

interface UserOption {
  id: string
  name: string
  email: string
}

export default function BillingPage() {
  return (
    <AdminRoute>
      <BillingContent />
    </AdminRoute>
  )
}

function BillingContent() {
  const { user } = useAuth()
  const { toast } = useToast()

  const [users, setUsers] = useState<UserOption[]>([])
  const [paymentPlans, setPaymentPlans] = useState<PaymentPlan[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<PaymentPlan | null>(null)

  const [formData, setFormData] = useState({
    userId: "",
    totalValue: "",
    installmentCount: "1",
    description: "",
    billingType: "BOLETO" as "BOLETO" | "CREDIT_CARD" | "PIX",
    startDate: new Date().toISOString().split("T")[0],
  })

  useEffect(() => {
    fetchUsers()
    fetchPaymentPlans()
  }, [])

  const fetchUsers = async () => {
    try {
      const usersSnapshot = await getDocs(collection(db, "users"))
      const usersData = usersSnapshot.docs.map((doc) => ({
        id: doc.id,
        name: doc.data().name || "",
        email: doc.data().email || "",
      }))
      setUsers(usersData)
    } catch (error) {
      console.error("Error fetching users:", error)
      toast({
        title: "Erro",
        description: "Erro ao carregar usuários",
        variant: "destructive",
      })
    }
  }

  const fetchPaymentPlans = async () => {
    try {
      const plansQuery = query(collection(db, "payment_plans"), orderBy("createdAt", "desc"))
      const plansSnapshot = await getDocs(plansQuery)

      const plansData = plansSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as PaymentPlan[]

      setPaymentPlans(plansData)
    } catch (error: any) {
      console.error("Error fetching payment plans:", error)

      // If collection doesn't exist yet, just set empty array
      if (error.code === "permission-denied" || error.message?.includes("permission")) {
        console.log("Payment plans collection may not exist yet or no permissions. Starting with empty list.")
        setPaymentPlans([])
      } else {
        toast({
          title: "Erro",
          description: "Erro ao carregar planos de pagamento",
          variant: "destructive",
        })
      }
    } finally {
      setLoading(false)
    }
  }

  const handleCreatePlan = async () => {
    if (!formData.userId || !formData.totalValue || !formData.description) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive",
      })
      return
    }

    setCreating(true)
    try {
      const selectedUser = users.find((u) => u.id === formData.userId)
      if (!selectedUser) {
        throw new Error("Usuário não encontrado")
      }

      const totalValue = Number.parseFloat(formData.totalValue)
      const installmentCount = Number.parseInt(formData.installmentCount)
      const installmentValue = totalValue / installmentCount

      // Generate installments
      const installments: PaymentInstallment[] = []
      const startDate = new Date(formData.startDate)

      for (let i = 0; i < installmentCount; i++) {
        const dueDate = new Date(startDate)
        dueDate.setMonth(dueDate.getMonth() + i)

        installments.push({
          installmentNumber: i + 1,
          value: installmentValue,
          dueDate: dueDate.toISOString().split("T")[0],
          status: "pending",
        })
      }

      const paymentPlan: Omit<PaymentPlan, "id"> = {
        userId: formData.userId,
        userName: selectedUser.name,
        userEmail: selectedUser.email,
        totalValue,
        installmentCount,
        installmentValue,
        description: formData.description,
        billingType: formData.billingType,
        startDate: formData.startDate,
        status: "active",
        installments,
        createdAt: new Date().toISOString(),
        createdBy: user?.uid || "admin",
      }

      // Save to Firestore
      await addDoc(collection(db, "payment_plans"), paymentPlan)

      toast({
        title: "Sucesso",
        description: "Plano de pagamento criado com sucesso",
      })

      // Reset form
      setFormData({
        userId: "",
        totalValue: "",
        installmentCount: "1",
        description: "",
        billingType: "BOLETO",
        startDate: new Date().toISOString().split("T")[0],
      })
      setShowCreateDialog(false)
      fetchPaymentPlans()
    } catch (error: any) {
      console.error("Error creating payment plan:", error)
      toast({
        title: "Erro",
        description: error.message || "Erro ao criar plano de pagamento",
        variant: "destructive",
      })
    } finally {
      setCreating(false)
    }
  }

  const handleDeletePlan = async (planId: string) => {
    if (!confirm("Tem certeza que deseja excluir este plano de pagamento?")) {
      return
    }

    try {
      await updateDoc(doc(db, "payment_plans", planId), {
        status: "cancelled",
      })

      toast({
        title: "Sucesso",
        description: "Plano de pagamento cancelado",
      })

      fetchPaymentPlans()
    } catch (error) {
      console.error("Error deleting plan:", error)
      toast({
        title: "Erro",
        description: "Erro ao cancelar plano",
        variant: "destructive",
      })
    }
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      active: "default",
      completed: "secondary",
      cancelled: "destructive",
      pending: "outline",
      paid: "default",
      overdue: "destructive",
    }

    const labels: Record<string, string> = {
      active: "Ativo",
      completed: "Concluído",
      cancelled: "Cancelado",
      pending: "Pendente",
      paid: "Pago",
      overdue: "Vencido",
    }

    return <Badge variant={variants[status] || "outline"}>{labels[status] || status}</Badge>
  }

  const getBillingTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      BOLETO: "Boleto",
      CREDIT_CARD: "Cartão de Crédito",
      PIX: "PIX",
    }
    return labels[type] || type
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
            <h1 className="text-3xl md:text-4xl font-serif font-bold">Gestão de Faturamento</h1>
            <p className="text-primary-foreground/90 mt-2">Crie e gerencie planos de pagamento para clientes</p>
          </div>
        </div>

        <div className="container mx-auto px-4 py-12">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total de Planos</p>
                    <p className="text-2xl font-bold">{paymentPlans.length}</p>
                  </div>
                  <DollarSign className="text-primary" size={32} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Planos Ativos</p>
                    <p className="text-2xl font-bold">{paymentPlans.filter((p) => p.status === "active").length}</p>
                  </div>
                  <CreditCard className="text-green-600" size={32} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Valor Total</p>
                    <p className="text-2xl font-bold">
                      R$ {paymentPlans.reduce((sum, p) => sum + p.totalValue, 0).toFixed(2)}
                    </p>
                  </div>
                  <DollarSign className="text-blue-600" size={32} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Clientes</p>
                    <p className="text-2xl font-bold">{new Set(paymentPlans.map((p) => p.userId)).size}</p>
                  </div>
                  <User className="text-purple-600" size={32} />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Create Button */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-serif font-bold">Planos de Pagamento</h2>
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="mr-2" size={18} />
              Criar Plano
            </Button>
          </div>

          {/* Payment Plans List */}
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="animate-spin text-primary" size={48} />
            </div>
          ) : paymentPlans.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <DollarSign className="mx-auto mb-4 text-muted-foreground" size={48} />
                <h3 className="text-xl font-semibold mb-2">Nenhum plano criado</h3>
                <p className="text-muted-foreground mb-4">Crie o primeiro plano de pagamento para seus clientes</p>
                <Button onClick={() => setShowCreateDialog(true)}>
                  <Plus className="mr-2" size={18} />
                  Criar Primeiro Plano
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {paymentPlans.map((plan) => (
                <Card key={plan.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold">{plan.description}</h3>
                          {getStatusBadge(plan.status)}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <User size={16} />
                            <span>
                              {plan.userName} ({plan.userEmail})
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <DollarSign size={16} />
                            <span>
                              R$ {plan.totalValue.toFixed(2)} em {plan.installmentCount}x de R${" "}
                              {plan.installmentValue.toFixed(2)}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <CreditCard size={16} />
                            <span>{getBillingTypeLabel(plan.billingType)}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar size={16} />
                            <span>Início: {new Date(plan.startDate).toLocaleDateString("pt-BR")}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => setSelectedPlan(plan)}>
                          <Eye className="mr-2" size={16} />
                          Ver Parcelas
                        </Button>
                        {plan.status === "active" && (
                          <Button variant="destructive" size="sm" onClick={() => handleDeletePlan(plan.id!)}>
                            <Trash2 size={16} />
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Create Plan Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-serif">Criar Plano de Pagamento</DialogTitle>
            <DialogDescription>Crie um novo plano de pagamento parcelado para um cliente</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="user">Cliente *</Label>
              <Select value={formData.userId} onValueChange={(value) => setFormData({ ...formData, userId: value })}>
                <SelectTrigger id="user">
                  <SelectValue placeholder="Selecione um cliente" />
                </SelectTrigger>
                <SelectContent>
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.name} ({user.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descrição *</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Ex: Projeto de Topografia - Lote 123"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="totalValue">Valor Total (R$) *</Label>
                <Input
                  id="totalValue"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.totalValue}
                  onChange={(e) => setFormData({ ...formData, totalValue: e.target.value })}
                  placeholder="0.00"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="installmentCount">Número de Parcelas *</Label>
                <Select
                  value={formData.installmentCount}
                  onValueChange={(value) => setFormData({ ...formData, installmentCount: value })}
                >
                  <SelectTrigger id="installmentCount">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 12 }, (_, i) => i + 1).map((num) => (
                      <SelectItem key={num} value={num.toString()}>
                        {num}x
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {formData.totalValue && formData.installmentCount && (
              <div className="p-4 bg-secondary/30 rounded-lg">
                <p className="text-sm font-medium">
                  Valor por parcela: R${" "}
                  {(Number.parseFloat(formData.totalValue) / Number.parseInt(formData.installmentCount)).toFixed(2)}
                </p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="billingType">Forma de Pagamento *</Label>
                <Select
                  value={formData.billingType}
                  onValueChange={(value: any) => setFormData({ ...formData, billingType: value })}
                >
                  <SelectTrigger id="billingType">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BOLETO">Boleto</SelectItem>
                    <SelectItem value="PIX">PIX</SelectItem>
                    <SelectItem value="CREDIT_CARD">Cartão de Crédito</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="startDate">Data de Início *</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowCreateDialog(false)} disabled={creating}>
              Cancelar
            </Button>
            <Button onClick={handleCreatePlan} disabled={creating}>
              {creating ? <Loader2 className="animate-spin mr-2" size={16} /> : null}
              Criar Plano
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Installments Dialog */}
      <Dialog open={!!selectedPlan} onOpenChange={() => setSelectedPlan(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-serif">Parcelas do Plano</DialogTitle>
            <DialogDescription>{selectedPlan?.description}</DialogDescription>
          </DialogHeader>

          {selectedPlan && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4 p-4 bg-secondary/30 rounded-lg">
                <div>
                  <p className="text-sm text-muted-foreground">Cliente</p>
                  <p className="font-medium">{selectedPlan.userName}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Valor Total</p>
                  <p className="font-medium">R$ {selectedPlan.totalValue.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Parcelas</p>
                  <p className="font-medium">
                    {selectedPlan.installmentCount}x de R$ {selectedPlan.installmentValue.toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <div className="mt-1">{getStatusBadge(selectedPlan.status)}</div>
                </div>
              </div>

              <div className="space-y-2">
                {selectedPlan.installments.map((installment) => (
                  <Card key={installment.installmentNumber}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Parcela {installment.installmentNumber}</p>
                          <p className="text-sm text-muted-foreground">
                            Vencimento: {new Date(installment.dueDate).toLocaleDateString("pt-BR")}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">R$ {installment.value.toFixed(2)}</p>
                          {getStatusBadge(installment.status)}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  )
}
