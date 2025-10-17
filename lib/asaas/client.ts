import type { AsaasCustomer, AsaasPayment, AsaasInstallment } from "./types"

const ASAAS_API_URL = "https://sandbox.asaas.com/api/v3"
const ASAAS_API_KEY = process.env.ASAAS_API_KEY || ""

export class AsaasClient {
  private apiKey: string
  private baseUrl: string

  constructor(apiKey?: string) {
    this.apiKey = apiKey || ASAAS_API_KEY
    this.baseUrl = ASAAS_API_URL
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        access_token: this.apiKey,
        ...options.headers,
      },
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      throw new Error(error.errors?.[0]?.description || `Asaas API Error: ${response.statusText}`)
    }

    return response.json()
  }

  // Customer Management
  async createCustomer(customer: AsaasCustomer) {
    return this.request("/customers", {
      method: "POST",
      body: JSON.stringify(customer),
    })
  }

  async getCustomer(customerId: string) {
    return this.request(`/customers/${customerId}`)
  }

  async updateCustomer(customerId: string, customer: Partial<AsaasCustomer>) {
    return this.request(`/customers/${customerId}`, {
      method: "POST",
      body: JSON.stringify(customer),
    })
  }

  // Payment Management
  async createPayment(payment: AsaasPayment) {
    return this.request("/payments", {
      method: "POST",
      body: JSON.stringify(payment),
    })
  }

  async getPayment(paymentId: string) {
    return this.request(`/payments/${paymentId}`)
  }

  async getPaymentsByCustomer(customerId: string) {
    return this.request(`/payments?customer=${customerId}`)
  }

  async deletePayment(paymentId: string) {
    return this.request(`/payments/${paymentId}`, {
      method: "DELETE",
    })
  }

  // Create installment payments
  async createInstallmentPayments(payment: AsaasPayment): Promise<AsaasInstallment[]> {
    const response = await this.createPayment(payment)
    return response.data || []
  }

  // Get payment status
  async getPaymentStatus(paymentId: string) {
    const payment = await this.getPayment(paymentId)
    return payment.status
  }
}

export const asaasClient = new AsaasClient()
