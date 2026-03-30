import { CartItem, CartState } from '@/types/checkout'

export function getCart(storeSlug: string): CartState {
  if (typeof window === 'undefined') {
    return { items: [], lastUpdated: new Date().toISOString() }
  }

  const saved = localStorage.getItem(`cart_${storeSlug}`)
  if (!saved) {
    return { items: [], lastUpdated: new Date().toISOString() }
  }

  try {
    return JSON.parse(saved)
  } catch {
    return { items: [], lastUpdated: new Date().toISOString() }
  }
}

export function saveCart(storeSlug: string, cart: CartState): void {
  if (typeof window === 'undefined') return

  cart.lastUpdated = new Date().toISOString()
  localStorage.setItem(`cart_${storeSlug}`, JSON.stringify(cart))
}

export function addToCart(
  storeSlug: string,
  product: {
    id: string
    name: string
    price: number
    image: string | null
  },
  quantity: number = 1
): CartState {
  const cart = getCart(storeSlug)
  
  // Check if item already exists
  const existingItem = cart.items.find(item => item.productId === product.id)
  
  if (existingItem) {
    existingItem.quantity += quantity
  } else {
    cart.items.push({
      id: `${product.id}_${Date.now()}`,
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity,
      image: product.image
    })
  }
  
  saveCart(storeSlug, cart)
  return cart
}

export function updateCartItemQuantity(
  storeSlug: string,
  itemId: string,
  delta: number
): CartState {
  const cart = getCart(storeSlug)
  
  const item = cart.items.find(i => i.id === itemId)
  if (item) {
    item.quantity = Math.max(1, item.quantity + delta)
  }
  
  saveCart(storeSlug, cart)
  return cart
}

export function removeCartItem(storeSlug: string, itemId: string): CartState {
  const cart = getCart(storeSlug)
  cart.items = cart.items.filter(item => item.id !== itemId)
  
  saveCart(storeSlug, cart)
  return cart
}

export function clearCart(storeSlug: string): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(`cart_${storeSlug}`)
}

export function getCartItemCount(storeSlug: string): number {
  const cart = getCart(storeSlug)
  return cart.items.reduce((total, item) => total + item.quantity, 0)
}

export function isCartEmpty(storeSlug: string): boolean {
  const cart = getCart(storeSlug)
  return cart.items.length === 0
}
