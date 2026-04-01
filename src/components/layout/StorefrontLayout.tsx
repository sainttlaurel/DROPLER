'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Icon } from '../ui/Icon'

interface StoreTheme {
  heroHeadline?: string | null
  heroSubheadline?: string | null
  heroDescription?: string | null
  heroCta1Text?: string | null
  announcementText?: string | null
  announcementEnabled?: boolean | null
}

interface StoreData {
  id: string
  name: string
  slug: string
  theme?: StoreTheme | null
}

interface StorefrontLayoutProps {
  children: React.ReactNode
}

export function StorefrontLayout({ children }: StorefrontLayoutProps) {
  const params = useParams()
  const slug = params.slug as string
  const { data: session } = useSession()

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [cartCount, setCartCount] = useState(0)
  const [store, setStore] = useState<StoreData | null>(null)
  const [isOwner, setIsOwner] = useState(false)

  const readCartCount = () => {
    try {
      const raw = localStorage.getItem(`cart_${slug}`)
      if (!raw) return 0
      const cart = JSON.parse(raw)
      const items: Array<{ quantity: number }> = cart.items || []
      return items.reduce((sum, item) => sum + item.quantity, 0)
    } catch {
      return 0
    }
  }

  useEffect(() => {
    // Fetch store data (name, theme/appearance settings)
    fetch(`/api/stores/${slug}`)
      .then((r) => r.json())
      .then((data) => {
        if (data && !data.error) setStore(data)
      })
      .catch(() => {})
  }, [slug])

  useEffect(() => {
    // Check if the logged-in admin owns this store
    if (session?.user?.storeId && store?.id) {
      setIsOwner(session.user.storeId === store.id)
    }
  }, [session, store])

  useEffect(() => {
    setCartCount(readCartCount())
    const handleCartUpdate = () => setCartCount(readCartCount())
    window.addEventListener('cart-updated', handleCartUpdate)
    window.addEventListener('storage', handleCartUpdate)
    return () => {
      window.removeEventListener('cart-updated', handleCartUpdate)
      window.removeEventListener('storage', handleCartUpdate)
    }
  }, [slug])

  const storeName = store?.name || 'Dropler'
  const theme = store?.theme
  const announcementText = theme?.announcementText || 'Free Shipping On All Orders Over $50'
  const announcementEnabled = theme?.announcementEnabled !== false

  return (
    <div className="min-h-screen bg-background">

      {/* Owner Admin Bar */}
      {isOwner && (
        <div className="bg-[#0055ff] border-b-4 border-[#1a1a1a] py-2 px-6 flex items-center justify-between z-[60] relative">
          <div className="flex items-center gap-3">
            <span className="font-headline font-black text-white text-xs uppercase tracking-widest">
              Owner Preview
            </span>
            <span className="w-2 h-2 rounded-full bg-[#ffcc00] animate-pulse"></span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/dashboard/appearance">
              <button className="flex items-center gap-1 bg-white text-[#0055ff] border-2 border-white px-3 py-1 font-headline font-black uppercase text-xs hover:bg-[#ffcc00] hover:text-[#1a1a1a] transition-colors">
                <Icon name="palette" size="sm" />
                Edit Appearance
              </button>
            </Link>
            <Link href="/dashboard/products">
              <button className="flex items-center gap-1 bg-white text-[#0055ff] border-2 border-white px-3 py-1 font-headline font-black uppercase text-xs hover:bg-[#ffcc00] hover:text-[#1a1a1a] transition-colors">
                <Icon name="inventory_2" size="sm" />
                Products
              </button>
            </Link>
            <Link href="/dashboard">
              <button className="flex items-center gap-1 bg-[#ffcc00] text-[#1a1a1a] border-2 border-[#1a1a1a] px-3 py-1 font-headline font-black uppercase text-xs hover:bg-white transition-colors">
                <Icon name="dashboard" size="sm" />
                Dashboard
              </button>
            </Link>
          </div>
        </div>
      )}

      {/* Announcement Bar */}
      {announcementEnabled && announcementText && (
        <div className="bg-primary border-b-4 border-primary py-3 px-6 text-center">
          <span className="font-headline font-bold text-sm tracking-widest text-on-primary uppercase">
            {announcementText}
          </span>
        </div>
      )}

      {/* Top Navigation */}
      <header className="sticky top-0 w-full border-b-4 border-primary bg-background z-50 neo-shadow">
        <nav className="flex justify-between items-center px-6 py-4 w-full max-w-none">
          <div className="flex items-center gap-8">
            <Link href={`/stores/${slug}`}>
              <span className="text-3xl font-black italic tracking-tighter text-primary cursor-pointer font-headline">
                {storeName}
              </span>
            </Link>
            <div className="hidden md:flex gap-6 font-headline uppercase font-bold tracking-tighter">
              <Link href={`/stores/${slug}`}>
                <span className="text-primary-container underline decoration-4 underline-offset-4 cursor-pointer">Shop</span>
              </Link>
              <Link href={`/stores/${slug}/categories`}>
                <span className="text-primary hover:bg-primary-container transition-colors duration-100 px-2 cursor-pointer">Categories</span>
              </Link>
              <Link href={`/stores/${slug}/support`}>
                <span className="text-primary hover:bg-primary-container transition-colors duration-100 px-2 cursor-pointer">Support</span>
              </Link>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden lg:flex items-center border-2 border-primary bg-white px-3 py-1">
              <Icon name="search" size="sm" className="text-primary mr-2" />
              <input
                className="bg-transparent border-none focus:ring-0 font-headline font-bold text-xs w-48 uppercase placeholder:normal-case"
                placeholder="Search..."
                type="text"
              />
            </div>
            <Link href={`/stores/${slug}/auth`}>
              <button className="p-2 hover:bg-primary-container transition-colors active:translate-x-[1px] active:translate-y-[1px]">
                <Icon name="person" size="lg" className="text-primary" />
              </button>
            </Link>
            <Link href={`/stores/${slug}/cart`}>
              <button className="relative p-2 hover:bg-primary-container transition-colors active:translate-x-[1px] active:translate-y-[1px]">
                <Icon name="shopping_cart" size="lg" className="text-primary" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-[#ffcc00] border-2 border-[#1a1a1a] text-[#1a1a1a] font-headline font-black text-xs w-5 h-5 flex items-center justify-center rounded-none">
                    {cartCount > 99 ? '99+' : cartCount}
                  </span>
                )}
              </button>
            </Link>
            <button className="md:hidden p-2" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              <Icon name="menu" size="lg" className="text-primary" />
            </button>
          </div>
        </nav>

        {mobileMenuOpen && (
          <div className="md:hidden border-t-4 border-primary bg-white p-6">
            <div className="flex flex-col gap-4 font-headline uppercase font-bold">
              <Link href={`/stores/${slug}`}><span className="block py-2 hover:bg-primary-container px-2">Shop</span></Link>
              <Link href={`/stores/${slug}/categories`}><span className="block py-2 hover:bg-primary-container px-2">Categories</span></Link>
              <Link href={`/stores/${slug}/support`}><span className="block py-2 hover:bg-primary-container px-2">Support</span></Link>
              <Link href={`/stores/${slug}/auth`}><span className="block py-2 hover:bg-primary-container px-2">Account</span></Link>
            </div>
          </div>
        )}
      </header>

      <main>{children}</main>

      <footer className="w-full border-t-4 border-primary mt-20 bg-primary">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 p-12 w-full">
          <div className="flex flex-col gap-6">
            <span className="text-4xl font-black text-primary-container font-headline uppercase">{storeName}</span>
            <p className="font-headline uppercase font-medium text-sm text-on-primary/80 leading-relaxed max-w-xs">
              Quality products curated for you.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-3">
              <span className="text-primary-container font-headline font-black uppercase text-sm mb-2">Shop</span>
              <Link href={`/stores/${slug}/products`}><span className="font-headline uppercase font-medium text-sm text-on-primary/80 hover:text-primary-container cursor-pointer">All Products</span></Link>
              <Link href={`/stores/${slug}/categories`}><span className="font-headline uppercase font-medium text-sm text-on-primary/80 hover:text-primary-container cursor-pointer">Categories</span></Link>
            </div>
            <div className="flex flex-col gap-3">
              <span className="text-primary-container font-headline font-black uppercase text-sm mb-2">Info</span>
              <Link href={`/stores/${slug}/support`}><span className="font-headline uppercase font-medium text-sm text-on-primary/80 hover:text-primary-container cursor-pointer">Support</span></Link>
            </div>
          </div>
          <div className="flex flex-col gap-6">
            <span className="text-primary-container font-headline font-black uppercase text-sm">Newsletter</span>
            <div className="flex border-2 border-on-primary">
              <input className="bg-transparent border-none focus:ring-0 font-headline text-on-primary p-3 w-full uppercase text-xs placeholder:text-on-primary/40" placeholder="YOUR@EMAIL.COM" type="email" />
              <button className="bg-primary-container text-primary px-4 font-black uppercase text-xs hover:bg-on-primary transition-colors">Join</button>
            </div>
          </div>
        </div>
        <div className="border-t-2 border-on-primary/10 p-12 pt-6">
          <span className="font-headline uppercase font-medium text-sm text-on-primary/60">© 2026 {storeName.toUpperCase()}. ALL RIGHTS RESERVED.</span>
        </div>
      </footer>
    </div>
  )
}
