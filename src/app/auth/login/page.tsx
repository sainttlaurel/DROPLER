'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { toast } from 'sonner'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Icon } from '@/components/ui/Icon'


const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

type LoginFormData = z.infer<typeof loginSchema>

export default function LoginPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true)

    try {
      const result = await signIn('credentials', {
        email: data.email,
        password: data.password,
        redirect: false,
      })

      if (result?.error) {
        toast.error('Invalid email or password')
      } else {
        toast.success('Welcome back!')
        const searchParams = new URLSearchParams(window.location.search)
        const callbackUrl = searchParams.get('callbackUrl')
        
        if (callbackUrl && callbackUrl.startsWith('/store/')) {
          router.push(callbackUrl)
        } else {
          router.push('/dashboard')
        }
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
      await signIn('google', { callbackUrl: '/dashboard' })
    } finally {
      setIsGoogleLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-grow flex items-center justify-center p-6 sm:p-12">
        <div className="max-w-md w-full">
          {/* Brand Header */}
          <div className="mb-12 text-center">
            <Link href="/">
              <h1 className="font-headline text-6xl font-black italic uppercase tracking-tighter text-primary hover:text-primary-container transition-colors cursor-pointer">
                Dropler
              </h1>
            </Link>
            <p className="font-headline font-bold text-lg uppercase mt-2 tracking-widest text-on-surface-variant">
              Admin Portal / v2.0
            </p>
          </div>

          {/* Login Card */}
          <div className="bg-surface border-4 border-primary p-8 neo-shadow relative">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div>
                <label className="block font-headline font-bold uppercase text-xs mb-2 tracking-widest" htmlFor="email">
                  Email Address
                </label>
                <input
                  {...register('email')}
                  className="w-full bg-transparent border-b-4 border-primary focus:border-primary-container focus:ring-0 px-0 py-3 font-body text-lg placeholder:text-on-surface-variant/40 placeholder:uppercase"
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

              <div>
                <div className="flex justify-between items-baseline mb-2">
                  <label className="block font-headline font-bold uppercase text-xs tracking-widest" htmlFor="password">
                    Password
                  </label>
                  <Link href="/auth/forgot-password" className="font-headline font-bold text-[10px] uppercase text-tertiary hover:underline">
                    Forgot Password?
                  </Link>
                </div>
                <input
                  {...register('password')}
                  className="w-full bg-transparent border-b-4 border-primary focus:border-primary-container focus:ring-0 px-0 py-3 font-body text-lg placeholder:text-on-surface-variant/40"
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

              <div className="pt-4 space-y-4">
                <Button
                  type="submit"
                  variant="primary"
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading ? 'Logging in...' : 'Login'}
                </Button>

                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={isGoogleLoading || isLoading}
                  className="w-full py-4 bg-transparent text-primary font-headline font-bold uppercase text-lg tracking-widest border-4 border-primary neo-shadow hover:neo-shadow-active active:neo-shadow-active transition-all hover:bg-tertiary-container flex items-center justify-center gap-3 disabled:opacity-50"
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                  {isGoogleLoading ? 'Connecting...' : 'Login with Google'}
                </button>
              </div>
            </form>

            <div className="mt-8 text-center">
              <p className="font-headline font-bold text-xs uppercase tracking-widest text-on-surface-variant">
                Don't have an account?{' '}
                <Link href="/auth/register" className="text-secondary hover:underline ml-1">
                  Sign up
                </Link>
              </p>
            </div>
          </div>

          {/* System Status */}
          <div className="mt-12 flex justify-between px-2">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 bg-secondary"></span>
              <span className="font-headline font-bold text-[10px] uppercase tracking-tighter">
                System: Stable
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-headline font-bold text-[10px] uppercase tracking-tighter text-on-surface-variant">
                Auth: AES-256
              </span>
            </div>
          </div>
        </div>
      </main>

      <footer className="py-6 text-center font-headline font-bold text-xs uppercase opacity-40">
        © {new Date().getFullYear()} Dropler
      </footer>
    </div>
  )
}