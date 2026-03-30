'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'sonner'
import { StorefrontLayout } from '@/components/layout/StorefrontLayout'
import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'

interface CartItem {
  id: string
  productId: string
  name: string
  price: number
  quantity: number
  image: string | null
}

export default function CartPage() {
  const params = useParams()
  const router = useRouter()
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [promoCode, setPromoCode] = useState('')
  const [discount, setDiscount] = useState(0)

  useEffect(() => {
    // Load cart from localStorage
    const savedCart = localStorage.getItem(`cart_${params.slug}`)
    if (savedCart) {
      setCartItems(JSON.parse(savedCart).items || [])
    }
  }, [params.slug])

  const updateQuantity = (itemId: string, delta: number) => {
    setCartItems((prev) => {
      const updated = prev.map((item) =>
        item.id === itemId
          ? { ...item, quantity: Math.max(1, item.quantity + delta) }
          : item
      )
      localStorage.setItem(
        `cart_${params.slug}`,
        JSON.stringify({ items: updated, lastUpdated: new Date().toISOString() })
      )
      window.dispatchEvent(new Event('cart-updated'))
      return updated
    })
  }

  const removeItem = (itemId: string) => {
    setCartItems((prev) => {
      const updated = prev.filter((item) => item.id !== itemId)
      localStorage.setItem(
        `cart_${params.slug}`,
        JSON.stringify({ items: updated, lastUpdated: new Date().toISOString() })
      )
      window.dispatchEvent(new Event('cart-updated'))
      toast.success('Item removed from cart')
      return updated
    })
  }

  const applyPromoCode = () => {
    if (promoCode.toUpperCase() === 'SAVE10') {
      setDiscount(0.1)
      toast.success('Promo code applied: 10% off!')
    } else {
      toast.error('Invalid promo code')
    }
  }

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const discountAmount = subtotal * discount
  const shipping = subtotal > 50 ? 0 : 10
  const total = subtotal - discountAmount + shipping

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      toast.error('Your cart is empty')
      return
    }
    router.push(`/stores/${params.slug}/checkout`)
  }

  return (
    <StorefrontLayout>
      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* Page Header */}
        <header className="mb-12">
          <h1 className="text-7xl font-black uppercase tracking-tighter leading-none mb-4 font-headline">
            Shopping Cart
          </h1>
          <p className="font-headline font-medium text-xl border-l-8 border-primary-container pl-4">
            Review your items and proceed to checkout when ready.
          </p>
        </header>

        {cartItems.length === 0 ? (
          /* Empty Cart State */
          <div className="border-4 border-primary bg-white neo-shadow-lg p-16 text-center">
            <Icon name="shopping_cart" className="text-9xl opacity-20 mb-6" />
            <h2 className="font-headline font-black text-3xl uppercase mb-4">Your Cart is Empty</h2>
            <p className="text-lg mb-8 opacity-60">Add some products to get started</p>
            <Link href={`/stores/${params.slug}`}>
              <Button variant="yellow" size="lg">
                <Icon name="arrow_back" size="sm" />
                Continue Shopping
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Cart Items (Left Column) */}
            <div className="lg:col-span-8 space-y-4">
              {cartItems.map((item) => (
                <div
                  key={item.id}
                  className="border-4 border-primary bg-white neo-shadow p-6 flex flex-col md:flex-row gap-6"
                >
                  {/* Product Image */}
                  <div className="w-32 h-32 border-2 border-primary bg-surface flex-shrink-0">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Icon name="image" size="lg" className="opacity-40" />
                      </div>
                    )}
                  </div>

                  {/* Product Info */}
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <Link href={`/stores/${params.slug}/products/${item.productId}`}>
                        <h3 className="font-headline font-black text-2xl uppercase mb-2 hover:text-tertiary cursor-pointer">
                          {item.name}
                        </h3>
                      </Link>
                      <p className="font-headline font-bold text-xl text-tertiary">
                        ${item.price.toFixed(2)}
                      </p>
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex items-center gap-4 mt-4">
                      <div className="flex items-center border-2 border-outline">
                        <button
                          className="px-3 py-2 border-r-2 border-outline hover:bg-primary-container font-headline font-bold"
                          onClick={() => updateQuantity(item.id, -1)}
                          disabled={item.quantity <= 1}
                        >
                          -
                        </button>
                        <span className="px-6 py-2 font-headline font-bold">{item.quantity}</span>
                        <button
                          className="px-3 py-2 border-l-2 border-outline hover:bg-primary-container font-headline font-bold"
                          onClick={() => updateQuantity(item.id, 1)}
                        >
                          +
                        </button>
                      </div>
                      <button
                        className="p-2 border-2 border-primary hover:bg-secondary hover:text-white transition-colors"
                        onClick={() => removeItem(item.id)}
                      >
                        <Icon name="delete" size="sm" />
                      </button>
                    </div>
                  </div>

                  {/* Item Total */}
                  <div className="text-right">
                    <p className="font-headline font-black text-3xl">
                      ${(item.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary (Right Column) */}
            <div className="lg:col-span-4">
              <div className="border-4 border-primary bg-white neo-shadow-lg p-8 sticky top-24">
                <h2 className="font-headline font-black text-2xl uppercase mb-6 border-b-4 border-primary pb-4">
                  Order Summary
                </h2>

                {/* Promo Code */}
                <div className="mb-6">
                  <label className="block font-headline font-bold uppercase text-xs mb-2">
                    Promo Code
                  </label>
                  <div className="flex gap-2">
                    <input
                      className="flex-1 border-2 border-primary px-3 py-2 font-headline font-bold uppercase text-sm focus:outline-none focus:bg-primary-container/10"
                      placeholder="ENTER CODE"
                      type="text"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                    />
                    <Button variant="secondary" size="sm" onClick={applyPromoCode}>
                      Apply
                    </Button>
                  </div>
                </div>

                {/* Price Breakdown */}
                <div className="space-y-4 mb-6">
                  <div className="flex justify-between font-headline font-bold">
                    <span>Subtotal:</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between font-headline font-bold text-tertiary">
                      <span>Discount ({(discount * 100).toFixed(0)}%):</span>
                      <span>-${discountAmount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-headline font-bold">
                    <span>Shipping:</span>
                    <span>{shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}</span>
                  </div>
                  {shipping > 0 && (
                    <p className="text-xs opacity-60">
                      Add ${(50 - subtotal).toFixed(2)} more for free shipping
                    </p>
                  )}
                </div>

                {/* Total */}
                <div className="border-t-4 border-primary pt-4 mb-6">
                  <div className="flex justify-between items-baseline">
                    <span className="font-headline font-black text-xl uppercase">Total:</span>
                    <span className="font-headline font-black text-4xl">${total.toFixed(2)}</span>
                  </div>
                </div>

                {/* Checkout Button */}
                <Button
                  variant="yellow"
                  size="lg"
                  className="w-full mb-4"
                  onClick={handleCheckout}
                >
                  Proceed to Checkout
                </Button>

                <Link href={`/stores/${params.slug}`}>
                  <Button variant="ghost" size="md" className="w-full">
                    <Icon name="arrow_back" size="sm" />
                    Continue Shopping
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </main>
    </StorefrontLayout>
  )
}
