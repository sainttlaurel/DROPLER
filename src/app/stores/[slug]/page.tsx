'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'sonner'
import { StorefrontLayout } from '@/components/layout/StorefrontLayout'
import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'

interface Product {
  id: string
  name: string
  price: number
  image: string | null
  category: { name: string } | null
  status: string
}

interface StoreTheme {
  heroHeadline?: string | null
  heroSubheadline?: string | null
  heroDescription?: string | null
  heroCta1Text?: string | null
  heroCta2Text?: string | null
  announcementText?: string | null
  announcementEnabled?: boolean | null
  trustBadge1Title?: string | null
  trustBadge1Desc?: string | null
  trustBadge2Title?: string | null
  trustBadge2Desc?: string | null
  trustBadge3Title?: string | null
  trustBadge3Desc?: string | null
  stat1Label?: string | null
  stat1Value?: string | null
  stat2Label?: string | null
  stat2Value?: string | null
}

// ── Hero Carousel ──────────────────────────────────────────────────────────────
function HeroCarousel({ products, slug }: { products: Product[]; slug: string }) {
  const slides = products.filter(p => p.image).slice(0, 6)
  const [current, setCurrent] = useState(0)

  const next = useCallback(
    () => setCurrent(i => (i + 1) % Math.max(slides.length, 1)),
    [slides.length]
  )
  const prev = () =>
    setCurrent(i => (i - 1 + Math.max(slides.length, 1)) % Math.max(slides.length, 1))

  useEffect(() => {
    if (slides.length < 2) return
    const t = setInterval(next, 3500)
    return () => clearInterval(t)
  }, [slides.length, next])

  if (slides.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center min-h-[400px]">
        <Icon name="inventory_2" className="text-9xl opacity-20" />
      </div>
    )
  }

  return (
    <div className="relative w-full h-full min-h-[400px] overflow-hidden select-none">
      {slides.map((s, i) => (
        <Link key={s.id} href={`/stores/${slug}/products/${s.id}`}>
          <div
            className={`absolute inset-0 transition-opacity duration-700 ${
              i === current ? 'opacity-100 z-10' : 'opacity-0 z-0'
            }`}
          >
            <img src={s.image!} alt={s.name} className="w-full h-full object-cover" />
            <div className="absolute bottom-0 left-0 right-0 bg-[#1a1a1a]/80 px-6 py-4 z-20">
              <p className="font-headline font-black uppercase text-white text-lg leading-tight truncate">
                {s.name}
              </p>
              <p className="font-headline font-bold text-[#ffcc00] text-sm">
                ${s.price.toFixed(2)}
              </p>
            </div>
          </div>
        </Link>
      ))}

      {slides.length > 1 && (
        <>
          <button
            onClick={e => { e.preventDefault(); prev() }}
            className="absolute left-3 top-1/2 -translate-y-1/2 z-30 w-10 h-10 bg-white border-4 border-[#1a1a1a] flex items-center justify-center hover:bg-[#ffcc00] transition-colors shadow-[3px_3px_0px_0px_rgba(26,26,26,1)]"
            aria-label="Previous"
          >
            <Icon name="chevron_left" size="sm" />
          </button>
          <button
            onClick={e => { e.preventDefault(); next() }}
            className="absolute right-3 top-1/2 -translate-y-1/2 z-30 w-10 h-10 bg-white border-4 border-[#1a1a1a] flex items-center justify-center hover:bg-[#ffcc00] transition-colors shadow-[3px_3px_0px_0px_rgba(26,26,26,1)]"
            aria-label="Next"
          >
            <Icon name="chevron_right" size="sm" />
          </button>
          <div className="absolute bottom-16 left-1/2 -translate-x-1/2 z-30 flex gap-2">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={e => { e.preventDefault(); setCurrent(i) }}
                className={`w-3 h-3 border-2 border-white transition-colors ${
                  i === current ? 'bg-[#ffcc00]' : 'bg-white/40'
                }`}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}

// ── Page ───────────────────────────────────────────────────────────────────────
export default function StorefrontHomePage() {
  const params = useParams()
  const slug = params.slug as string
  const [products, setProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState('ALL')
  const [theme, setTheme] = useState<StoreTheme | null>(null)

  useEffect(() => {
    fetchProducts()
    fetch(`/api/stores/${slug}`)
      .then(r => r.json())
      .then(data => { if (data?.theme) setTheme(data.theme) })
      .catch(() => {})
  }, [slug])

  useEffect(() => {
    filterProducts()
  }, [products, selectedCategory])

  const fetchProducts = async () => {
    try {
      const res = await fetch(`/api/stores/${slug}/products`)
      const data = await res.json()
      setProducts(Array.isArray(data) ? data : [])
    } catch {
      toast.error('Failed to load products')
    } finally {
      setLoading(false)
    }
  }

  const filterProducts = () => {
    if (selectedCategory === 'ALL') {
      setFilteredProducts(products)
    } else {
      setFilteredProducts(products.filter(p => p.category?.name === selectedCategory))
    }
  }

  const addToCart = (product: Product) => {
    const cartKey = `cart_${slug}`
    const existing = localStorage.getItem(cartKey)
    let cart
    try {
      cart = existing ? JSON.parse(existing) : { items: [], lastUpdated: new Date().toISOString() }
    } catch (error) {
      console.error('Failed to parse cart from localStorage:', error)
      cart = { items: [], lastUpdated: new Date().toISOString() }
    }
    const existingItem = cart.items.find((i: { productId: string }) => i.productId === product.id)
    if (existingItem) {
      existingItem.quantity += 1
    } else {
      cart.items.push({
        id: `${product.id}_${Date.now()}`,
        productId: product.id,
        name: product.name,
        price: product.price,
        quantity: 1,
        image: product.image,
      })
    }
    cart.lastUpdated = new Date().toISOString()
    localStorage.setItem(cartKey, JSON.stringify(cart))
    toast.success(`${product.name} added to cart`)
    window.dispatchEvent(new Event('cart-updated'))
  }

  const categories = [
    'ALL',
    ...Array.from(new Set(products.map(p => p.category?.name).filter(Boolean) as string[])),
  ]

  return (
    <StorefrontLayout>
      {/* Hero */}
      <section className="grid grid-cols-1 lg:grid-cols-12 min-h-[600px] border-b-4 border-primary">
        <div className="lg:col-span-7 p-8 md:p-16 flex flex-col justify-center items-start border-b-4 lg:border-b-0 lg:border-r-4 border-primary">
          <span className="bg-secondary text-white font-headline font-black px-4 py-1 mb-6 text-xl uppercase tracking-tighter">
            Limited Drop
          </span>
          <h1 className="font-headline font-black text-6xl md:text-9xl text-primary leading-[0.85] tracking-tighter uppercase mb-6">
            {theme?.heroHeadline || 'New\nArrivals'}
          </h1>
          <p className="font-headline font-bold text-2xl md:text-4xl text-primary/80 uppercase mb-4 tracking-tight">
            {theme?.heroSubheadline || 'Form Meets Function'}
          </p>
          {theme?.heroDescription && (
            <p className="font-body text-lg text-primary/70 mb-8 max-w-md">{theme.heroDescription}</p>
          )}
          <div className="flex flex-wrap gap-4">
            <Link href={`/stores/${slug}/products`}>
              <Button variant="yellow" size="lg" className="text-2xl px-10 py-5">
                {theme?.heroCta1Text || 'Shop Now'}
              </Button>
            </Link>
            {theme?.heroCta2Text && (
              <Link href={`/stores/${slug}/products`}>
                <Button variant="ghost" size="lg" className="text-2xl px-10 py-5 border border-current">
                  {theme.heroCta2Text}
                </Button>
              </Link>
            )}
          </div>
        </div>
        <div className="lg:col-span-5 overflow-hidden relative">
          <HeroCarousel products={products} slug={slug} />
        </div>
      </section>

      {/* Trust Badges */}
      <section className="p-6 md:p-12 bg-white">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { title: theme?.trustBadge1Title || 'Quality Products', desc: theme?.trustBadge1Desc || 'Carefully selected items that meet our high standards.', icon: 'verified', hover: 'hover:bg-primary-container' },
            { title: theme?.trustBadge2Title || 'Secure Checkout', desc: theme?.trustBadge2Desc || 'Encrypted transactions via global standards.', icon: 'verified_user', hover: 'hover:bg-tertiary-container' },
            { title: theme?.trustBadge3Title || 'Fast Shipping', desc: theme?.trustBadge3Desc || 'Quick processing and reliable delivery.', icon: 'local_shipping', hover: 'hover:bg-secondary-container' },
          ].map((badge, i) => (
            <div key={i} className={`border-4 border-primary p-8 bg-surface-container neo-shadow flex flex-col items-center text-center group ${badge.hover} transition-colors`}>
              <Icon name={badge.icon} size="xl" className="mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="font-headline font-black text-2xl uppercase mb-2">{badge.title}</h3>
              <p className="font-body font-medium uppercase text-sm">{badge.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Stats Bar */}
      {(theme?.stat1Value || theme?.stat2Value) && (
        <section className="border-t-4 border-b-4 border-primary bg-primary text-on-primary">
          <div className="flex divide-x-4 divide-primary/30">
            {theme?.stat1Value && (
              <div className="flex-1 p-8 text-center">
                <p className="font-headline font-black text-5xl mb-2">{theme.stat1Value}</p>
                <p className="font-headline font-bold uppercase text-sm opacity-70">{theme.stat1Label}</p>
              </div>
            )}
            {theme?.stat2Value && (
              <div className="flex-1 p-8 text-center">
                <p className="font-headline font-black text-5xl mb-2">{theme.stat2Value}</p>
                <p className="font-headline font-bold uppercase text-sm opacity-70">{theme.stat2Label}</p>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Category Filters */}
      <section className="px-6 md:px-12 py-10 border-t-4 border-primary bg-background">
        <div className="flex flex-wrap items-center gap-4 justify-center md:justify-start">
          <span className="font-headline font-black text-xl uppercase mr-4">Filter:</span>
          {categories.map(category => (
            <button
              key={category}
              className={`px-6 py-2 border-4 border-primary font-headline font-bold uppercase transition-all active:translate-x-[2px] active:translate-y-[2px] active:shadow-none ${
                selectedCategory === category
                  ? 'bg-primary text-on-primary'
                  : 'bg-white text-primary hover:bg-primary-container'
              }`}
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </button>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="px-6 md:px-12 pb-24">
        <div className="flex items-baseline justify-between mb-10 border-b-4 border-primary pb-4">
          <h2 className="font-headline font-black text-5xl md:text-7xl uppercase tracking-tighter">Featured</h2>
          <Link href={`/stores/${slug}/products`}>
            <span className="font-headline font-bold text-xl uppercase underline decoration-4 underline-offset-4 hover:text-tertiary cursor-pointer">
              View All
            </span>
          </Link>
        </div>

        {loading ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <Icon name="refresh" size="xl" className="animate-spin text-primary mb-4" />
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="flex items-center justify-center min-h-[400px] text-center">
            <div>
              <Icon name="inventory_2" size="xl" className="opacity-20 mb-4" />
              <p className="font-headline font-bold uppercase text-lg mb-2">No Products Found</p>
              <p className="text-sm opacity-60">Check back soon for new arrivals</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {filteredProducts.slice(0, 8).map(product => (
              <div
                key={product.id}
                className="group border-4 border-primary bg-white neo-shadow-lg hover:translate-x-[-4px] hover:translate-y-[-4px] hover:shadow-[12px_12px_0px_0px_#1a1a1a] transition-all"
              >
                <Link href={`/stores/${slug}/products/${product.id}`}>
                  <div className="aspect-square border-b-4 border-primary overflow-hidden bg-surface-container relative cursor-pointer">
                    {product.image ? (
                      <img
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        src={product.image}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Icon name="image" size="xl" className="opacity-40" />
                      </div>
                    )}
                    <div className="absolute top-4 right-4 bg-tertiary text-white font-headline font-bold px-3 py-1 text-sm uppercase">
                      New
                    </div>
                  </div>
                </Link>
                <div className="p-6">
                  <p className="font-headline font-medium text-xs text-primary/60 uppercase mb-1">
                    {product.category?.name || 'Uncategorized'}
                  </p>
                  <Link href={`/stores/${slug}/products/${product.id}`}>
                    <h3 className="font-headline font-black text-2xl uppercase mb-2 tracking-tight hover:text-tertiary cursor-pointer">
                      {product.name}
                    </h3>
                  </Link>
                  <p className="font-headline font-bold text-xl mb-4">${product.price.toFixed(2)}</p>
                  <button
                    onClick={() => addToCart(product)}
                    className="w-full border-4 border-primary py-3 font-headline font-black uppercase text-sm bg-[#ffcc00] hover:bg-primary hover:text-white transition-colors active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </StorefrontLayout>
  )
}
