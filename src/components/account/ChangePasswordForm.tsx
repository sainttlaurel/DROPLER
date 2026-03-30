'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { changePasswordSchema, ChangePasswordData } from '@/lib/validations/auth'

interface ChangePasswordFormProps {
  slug: string
}

export function ChangePasswordForm({ slug }: ChangePasswordFormProps) {
  const [loading, setLoading] = useState(false)

  const { register, handleSubmit, reset, formState: { errors } } = useForm<ChangePasswordData>({
    resolver: zodResolver(changePasswordSchema),
  })

  const onSubmit = async (data: ChangePasswordData) => {
    setLoading(true)
    try {
      const token = localStorage.getItem(`customer_token_${slug}`)
      const res = await fetch(`/api/stores/${slug}/customers/password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(data),
      })

      const json = await res.json()
      if (!res.ok) {
        toast.error(json.error || 'Failed to change password.')
        return
      }

      toast.success('Password changed successfully!')
      reset()
    } catch {
      toast.error('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="border-4 border-black bg-white shadow-[4px_4px_0px_0px_#1a1a1a] p-6 space-y-5">
      <h2 className="font-headline font-black uppercase text-xl tracking-tighter border-b-4 border-black pb-3">
        Change Password
      </h2>
      <Input label="Current Password" type="password" placeholder="••••••••" error={errors.currentPassword?.message} {...register('currentPassword')} />
      <Input label="New Password" type="password" placeholder="••••••••" error={errors.newPassword?.message} {...register('newPassword')} />
      <Input label="Confirm New Password" type="password" placeholder="••••••••" error={errors.confirmPassword?.message} {...register('confirmPassword')} />
      <p className="font-body text-xs opacity-60">
        Password must be at least 8 characters and include uppercase, lowercase, and a number.
      </p>
      <Button type="submit" size="md" className="w-full" disabled={loading}>
        {loading ? 'Updating…' : 'Update Password'}
      </Button>
    </form>
  )
}
