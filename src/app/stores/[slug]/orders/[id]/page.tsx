'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { StorefrontLayout } from '@/components/layout/StorefrontLayout'
import { calculateEstimatedDelivery, formatDate, formatOrderNumber } from '@/lib/utils/formatting'
import { Order } from '@/types/customer'

export default function OrderConfirmationPage() {
  const params = useParams()
  const slug = params.slug as string
  const id = params.id as string

  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (id && slug) {
      fetchOrder()
    }
  }, [id, slug])

  const fetchOrder = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/stores/${slug}/orders/${id}`)
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to load order')
      }
      const data = await res.json()
      setOrder(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load order')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <StorefrontLayout>
        <div className="max-w-3xl mx-auto px-6 py-20 text-center">
          <div className="border-4 border-primary bg-white neo-shadow p-12">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-6" />
            <p className="font-headline font-bold text-lg uppercase">Loading your order...</p>
          </div>
        </div>
      </StorefrontLayout>
    )
  }

  if (error || !order) {
    return (
      <StorefrontLayout>
        <div className="max-w-3xl mx-auto px-6 py-20 text-center">
          <div className="border-4 border-primary bg-white neo-shadow p-12">
            <p className="font-headline font-black text-2xl uppercase mb-4 text-red-600">
              Order Not Found
            </p>
            <p className="font-headline font-medium mb-8 text-primary/70">
              {error || 'We could not find this order.'}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={fetchOrder}
                className="border-4 border-primary bg-yellow-400 px-6 py-3 font-headline font-black uppercase text-sm neo-shadow hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all"
              >
                Try Again
              </button>
              <Link href={`/stores/${slug}`}>
                <span className="block border-4 border-primary bg-white px-6 py-3 font-headline font-black uppercase text-sm neo-shadow hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all cursor-pointer">
                  Continue Shopping
                </span>
              </Link>
            </div>
          </div>
        </div>
      </StorefrontLayout>
    )
  }

  const estimatedDelivery = calculateEstimatedDelivery()

  const statusConfig: Record<string, { bg: string; icon: string; title: string; subtitle: string }> = {
    PENDING:    { bg: 'bg-yellow-400',  icon: '🕐', title: 'Order Received',   subtitle: 'Your order is pending confirmation.' },
    PROCESSING: { bg: 'bg-blue-400',    icon: '⚙️', title: 'Being Processed',  subtitle: 'We are preparing your order.' },
    SHIPPED:    { bg: 'bg-purple-400',  icon: '🚚', title: 'Order Shipped',    subtitle: 'Your order is on its way!' },
    DELIVERED:  { bg: 'bg-green-400',   icon: '✓',  title: 'Order Delivered',  subtitle: 'Your order has been delivered.' },
    CANCELLED:  { bg: 'bg-red-400',     icon: '✕',  title: 'Order Cancelled',  subtitle: 'This order has been cancelled.' },
  }
  const sc = statusConfig[order.status] ?? { bg: 'bg-gray-300', icon: '📋', title: 'Order Status', subtitle: order.status }

  return (
    <StorefrontLayout>
      <div className="max-w-3xl mx-auto px-6 py-12">
        {/* Status Header */}
        <div className={`border-4 border-primary ${sc.bg} neo-shadow p-8 mb-8 text-center`}>
          <div className="text-5xl mb-4">{sc.icon}</div>
          <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter leading-none mb-3 font-headline">
            {sc.title}
          </h1>
          <p className="font-headline font-bold text-lg uppercase">
            {sc.subtitle}
          </p>
          <p className="font-headline font-medium mt-2 text-primary/80">
            Order #{formatOrderNumber(order.orderNumber)}
          </p>
        </div>

        {/* Email Notice — only for non-cancelled */}
        {order.status !== 'CANCELLED' && (
          <div className="border-4 border-primary bg-white neo-shadow p-5 mb-8 flex items-start gap-4">
            <span className="text-2xl flex-shrink-0">✉</span>
            <div>
              <p className="font-headline font-black uppercase text-sm mb-1">
                Confirmation Email Sent
              </p>
              <p className="font-headline font-medium text-sm text-primary/70">
                A confirmation email has been sent to{' '}
                <span className="font-bold text-primary">{order.customerEmail}</span>.
                Please check your inbox (and spam folder) for your order details.
              </p>
            </div>
          </div>
        )}

        {/* Cancellation notice */}
        {order.status === 'CANCELLED' && (
          <div className="border-4 border-red-500 bg-red-50 neo-shadow p-5 mb-8 flex items-start gap-4">
            <span className="text-2xl flex-shrink-0">⚠️</span>
            <div>
              <p className="font-headline font-black uppercase text-sm mb-1 text-red-700">
                Order Cancelled
              </p>
              <p className="font-headline font-medium text-sm text-red-600">
                This order has been cancelled. If you have questions, please contact support.
              </p>
            </div>
          </div>
        )}

        {/* Order Items */}
        <div className="border-4 border-primary bg-white neo-shadow mb-8">
          <div className="border-b-4 border-primary px-6 py-4">
            <h2 className="font-headline font-black text-xl uppercase">Order Items</h2>
          </div>
          <div className="divide-y-4 divide-primary">
            {order.items.map((item) => (
              <div key={item.id} className="px-6 py-4 flex justify-between items-center gap-4">
                <div className="flex-1 min-w-0">
                  <p className="font-headline font-bold text-sm uppercase truncate">{item.name}</p>
                  <p className="font-headline font-medium text-xs text-primary/60 mt-1">
                    Qty: {item.quantity}
                  </p>
                </div>
                <p className="font-headline font-black text-sm flex-shrink-0">
                  ${(item.price * item.quantity).toFixed(2)}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          {/* Shipping Address */}
          <div className="border-4 border-primary bg-white neo-shadow">
            <div className="border-b-4 border-primary px-6 py-4">
              <h2 className="font-headline font-black text-xl uppercase">Shipping Address</h2>
            </div>
            <div className="px-6 py-5">
              <p className="font-headline font-bold text-sm uppercase mb-1">{order.customerName}</p>
              <p className="font-headline font-medium text-sm text-primary/80 whitespace-pre-line">
                {order.shippingAddress}
              </p>
            </div>
          </div>

          {/* Payment Method */}
          <div className="border-4 border-primary bg-white neo-shadow">
            <div className="border-b-4 border-primary px-6 py-4">
              <h2 className="font-headline font-black text-xl uppercase">Payment</h2>
            </div>
            <div className="px-6 py-5">
              <p className="font-headline font-bold text-sm uppercase mb-1">
                {order.shippingAddress?.toLowerCase().includes('cod') || order.shippingAddress?.toLowerCase().includes('cash on delivery')
                  ? 'Cash on Delivery'
                  : 'Online Payment'}
              </p>
              <p className="font-headline font-medium text-sm text-primary/60">
                Order #{formatOrderNumber(order.orderNumber)}
              </p>
            </div>
          </div>
        </div>

        {/* Price Breakdown */}
        <div className="border-4 border-primary bg-white neo-shadow mb-8">
          <div className="border-b-4 border-primary px-6 py-4">
            <h2 className="font-headline font-black text-xl uppercase">Price Breakdown</h2>
          </div>
          <div className="px-6 py-5 space-y-3">
            <div className="flex justify-between">
              <span className="font-headline font-medium text-sm uppercase text-primary/70">Subtotal</span>
              <span className="font-headline font-bold text-sm">${order.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-headline font-medium text-sm uppercase text-primary/70">Shipping</span>
              <span className="font-headline font-bold text-sm">
                {order.shipping === 0 ? 'Free' : `$${order.shipping.toFixed(2)}`}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="font-headline font-medium text-sm uppercase text-primary/70">Tax</span>
              <span className="font-headline font-bold text-sm">${order.tax.toFixed(2)}</span>
            </div>
            <div className="border-t-4 border-primary pt-3 flex justify-between">
              <span className="font-headline font-black text-base uppercase">Total</span>
              <span className="font-headline font-black text-base">${order.total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Estimated Delivery — only when not cancelled */}
        {order.status !== 'CANCELLED' && (
          <div className="border-4 border-primary bg-white neo-shadow p-6 mb-8 flex items-center gap-4">
            <span className="text-3xl flex-shrink-0">📦</span>
            <div>
              <p className="font-headline font-black uppercase text-sm mb-1">Estimated Delivery</p>
              <p className="font-headline font-bold text-lg">{estimatedDelivery}</p>
              <p className="font-headline font-medium text-xs text-primary/60 mt-1">
                Placed on {formatDate(order.createdAt)}
              </p>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Link href={`/stores/${slug}/account`} className="flex-1">
            <span className="block text-center border-4 border-primary bg-primary text-white px-6 py-4 font-headline font-black uppercase text-sm neo-shadow hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all cursor-pointer">
              View Account
            </span>
          </Link>
          <Link href={`/stores/${slug}`} className="flex-1">
            <span className="block text-center border-4 border-primary bg-yellow-400 px-6 py-4 font-headline font-black uppercase text-sm neo-shadow hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all cursor-pointer">
              Continue Shopping
            </span>
          </Link>
        </div>
      </div>
    </StorefrontLayout>
  )
}
