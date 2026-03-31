/**
 * Checkout step type
 */
export type CheckoutStep = 1 | 2 | 3

/**
 * Checkout state interface
 */
export interface CheckoutState {
  currentStep: CheckoutStep
  shippingData: ShippingFormData | null
  paymentData: PaymentFormData | null
  isSubmitting: boolean
  error: string | null
}

/**
 * Shipping form data interface
 */
export interface ShippingFormData {
  name: string
  email: string
  phone: string
  address: string
  city: string
  state: string
  zip: string
  country: string
}

/**
 * Payment form data interface
 */
export type PaymentFormData = {
  method: 'CARD' | 'COD'
  cardNumber?: string
  cardName?: string
  expiryDate?: string
  cvv?: string
}

/**
 * Cart item interface
 */
export interface CartItem {
  id: string
  productId: string
  name: string
  price: number
  quantity: number
  image: string | null
}

/**
 * Cart state interface
 */
export interface CartState {
  items: CartItem[]
  lastUpdated: string
}

/**
 * Order creation payload interface
 */
export interface OrderCreatePayload {
  storeId: string
  customerName: string
  customerEmail: string
  shippingAddress: string
  items: {
    productId: string
    quantity: number
  }[]
  subtotal: number
  shipping: number
  tax: number
  total: number
  customerId?: string
}

/**
 * Price breakdown interface
 */
export interface PriceBreakdown {
  subtotal: number
  discount: number
  shipping: number
  tax: number
  total: number
}
