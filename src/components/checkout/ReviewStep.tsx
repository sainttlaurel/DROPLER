'use client'

import React from 'react'
import { ShippingFormData } from '@/lib/validations/checkout'
import { PaymentFormData } from '@/types/checkout'
import { CartItem } from '@/types/checkout'
import { Button } from '@/components/ui/Button'

interface ReviewStepProps {
  shippingData: ShippingFormData | null
  paymentData: PaymentFormData | null
  cartItems: CartItem[]
  onPlaceOrder: () => void
  onBack: () => void
  isSubmitting: boolean
}

export function ReviewStep({
  shippingData,
  paymentData,
  cartItems,
  onPlaceOrder,
  onBack,
  isSubmitting
}: ReviewStepProps) {
  if (!shippingData || !paymentData) {
    return null
  }

  return (
    <div className="border-2 border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-8">
      <h2 className="font-headline font-black text-3xl uppercase mb-6 border-b-2 border-black pb-4">
        Review Order
      </h2>

      <div className="space-y-8">
        {/* Shipping Information */}
        <div>
          <h3 className="font-headline font-black text-xl uppercase mb-4">
            Shipping Address
          </h3>
          <div className="bg-gray-50 border-2 border-black p-6 space-y-1">
            <p className="font-headline font-bold text-lg">{shippingData.name}</p>
            <p className="font-body text-sm">{shippingData.email}</p>
            <p className="font-body text-sm">{shippingData.phone}</p>
            <p className="font-body mt-3">{shippingData.address}</p>
            <p className="font-body">
              {shippingData.city}, {shippingData.state} {shippingData.zip}
            </p>
            <p className="font-body">{shippingData.country}</p>
          </div>
        </div>

        {/* Payment Information */}
        <div>
          <h3 className="font-headline font-black text-xl uppercase mb-4">
            Payment Method
          </h3>
          <div className="bg-gray-50 border-2 border-black p-6 space-y-1">
            {paymentData.method === 'COD' ? (
              <div className="flex items-center gap-3">
                <span className="font-headline font-black text-lg uppercase">Cash on Delivery</span>
                <span className="px-2 py-1 bg-black text-white text-[10px] font-headline font-black uppercase">COD</span>
              </div>
            ) : (
              <>
                <p className="font-headline font-bold text-lg">{(paymentData as any).cardName}</p>
                <p className="font-body font-mono">{`**** **** **** ${(paymentData as any).cardNumber?.slice(-4)}`}</p>
                <p className="font-body text-sm opacity-70">Expires: {(paymentData as any).expiryDate}</p>
              </>
            )}
          </div>
        </div>

        {/* Order Items */}
        <div>
          <h3 className="font-headline font-black text-xl uppercase mb-4">
            Order Items
          </h3>
          <div className="border-2 border-black divide-y-2 divide-black">
            {cartItems.map((item) => (
              <div key={item.id} className="p-4 flex justify-between items-center gap-4">
                <div className="flex items-center gap-4">
                  {item.image && (
                    <div className="w-14 h-14 border-2 border-black bg-white flex-shrink-0 overflow-hidden">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div>
                    <p className="font-headline font-bold">{item.name}</p>
                    <p className="font-body text-sm opacity-60">Qty: {item.quantity}</p>
                  </div>
                </div>
                <p className="font-headline font-black text-lg flex-shrink-0">
                  ${(item.price * item.quantity).toFixed(2)}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 pt-4">
          <Button
            type="button"
            variant="ghost"
            size="lg"
            className="flex-1"
            onClick={onBack}
            disabled={isSubmitting}
          >
            Back
          </Button>
          <Button
            type="button"
            variant="yellow"
            size="lg"
            className="flex-1"
            onClick={onPlaceOrder}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Placing Order...' : 'Place Order'}
          </Button>
        </div>
      </div>
    </div>
  )
}
