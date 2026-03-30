'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { toast } from 'sonner'
import { signIn } from 'next-auth/react'
import { Button } from '@/components/ui/Button'
import { getSafeAuthCallbackUrl } from '@/lib/auth-redirect'
import React, { Suspense } from 'react'

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  storeName: z.string().min(2, 'Store name must be at least 2 characters'),
  terms: z.boolean().refine((val) => val === true, {
    message: 'You must accept the terms',
  }),
})

type RegisterFormData = z.infer<typeof registerSchema>

function RegisterContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isLoading, setIsLoading] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  })

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true)

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok) {
        toast.error(result.error || 'Registration failed')
        return
      }

      toast.success('Account created successfully!')

      const signInResult = await signIn('credentials', {
        email: data.email,
        password: data.password,
        redirect: false,
      })

      if (signInResult?.error) {
        router.push('/auth/login')
      } else {
        router.push(getSafeAuthCallbackUrl(searchParams.toString()))
        router.refresh()
      }
    } catch (error) {
      toast.error('Something went wrong')
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true)
    try {
      await signIn('google', {
        callbackUrl: getSafeAuthCallbackUrl(searchParams.toString()),
      })
    } finally {
      setIsGoogleLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-grow flex items-center justify-center px-6 py-20 relative overflow-hidden">
        {/* Abstract Background Geometrics */}
        <div className="absolute top-10 left-10 w-32 h-32 bg-secondary/10 border-4 border-primary rounded-full -z-10"></div>
        <div className="absolute bottom-20 right-20 w-48 h-48 bg-primary-container/20 border-4 border-primary -z-10 rotate-12"></div>
        <div className="absolute top-1/2 left-0 w-24 h-4 bg-tertiary -z-10 -translate-y-1/2"></div>

        <div className="w-full max-w-xl">
          {/* Brand Anchor */}
          <div className="mb-12 text-center">
            <Link href="/">
              <h1 className="text-6xl font-headline font-black uppercase italic tracking-tighter text-primary hover:text-primary-container transition-colors cursor-pointer">
                Dropler
              </h1>
            </Link>
            <p className="font-headline font-bold uppercase tracking-widest mt-2 text-primary/60">
              Admin Registration
            </p>
          </div>

          {/* Form Card */}
          <div className="bg-white border-4 border-primary p-8 md:p-12 neo-shadow">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
              <div className="space-y-6">
                {/* Full Name */}
                <div className="relative">
                  <label className="block font-headline font-bold uppercase text-xs mb-2 tracking-wider" htmlFor="name">
                    Full Name
                  </label>
                  <input
                    {...register('name')}
                    autoComplete="name"
                    className="w-full px-0 py-3 bg-transparent border-t-0 border-x-0 border-b-4 border-primary focus:ring-0 focus:border-tertiary font-headline font-bold text-lg placeholder:text-primary/20 placeholder:uppercase transition-colors"
                    id="name"
                    type="text"
                    placeholder="MIES VAN DER ROHE"
                  />
                  {errors.name && (
                    <p className="mt-2 text-xs font-bold text-secondary uppercase tracking-wider">
                      {errors.name.message}
                    </p>
                  )}
                </div>

                {/* Email */}
                <div className="relative">
                  <label className="block font-headline font-bold uppercase text-xs mb-2 tracking-wider" htmlFor="email">
                    Email Address
                  </label>
                  <input
                    {...register('email')}
                    autoComplete="email"
                    className="w-full px-0 py-3 bg-transparent border-t-0 border-x-0 border-b-4 border-primary focus:ring-0 focus:border-tertiary font-headline font-bold text-lg placeholder:text-primary/20 placeholder:uppercase transition-colors"
                    id="email"
                    type="email"
                    placeholder="ADMIN@DROPLER.COM"
                  />
                  {errors.email && (
                    <p className="mt-2 text-xs font-bold text-secondary uppercase tracking-wider">
                      {errors.email.message}
                    </p>
                  )}
                </div>

                {/* Password */}
                <div className="relative">
                  <label className="block font-headline font-bold uppercase text-xs mb-2 tracking-wider" htmlFor="password">
                    Password
                  </label>
                  <input
                    {...register('password')}
                    autoComplete="new-password"
                    className="w-full px-0 py-3 bg-transparent border-t-0 border-x-0 border-b-4 border-primary focus:ring-0 focus:border-tertiary font-headline font-bold text-lg placeholder:text-primary/20 transition-colors"
                    id="password"
                    type="password"
                    placeholder="••••••••"
                  />
                  {errors.password && (
                    <p className="mt-2 text-xs font-bold text-secondary uppercase tracking-wider">
                      {errors.password.message}
                    </p>
                  )}
                </div>

                {/* Store Name */}
                <div className="relative">
                  <label className="block font-headline font-bold uppercase text-xs mb-2 tracking-wider" htmlFor="storeName">
                    Store Name
                  </label>
                  <div className="flex items-center">
                    <span className="font-headline font-bold text-primary/40 mr-2 text-lg">
                      dropler.io/
                    </span>
                    <input
                      {...register('storeName')}
                      autoComplete="organization"
                      className="w-full px-0 py-3 bg-transparent border-t-0 border-x-0 border-b-4 border-primary focus:ring-0 focus:border-tertiary font-headline font-bold text-lg placeholder:text-primary/20 transition-colors"
                      id="storeName"
                      type="text"
                      placeholder="my-awesome-store"
                    />
                  </div>
                  {errors.storeName && (
                    <p className="mt-2 text-xs font-bold text-secondary uppercase tracking-wider">
                      {errors.storeName.message}
                    </p>
                  )}
                </div>

                {/* Terms */}
                <div className="flex items-start pt-2">
                  <div className="flex items-center h-5">
                    <input
                      {...register('terms')}
                      className="h-5 w-5 rounded-none border-4 border-primary text-tertiary focus:ring-0 transition-all checked:bg-tertiary"
                      id="terms"
                      type="checkbox"
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <label className="font-headline font-bold uppercase tracking-tight text-primary" htmlFor="terms">
                      I agree to the{' '}
                      <Link href="/dashboard/legal" className="text-tertiary underline decoration-2 underline-offset-4 hover:bg-tertiary hover:text-white">
                        Terms of Service
                      </Link>
                    </label>
                    {errors.terms && (
                      <p className="mt-1 text-xs font-bold text-secondary uppercase tracking-wider">
                        {errors.terms.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-4 pt-4">
                <Button
                  type="submit"
                  variant="yellow"
                  className="w-full text-xl"
                  disabled={isLoading}
                >
                  {isLoading ? 'Creating Store...' : 'Create Store'}
                </Button>

                <div className="flex items-center gap-4 py-2">
                  <div className="h-1 flex-grow bg-primary/10"></div>
                  <span className="font-headline font-bold text-xs uppercase text-primary/40">OR</span>
                  <div className="h-1 flex-grow bg-primary/10"></div>
                </div>

                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={isGoogleLoading || isLoading}
                  className="w-full py-4 bg-white border-4 border-primary font-headline font-black uppercase text-xl tracking-tighter text-primary flex items-center justify-center gap-3 hover:bg-secondary hover:text-white active:translate-x-1 active:translate-y-1 transition-all neo-shadow active:shadow-none disabled:opacity-50"
                >
                  <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                    <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.908 3.152-1.928 4.176-1.024 1.032-2.312 1.82-5.912 1.82-5.744 0-10.24-4.664-10.24-10.4s4.496-10.4 10.24-10.4c3.128 0 5.392 1.232 7.072 2.832l2.312-2.312c-2.024-1.936-4.944-3.416-9.384-3.416-7.832 0-14.28 6.336-14.28 14.28s6.448 14.28 14.28 14.28c4.248 0 7.456-1.4 9.872-3.92 2.504-2.504 3.32-6.008 3.32-8.76 0-.568-.04-1.128-.128-1.648h-13.064z" />
                  </svg>
                  {isGoogleLoading ? 'Connecting...' : 'Sign up with Google'}
                </button>
              </div>

              {/* Login Link */}
              <div className="text-center mt-8">
                <p className="font-headline font-bold uppercase tracking-tight text-primary">
                  Already have an account?{' '}
                  <Link href="/auth/login" className="text-tertiary underline decoration-4 underline-offset-4 hover:bg-tertiary hover:text-white ml-1">
                    Log in
                  </Link>
                </p>
              </div>
            </form>
          </div>
        </div>
      </main>

      <footer className="py-6 text-center font-headline font-bold text-xs uppercase opacity-40">
        © {new Date().getFullYear()} Dropler
      </footer>
    </div>
  )
}

export default function RegisterPage() {
  const LazyRegisterContent = React.lazy(() => Promise.resolve({ default: RegisterContent }))
  
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg font-bold uppercase tracking-wide text-primary">Loading...</p>
        </div>
      </div>
    }>
      <RegisterContent />
    </Suspense>
  )
}

