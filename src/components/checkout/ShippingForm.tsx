'use client'

import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { shippingSchema } from '@/lib/validations/checkout'
import { ShippingFormData } from '@/types/checkout'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

interface ShippingFormProps {
  onSubmit: (data: ShippingFormData) => void
  defaultValues?: Partial<ShippingFormData>
}

export function ShippingForm({ onSubmit, defaultValues }: ShippingFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<ShippingFormData>({
    resolver: zodResolver(shippingSchema),
    defaultValues
  })

  return (
    <div className="border-2 border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-8">
      <h2 className="font-headline font-black text-3xl uppercase mb-6 border-b-2 border-black pb-4">
        Shipping Information
      </h2>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Input
          label="Full Name"
          {...register('name')}
          error={errors.name?.message}
          placeholder="John Doe"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input
            label="Email"
            type="email"
            {...register('email')}
            error={errors.email?.message}
            placeholder="john@example.com"
          />

          <Input
            label="Phone"
            type="tel"
            {...register('phone')}
            error={errors.phone?.message}
            placeholder="+1 (555) 123-4567"
          />
        </div>

        <Input
          label="Address"
          {...register('address')}
          error={errors.address?.message}
          placeholder="123 Main Street"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input
            label="City"
            {...register('city')}
            error={errors.city?.message}
            placeholder="New York"
          />

          <Input
            label="State"
            {...register('state')}
            error={errors.state?.message}
            placeholder="NY"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input
            label="ZIP Code"
            {...register('zip')}
            error={errors.zip?.message}
            placeholder="10001"
          />

          <Input
            label="Country"
            {...register('country')}
            error={errors.country?.message}
            placeholder="US"
            defaultValue="US"
          />
        </div>

        <Button
          type="submit"
          variant="yellow"
          size="lg"
          className="w-full"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Processing...' : 'Continue to Payment'}
        </Button>
      </form>
    </div>
  )
}
