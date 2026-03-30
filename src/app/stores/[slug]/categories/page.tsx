'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'sonner'
import { StorefrontLayout } from '@/components/layout/StorefrontLayout'
import { Icon } from '@/components/ui/Icon'

interface Category {
  id: string
  name: string
  slug: string
  description: string | null
  _count: { products: number }
}

export default function StorefrontCategoriesPage() {
  const params = useParams()
  const slug = params.slug as string
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/stores/${slug}/categories`)
      .then((r) => r.json())
      .then((data) => setCategories(Array.isArray(data) ? data : []))
      .catch(() => toast.error('Failed to load categories'))
      .finally(() => setLoading(false))
  }, [slug])

  const cardColors = [
    'bg-[#ffcc00]',
    'bg-[#1a1a1a] text-white',
    'bg-[#0055ff] text-white',
    'bg-[#e63b2e] text-white',
    'bg-white',
    'bg-[#d6e3ff]',
  ]

  return (
    <StorefrontLayout>
      <main className="max-w-7xl mx-auto px-6 py-12">
        <header className="mb-12 border-b-4 border-[#1a1a1a] pb-8">
          <h1 className="text-7xl font-black uppercase tracking-tighter leading-none mb-4 font-headline">
            Categories
          </h1>
          <p className="font-headline font-medium text-xl border-l-8 border-[#ffcc00] pl-4">
            Browse products by category.
          </p>
        </header>

        {loading ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <Icon name="refresh" size="xl" className="animate-spin" />
          </div>
        ) : categories.length === 0 ? (
          <div className="border-4 border-[#1a1a1a] bg-white shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] p-16 text-center">
            <Icon name="category" className="text-9xl opacity-20 mb-4" />
            <p className="font-headline font-black uppercase text-2xl mb-2">No Categories Yet</p>
            <Link href={`/stores/${slug}/products`}>
              <button className="mt-4 px-8 py-3 bg-[#ffcc00] border-4 border-[#1a1a1a] font-headline font-black uppercase shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all">
                Browse All Products
              </button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {categories.map((cat, i) => (
              <Link key={cat.id} href={`/stores/${slug}/products?category=${encodeURIComponent(cat.name)}`}>
                <div className={`border-4 border-[#1a1a1a] p-8 shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] hover:translate-x-[-4px] hover:translate-y-[-4px] hover:shadow-[8px_8px_0px_0px_#1a1a1a] transition-all cursor-pointer ${cardColors[i % cardColors.length]}`}>
                  <div className="flex justify-between items-start mb-6">
                    <Icon name="category" className="text-4xl" />
                    <span className="font-headline font-black text-3xl">{cat._count.products}</span>
                  </div>
                  <h2 className="text-3xl font-headline font-black uppercase tracking-tighter mb-2">{cat.name}</h2>
                  {cat.description && (
                    <p className="font-body text-sm opacity-70 mb-4">{cat.description}</p>
                  )}
                  <p className="font-headline font-bold uppercase text-xs opacity-60">
                    {cat._count.products} product{cat._count.products !== 1 ? 's' : ''}
                  </p>
                </div>
              </Link>
            ))}

            {/* All Products card */}
            <Link href={`/stores/${slug}/products`}>
              <div className="border-4 border-dashed border-[#1a1a1a]/40 p-8 flex flex-col items-center justify-center min-h-[200px] group cursor-pointer hover:bg-[#ffcc00] hover:border-solid hover:border-[#1a1a1a] transition-all">
                <Icon name="grid_view" className="text-5xl mb-3 group-hover:scale-110 transition-transform" />
                <span className="font-headline font-black uppercase text-xl text-center">View All Products</span>
              </div>
            </Link>
          </div>
        )}
      </main>
    </StorefrontLayout>
  )
}
