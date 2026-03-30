'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { updateProfileSchema, UpdateProfileData } from '@/lib/validations/auth'
import { Customer } from '@/types/customer'

interface EditProfileFormProps {
  customer: Customer
  slug: string
  onSuccess: () => void
}

export function EditProfileForm({ customer, slug, onSuccess }: EditProfileFormProps) {
  const [loading, setLoading] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<UpdateProfileData>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      name: customer.name,
      email: customer.email,
      phone: customer.phone ?? '',
    },
  })

  const onSubmit = async (data: UpdateProfileData) => {
    setLoading(true)
    try {
      const token = localStorage.getItem(`customer_token_${slug}`)
      const res = await fetch(`/api/stores/${slug}/customers/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(data),
      })

      const json = await res.json()
      if (!res.ok) {
        toast.error(json.error || 'Failed to update profile.')
        return
      }

      toast.success('Profile updated successfully!')
      onSuccess()
    } catch {
      toast.error('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="border-4 border-black bg-white shadow-[4px_4px_0px_0px_#1a1a1a] p-6 space-y-5">
      <h2 className="font-headline font-black uppercase text-xl tracking-tighter border-b-4 border-black pb-3">
        Edit Profile
      </h2>
      <Input label="Name" type="text" placeholder="Your full name" error={errors.name?.message} {...register('name')} />
      <Input label="Email" type="email" placeholder="you@example.com" error={errors.email?.message} {...register('email')} />
      <Input label="Phone (optional)" type="tel" placeholder="+1 555 000 0000" error={errors.phone?.message} {...register('phone')} />
      <Button type="submit" variant="yellow" size="md" className="w-full" disabled={loading}>
        {loading ? 'Saving…' : 'Save Changes'}
      </Button>
    </form>
  )
}
