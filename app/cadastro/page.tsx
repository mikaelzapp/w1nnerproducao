"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  createUserWithEmailAndPassword,
  updateProfile,
  sendEmailVerification,
  RecaptchaVerifier,
  signInWithPhoneNumber,
} from "firebase/auth"
import { doc, setDoc } from "firebase/firestore"
import { auth, db } from "@/lib/firebase/config"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, CheckCircle2 } from "lucide-react"
import {
  validateCPF,
  formatCPF,
  validateBrazilianPhone,
  formatBrazilianPhone,
  phoneToE164,
} from "@/lib/utils/validators"

export default function SignupPage() {
  const router = useRouter()
  const [step, setStep] = useState(1) // 1: Form, 2: Email verification, 3: Phone verification
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [cpf, setCpf] = useState("")
  const [phone, setPhone] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [verificationCode, setVerificationCode] = useState("")
  const [acceptedTerms, setAcceptedTerms] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [emailSent, setEmailSent] = useState(false)
  const [confirmationResult, setConfirmationResult] = useState<any>(null)

  const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCPF(e.target.value)
    setCpf(formatted)
  }

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatBrazilianPhone(e.target.value)
    setPhone(formatted)
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    // Validate all fields
    if (!name || !email || !cpf || !phone || !password || !confirmPassword) {
      setError("Todos os campos são obrigatórios.")
      return
    }

    if (!acceptedTerms) {
      setError("Você deve aceitar os Termos de Uso e Política de Privacidade para continuar.")
      return
    }

    if (password !== confirmPassword) {
      setError("As senhas não coincidem.")
      return
    }

    if (password.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres.")
      return
    }

    if (!validateCPF(cpf)) {
      setError("CPF inválido.")
      return
    }

    if (!validateBrazilianPhone(phone)) {
      setError("Telefone inválido. Use o formato (XX) XXXXX-XXXX")
      return
    }

    setLoading(true)

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      await updateProfile(userCredential.user, { displayName: name })

      await setDoc(doc(db, "users", userCredential.user.uid), {
        name,
        email,
        cpf: cpf.replace(/[^\d]/g, ""), // Store only numbers
        phone: phone.replace(/[^\d]/g, ""), // Store only numbers
        emailVerified: false,
        phoneVerified: false,
        createdAt: new Date().toISOString(),
        role: "user",
        termsAcceptedAt: new Date().toISOString(),
        privacyAcceptedAt: new Date().toISOString(),
      })

      await sendEmailVerification(userCredential.user)
      setEmailSent(true)
      setStep(2)
    } catch (err: any) {
      if (err.code === "auth/email-already-in-use") {
        setError("Este email já está em uso.")
      } else if (err.code === "auth/invalid-email") {
        setError("Email inválido.")
      } else {
        setError("Erro ao criar conta. Por favor, tente novamente.")
        console.error("[v0] Signup error:", err)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleEmailVerificationCheck = async () => {
    setLoading(true)
    setError("")

    try {
      const currentUser = auth.currentUser

      if (!currentUser) {
        setError("Sessão expirada. Por favor, faça login novamente.")
        router.push("/login")
        return
      }

      // Reload user to get latest emailVerified status
      await currentUser.reload()

      // Check if email is verified
      if (currentUser.emailVerified) {
        // Update Firestore
        await setDoc(
          doc(db, "users", currentUser.uid),
          {
            emailVerified: true,
          },
          { merge: true },
        )

        // Move to phone verification
        setStep(3)
        setupRecaptcha()
      } else {
        setError("Email ainda não verificado. Por favor, verifique sua caixa de entrada.")
      }
    } catch (err: any) {
      setError("Erro ao verificar email. Tente novamente.")
      console.error("[v0] Email verification check error:", err)
    } finally {
      setLoading(false)
    }
  }

  const setupRecaptcha = () => {
    if (!(window as any).recaptchaVerifier) {
      ;(window as any).recaptchaVerifier = new RecaptchaVerifier(auth, "recaptcha-container", {
        size: "normal",
        callback: () => {
          // reCAPTCHA solved
        },
      })
    }
  }

  const handleSendPhoneVerification = async () => {
    setLoading(true)
    setError("")

    try {
      const phoneNumber = phoneToE164(phone)
      const appVerifier = (window as any).recaptchaVerifier

      const result = await signInWithPhoneNumber(auth, phoneNumber, appVerifier)
      setConfirmationResult(result)
      setError("")
    } catch (err: any) {
      setError("Erro ao enviar código de verificação. Verifique o número de telefone.")
      console.error("[v0] Phone verification error:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyPhoneCode = async () => {
    if (!verificationCode || !confirmationResult) {
      setError("Digite o código de verificação.")
      return
    }

    setLoading(true)
    setError("")

    try {
      await confirmationResult.confirm(verificationCode)

      // Update Firestore
      if (auth.currentUser) {
        await setDoc(
          doc(db, "users", auth.currentUser.uid),
          {
            phoneVerified: true,
          },
          { merge: true },
        )
      }

      // Registration complete
      router.push("/portal")
    } catch (err) {
      setError("Código de verificação inválido.")
      console.error("[v0] Phone code verification error:", err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary/30 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <h1 className="text-3xl font-serif font-bold">
              <span className="text-primary">W1nner</span> Engenharia
            </h1>
          </Link>
        </div>

        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-serif">
              {step === 1 && "Criar Conta"}
              {step === 2 && "Verificar Email"}
              {step === 3 && "Verificar Telefone"}
            </CardTitle>
            <CardDescription>
              {step === 1 && "Preencha os dados abaixo para criar sua conta"}
              {step === 2 && "Verifique seu email para continuar"}
              {step === 3 && "Verifique seu telefone para concluir o cadastro"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {step === 1 && (
              <form onSubmit={handleSignup} className="space-y-4">
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Label htmlFor="name">Nome Completo *</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Seu nome"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cpf">CPF *</Label>
                  <Input
                    id="cpf"
                    type="text"
                    placeholder="000.000.000-00"
                    value={cpf}
                    onChange={handleCpfChange}
                    maxLength={14}
                    required
                    disabled={loading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Telefone *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="(00) 00000-0000"
                    value={phone}
                    onChange={handlePhoneChange}
                    maxLength={15}
                    required
                    disabled={loading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Senha *</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirmar Senha *</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>

                <div className="flex items-start space-x-2 pt-2">
                  <input
                    type="checkbox"
                    id="terms"
                    checked={acceptedTerms}
                    onChange={(e) => setAcceptedTerms(e.target.checked)}
                    className="mt-1 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                    disabled={loading}
                  />
                  <label htmlFor="terms" className="text-sm text-muted-foreground leading-tight">
                    Li e aceito os{" "}
                    <Link href="/termos-de-uso" target="_blank" className="text-primary hover:underline font-medium">
                      Termos de Uso
                    </Link>{" "}
                    e a{" "}
                    <Link
                      href="/politica-de-privacidade"
                      target="_blank"
                      className="text-primary hover:underline font-medium"
                    >
                      Política de Privacidade
                    </Link>{" "}
                    *
                  </label>
                </div>

                <Button type="submit" className="w-full bg-primary text-primary-foreground" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Criando conta...
                    </>
                  ) : (
                    "Criar Conta"
                  )}
                </Button>
              </form>
            )}

            {step === 2 && (
              <div className="space-y-4">
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {emailSent && (
                  <Alert>
                    <CheckCircle2 className="h-4 w-4" />
                    <AlertDescription>
                      Um email de verificação foi enviado para <strong>{email}</strong>. Por favor, verifique sua caixa
                      de entrada e clique no link de verificação.
                    </AlertDescription>
                  </Alert>
                )}

                <div className="text-center py-4">
                  <p className="text-sm text-muted-foreground mb-4">
                    Após verificar seu email, clique no botão abaixo para continuar.
                  </p>
                </div>

                <Button
                  onClick={handleEmailVerificationCheck}
                  className="w-full bg-primary text-primary-foreground"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Verificando...
                    </>
                  ) : (
                    "Já verifiquei meu email"
                  )}
                </Button>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4">
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {!confirmationResult ? (
                  <>
                    <div className="text-center py-4">
                      <p className="text-sm text-muted-foreground mb-4">
                        Enviaremos um código de verificação via SMS para <strong>{phone}</strong>
                      </p>
                    </div>

                    <div id="recaptcha-container"></div>

                    <Button
                      onClick={handleSendPhoneVerification}
                      className="w-full bg-primary text-primary-foreground"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Enviando código...
                        </>
                      ) : (
                        "Enviar código de verificação"
                      )}
                    </Button>
                  </>
                ) : (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="verificationCode">Código de Verificação</Label>
                      <Input
                        id="verificationCode"
                        type="text"
                        placeholder="000000"
                        value={verificationCode}
                        onChange={(e) => setVerificationCode(e.target.value)}
                        maxLength={6}
                        required
                        disabled={loading}
                      />
                      <p className="text-xs text-muted-foreground">
                        Digite o código de 6 dígitos enviado para seu telefone
                      </p>
                    </div>

                    <Button
                      onClick={handleVerifyPhoneCode}
                      className="w-full bg-primary text-primary-foreground"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Verificando...
                        </>
                      ) : (
                        "Verificar código"
                      )}
                    </Button>
                  </>
                )}
              </div>
            )}

            {step === 1 && (
              <div className="mt-6 text-center text-sm">
                <span className="text-muted-foreground">Já tem uma conta? </span>
                <Link href="/login" className="text-primary hover:underline font-medium">
                  Entrar
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="mt-6 text-center">
          <Link href="/" className="text-sm text-muted-foreground hover:text-primary transition-colors">
            ← Voltar para o site
          </Link>
        </div>
      </div>
    </div>
  )
}
