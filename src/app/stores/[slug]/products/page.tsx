'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'sonner'
import { StorefrontLayout } from '@/components/layout/StorefrontLayout'
import { Icon } from '@/components/ui/Icon'

interface Product {
  id: string
  name: string
  price: number
  image: string | null
  description: string | null
  category: { name: string } | null
}

export default function StorefrontProductsPage() {
  const params = useParams()
  const slug = params.slug as string

  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('ALL')
  const [categories, setCategories] = useState<string[]>(['ALL'])

  const fetchProducts = useCallback(async () => {
    setLoading(true)
    try {
      const qs = new URLSearchParams()
      if (search) qs.set('search', search)
      if (selectedCategory !== 'ALL') qs.set('category', selectedCategory)

      const res = await fetch(`/api/stores/${slug}/products?${qs.toString()}`)
      const data = await res.json()
      const list: Product[] = Array.isArray(data) ? data : []
      setProducts(list)

      // Build category list from results when no filter active
      if (selectedCategory === 'ALL' && !search) {
        const cats = Array.from(
          new Set(list.map((p) => p.category?.name).filter(Boolean) as string[])
        )
        setCategories(['ALL', ...cats])
      }
    } catch {
      toast.error('Failed to load products')
    } finally {
      setLoading(false)
    }
  }, [slug, search, selectedCategory])

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  const addToCart = (product: Product) => {
    const cartKey = `cart_${slug}`
    const existing = localStorage.getItem(cartKey)
    let cart
    try {
      cart = existing
        ? JSON.parse(existing)
        : { items: [], lastUpdated: new Date().toISOString() }
    } catch (error) {
      console.error('Failed to parse cart:', error)
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

  return (
    <StorefrontLayout>
      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* Header */}
        <header className="mb-12 border-b-4 border-[#1a1a1a] pb-8">
          <h1 className="text-7xl font-black uppercase tracking-tighter leading-none mb-4 font-headline">
            All Products
          </h1>
          <p className="font-headline font-medium text-xl border-l-8 border-[#ffcc00] pl-4">
            Browse our full collection of quality products.
          </p>
        </header>

        {/* Search + Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-10">
          <div className="flex items-center border-4 border-[#1a1a1a] bg-white px-4 py-2 flex-1 shadow-[4px_4px_0px_0px_rgba(26,26,26,1)]">
            <Icon name="search" size="sm" className="mr-2 opacity-60" />
            <input
              className="bg-transparent border-none focus:ring-0 font-headline font-bold text-sm uppercase placeholder:normal-case focus:outline-none w-full"
              placeholder="Search products..."
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 border-4 border-[#1a1a1a] font-headline font-bold uppercase text-sm transition-all active:translate-x-[2px] active:translate-y-[2px] ${
                  selectedCategory === cat
                    ? 'bg-[#1a1a1a] text-white'
                    : 'bg-white hover:bg-[#ffcc00]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <Icon name="refresh" size="xl" className="animate-spin mb-4" />
              <p className="font-headline font-bold uppercase text-lg">Loading Products...</p>
            </div>
          </div>
        ) : products.length === 0 ? (
          <div className="flex items-center justify-center min-h-[400px] border-4 border-[#1a1a1a] bg-white shadow-[4px_4px_0px_0px_rgba(26,26,26,1)]">
            <div className="text-center p-12">
              <Icon name="inventory_2" size="xl" className="opacity-20 mb-4" />
              <p className="font-headline font-bold uppercase text-lg mb-2">No Products Found</p>
              <p className="text-sm opacity-60">Try a different search or category</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {products.map((product) => (
              <div
                key={product.id}
                className="group border-4 border-[#1a1a1a] bg-white shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] hover:translate-x-[-4px] hover:translate-y-[-4px] hover:shadow-[12px_12px_0px_0px_#1a1a1a] transition-all"
              >
                <Link href={`/stores/${slug}/products/${product.id}`}>
                  <div className="aspect-square border-b-4 border-[#1a1a1a] overflow-hidden bg-gray-50 relative cursor-pointer">
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
                  </div>
                </Link>
                <div className="p-5">
                  <p className="font-headline font-medium text-xs opacity-60 uppercase mb-1">
                    {product.category?.name || 'Uncategorized'}
                  </p>
                  <Link href={`/stores/${slug}/products/${product.id}`}>
                    <h3 className="font-headline font-black text-xl uppercase mb-1 tracking-tight hover:text-[#0055ff] cursor-pointer line-clamp-2">
                      {product.name}
                    </h3>
                  </Link>
                  <p className="font-headline font-bold text-lg mb-4">${product.price.toFixed(2)}</p>
                  <button
                    onClick={() => addToCart(product)}
                    className="w-full border-4 border-[#1a1a1a] py-2 font-headline font-black uppercase text-sm bg-[#ffcc00] hover:bg-[#1a1a1a] hover:text-white transition-colors active:translate-x-[2px] active:translate-y-[2px]"
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </StorefrontLayout>
  )
}
