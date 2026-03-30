'use client'

import React from 'react'
import { cn } from '@/lib/utils'

interface CheckoutStepsProps {
  currentStep: 1 | 2 | 3
}

export function CheckoutSteps({ currentStep }: CheckoutStepsProps) {
  const steps = [
    { number: 1, label: 'Shipping' },
    { number: 2, label: 'Payment' },
    { number: 3, label: 'Review' }
  ]

  return (
    <div className="flex items-center justify-center gap-4 mb-12">
      {steps.map((step, index) => {
        const isCompleted = currentStep > step.number
        const isActive = currentStep === step.number

        return (
          <React.Fragment key={step.number}>
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  'w-12 h-12 border-4 border-black flex items-center justify-center font-headline font-black text-xl transition-all',
                  isCompleted
                    ? 'bg-black text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
                    : isActive
                    ? 'bg-[#ffcc00] text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
                    : 'bg-white text-black opacity-50'
                )}
              >
                {isCompleted ? '✓' : step.number}
              </div>
              <span
                className={cn(
                  'font-headline font-bold uppercase text-sm tracking-wider hidden sm:inline',
                  isCompleted || isActive ? 'text-black' : 'text-black opacity-50'
                )}
              >
                {step.label}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div
                className={cn(
                  'w-12 h-1 border-b-4 transition-all',
                  isCompleted ? 'border-black' : 'border-black opacity-30'
                )}
              />
            )}
          </React.Fragment>
        )
      })}
    </div>
  )
}
