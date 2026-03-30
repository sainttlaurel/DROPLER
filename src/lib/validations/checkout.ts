import { z } from 'zod'

function luhnCheck(cardNumber: string): boolean {
  let sum = 0
  let isEven = false
  for (let i = cardNumber.length - 1; i >= 0; i--) {
    let digit = parseInt(cardNumber[i])
    if (isEven) { digit *= 2; if (digit > 9) digit -= 9 }
    sum += digit
    isEven = !isEven
  }
  return sum % 10 === 0
}

function isNotExpired(expiryDate: string): boolean {
  const [month, year] = expiryDate.split('/').map(Number)
  const expiry = new Date(2000 + year, month - 1)
  return expiry > new Date()
}

export const shippingSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().regex(/^\+?[\d\s\-()]+$/, 'Invalid phone number'),
  address: z.string().min(5, 'Address is required'),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  zip: z.string().min(1, 'ZIP/Postal code is required'),
  country: z.string().min(2, 'Country is required'),
})

export const paymentSchema = z.discriminatedUnion('method', [
  z.object({
    method: z.literal('CARD'),
    cardNumber: z.string()
      .regex(/^\d{16}$/, 'Card number must be 16 digits')
      .refine(luhnCheck, 'Invalid card number'),
    cardName: z.string().min(3, 'Cardholder name is required'),
    expiryDate: z.string()
      .regex(/^(0[1-9]|1[0-2])\/\d{2}$/, 'Format: MM/YY')
      .refine(isNotExpired, 'Card has expired'),
    cvv: z.string().regex(/^\d{3,4}$/, 'CVV must be 3 or 4 digits'),
  }),
  z.object({
    method: z.literal('COD'),
    cardNumber: z.string().optional(),
    cardName: z.string().optional(),
    expiryDate: z.string().optional(),
    cvv: z.string().optional(),
  }),
])


export type ShippingFormData = z.infer<typeof shippingSchema>
export type { PaymentFormData } from '@/types/checkout'
