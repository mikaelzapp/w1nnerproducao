"use client"

import type React from "react"

import { ProtectedRoute } from "@/components/protected-route"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/lib/firebase/auth-context"
import { User, Calendar, ArrowLeft, Camera, Shield, Loader2, Check, X, DollarSign, CreditCard } from "lucide-react"
import Link from "next/link"
import { useState, useRef, useEffect } from "react"
import { updateProfile, updateEmail, updatePassword, sendEmailVerification } from "firebase/auth"
import { doc, getDoc, updateDoc, collection, query, where, getDocs } from "firebase/firestore"
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"
import { db, storage } from "@/lib/firebase/config"
import { useToast } from "@/hooks/use-toast"
import type { PaymentPlan } from "@/lib/asaas/types"

interface UserData {
  name: string
  email: string
  phone?: string
  photoURL?: string
  twoFactorEnabled?: boolean
}

export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <ProfileContent />
    </ProtectedRoute>
  )
}

function ProfileContent() {
  const { user } = useAuth()
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [userData, setUserData] = useState<UserData>({
    name: "",
    email: "",
    phone: "",
    photoURL: "",
    twoFactorEnabled: false,
  })
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const [changingPassword, setChangingPassword] = useState(false)
  const [passwordData, setPasswordData] = useState({
    newPassword: "",
    confirmPassword: "",
  })

  const [paymentPlans, setPaymentPlans] = useState<PaymentPlan[]>([])
  const [loadingPlans, setLoadingPlans] = useState(true)

  useEffect(() => {
    const loadUserData = async () => {
      if (!user) return

      try {
        const userDoc = await getDoc(doc(db, "users", user.uid))
        if (userDoc.exists()) {
          const data = userDoc.data()
          setUserData({
            name: data.name || user.displayName || "",
            email: user.email || "",
            phone: data.phone || "",
            photoURL: user.photoURL || data.photoURL || "",
            twoFactorEnabled: data.twoFactorEnabled || false,
          })
        } else {
          setUserData({
            name: user.displayName || "",
            email: user.email || "",
            phone: "",
            photoURL: user.photoURL || "",
            twoFactorEnabled: false,
          })
        }
      } catch (error) {
        console.error("Error loading user data:", error)
      }
    }

    loadUserData()
    loadPaymentPlans()
  }, [user])

  const loadPaymentPlans = async () => {
    if (!user) return

    setLoadingPlans(true)
    try {
      const q = query(collection(db, "payment_plans"), where("userId", "==", user.uid))
      const querySnapshot = await getDocs(q)
      const plans = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as PaymentPlan[]
      setPaymentPlans(plans)
    } catch (error: any) {
      console.error("Error loading payment plans:", error)
      // If it's a permissions error and there are no plans yet, just show empty state
      if (error.code === "permission-denied" || error.message?.includes("permission")) {
        setPaymentPlans([])
      } else {
        toast({
          title: "Erro",
          description: "Não foi possível carregar os planos de pagamento",
          variant: "destructive",
        })
      }
    } finally {
      setLoadingPlans(false)
    }
  }

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0] || !user) return

    const file = e.target.files[0]
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Erro",
        description: "Por favor, selecione uma imagem válida",
        variant: "destructive",
      })
      return
    }

    setUploadingPhoto(true)
    try {
      const storageRef = ref(storage, `profile-photos/${user.uid}/${file.name}`)
      await uploadBytes(storageRef, file)
      const photoURL = await getDownloadURL(storageRef)

      await updateProfile(user, { photoURL })
      await updateDoc(doc(db, "users", user.uid), { photoURL })

      setUserData((prev) => ({ ...prev, photoURL }))

      toast({
        title: "Sucesso",
        description: "Foto de perfil atualizada com sucesso",
      })
    } catch (error) {
      console.error("Error uploading photo:", error)
      toast({
        title: "Erro",
        description: "Erro ao fazer upload da foto",
        variant: "destructive",
      })
    } finally {
      setUploadingPhoto(false)
    }
  }

  const handleUpdateProfile = async () => {
    if (!user) return

    setLoading(true)
    try {
      await updateProfile(user, {
        displayName: userData.name,
      })

      if (userData.email !== user.email) {
        await updateEmail(user, userData.email)
      }

      await updateDoc(doc(db, "users", user.uid), {
        name: userData.name,
        phone: userData.phone,
      })

      setIsEditing(false)
      toast({
        title: "Sucesso",
        description: "Perfil atualizado com sucesso",
      })
    } catch (error: any) {
      console.error("Error updating profile:", error)
      toast({
        title: "Erro",
        description: error.message || "Erro ao atualizar perfil",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleChangePassword = async () => {
    if (!user) return

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: "Erro",
        description: "As senhas não coincidem",
        variant: "destructive",
      })
      return
    }

    if (passwordData.newPassword.length < 6) {
      toast({
        title: "Erro",
        description: "A senha deve ter pelo menos 6 caracteres",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      await updatePassword(user, passwordData.newPassword)
      setChangingPassword(false)
      setPasswordData({ newPassword: "", confirmPassword: "" })
      toast({
        title: "Sucesso",
        description: "Senha alterada com sucesso",
      })
    } catch (error: any) {
      console.error("Error changing password:", error)
      toast({
        title: "Erro",
        description: error.message || "Erro ao alterar senha. Você pode precisar fazer login novamente.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleToggle2FA = async () => {
    if (!user) return

    setLoading(true)
    try {
      const newValue = !userData.twoFactorEnabled

      if (newValue && !user.emailVerified) {
        await sendEmailVerification(user)
        toast({
          title: "Verificação necessária",
          description: "Um email de verificação foi enviado. Por favor, verifique seu email antes de ativar 2FA.",
        })
        setLoading(false)
        return
      }

      await updateDoc(doc(db, "users", user.uid), {
        twoFactorEnabled: newValue,
      })

      setUserData((prev) => ({ ...prev, twoFactorEnabled: newValue }))

      toast({
        title: "Sucesso",
        description: newValue ? "Autenticação de dois fatores ativada" : "Autenticação de dois fatores desativada",
      })
    } catch (error) {
      console.error("Error toggling 2FA:", error)
      toast({
        title: "Erro",
        description: "Erro ao atualizar configuração de 2FA",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
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

  const isInstallmentOverdue = (dueDate: string) => {
    return new Date(dueDate) < new Date() && new Date(dueDate).toDateString() !== new Date().toDateString()
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />

      <main className="flex-1 pt-20">
        <div className="bg-primary text-primary-foreground py-8 md:py-12">
          <div className="container mx-auto px-4">
            <Link
              href="/portal"
              className="inline-flex items-center text-primary-foreground/90 hover:text-primary-foreground mb-4 text-sm md:text-base"
            >
              <ArrowLeft className="mr-2" size={18} />
              Voltar ao Portal
            </Link>
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-serif font-bold">Meu Perfil</h1>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8 md:py-12">
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Profile Photo Card */}
            <Card>
              <CardHeader>
                <CardTitle className="font-serif text-lg md:text-xl">Foto de Perfil</CardTitle>
                <CardDescription className="text-sm">Personalize sua foto de perfil</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center gap-4">
                <div className="relative">
                  <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
                    {userData.photoURL ? (
                      <img
                        src={userData.photoURL || "/placeholder.svg"}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="text-primary" size={48} />
                    )}
                  </div>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingPhoto}
                    className="absolute bottom-0 right-0 w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 transition-colors disabled:opacity-50"
                  >
                    {uploadingPhoto ? <Loader2 className="animate-spin" size={20} /> : <Camera size={20} />}
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                </div>
                <p className="text-xs md:text-sm text-muted-foreground text-center px-4">
                  Clique no ícone da câmera para alterar sua foto
                </p>
              </CardContent>
            </Card>

            {/* Personal Information Card */}
            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <CardTitle className="font-serif text-lg md:text-xl">Informações Pessoais</CardTitle>
                    <CardDescription className="text-sm">Gerencie seus dados pessoais</CardDescription>
                  </div>
                  {!isEditing ? (
                    <Button onClick={() => setIsEditing(true)} variant="outline" className="w-full sm:w-auto">
                      Editar
                    </Button>
                  ) : (
                    <div className="flex gap-2">
                      <Button
                        onClick={() => setIsEditing(false)}
                        variant="outline"
                        size="sm"
                        className="flex-1 sm:flex-none"
                      >
                        <X size={16} className="sm:mr-0" />
                        <span className="sm:hidden ml-2">Cancelar</span>
                      </Button>
                      <Button
                        onClick={handleUpdateProfile}
                        disabled={loading}
                        size="sm"
                        className="flex-1 sm:flex-none"
                      >
                        {loading ? <Loader2 className="animate-spin" size={16} /> : <Check size={16} />}
                        <span className="sm:hidden ml-2">Salvar</span>
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm">
                    Nome Completo
                  </Label>
                  <Input
                    id="name"
                    value={userData.name}
                    onChange={(e) => setUserData((prev) => ({ ...prev, name: e.target.value }))}
                    disabled={!isEditing}
                    className="text-sm md:text-base"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={userData.email}
                    onChange={(e) => setUserData((prev) => ({ ...prev, email: e.target.value }))}
                    disabled={!isEditing}
                    className="text-sm md:text-base"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-sm">
                    Telefone
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={userData.phone}
                    onChange={(e) => setUserData((prev) => ({ ...prev, phone: e.target.value }))}
                    disabled={!isEditing}
                    placeholder="(00) 00000-0000"
                    className="text-sm md:text-base"
                  />
                </div>

                <div className="flex items-center gap-3 md:gap-4 p-3 md:p-4 rounded-lg bg-secondary/30">
                  <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Calendar className="text-primary" size={20} />
                  </div>
                  <div>
                    <p className="text-xs md:text-sm text-muted-foreground">Membro desde</p>
                    <p className="text-sm md:text-base font-medium">
                      {user?.metadata.creationTime
                        ? new Date(user.metadata.creationTime).toLocaleDateString("pt-BR")
                        : "Não disponível"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="font-serif text-lg md:text-xl flex items-center gap-2">
                  <DollarSign className="text-primary" size={24} />
                  Minhas Parcelas
                </CardTitle>
                <CardDescription className="text-sm">Acompanhe seus planos de pagamento e parcelas</CardDescription>
              </CardHeader>
              <CardContent>
                {loadingPlans ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="animate-spin text-primary" size={32} />
                  </div>
                ) : paymentPlans.length === 0 ? (
                  <div className="text-center py-8">
                    <CreditCard className="mx-auto mb-4 text-muted-foreground" size={48} />
                    <p className="text-muted-foreground">Você não possui planos de pagamento ativos</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {paymentPlans.map((plan) => (
                      <div key={plan.id} className="space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b">
                          <div>
                            <h3 className="font-semibold text-base md:text-lg">{plan.description}</h3>
                            <p className="text-sm text-muted-foreground">
                              {plan.installmentCount}x de R$ {plan.installmentValue.toFixed(2)} -{" "}
                              {getBillingTypeLabel(plan.billingType)}
                            </p>
                          </div>
                          {getStatusBadge(plan.status)}
                        </div>

                        <div className="space-y-2">
                          {plan.installments.map((installment) => {
                            const isOverdue =
                              installment.status === "pending" && isInstallmentOverdue(installment.dueDate)
                            return (
                              <div
                                key={installment.installmentNumber}
                                className={`p-4 rounded-lg border ${
                                  isOverdue
                                    ? "border-destructive/50 bg-destructive/5"
                                    : installment.status === "paid"
                                      ? "border-green-500/50 bg-green-500/5"
                                      : "border-border"
                                }`}
                              >
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                      <p className="font-medium">Parcela {installment.installmentNumber}</p>
                                      {getStatusBadge(isOverdue ? "overdue" : installment.status)}
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                      Vencimento: {new Date(installment.dueDate).toLocaleDateString("pt-BR")}
                                    </p>
                                    {installment.paidAt && (
                                      <p className="text-sm text-green-600 dark:text-green-400">
                                        Pago em: {new Date(installment.paidAt).toLocaleDateString("pt-BR")}
                                      </p>
                                    )}
                                  </div>
                                  <div className="text-left sm:text-right">
                                    <p className="text-lg font-bold">R$ {installment.value.toFixed(2)}</p>
                                    {installment.status === "pending" && (
                                      <Button size="sm" variant="outline" className="mt-2 bg-transparent">
                                        Ver Boleto
                                      </Button>
                                    )}
                                  </div>
                                </div>
                              </div>
                            )
                          })}
                        </div>

                        <div className="p-4 bg-secondary/30 rounded-lg">
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <p className="text-muted-foreground">Valor Total</p>
                              <p className="font-semibold">R$ {plan.totalValue.toFixed(2)}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Parcelas Pagas</p>
                              <p className="font-semibold">
                                {plan.installments.filter((i) => i.status === "paid").length} / {plan.installmentCount}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Security Card */}
            <Card>
              <CardHeader>
                <CardTitle className="font-serif text-lg md:text-xl">Segurança</CardTitle>
                <CardDescription className="text-sm">Gerencie suas configurações de segurança</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Change Password */}
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                      <h3 className="text-sm md:text-base font-medium">Alterar Senha</h3>
                      <p className="text-xs md:text-sm text-muted-foreground">Atualize sua senha regularmente</p>
                    </div>
                    {!changingPassword && (
                      <Button onClick={() => setChangingPassword(true)} variant="outline" className="w-full sm:w-auto">
                        Alterar
                      </Button>
                    )}
                  </div>

                  {changingPassword && (
                    <div className="space-y-4 p-3 md:p-4 border rounded-lg">
                      <div className="space-y-2">
                        <Label htmlFor="newPassword" className="text-sm">
                          Nova Senha
                        </Label>
                        <Input
                          id="newPassword"
                          type="password"
                          value={passwordData.newPassword}
                          onChange={(e) => setPasswordData((prev) => ({ ...prev, newPassword: e.target.value }))}
                          placeholder="Mínimo 6 caracteres"
                          className="text-sm md:text-base"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="confirmPassword" className="text-sm">
                          Confirmar Nova Senha
                        </Label>
                        <Input
                          id="confirmPassword"
                          type="password"
                          value={passwordData.confirmPassword}
                          onChange={(e) => setPasswordData((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                          placeholder="Digite a senha novamente"
                          className="text-sm md:text-base"
                        />
                      </div>

                      <div className="flex flex-col sm:flex-row gap-2">
                        <Button onClick={() => setChangingPassword(false)} variant="outline" className="flex-1">
                          Cancelar
                        </Button>
                        <Button onClick={handleChangePassword} disabled={loading} className="flex-1">
                          {loading ? <Loader2 className="animate-spin mr-2" size={16} /> : null}
                          Salvar
                        </Button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Two-Factor Authentication */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-3 md:p-4 border rounded-lg">
                  <div className="flex items-center gap-3 md:gap-4">
                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Shield className="text-primary" size={20} />
                    </div>
                    <div>
                      <h3 className="text-sm md:text-base font-medium">Autenticação de Dois Fatores</h3>
                      <p className="text-xs md:text-sm text-muted-foreground">
                        {userData.twoFactorEnabled ? "Ativada" : "Adicione uma camada extra de segurança"}
                      </p>
                    </div>
                  </div>
                  <Button
                    onClick={handleToggle2FA}
                    disabled={loading}
                    variant={userData.twoFactorEnabled ? "destructive" : "default"}
                    className="w-full sm:w-auto"
                  >
                    {loading ? (
                      <Loader2 className="animate-spin" size={16} />
                    ) : userData.twoFactorEnabled ? (
                      "Desativar"
                    ) : (
                      "Ativar"
                    )}
                  </Button>
                </div>

                {/* Email Verification Status */}
                {user && !user.emailVerified && (
                  <div className="p-3 md:p-4 border border-yellow-500/50 bg-yellow-500/10 rounded-lg">
                    <p className="text-xs md:text-sm text-yellow-700 dark:text-yellow-400">
                      Seu email ainda não foi verificado. Verifique sua caixa de entrada para ativar recursos de
                      segurança adicionais.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
