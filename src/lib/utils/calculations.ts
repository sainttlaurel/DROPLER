import { CartItem, PriceBreakdown } from '@/types/checkout'

export function calculateSubtotal(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0)
}

// Free shipping for orders over $50, otherwise $10
export function calculateShipping(items: CartItem[]): number {
  const subtotal = calculateSubtotal(items)
  return subtotal >= 50 ? 0 : 10
}

// 8% tax rate
export function calculateTax(items: CartItem[]): number {
  const subtotal = calculateSubtotal(items)
  return subtotal * 0.08
}

export function calculateDiscount(subtotal: number, discountRate: number): number {
  return subtotal * discountRate
}

export function calculateTotal(items: CartItem[], discountRate: number = 0): number {
  const subtotal = calculateSubtotal(items)
  const discount = calculateDiscount(subtotal, discountRate)
  const shipping = calculateShipping(items)
  const tax = calculateTax(items)
  
  return subtotal - discount + shipping + tax
}

export function getPriceBreakdown(
  items: CartItem[],
  discountRate: number = 0
): PriceBreakdown {
  const subtotal = calculateSubtotal(items)
  const discount = calculateDiscount(subtotal, discountRate)
  const shipping = calculateShipping(items)
  const tax = calculateTax(items)
  const total = subtotal - discount + shipping + tax
  
  return {
    subtotal,
    discount,
    shipping,
    tax,
    total
  }
}

export function formatPrice(amount: number): string {
  return `${amount.toFixed(2)}`
}

// Returns how much more the customer needs to spend to qualify for free shipping
export function amountForFreeShipping(items: CartItem[]): number {
  const subtotal = calculateSubtotal(items)
  return Math.max(0, 50 - subtotal)
}
