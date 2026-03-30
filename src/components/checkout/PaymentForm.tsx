'use client'

import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { paymentSchema } from '@/lib/validations/checkout'
import { PaymentFormData } from '@/types/checkout'
import { Icon } from '@/components/ui/Icon'

interface PaymentFormProps {
  onSubmit: (data: PaymentFormData) => void
  onBack: () => void
  defaultValues?: Partial<PaymentFormData>
}

const inputClass = "w-full px-4 py-3 bg-[#f5f0e8] border-b-4 border-[#1a1a1a] font-body font-medium focus:outline-none focus:bg-[#fffbe6] transition-colors"
const labelClass = "block font-headline font-bold uppercase text-xs tracking-widest mb-2"
const errorClass = "mt-1 text-xs font-bold text-[#e63b2e] uppercase tracking-wider"

export function PaymentForm({ onSubmit, onBack, defaultValues }: PaymentFormProps) {
  const [method, setMethod] = useState<'CARD' | 'COD'>(
    (defaultValues?.method as 'CARD' | 'COD') || 'CARD'
  )

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
    reset,
  } = useForm<PaymentFormData>({
    resolver: zodResolver(paymentSchema),
    defaultValues: defaultValues || { method: 'CARD' },
  })

  const cardNumber = watch('cardNumber' as any)

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 16)
    setValue('cardNumber' as any, raw, { shouldValidate: true })
  }

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '')
    if (value.length >= 2) value = value.slice(0, 2) + '/' + value.slice(2, 4)
    setValue('expiryDate' as any, value, { shouldValidate: true })
  }

  const displayCardNumber = cardNumber
    ? (cardNumber as string).replace(/(.{4})/g, '$1 ').trim()
    : ''

  const switchMethod = (m: 'CARD' | 'COD') => {
    setMethod(m)
    reset({ method: m } as any)
  }

  const handleFormSubmit = (data: PaymentFormData) => {
    onSubmit({ ...data, method })
  }

  const cardErrors = errors as any

  return (
    <div className="border-4 border-[#1a1a1a] bg-white shadow-[8px_8px_0px_0px_rgba(26,26,26,1)] p-8">
      <h2 className="font-headline font-black text-3xl uppercase mb-6 border-b-4 border-[#1a1a1a] pb-4">
        Payment Information
      </h2>

      {/* Method Selector */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <button
          type="button"
          onClick={() => switchMethod('CARD')}
          className={`flex items-center gap-3 p-4 border-4 font-headline font-black uppercase text-sm transition-all ${
            method === 'CARD'
              ? 'border-[#1a1a1a] bg-[#ffcc00] shadow-[4px_4px_0px_0px_rgba(26,26,26,1)]'
              : 'border-[#1a1a1a]/30 bg-white hover:border-[#1a1a1a] hover:bg-[#f5f0e8]'
          }`}
        >
          <Icon name="credit_card" size="sm" />
          <div className="text-left">
            <p className="text-sm font-black uppercase">Credit / Debit Card</p>
            <p className="text-[10px] font-bold opacity-60 normal-case">Visa, Mastercard, etc.</p>
          </div>
          {method === 'CARD' && (
            <Icon name="check_circle" size="sm" className="ml-auto" />
          )}
        </button>

        <button
          type="button"
          onClick={() => switchMethod('COD')}
          className={`flex items-center gap-3 p-4 border-4 font-headline font-black uppercase text-sm transition-all ${
            method === 'COD'
              ? 'border-[#1a1a1a] bg-[#ffcc00] shadow-[4px_4px_0px_0px_rgba(26,26,26,1)]'
              : 'border-[#1a1a1a]/30 bg-white hover:border-[#1a1a1a] hover:bg-[#f5f0e8]'
          }`}
        >
          <Icon name="payments" size="sm" />
          <div className="text-left">
            <p className="text-sm font-black uppercase">Cash on Delivery</p>
            <p className="text-[10px] font-bold opacity-60 normal-case">Pay when you receive</p>
          </div>
          {method === 'COD' && (
            <Icon name="check_circle" size="sm" className="ml-auto" />
          )}
        </button>
      </div>

      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
        {method === 'CARD' ? (
          <>
            {/* Card Number */}
            <div>
              <label className={labelClass}>Card Number</label>
              <input
                type="text"
                value={displayCardNumber}
                onChange={handleCardNumberChange}
                className={inputClass}
                placeholder="1234 5678 9012 3456"
                maxLength={19}
                inputMode="numeric"
                autoComplete="cc-number"
              />
              {cardErrors.cardNumber && (
                <p className={errorClass}>{cardErrors.cardNumber.message}</p>
              )}
            </div>

            {/* Cardholder Name */}
            <div>
              <label className={labelClass}>Cardholder Name</label>
              <input
                type="text"
                {...register('cardName' as any)}
                className={inputClass}
                placeholder="John Doe"
                autoComplete="cc-name"
              />
              {cardErrors.cardName && (
                <p className={errorClass}>{cardErrors.cardName.message}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-6">
              {/* Expiry */}
              <div>
                <label className={labelClass}>Expiry Date</label>
                <input
                  type="text"
                  {...register('expiryDate' as any)}
                  onChange={handleExpiryChange}
                  className={inputClass}
                  placeholder="MM/YY"
                  maxLength={5}
                  inputMode="numeric"
                  autoComplete="cc-exp"
                />
                {cardErrors.expiryDate && (
                  <p className={errorClass}>{cardErrors.expiryDate.message}</p>
                )}
              </div>

              {/* CVV */}
              <div>
                <label className={labelClass}>CVV</label>
                <input
                  type="text"
                  {...register('cvv' as any)}
                  className={inputClass}
                  placeholder="123"
                  maxLength={4}
                  inputMode="numeric"
                  autoComplete="cc-csc"
                />
                {cardErrors.cvv && (
                  <p className={errorClass}>{cardErrors.cvv.message}</p>
                )}
              </div>
            </div>
          </>
        ) : (
          /* COD Info */
          <div className="border-4 border-[#1a1a1a] bg-[#f5f0e8] p-6 flex gap-4 items-start">
            <Icon name="info" size="lg" className="shrink-0 mt-0.5" />
            <div>
              <p className="font-headline font-black uppercase text-sm mb-1">Cash on Delivery</p>
              <p className="font-body text-sm opacity-70 leading-relaxed">
                You will pay in cash when your order is delivered. Please have the exact amount ready.
                A delivery fee may apply.
              </p>
            </div>
          </div>
        )}

        <div className="flex gap-4 pt-2">
          <button
            type="button"
            onClick={onBack}
            className="flex-1 py-4 border-4 border-[#1a1a1a] font-headline font-black uppercase hover:bg-[#eee9e0] transition-colors shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] active:translate-x-1 active:translate-y-1 active:shadow-none"
          >
            Back
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 py-4 bg-[#ffcc00] border-4 border-[#1a1a1a] font-headline font-black uppercase shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] hover:bg-[#1a1a1a] hover:text-white transition-all active:translate-x-1 active:translate-y-1 active:shadow-none disabled:opacity-50"
          >
            {isSubmitting ? 'Processing...' : 'Continue to Review'}
          </button>
        </div>
      </form>
    </div>
  )
}
