'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { customerRegistrationSchema, CustomerRegistrationData } from '@/lib/validations/auth'

interface RegisterFormProps {
  slug: string
  onSuccess: () => void
}

export function RegisterForm({ slug, onSuccess }: RegisterFormProps) {
  const [loading, setLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CustomerRegistrationData>({
    resolver: zodResolver(customerRegistrationSchema),
  })

  const onSubmit = async (data: CustomerRegistrationData) => {
    setLoading(true)
    try {
      const res = await fetch(`/api/stores/${slug}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      const json = await res.json()

      if (res.status === 409) {
        toast.error('An account with this email already exists.')
        return
      }

      if (!res.ok) {
        toast.error(json.error || 'Registration failed. Please try again.')
        return
      }

      // Auto-login: store the token returned from registration
      localStorage.setItem(`customer_token_${slug}`, json.token)
      toast.success('Account created! Welcome.')
      onSuccess()
    } catch {
      toast.error('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="border-4 border-black shadow-[4px_4px_0px_0px_#1a1a1a] bg-white p-6 space-y-5"
    >
      <h2 className="font-black uppercase text-xl tracking-tighter">Create Account</h2>

      <Input
        label="Name"
        type="text"
        placeholder="Jane Doe"
        error={errors.name?.message}
        {...register('name')}
      />

      <Input
        label="Email"
        type="email"
        placeholder="you@example.com"
        error={errors.email?.message}
        {...register('email')}
      />

      <Input
        label="Password"
        type="password"
        placeholder="••••••••"
        error={errors.password?.message}
        {...register('password')}
      />

      <div>
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            className="mt-1 w-4 h-4 border-2 border-black accent-black"
            {...register('terms')}
          />
          <span className="text-sm font-medium">
            I agree to the{' '}
            <a href="#" className="font-bold underline">
              Terms &amp; Conditions
            </a>
          </span>
        </label>
        {errors.terms && (
          <p className="mt-1 text-xs font-bold text-secondary uppercase tracking-wider">
            {errors.terms.message}
          </p>
        )}
      </div>

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? 'Creating account…' : 'Create Account'}
      </Button>
    </form>
  )
}
