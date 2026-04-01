'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'sonner'
import { StorefrontLayout } from '@/components/layout/StorefrontLayout'
import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'

interface Product {
  id: string
  name: string
  description: string | null
  price: number
  compareAtPrice: number | null
  image: string | null
  images: string | null
  category: { name: string } | null
  inventory: number
  status: string
}

export default function StorefrontProductDetailPage() {
  const params = useParams()
  const router = useRouter()
  const slug = params.slug as string
  const id = params.id as string

  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)
  const [selectedImage, setSelectedImage] = useState(0)

  useEffect(() => {
    fetchProduct()
  }, [id])

  const fetchProduct = async () => {
    try {
      const res = await fetch(`/api/stores/${slug}/products/${id}`)
      if (!res.ok) throw new Error('Product not found')
      const data = await res.json()
      setProduct(data)
    } catch {
      toast.error('Failed to load product')
      router.push(`/stores/${slug}`)
    } finally {
      setLoading(false)
    }
  }

  const handleAddToCart = () => {
    if (!product) return
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
      existingItem.quantity += quantity
    } else {
      cart.items.push({
        id: `${product.id}_${Date.now()}`,
        productId: product.id,
        name: product.name,
        price: product.price,
        quantity,
        image: product.image,
      })
    }
    cart.lastUpdated = new Date().toISOString()
    localStorage.setItem(cartKey, JSON.stringify(cart))
    toast.success(`${product.name} added to cart`)
    window.dispatchEvent(new Event('cart-updated'))
  }

  const handleQuantityChange = (delta: number) => {
    const newQty = quantity + delta
    if (newQty >= 1 && (!product || newQty <= product.inventory)) {
      setQuantity(newQty)
    }
  }

  if (loading) {
    return (
      <StorefrontLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Icon name="refresh" size="xl" className="animate-spin text-primary mb-4" />
            <p className="font-headline font-bold uppercase text-lg">Loading Product...</p>
          </div>
        </div>
      </StorefrontLayout>
    )
  }

  if (!product) return null

  let extraImages: string[] = []
  try {
    extraImages = product.images ? JSON.parse(product.images) : []
  } catch {
    extraImages = []
  }
  const allImages = [product.image, ...extraImages].filter(Boolean) as string[]
  const hasDiscount = product.compareAtPrice && product.compareAtPrice > product.price

  return (
    <StorefrontLayout>
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Back link */}
        <div className="mb-8">
          <Link href={`/stores/${slug}/products`}>
            <button className="flex items-center gap-2 font-headline font-bold uppercase text-sm border-4 border-[#1a1a1a] px-4 py-2 bg-white hover:bg-[#ffcc00] transition-colors shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none">
              <Icon name="arrow_back" size="sm" />
              Back to Shop
            </button>
          </Link>
        </div>

        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 mb-8 font-headline uppercase font-bold tracking-tight text-sm">
          <Link href={`/stores/${slug}`}>
            <span className="hover:text-[#0055ff] transition-colors cursor-pointer">Home</span>
          </Link>
          <Icon name="chevron_right" size="sm" />
          <Link href={`/stores/${slug}/products`}>
            <span className="hover:text-[#0055ff] transition-colors cursor-pointer">Products</span>
          </Link>
          {product.category && (
            <>
              <Icon name="chevron_right" size="sm" />
              <span className="opacity-60">{product.category.name}</span>
            </>
          )}
          <Icon name="chevron_right" size="sm" />
          <span className="opacity-60 truncate max-w-[200px]">{product.name}</span>
        </nav>

        {/* Product Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Image Gallery */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            <div className="border-4 border-[#1a1a1a] bg-white aspect-square overflow-hidden shadow-[8px_8px_0px_0px_rgba(26,26,26,1)]">
              {allImages.length > 0 ? (
                <img
                  alt={product.name}
                  className="w-full h-full object-cover"
                  src={allImages[selectedImage]}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Icon name="image" className="text-9xl opacity-20" />
                </div>
              )}
            </div>
            {allImages.length > 1 && (
              <div className="grid grid-cols-4 gap-4">
                {allImages.slice(0, 4).map((img, idx) => (
                  <div
                    key={idx}
                    className={`border-4 bg-white aspect-square cursor-pointer transition-all ${
                      selectedImage === idx
                        ? 'border-[#1a1a1a]'
                        : 'border-gray-300 opacity-50 hover:opacity-100'
                    }`}
                    onClick={() => setSelectedImage(idx)}
                  >
                    <img alt={`View ${idx + 1}`} className="w-full h-full object-cover" src={img} />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="lg:col-span-5 flex flex-col gap-8">
            <div className="border-b-4 border-[#1a1a1a] pb-6">
              {product.category && (
                <p className="font-headline font-bold uppercase text-sm opacity-60 mb-2">
                  {product.category.name}
                </p>
              )}
              <h1 className="text-5xl md:text-6xl font-black uppercase leading-none tracking-tighter mb-4 font-headline">
                {product.name}
              </h1>
              <div className="flex items-baseline gap-4">
                <p className="text-4xl font-headline font-black text-[#0055ff]">
                  ${product.price.toFixed(2)}
                </p>
                {hasDiscount && (
                  <p className="text-xl font-headline font-bold opacity-40 line-through">
                    ${product.compareAtPrice?.toFixed(2)}
                  </p>
                )}
              </div>
            </div>

            {product.description && (
              <div>
                <h3 className="font-headline font-extrabold uppercase text-sm tracking-widest mb-3">
                  Description
                </h3>
                <p className="font-body text-base leading-relaxed opacity-80">
                  {product.description}
                </p>
              </div>
            )}

            {/* Quantity + Add to Cart */}
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center border-4 border-[#1a1a1a]">
                  <button
                    className="px-4 py-3 border-r-4 border-[#1a1a1a] hover:bg-[#ffcc00] font-headline font-bold text-xl disabled:opacity-40"
                    onClick={() => handleQuantityChange(-1)}
                    disabled={quantity <= 1}
                  >
                    -
                  </button>
                  <span className="px-8 py-3 font-headline font-bold text-xl">{quantity}</span>
                  <button
                    className="px-4 py-3 border-l-4 border-[#1a1a1a] hover:bg-[#ffcc00] font-headline font-bold text-xl disabled:opacity-40"
                    onClick={() => handleQuantityChange(1)}
                    disabled={product.inventory > 0 && quantity >= product.inventory}
                  >
                    +
                  </button>
                </div>
                <button
                  className="flex-grow bg-[#ffcc00] border-4 border-[#1a1a1a] font-headline font-black text-xl py-3 shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] hover:bg-[#1a1a1a] hover:text-white transition-colors active:translate-x-[2px] active:translate-y-[2px] active:shadow-none uppercase disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={handleAddToCart}
                  disabled={product.inventory === 0}
                >
                  {product.inventory === 0 ? 'Out of Stock' : 'Add to Cart'}
                </button>
              </div>
            </div>

            {/* Stock warning */}
            {product.inventory > 0 && product.inventory <= 10 && (
              <div className="p-4 bg-[#ffcc00] border-4 border-[#1a1a1a]">
                <p className="font-headline font-bold uppercase text-sm">
                  Only {product.inventory} left in stock!
                </p>
              </div>
            )}

            {/* Details accordion */}
            <div className="border-t-4 border-[#1a1a1a] pt-6 space-y-2">
              <details className="group border-4 border-[#1a1a1a]">
                <summary className="flex justify-between items-center cursor-pointer font-headline font-bold uppercase px-4 py-3 list-none hover:bg-[#ffcc00] transition-colors">
                  Shipping & Returns
                  <Icon name="expand_more" size="sm" className="group-open:rotate-180 transition-transform" />
                </summary>
                <div className="px-4 py-3 border-t-4 border-[#1a1a1a] font-body text-sm opacity-80">
                  Free worldwide shipping on orders over $50. 30-day no-questions-asked return policy.
                </div>
              </details>
              <details className="group border-4 border-[#1a1a1a]">
                <summary className="flex justify-between items-center cursor-pointer font-headline font-bold uppercase px-4 py-3 list-none hover:bg-[#ffcc00] transition-colors">
                  Materials & Origin
                  <Icon name="expand_more" size="sm" className="group-open:rotate-180 transition-transform" />
                </summary>
                <div className="px-4 py-3 border-t-4 border-[#1a1a1a] font-body text-sm opacity-80">
                  High-quality materials sourced responsibly. Designed with care, manufactured with precision.
                </div>
              </details>
            </div>
          </div>
        </div>
      </main>
    </StorefrontLayout>
  )
}
