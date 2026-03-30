'use client'

import React from 'react'
import { CartItem } from '@/types/checkout'
import { getPriceBreakdown } from '@/lib/utils/calculations'

interface OrderSummaryProps {
  items: CartItem[]
}

export function OrderSummary({ items }: OrderSummaryProps) {
  const { subtotal, shipping, tax, total } = getPriceBreakdown(items)

  return (
    <div className="border-2 border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-8 sticky top-8">
      <h2 className="font-headline font-black text-2xl uppercase mb-6 border-b-2 border-black pb-4">
        Order Summary
      </h2>

      {items.length === 0 ? (
        <div className="text-center py-8">
          <p className="font-headline font-bold text-lg opacity-60">
            Your cart is empty
          </p>
        </div>
      ) : (
        <>
          {/* Cart Items */}
          <div className="space-y-4 mb-6">
            {items.map((item) => (
              <div key={item.id} className="flex gap-4">
                {item.image && (
                  <div className="w-16 h-16 border-2 border-black bg-gray-100 flex-shrink-0 overflow-hidden">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-headline font-bold text-sm truncate">
                    {item.name}
                  </p>
                  <p className="font-body text-xs opacity-60">
                    Qty: {item.quantity}
                  </p>
                  <p className="font-headline font-black text-sm mt-1">
                    ${(item.price * item.quantity).toFixed(2)}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Price Breakdown */}
          <div className="border-t-2 border-black pt-6 space-y-3">
            <div className="flex justify-between font-body">
              <span className="font-medium">Subtotal</span>
              <span className="font-bold">${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-body">
              <span className="font-medium">Shipping</span>
              <span className="font-bold">
                {shipping === 0 ? (
                  <span className="text-green-700 font-black">FREE</span>
                ) : (
                  `$${shipping.toFixed(2)}`
                )}
              </span>
            </div>
            <div className="flex justify-between font-body">
              <span className="font-medium">Tax (8%)</span>
              <span className="font-bold">${tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-headline font-black text-xl pt-3 border-t-2 border-black">
              <span className="uppercase">Total</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>

          {subtotal < 50 && (
            <p className="mt-4 text-xs font-bold text-center border-2 border-black bg-[#ffcc00] px-3 py-2">
              Add ${(50 - subtotal).toFixed(2)} more for FREE shipping!
            </p>
          )}
        </>
      )}
    </div>
  )
}
