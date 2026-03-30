'use client'

import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { Icon } from '@/components/ui/Icon'
import { Button } from '@/components/ui/Button'

export function TopNav() {
  const { data: session } = useSession()

  return (
    <header className="sticky top-0 z-50 flex justify-between items-center px-6 py-4 w-full bg-background border-b-4 border-outline neo-shadow">
      <div className="flex items-center gap-8">
        <Link href="/" className="text-3xl font-black text-primary uppercase italic font-headline tracking-tighter hover:text-primary-container transition-colors">
          Dropler
        </Link>
        
        <nav className="hidden md:flex items-center gap-8 font-headline font-bold uppercase tracking-tighter">
          <Link href="#features" className="text-primary hover:bg-primary-container hover:text-on-primary-container transition-colors duration-75 px-2 py-1">
            Features
          </Link>
          <Link href="#pricing" className="text-primary hover:bg-primary-container hover:text-on-primary-container transition-colors duration-75 px-2 py-1">
            Pricing
          </Link>
          <Link href="#testimonials" className="text-primary hover:bg-primary-container hover:text-on-primary-container transition-colors duration-75 px-2 py-1">
            Testimonials
          </Link>
        </nav>
      </div>

      <div className="flex items-center gap-4">
        {session ? (
          <>
            <Link href="/dashboard">
              <Button variant="ghost" size="sm">
                Dashboard
              </Button>
            </Link>
            <Button 
              variant="yellow" 
              size="sm"
              onClick={() => signOut()}
            >
              Sign Out
            </Button>
          </>
        ) : (
          <>
            <Link href="/auth/login" className="hidden md:block">
              <Button variant="ghost" size="sm">
                Login
              </Button>
            </Link>
            <Link href="/auth/register">
              <Button variant="yellow" size="sm">
                Get Started
              </Button>
            </Link>
          </>
        )}
      </div>
    </header>
  )
}
