// Utility functions for CPF and phone validation

export function validateCPF(cpf: string): boolean {
  // Remove non-numeric characters
  cpf = cpf.replace(/[^\d]/g, "")

  // Check if CPF has 11 digits
  if (cpf.length !== 11) return false

  // Check if all digits are the same
  if (/^(\d)\1{10}$/.test(cpf)) return false

  // Validate first check digit
  let sum = 0
  for (let i = 0; i < 9; i++) {
    sum += Number.parseInt(cpf.charAt(i)) * (10 - i)
  }
  let checkDigit = 11 - (sum % 11)
  if (checkDigit >= 10) checkDigit = 0
  if (checkDigit !== Number.parseInt(cpf.charAt(9))) return false

  // Validate second check digit
  sum = 0
  for (let i = 0; i < 10; i++) {
    sum += Number.parseInt(cpf.charAt(i)) * (11 - i)
  }
  checkDigit = 11 - (sum % 11)
  if (checkDigit >= 10) checkDigit = 0
  if (checkDigit !== Number.parseInt(cpf.charAt(10))) return false

  return true
}

export function formatCPF(value: string): string {
  // Remove non-numeric characters
  const numbers = value.replace(/[^\d]/g, "")

  // Apply CPF mask: XXX.XXX.XXX-XX
  if (numbers.length <= 3) return numbers
  if (numbers.length <= 6) return `${numbers.slice(0, 3)}.${numbers.slice(3)}`
  if (numbers.length <= 9) return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6)}`
  return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6, 9)}-${numbers.slice(9, 11)}`
}

export function validateBrazilianPhone(phone: string): boolean {
  // Remove non-numeric characters
  const numbers = phone.replace(/[^\d]/g, "")

  // Brazilian phone numbers have 10 or 11 digits (with area code)
  // Format: (XX) XXXXX-XXXX or (XX) XXXX-XXXX
  return numbers.length === 10 || numbers.length === 11
}

export function formatBrazilianPhone(value: string): string {
  // Remove non-numeric characters
  const numbers = value.replace(/[^\d]/g, "")

  // Apply phone mask: (XX) XXXXX-XXXX or (XX) XXXX-XXXX
  if (numbers.length <= 2) return numbers
  if (numbers.length <= 6) return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`
  if (numbers.length <= 10) return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 6)}-${numbers.slice(6)}`
  return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`
}

export function phoneToE164(phone: string): string {
  // Convert Brazilian phone to E.164 format (+55XXXXXXXXXXX)
  const numbers = phone.replace(/[^\d]/g, "")
  return `+55${numbers}`
}
