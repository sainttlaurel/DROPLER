'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { StorefrontLayout } from '@/components/layout/StorefrontLayout'
import { LoginForm } from '@/components/auth/LoginForm'
import { RegisterForm } from '@/components/auth/RegisterForm'
import { OAuthButtons } from '@/components/auth/OAuthButtons'

type Tab = 'login' | 'register'

export default function CustomerAuthPage() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const slug = params.slug as string

  const [activeTab, setActiveTab] = useState<Tab>('login')

  const redirectParam = searchParams.get('redirect')
  const redirectTo =
    redirectParam === 'checkout'
      ? `/stores/${slug}/checkout`
      : `/stores/${slug}/account`

  // Redirect already-authenticated customers
  useEffect(() => {
    const token = localStorage.getItem(`customer_token_${slug}`)
    if (token) {
      router.replace(redirectTo)
    }
  }, [slug, redirectTo, router])

  const handleSuccess = () => {
    router.push(redirectTo)
  }

  return (
    <StorefrontLayout>
      <div className="min-h-screen bg-background flex items-start justify-center px-4 py-16">
        <div className="w-full max-w-md">
          {/* Page heading */}
          <h1 className="font-headline font-black uppercase text-5xl tracking-tighter leading-none mb-8">
            {activeTab === 'login' ? 'Sign In' : 'Join Us'}
          </h1>

          {/* Tab switcher */}
          <div className="flex border-4 border-black mb-6 shadow-[4px_4px_0px_0px_#1a1a1a]">
            <button
              onClick={() => setActiveTab('login')}
              className={`flex-1 py-3 font-headline font-black uppercase text-sm tracking-tighter transition-colors ${
                activeTab === 'login'
                  ? 'bg-primary text-on-primary'
                  : 'bg-white text-primary hover:bg-primary-container'
              }`}
            >
              Login
            </button>
            <button
              onClick={() => setActiveTab('register')}
              className={`flex-1 py-3 font-headline font-black uppercase text-sm tracking-tighter border-l-4 border-black transition-colors ${
                activeTab === 'register'
                  ? 'bg-primary text-on-primary'
                  : 'bg-white text-primary hover:bg-primary-container'
              }`}
            >
              Register
            </button>
          </div>

          {/* Forms */}
          {activeTab === 'login' ? (
            <div className="space-y-4">
              <LoginForm slug={slug} onSuccess={handleSuccess} />

              {/* Forgot password */}
              <div className="text-center">
                <Link
                  href="#"
                  className="font-headline font-bold text-sm uppercase tracking-tighter underline decoration-2 underline-offset-2 hover:opacity-70 transition-opacity"
                >
                  Forgot Password?
                </Link>
              </div>

              <OAuthButtons slug={slug} />
            </div>
          ) : (
            <div className="space-y-4">
              <RegisterForm slug={slug} onSuccess={handleSuccess} />
              <OAuthButtons slug={slug} />
            </div>
          )}

          {/* Continue as guest */}
          <div className="mt-8 border-t-4 border-black pt-6 text-center">
            <p className="font-headline font-bold text-sm uppercase tracking-tighter mb-3 opacity-60">
              No account needed
            </p>
            <Link
              href={`/stores/${slug}`}
              className="inline-block w-full py-3 border-4 border-black bg-white font-headline font-black uppercase text-sm tracking-tighter shadow-[4px_4px_0px_0px_#1a1a1a] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_#1a1a1a] transition-all text-center"
            >
              Continue as Guest
            </Link>
          </div>
        </div>
      </div>
    </StorefrontLayout>
  )
}
