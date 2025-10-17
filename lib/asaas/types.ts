// Asaas API Types
export interface AsaasCustomer {
  id?: string
  name: string
  email: string
  cpfCnpj?: string
  phone?: string
  mobilePhone?: string
  address?: string
  addressNumber?: string
  complement?: string
  province?: string
  postalCode?: string
}

export interface AsaasPayment {
  id?: string
  customer: string // Customer ID
  billingType: "BOLETO" | "CREDIT_CARD" | "PIX" | "UNDEFINED"
  value: number
  dueDate: string // YYYY-MM-DD
  description?: string
  externalReference?: string
  installmentCount?: number
  installmentValue?: number
  discount?: {
    value: number
    dueDateLimitDays: number
  }
  fine?: {
    value: number
  }
  interest?: {
    value: number
  }
}

export interface AsaasInstallment {
  id: string
  paymentId: string
  installmentNumber: number
  value: number
  netValue: number
  dueDate: string
  status: "PENDING" | "RECEIVED" | "CONFIRMED" | "OVERDUE" | "REFUNDED" | "RECEIVED_IN_CASH" | "REFUND_REQUESTED"
  description: string
  billingType: string
  invoiceUrl?: string
  bankSlipUrl?: string
  pixQrCode?: string
}

export interface PaymentPlan {
  id?: string
  userId: string
  userName: string
  userEmail: string
  asaasCustomerId?: string
  totalValue: number
  installmentCount: number
  installmentValue: number
  description: string
  billingType: "BOLETO" | "CREDIT_CARD" | "PIX"
  startDate: string
  status: "active" | "completed" | "cancelled"
  installments: PaymentInstallment[]
  createdAt: string
  createdBy: string
}

export interface PaymentInstallment {
  id?: string
  asaasPaymentId?: string
  installmentNumber: number
  value: number
  dueDate: string
  status: "pending" | "paid" | "overdue" | "cancelled"
  paidAt?: string
  invoiceUrl?: string
  bankSlipUrl?: string
  pixQrCode?: string
}
