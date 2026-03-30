export interface Customer {
  id: string
  email: string
  name: string
  phone?: string | null
  storeId: string
  createdAt: Date
  updatedAt: Date
}

export interface CustomerSession {
  user: {
    id: string
    email: string
    name: string
    role: 'customer'
  }
  expires: string
}

export type OrderStatus = 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED'

export interface Order {
  id: string
  orderNumber: string
  customerName: string
  customerEmail: string
  shippingAddress: string
  total: number
  subtotal: number
  tax: number
  shipping: number
  profit: number
  status: OrderStatus
  trackingNumber?: string | null
  notes?: string | null
  storeId: string
  customerId?: string | null
  createdAt: Date
  updatedAt: Date
  items: OrderItem[]
}

export interface OrderItem {
  id: string
  orderId: string
  productId: string
  name: string
  quantity: number
  price: number
  cost: number
  profit: number
  createdAt: Date
  updatedAt: Date
}

export interface Address {
  id: string
  customerId: string
  name: string
  address: string
  city: string
  state: string
  zip: string
  country: string
  phone?: string | null
  isDefault: boolean
  createdAt: Date
  updatedAt: Date
}

export interface SupportMessage {
  id: string
  name: string
  email: string
  subject: string
  message: string
  status: 'UNREAD' | 'READ' | 'REPLIED'
  reply?: string | null
  repliedAt?: Date | null
  storeId: string
  createdAt: Date
  updatedAt: Date
}

export interface OrderStatusConfig {
  color: string
  label: string
}

export const ORDER_STATUS_CONFIG: Record<string, OrderStatusConfig> = {
  PENDING:    { color: 'bg-yellow-400 text-black', label: 'Pending' },
  PROCESSING: { color: 'bg-blue-500 text-white',   label: 'Processing' },
  SHIPPED:    { color: 'bg-purple-500 text-white', label: 'Shipped' },
  DELIVERED:  { color: 'bg-green-600 text-white',  label: 'Delivered' },
  CANCELLED:  { color: 'bg-red-500 text-white',    label: 'Cancelled' },
  REFUNDED:   { color: 'bg-gray-500 text-white',   label: 'Refunded' },
  ON_HOLD:    { color: 'bg-orange-400 text-black', label: 'On Hold' },
}
