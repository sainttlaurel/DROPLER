'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { StorefrontLayout } from '@/components/layout/StorefrontLayout'
import { CheckoutSteps } from '@/components/checkout/CheckoutSteps'
import { ShippingForm } from '@/components/checkout/ShippingForm'
import { PaymentForm } from '@/components/checkout/PaymentForm'
import { ReviewStep } from '@/components/checkout/ReviewStep'
import { OrderSummary } from '@/components/checkout/OrderSummary'
import { ShippingFormData } from '@/lib/validations/checkout'
import { PaymentFormData } from '@/types/checkout'
import { CartItem } from '@/types/checkout'
import { getCart, clearCart } from '@/lib/utils/cart'
import { calculateSubtotal, calculateShipping, calculateTax, calculateTotal } from '@/lib/utils/calculations'
import { formatAddress } from '@/lib/utils/formatting'

export default function CheckoutPage() {
  const params = useParams()
  const router = useRouter()
  const slug = params.slug as string

  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1)
  const [shippingData, setShippingData] = useState<ShippingFormData | null>(null)
  const [paymentData, setPaymentData] = useState<PaymentFormData | null>(null)
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [storeId, setStoreId] = useState<string | null>(null)
  const [customerId, setCustomerId] = useState<string | null>(null)

  useEffect(() => {
    const cart = getCart(slug)
    setCartItems(cart.items)

    if (cart.items.length === 0) {
      router.push(`/stores/${slug}`)
    }

    fetchStoreId()

    // Read logged-in customer id from JWT if present
    try {
      const token = localStorage.getItem(`customer_token_${slug}`)
      if (token) {
        const payload = JSON.parse(atob(token.split('.')[1]))
        if (payload?.id) setCustomerId(payload.id)
      }
    } catch { /* not logged in */ }
  }, [slug])

  const fetchStoreId = async () => {
    try {
      const response = await fetch(`/api/stores/${slug}`)
      if (response.ok) {
        const data = await response.json()
        setStoreId(data.id)
      } else {
        toast.error('Could not load store. Please refresh and try again.')
      }
    } catch (error) {
      console.error('Failed to fetch store:', error)
      toast.error('Could not load store. Please refresh and try again.')
    }
  }

  const handleShippingSubmit = (data: ShippingFormData) => {
    setShippingData(data)
    setCurrentStep(2)
  }

  const handlePaymentSubmit = (data: PaymentFormData) => {
    setPaymentData(data)
    setCurrentStep(3)
  }

  const handlePlaceOrder = async () => {
    if (!shippingData || !paymentData || !storeId) {
      toast.error('Missing required information')
      return
    }

    if (cartItems.length === 0) {
      toast.error('Your cart is empty')
      return
    }

    setIsSubmitting(true)
    try {
      const orderData = {
        storeId,
        customerId: customerId || undefined,
        customerName: shippingData.name,
        customerEmail: shippingData.email,
        shippingAddress: formatAddress(shippingData),
        items: cartItems.map(item => ({
          productId: item.productId,
          quantity: item.quantity
        })),
        subtotal: calculateSubtotal(cartItems),
        shipping: calculateShipping(cartItems),
        tax: calculateTax(cartItems),
        total: calculateTotal(cartItems)
      }

      const response = await fetch('/api/orders/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Order creation failed')
      }

      const order = await response.json()

      clearCart(slug)

      toast.success('Order placed successfully!')
      router.push(`/stores/${slug}/orders/${order.id}`)
    } catch (error) {
      console.error('Order creation error:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to place order')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <StorefrontLayout>
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Page Header */}
        <header className="mb-12">
          <h1 className="text-7xl font-black uppercase tracking-tighter leading-none mb-4 font-headline">
            Checkout
          </h1>
          <p className="font-headline font-medium text-xl opacity-60">
            Complete your order in 3 simple steps
          </p>
        </header>

        {/* Checkout Steps Indicator */}
        <CheckoutSteps currentStep={currentStep} />

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-8">
          {/* Forms Section - 2/3 width on desktop */}
          <div className="lg:col-span-8">
            {currentStep === 1 && (
              <ShippingForm
                onSubmit={handleShippingSubmit}
                defaultValues={shippingData || undefined}
              />
            )}

            {currentStep === 2 && (
              <PaymentForm
                onSubmit={handlePaymentSubmit}
                onBack={() => setCurrentStep(1)}
                defaultValues={paymentData || undefined}
              />
            )}

            {currentStep === 3 && (
              <ReviewStep
                shippingData={shippingData}
                paymentData={paymentData}
                cartItems={cartItems}
                onPlaceOrder={handlePlaceOrder}
                onBack={() => setCurrentStep(2)}
                isSubmitting={isSubmitting}
              />
            )}
          </div>

          {/* Order Summary Sidebar - 1/3 width on desktop */}
          <div className="lg:col-span-4 order-first lg:order-last">
            <OrderSummary items={cartItems} />
          </div>
        </div>
      </div>
    </StorefrontLayout>
  )
}
