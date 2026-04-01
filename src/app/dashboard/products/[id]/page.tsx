'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'sonner'
import { useStore } from '@/contexts/StoreContext'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import { Input } from '@/components/ui/Input'
import { DeleteConfirmModal } from '@/components/ui/DeleteConfirmModal'

interface Product {
  id: string
  name: string
  description: string
  sku: string
  barcode: string
  price: number
  compareAtPrice: number | null
  cost: number
  inventory: number
  status: string
  image: string | null
  images: string[]
  categoryId: string | null
  supplierId: string | null
  tags: string[]
  trackInventory: boolean
  continueSellingWhenOutOfStock: boolean
}

interface Category {
  id: string
  name: string
}

interface Supplier {
  id: string
  name: string
}

export default function ProductDetailPage() {
  const router = useRouter()
  const params = useParams()
  const { formatCurrency } = useStore()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [product, setProduct] = useState<Product | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [newTag, setNewTag] = useState('')
  const mainImageInputRef = useRef<HTMLInputElement>(null)
  const galleryImageInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetchCategories()
    fetchSuppliers()
    if (params.id === 'new') {
      setProduct({
        id: '',
        name: '',
        description: '',
        sku: '',
        barcode: '',
        price: 0,
        compareAtPrice: null,
        cost: 0,
        inventory: 0,
        status: 'DRAFT',
        image: null,
        images: [],
        categoryId: null,
        supplierId: null,
        tags: [],
        trackInventory: true,
        continueSellingWhenOutOfStock: false,
      })
      setLoading(false)
    } else {
      fetchProduct()
    }
  }, [params.id])

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/categories')
      if (!res.ok) throw new Error('Failed to load categories')
      const data = await res.json()
      setCategories(Array.isArray(data) ? data : [])
    } catch (e) {
      console.error('fetchCategories:', e)
    }
  }

  const fetchSuppliers = async () => {
    try {
      const res = await fetch('/api/suppliers')
      if (!res.ok) throw new Error('Failed to load suppliers')
      const data = await res.json()
      setSuppliers(Array.isArray(data) ? data : [])
    } catch (e) {
      console.error('fetchSuppliers:', e)
    }
  }

  const fetchProduct = async () => {
    try {
      const res = await fetch(`/api/products/${params.id}`)
      if (!res.ok) throw new Error('Product not found')
      const data = await res.json()
      // images and tags are stored as JSON strings in the DB
      setProduct({
        ...data,
        images: Array.isArray(data.images) ? data.images : (() => { try { return JSON.parse(data.images || '[]') } catch { return [] } })(),
        tags: Array.isArray(data.tags) ? data.tags : (() => { try { return JSON.parse(data.tags || '[]') } catch { return [] } })(),
      })
    } catch (error) {
      toast.error('Failed to load product')
      router.push('/dashboard/products')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!product) return

    setSaving(true)
    try {
      const method = params.id === 'new' ? 'POST' : 'PATCH'
      const url = params.id === 'new' ? '/api/products' : `/api/products/${params.id}`

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(product),
      })

      const data = await res.json()

      if (!res.ok) throw new Error(data.error || 'Failed to save product')

      toast.success(params.id === 'new' ? 'Product created' : 'Product updated')
      if (params.id === 'new') {
        router.push(`/dashboard/products/${data.id}`)
      } else {
        // Refresh product data to confirm saved values
        fetchProduct()
      }
    } catch (error) {
      console.error('Save error:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to save product')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    try {
      const res = await fetch(`/api/products/${params.id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete product')

      toast.success('Product deleted')
      router.push('/dashboard/products')
    } catch (error) {
      toast.error('Failed to delete product')
    }
  }

  const addTag = () => {
    if (!newTag.trim() || !product) return
    setProduct({ ...product, tags: [...product.tags, newTag.trim().toUpperCase()] })
    setNewTag('')
  }

  const removeTag = (tag: string) => {
    if (!product) return
    setProduct({ ...product, tags: product.tags.filter((t) => t !== tag) })
  }

  const handleMainImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !product) return

    try {
      const reader = new FileReader()
      reader.onload = (event) => {
        const base64 = event.target?.result as string
        setProduct({ ...product, image: base64 })
        toast.success('Main image uploaded')
      }
      reader.readAsDataURL(file)
    } catch (error) {
      toast.error('Failed to upload image')
    }
  }

  const handleGalleryImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || !product) return

    try {
      const newImages: string[] = []
      let filesProcessed = 0

      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        const reader = new FileReader()
        
        reader.onload = (event) => {
          const base64 = event.target?.result as string
          newImages.push(base64)
          filesProcessed++

          if (filesProcessed === files.length) {
            setProduct({ ...product, images: [...product.images, ...newImages] })
            toast.success(`${newImages.length} image(s) added to gallery`)
          }
        }
        reader.readAsDataURL(file)
      }
    } catch (error) {
      toast.error('Failed to upload images')
    }
  }

  const removeImage = (index: number) => {
    if (!product) return
    setProduct({
      ...product,
      images: product.images.filter((_, i) => i !== index),
    })
    toast.success('Image removed')
  }

  const calculateMargin = () => {
    if (!product || product.price === 0) return { margin: 0, profit: 0 }
    const profit = product.price - product.cost
    const margin = (profit / product.price) * 100
    return { margin: margin.toFixed(1), profit: profit.toFixed(2) }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Icon name="refresh" size="xl" className="animate-spin text-primary mb-4" />
            <p className="font-headline font-bold uppercase text-lg">Loading Product...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (!product) return null

  const { margin, profit } = calculateMargin()

  return (
    <DashboardLayout>
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/products">
            <button className="w-14 h-14 border-4 border-primary flex items-center justify-center bg-white neo-shadow hover:neo-shadow-active active:neo-shadow-active">
              <Icon name="arrow_back" size="md" />
            </button>
          </Link>
          <div>
            <h1 className="text-6xl font-black uppercase tracking-tighter leading-none font-headline">
              {params.id === 'new' ? 'New Product' : 'Edit Product'}
            </h1>
            {params.id !== 'new' && (
              <p className="font-bold opacity-60 uppercase text-xs mt-2">
                Product ID: #{product.id}
              </p>
            )}
          </div>
        </div>
        <Button
          variant="yellow"
          size="lg"
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Form Content */}
        <div className="lg:col-span-8 space-y-8">
          {/* General Info */}
          <section className="border-4 border-primary bg-white p-8 neo-shadow-lg">
            <h2 className="text-2xl font-black uppercase mb-6 border-b-4 border-primary inline-block font-headline">
              General Info
            </h2>
            <div className="space-y-6">
              <div>
                <label className="block font-black uppercase text-xs mb-2 font-headline">
                  Product Name
                </label>
                <input
                  className="w-full border-b-4 border-l-0 border-r-0 border-t-0 border-primary focus:ring-0 focus:bg-primary-container/10 font-black text-2xl uppercase p-0 pb-2 transition-colors font-headline"
                  type="text"
                  value={product.name}
                  onChange={(e) => setProduct({ ...product, name: e.target.value })}
                  placeholder="Enter product name"
                />
              </div>
              <div>
                <label className="block font-black uppercase text-xs mb-2 font-headline">
                  Description
                </label>
                <div className="border-4 border-primary">
                  <textarea
                    className="w-full border-0 focus:ring-0 p-4 font-medium text-lg leading-relaxed"
                    rows={6}
                    value={product.description}
                    onChange={(e) => setProduct({ ...product, description: e.target.value })}
                    placeholder="Describe your product..."
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block font-black uppercase text-xs mb-2 font-headline">SKU</label>
                  <input
                    className="w-full border-b-4 border-0 border-primary focus:ring-0 font-bold uppercase p-0 pb-2"
                    type="text"
                    value={product.sku}
                    onChange={(e) => setProduct({ ...product, sku: e.target.value })}
                    placeholder="PROD-001"
                  />
                </div>
                <div>
                  <label className="block font-black uppercase text-xs mb-2 font-headline">
                    Barcode
                  </label>
                  <input
                    className="w-full border-b-4 border-0 border-primary focus:ring-0 font-bold uppercase p-0 pb-2"
                    type="text"
                    value={product.barcode}
                    onChange={(e) => setProduct({ ...product, barcode: e.target.value })}
                    placeholder="0000000000"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Hidden File Inputs */}
          <input
            ref={mainImageInputRef}
            type="file"
            accept="image/*"
            hidden
            onChange={handleMainImageUpload}
          />
          <input
            ref={galleryImageInputRef}
            type="file"
            accept="image/*"
            multiple
            hidden
            onChange={handleGalleryImageUpload}
          />

          {/* Media Gallery */}
          <section className="border-4 border-primary bg-white p-8 neo-shadow-lg">
            <h2 className="text-2xl font-black uppercase mb-6 border-b-4 border-primary inline-block font-headline">
              Media Gallery
            </h2>
            <div className="space-y-8">
              {/* Main Image */}
              <div className="border-4 border-primary bg-surface min-h-[250px] flex items-center justify-center group relative overflow-hidden">
                {product.image ? (
                  <>
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover max-h-[350px]"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                      <Button
                        variant="yellow"
                        size="sm"
                        onClick={() => mainImageInputRef.current?.click()}
                      >
                        Change Image
                      </Button>
                      <button
                        className="w-10 h-10 border-2 border-white text-white flex items-center justify-center hover:bg-white hover:text-primary transition-all"
                        onClick={() => setProduct({ ...product, image: null })}
                        title="Remove main image"
                      >
                        <Icon name="close" className="text-lg" />
                      </button>
                    </div>
                  </>
                ) : (
                  <div
                    className="text-center cursor-pointer w-full h-full flex flex-col items-center justify-center hover:bg-primary-container transition-colors"
                    onClick={() => mainImageInputRef.current?.click()}
                    role="button"
                  >
                    <Icon name="add_photo_alternate" size="xl" className="opacity-60 mb-2" />
                    <p className="font-headline font-bold uppercase text-sm opacity-60">Click to upload main image</p>
                  </div>
                )}
              </div>

              {/* Gallery Grid - Compact 2 Column Layout */}
              {product.images.length > 0 && (
                <div className="space-y-3">
                  <h3 className="font-black uppercase text-xs font-headline">Gallery Images ({product.images.length})</h3>
                  <div className="grid grid-cols-2 gap-4 max-w-2xl">
                    {product.images.map((img, idx) => (
                      <div
                        key={idx}
                        className="relative aspect-square border-4 border-primary bg-surface overflow-hidden group"
                      >
                        <img
                          src={img}
                          alt={`Gallery ${idx + 1}`}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <button
                            className="w-10 h-10 border-2 border-white text-white flex items-center justify-center hover:bg-white hover:text-secondary transition-all"
                            onClick={() => removeImage(idx)}
                            title="Remove image"
                          >
                            <Icon name="close" className="text-lg" />
                          </button>
                        </div>
                        <div className="absolute top-2 left-2 bg-primary text-primary-container px-2 py-1 text-xs font-black font-headline">
                          #{idx + 1}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Add Gallery Images Button */}
              <div
                className="border-4 border-primary border-dashed bg-surface-container py-12 text-center cursor-pointer hover:bg-primary-container transition-colors"
                onClick={() => galleryImageInputRef.current?.click()}
                role="button"
              >
                <Icon name="add_photo_alternate" size="lg" className="mx-auto mb-2 opacity-60" />
                <p className="font-headline font-bold uppercase text-sm">Add Gallery Images</p>
                <p className="text-xs opacity-60 mt-1">from your computer</p>
              </div>
            </div>
          </section>

          {/* Pricing */}
          <section className="border-4 border-primary bg-white p-8 neo-shadow-lg">
            <h2 className="text-2xl font-black uppercase mb-6 border-b-4 border-primary inline-block font-headline">
              Pricing
            </h2>
            <div className="grid grid-cols-3 gap-8">
              <div>
                <label className="block font-black uppercase text-xs mb-2 font-headline">Price</label>
                <div className="flex items-center">
                  <span className="text-2xl font-black mr-2 font-headline">$</span>
                  <input
                    className="w-full border-b-4 border-0 border-primary focus:ring-0 font-black text-2xl p-0 pb-1 font-headline"
                    type="number"
                    step="0.01"
                    value={product.price}
                    onChange={(e) => setProduct({ ...product, price: parseFloat(e.target.value) || 0 })}
                  />
                </div>
              </div>
              <div>
                <label className="block font-black uppercase text-xs mb-2 font-headline">
                  Compare At Price
                </label>
                <div className="flex items-center">
                  <span className="text-2xl font-black mr-2 opacity-40 font-headline">$</span>
                  <input
                    className="w-full border-b-4 border-0 border-primary/40 focus:ring-0 font-black text-2xl p-0 pb-1 font-headline"
                    type="number"
                    step="0.01"
                    value={product.compareAtPrice || ''}
                    onChange={(e) => setProduct({ ...product, compareAtPrice: parseFloat(e.target.value) || null })}
                    placeholder="0.00"
                  />
                </div>
              </div>
              <div>
                <label className="block font-black uppercase text-xs mb-2 font-headline">
                  Cost Per Item
                </label>
                <div className="flex items-center">
                  <span className="text-2xl font-black mr-2 opacity-40 font-headline">$</span>
                  <input
                    className="w-full border-b-4 border-0 border-primary/40 focus:ring-0 font-black text-2xl p-0 pb-1 font-headline"
                    type="number"
                    step="0.01"
                    value={product.cost}
                    onChange={(e) => setProduct({ ...product, cost: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <p className="text-[10px] font-bold mt-2 text-tertiary">
                  MARGIN: {margin}% | PROFIT: ${profit}
                </p>
              </div>
            </div>
          </section>

          {/* Inventory */}
          <section className="border-4 border-primary bg-white p-8 neo-shadow-lg">
            <h2 className="text-2xl font-black uppercase mb-6 border-b-4 border-primary inline-block font-headline">
              Inventory
            </h2>
            <div className="space-y-8">
              <div className="flex items-center justify-between bg-surface p-4 border-2 border-primary">
                <div>
                  <p className="font-black uppercase text-sm font-headline">Track Quantity</p>
                  <p className="text-[10px] font-medium opacity-60">Monitor stock levels in real-time</p>
                </div>
                <button
                  className={`relative inline-block w-12 h-6 cursor-pointer transition-colors ${
                    product.trackInventory ? 'bg-primary' : 'bg-surface-container'
                  }`}
                  onClick={() => setProduct({ ...product, trackInventory: !product.trackInventory })}
                >
                  <div
                    className={`absolute top-1 w-4 h-4 bg-primary-container transition-all ${
                      product.trackInventory ? 'right-1' : 'left-1'
                    }`}
                  />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-8 items-center">
                <div>
                  <label className="block font-black uppercase text-xs mb-2 font-headline">
                    Quantity Available
                  </label>
                  <div className="flex items-center gap-4">
                    <button
                      className="w-12 h-12 border-4 border-primary flex items-center justify-center font-black text-2xl hover:bg-primary-container font-headline"
                      onClick={() => setProduct({ ...product, inventory: Math.max(0, product.inventory - 1) })}
                    >
                      -
                    </button>
                    <input
                      className="w-20 text-center border-b-4 border-0 border-primary focus:ring-0 font-black text-3xl font-headline"
                      type="number"
                      value={product.inventory}
                      onChange={(e) => setProduct({ ...product, inventory: parseInt(e.target.value) || 0 })}
                    />
                    <button
                      className="w-12 h-12 border-4 border-primary flex items-center justify-center font-black text-2xl hover:bg-primary-container font-headline"
                      onClick={() => setProduct({ ...product, inventory: product.inventory + 1 })}
                    >
                      +
                    </button>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <input
                    className="mt-1 w-5 h-5 border-4 border-primary text-primary focus:ring-0 rounded-none"
                    type="checkbox"
                    checked={product.continueSellingWhenOutOfStock}
                    onChange={(e) => setProduct({ ...product, continueSellingWhenOutOfStock: e.target.checked })}
                  />
                  <label className="font-black uppercase text-xs font-headline">
                    Continue Selling When Out of Stock
                  </label>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Right Column: Sidebar */}
        <div className="lg:col-span-4 space-y-8">
          {/* Status Widget */}
          <section className="border-4 border-primary bg-white p-6 neo-shadow-lg">
            <h3 className="font-black uppercase text-sm mb-4 font-headline">Product Status</h3>
            <div className="space-y-4">
              <div className="flex flex-col gap-2">
                <button
                  className={`w-full border-4 border-primary py-3 font-black uppercase tracking-widest text-lg flex items-center justify-center gap-2 font-headline ${
                    product.status === 'ACTIVE'
                      ? 'bg-primary text-primary-container'
                      : 'bg-white text-primary hover:bg-surface-container'
                  }`}
                  onClick={() => setProduct({ ...product, status: 'ACTIVE' })}
                >
                  {product.status === 'ACTIVE' && <Icon name="check_circle" size="sm" />}
                  Published
                </button>
                <button
                  className={`w-full border-4 border-primary py-3 font-black uppercase tracking-widest text-lg font-headline ${
                    product.status === 'DRAFT'
                      ? 'bg-primary text-primary-container'
                      : 'bg-white text-primary hover:bg-surface-container'
                  }`}
                  onClick={() => setProduct({ ...product, status: 'DRAFT' })}
                >
                  Draft
                </button>
              </div>
            </div>
          </section>

          {/* Organization */}
          <section className="border-4 border-primary bg-white p-6 neo-shadow-lg">
            <h3 className="font-black uppercase text-sm mb-6 border-b-2 border-primary inline-block font-headline">
              Organization
            </h3>
            <div className="space-y-6">
              <div>
                <label className="block font-black uppercase text-[10px] mb-1 font-headline">Category</label>
                <select
                  className="w-full border-b-4 border-0 border-primary focus:ring-0 font-bold uppercase text-sm px-0"
                  value={product.categoryId || ''}
                  onChange={(e) => setProduct({ ...product, categoryId: e.target.value || null })}
                >
                  <option value="">Select Category</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block font-black uppercase text-[10px] mb-1 font-headline">Supplier</label>
                <select
                  className="w-full border-b-4 border-0 border-primary focus:ring-0 font-bold uppercase text-sm px-0"
                  value={product.supplierId || ''}
                  onChange={(e) => setProduct({ ...product, supplierId: e.target.value || null })}
                >
                  <option value="">Select Supplier</option>
                  {suppliers.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block font-black uppercase text-[10px] mb-2 font-headline">Tags</label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {product.tags.map((tag) => (
                    <span
                      key={tag}
                      className="bg-tertiary text-white px-2 py-1 text-[10px] font-black uppercase flex items-center gap-1 font-headline"
                    >
                      {tag}
                      <button onClick={() => removeTag(tag)}>
                        <Icon name="close" className="text-[10px]" />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    className="flex-1 border-b-4 border-0 border-primary focus:ring-0 font-bold uppercase text-xs p-0 pb-1"
                    placeholder="Add tag..."
                    type="text"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addTag()}
                  />
                  <button
                    className="w-8 h-8 border-2 border-primary flex items-center justify-center hover:bg-primary hover:text-white"
                    onClick={addTag}
                  >
                    <Icon name="add" size="sm" />
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* Danger Zone */}
          {params.id !== 'new' && (
            <section className="border-4 border-secondary bg-secondary-container p-6 neo-shadow-lg">
              <h3 className="font-black uppercase text-sm mb-4 text-secondary font-headline">
                Danger Zone
              </h3>
              <Button
                variant="danger"
                size="md"
                onClick={() => setDeleteModalOpen(true)}
                className="w-full"
              >
                Delete Product
              </Button>
            </section>
          )}
        </div>
      </div>

      {/* Delete Modal */}
      <DeleteConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="Delete Product"
        message="Are you sure you want to delete this product? This action cannot be undone and will remove all associated data."
      />
    </DashboardLayout>
  )
}
