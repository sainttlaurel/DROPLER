'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { toast } from 'sonner'
import { useStore } from '@/contexts/StoreContext'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Icon } from '@/components/ui/Icon'

interface Product {
  id: string
  name: string
  sku: string
  price: number
  cost: number
  inventory: number
  status: string
  image: string | null
  categoryId: string | null
  category: { id: string; name: string } | null
}

interface Category {
  id: string
  name: string
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [categoryFilter, setCategoryFilter] = useState('ALL')
  const [selected, setSelected] = useState<string[]>([])
  const [bulkAction, setBulkAction] = useState('')
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const { formatCurrency } = useStore()

  useEffect(() => { fetchData() }, [])
  useEffect(() => { filterProducts() }, [products, searchQuery, statusFilter, categoryFilter])

  const fetchData = async () => {
    try {
      const [pRes, cRes] = await Promise.all([fetch('/api/products'), fetch('/api/categories')])
      const pData = await pRes.json()
      const cData = await cRes.json()
      setProducts(Array.isArray(pData) ? pData : (pData.products ?? []))
      setCategories(Array.isArray(cData) ? cData : [])
    } catch { toast.error('Failed to load products') }
    finally { setLoading(false) }
  }

  const filterProducts = () => {
    let f = products
    if (searchQuery) f = f.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.sku.toLowerCase().includes(searchQuery.toLowerCase()))
    if (statusFilter !== 'ALL') f = f.filter(p => p.status === statusFilter)
    if (categoryFilter !== 'ALL') f = f.filter(p => p.category?.id === categoryFilter)
    setFilteredProducts(f)
  }

  const toggleSelect = (id: string) => setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  const toggleAll = () => setSelected(selected.length === filteredProducts.length ? [] : filteredProducts.map(p => p.id))

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/products/${id}`, { method: 'DELETE' })
      setProducts(prev => prev.filter(p => p.id !== id))
      toast.success('Product deleted')
    } catch { toast.error('Failed to delete') }
    finally { setDeleteId(null) }
  }

  const handleBulkAction = async () => {
    if (!bulkAction || selected.length === 0) return
    try {
      if (bulkAction === 'delete') {
        await Promise.all(selected.map(id => fetch(`/api/products/${id}`, { method: 'DELETE' })))
        setProducts(prev => prev.filter(p => !selected.includes(p.id)))
        toast.success(`${selected.length} products deleted`)
      } else {
        const status = bulkAction === 'publish' ? 'ACTIVE' : 'DRAFT'
        await Promise.all(selected.map(id => fetch(`/api/products/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) })))
        setProducts(prev => prev.map(p => selected.includes(p.id) ? { ...p, status } : p))
        toast.success(`${selected.length} products updated`)
      }
      setSelected([]); setBulkAction('')
    } catch { toast.error('Bulk action failed') }
  }

  const statusStyle = (s: string) => ({
    ACTIVE: 'bg-[#1a1a1a] text-white',
    DRAFT: 'bg-[#eee9e0] text-[#1a1a1a]',
    ARCHIVED: 'bg-[#e63b2e] text-white',
  }[s] || 'bg-[#eee9e0] text-[#1a1a1a]')

  if (loading) return (
    <DashboardLayout>
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Icon name="refresh" size="xl" className="animate-spin text-[#1a1a1a] mb-4" />
          <p className="font-headline font-bold uppercase text-lg">Loading Products...</p>
        </div>
      </div>
    </DashboardLayout>
  )

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6 border-b-8 border-[#1a1a1a] pb-8">
        <div>
          <h1 className="text-7xl md:text-8xl font-black uppercase tracking-tighter leading-none mb-2 font-headline">Products</h1>
          <p className="font-bold text-xl border-l-8 border-[#ffcc00] pl-4 uppercase">Manage your dropshipping catalog.</p>
        </div>
        <div className="flex gap-3">
          <button disabled className="flex items-center gap-2 px-5 py-3 border-4 border-[#1a1a1a] font-headline font-black uppercase shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] hover:bg-[#1a1a1a] hover:text-white transition-all active:translate-x-1 active:translate-y-1 active:shadow-none text-sm opacity-50 cursor-not-allowed" title="Feature coming soon">
            <Icon name="link" size="sm" /> Import URL
          </button>
          <Link href="/dashboard/products/new">
            <button className="flex items-center gap-2 px-6 py-3 bg-[#ffcc00] border-4 border-[#1a1a1a] font-headline font-black uppercase shadow-[6px_6px_0px_0px_rgba(26,26,26,1)] hover:bg-[#1a1a1a] hover:text-white transition-all active:translate-x-1 active:translate-y-1 active:shadow-none">
              <Icon name="add" size="sm" /> Add Product
            </button>
          </Link>
        </div>
      </div>

      {/* Bulk Actions */}
      {selected.length > 0 && (
        <div className="mb-6 p-4 bg-[#0055ff] text-white border-4 border-[#1a1a1a] shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="font-headline font-black uppercase">{selected.length} product{selected.length > 1 ? 's' : ''} selected</p>
          <div className="flex gap-3">
            <select value={bulkAction} onChange={e => setBulkAction(e.target.value)} className="bg-white text-[#1a1a1a] border-2 border-[#1a1a1a] px-3 py-2 font-headline font-bold uppercase text-sm focus:outline-none">
              <option value="">Choose Action</option>
              <option value="publish">Publish All</option>
              <option value="draft">Set to Draft</option>
              <option value="delete">Delete All</option>
            </select>
            <button onClick={handleBulkAction} disabled={!bulkAction} className="px-4 py-2 bg-[#ffcc00] text-[#1a1a1a] border-2 border-[#1a1a1a] font-headline font-black uppercase text-sm disabled:opacity-50">Apply</button>
            <button onClick={() => setSelected([])} className="px-4 py-2 bg-white text-[#1a1a1a] border-2 border-[#1a1a1a] font-headline font-black uppercase text-sm">Cancel</button>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-8">
        <div className="md:col-span-6 flex items-center border-4 border-[#1a1a1a] bg-white shadow-[4px_4px_0px_0px_rgba(26,26,26,1)]">
          <Icon name="search" size="sm" className="ml-4 opacity-50 shrink-0" />
          <input className="flex-1 p-4 bg-transparent font-headline font-bold uppercase placeholder:normal-case placeholder:opacity-40 focus:outline-none text-sm" placeholder="Search products, SKUs..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
        </div>
        <div className="md:col-span-3">
          <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)} className="w-full h-full min-h-[52px] border-4 border-[#1a1a1a] bg-white px-4 font-headline font-bold uppercase text-sm focus:outline-none shadow-[4px_4px_0px_0px_rgba(26,26,26,1)]">
            <option value="ALL">All Categories</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div className="md:col-span-3">
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="w-full h-full min-h-[52px] border-4 border-[#1a1a1a] bg-white px-4 font-headline font-bold uppercase text-sm focus:outline-none shadow-[4px_4px_0px_0px_rgba(26,26,26,1)]">
            <option value="ALL">Filter Status</option>
            <option value="ACTIVE">Active</option>
            <option value="DRAFT">Draft</option>
            <option value="ARCHIVED">Archived</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="border-4 border-[#1a1a1a] bg-white shadow-[8px_8px_0px_0px_rgba(26,26,26,1)] overflow-hidden mb-6">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-[#ffcc00] border-b-4 border-[#1a1a1a] font-headline font-black uppercase text-xs tracking-widest">
                <th className="p-4 border-r-2 border-[#1a1a1a] w-10">
                  <input type="checkbox" checked={selected.length === filteredProducts.length && filteredProducts.length > 0} onChange={toggleAll} className="w-5 h-5 border-2 border-[#1a1a1a] rounded-none accent-[#1a1a1a]" />
                </th>
                <th className="p-4 border-r-2 border-[#1a1a1a]">Product</th>
                <th className="p-4 border-r-2 border-[#1a1a1a]">SKU</th>
                <th className="p-4 border-r-2 border-[#1a1a1a]">Price</th>
                <th className="p-4 border-r-2 border-[#1a1a1a]">Status</th>
                <th className="p-4 border-r-2 border-[#1a1a1a]">Stock</th>
                <th className="p-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-[#1a1a1a]/10">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-16 text-center">
                    <Icon name="inventory_2" size="xl" className="mx-auto mb-4 opacity-20" />
                    <p className="font-headline font-bold uppercase text-lg mb-1">No Products Found</p>
                    <p className="text-sm opacity-50">{searchQuery || statusFilter !== 'ALL' || categoryFilter !== 'ALL' ? 'Try adjusting your filters' : 'Import your first product to get started'}</p>
                  </td>
                </tr>
              ) : filteredProducts.map(product => (
                <tr key={product.id} className="hover:bg-[#f5f0e8] transition-colors">
                  <td className="p-4 border-r-2 border-[#1a1a1a]/10">
                    <input type="checkbox" checked={selected.includes(product.id)} onChange={() => toggleSelect(product.id)} className="w-5 h-5 border-2 border-[#1a1a1a] rounded-none accent-[#1a1a1a]" />
                  </td>
                  <td className="p-4 border-r-2 border-[#1a1a1a]/10">
                    <div className="flex items-center gap-3">
                      <div className="w-14 h-14 border-2 border-[#1a1a1a] shrink-0 bg-[#eee9e0] overflow-hidden">
                        {product.image ? <img src={product.image} alt={product.name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><Icon name="image" size="sm" className="opacity-30" /></div>}
                      </div>
                      <div>
                        <p className="font-headline font-black uppercase text-sm leading-tight">{product.name}</p>
                        <span className="text-[10px] font-bold text-[#0055ff] uppercase">{product.category?.name || 'Uncategorized'}</span>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 border-r-2 border-[#1a1a1a]/10 font-mono text-sm font-bold">{product.sku}</td>
                  <td className="p-4 border-r-2 border-[#1a1a1a]/10 font-headline font-black text-lg">{formatCurrency(product.price)}</td>
                  <td className="p-4 border-r-2 border-[#1a1a1a]/10">
                    <span className={`px-3 py-1 text-[10px] font-headline font-black uppercase border-2 border-[#1a1a1a] ${statusStyle(product.status)}`}>{product.status}</span>
                  </td>
                  <td className="p-4 border-r-2 border-[#1a1a1a]/10">
                    <span className={`font-headline font-black text-lg ${product.inventory === 0 ? 'text-[#e63b2e]' : ''}`}>{product.inventory}</span>
                    <span className="text-xs font-bold opacity-50 ml-1 uppercase">{product.inventory === 0 ? 'Out' : 'Units'}</span>
                  </td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      <Link href={`/dashboard/products/${product.id}`}>
                        <button className="w-9 h-9 border-2 border-[#1a1a1a] flex items-center justify-center hover:bg-[#ffcc00] transition-colors">
                          <Icon name="edit" size="sm" />
                        </button>
                      </Link>
                      <button onClick={() => setDeleteId(product.id)} className="w-9 h-9 border-2 border-[#1a1a1a] flex items-center justify-center hover:bg-[#e63b2e] hover:text-white transition-colors">
                        <Icon name="delete" size="sm" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="p-4 bg-[#eee9e0] border-t-4 border-[#1a1a1a] flex justify-between items-center">
          <span className="font-headline font-bold uppercase text-xs opacity-60">Showing {filteredProducts.length} of {products.length} products</span>
        </div>
      </div>

      {/* Delete Confirm */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1a1a1a]/60">
          <div className="w-full max-w-sm bg-[#f5f0e8] border-4 border-[#1a1a1a] p-8 shadow-[8px_8px_0px_0px_rgba(26,26,26,1)]">
            <h2 className="font-headline font-black uppercase text-2xl mb-4">Delete Product?</h2>
            <p className="font-body text-sm mb-6 opacity-70">This action cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)} className="flex-1 border-2 border-[#1a1a1a] py-3 font-headline font-black uppercase hover:bg-[#eee9e0] transition-colors">Cancel</button>
              <button onClick={() => handleDelete(deleteId)} className="flex-1 bg-[#e63b2e] text-white border-2 border-[#1a1a1a] py-3 font-headline font-black uppercase hover:bg-[#1a1a1a] transition-colors">Delete</button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}
