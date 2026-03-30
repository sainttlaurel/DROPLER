'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { customerLoginSchema, CustomerLoginData } from '@/lib/validations/auth'

interface LoginFormProps {
  slug: string
  onSuccess: () => void
}

export function LoginForm({ slug, onSuccess }: LoginFormProps) {
  const [loading, setLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CustomerLoginData>({
    resolver: zodResolver(customerLoginSchema),
  })

  const onSubmit = async (data: CustomerLoginData) => {
    setLoading(true)
    try {
      const res = await fetch(`/api/stores/${slug}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      const json = await res.json()

      if (!res.ok) {
        toast.error(json.error || 'Login failed. Please try again.')
        return
      }

      localStorage.setItem(`customer_token_${slug}`, json.token)
      toast.success('Welcome back!')
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
      <h2 className="font-black uppercase text-xl tracking-tighter">Sign In</h2>

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

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? 'Signing in…' : 'Sign In'}
      </Button>
    </form>
  )
}
