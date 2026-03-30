'use client'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Icon } from '@/components/ui/Icon'

interface Category {
  id: string
  name: string
  slug: string
  description: string | null
  _count: { products: number }
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [deleteCategory, setDeleteCategory] = useState<Category | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => { fetchCategories() }, [])

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/categories')
      setCategories(await res.json())
    } catch { toast.error('Failed to load categories') }
    finally { setLoading(false) }
  }

  const openModal = (category?: Category) => {
    setEditingCategory(category || null)
    setName(category?.name || '')
    setDescription(category?.description || '')
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setEditingCategory(null)
    setName('')
    setDescription('')
  }

  const handleSave = async () => {
    if (!name.trim()) return toast.error('Category name is required')
    setSaving(true)
    try {
      const url = editingCategory ? `/api/categories/${editingCategory.id}` : '/api/categories'
      const res = await fetch(url, {
        method: editingCategory ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), description: description.trim() || null }),
      })
      if (res.ok) {
        toast.success(editingCategory ? 'Category updated!' : 'Category created!')
        closeModal()
        fetchCategories()
      } else {
        const d = await res.json()
        toast.error(d.error || 'Failed to save')
      }
    } catch { toast.error('Failed to save category') }
    finally { setSaving(false) }
  }

  const handleDelete = async () => {
    if (!deleteCategory) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/categories/${deleteCategory.id}`, { method: 'DELETE' })
      if (res.ok) {
        toast.success('Category deleted!')
        setDeleteCategory(null)
        fetchCategories()
      } else {
        const d = await res.json()
        toast.error(d.error || 'Failed to delete')
      }
    } catch { toast.error('Failed to delete category') }
    finally { setDeleting(false) }
  }

  const totalProducts = categories.reduce((sum, c) => sum + c._count.products, 0)

  if (loading) return (
    <DashboardLayout>
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Icon name="refresh" size="xl" className="animate-spin text-[#1a1a1a] mb-4" />
          <p className="font-headline font-bold uppercase text-lg">Loading Categories...</p>
        </div>
      </div>
    </DashboardLayout>
  )

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6 border-b-8 border-[#1a1a1a] pb-8">
        <div>
          <h1 className="text-7xl md:text-8xl font-black uppercase tracking-tighter leading-none mb-2 font-headline">Categories</h1>
          <p className="font-bold text-xl border-l-8 border-[#ffcc00] pl-4 uppercase">Organize your product catalog.</p>
        </div>
        <button onClick={() => openModal()} className="flex items-center gap-2 px-6 py-3 bg-[#ffcc00] border-4 border-[#1a1a1a] font-headline font-black uppercase shadow-[6px_6px_0px_0px_rgba(26,26,26,1)] hover:bg-[#1a1a1a] hover:text-white transition-all active:translate-x-1 active:translate-y-1 active:shadow-none">
          <Icon name="add" size="sm" /> Add New Category
        </button>
      </div>

      {categories.length === 0 ? (
        <div className="border-4 border-dashed border-[#1a1a1a]/30 p-16 text-center bg-[#f5f0e8]">
          <Icon name="category" className="text-6xl opacity-20 mb-4" />
          <h3 className="font-headline font-black uppercase text-2xl mb-2">No Categories Yet</h3>
          <p className="font-bold opacity-50 mb-6 uppercase text-sm">Create categories to organize your products</p>
          <button onClick={() => openModal()} className="bg-[#ffcc00] border-4 border-[#1a1a1a] px-8 py-3 font-headline font-black uppercase shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] hover:bg-[#1a1a1a] hover:text-white transition-all">
            Create First Category
          </button>
        </div>
      ) : (
        <>
          {/* Category Table */}
          <div className="border-4 border-[#1a1a1a] bg-white shadow-[8px_8px_0px_0px_rgba(26,26,26,1)] overflow-hidden mb-10">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-[#ffcc00] border-b-4 border-[#1a1a1a] font-headline font-black uppercase text-xs tracking-widest">
                  <th className="p-4 text-left border-r-2 border-[#1a1a1a]">Category</th>
                  <th className="p-4 text-left border-r-2 border-[#1a1a1a]">Description</th>
                  <th className="p-4 text-left border-r-2 border-[#1a1a1a]">Products</th>
                  <th className="p-4 text-left border-r-2 border-[#1a1a1a]">Status</th>
                  <th className="p-4 text-left">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-[#1a1a1a]/10">
                {categories.map(category => (
                  <tr key={category.id} className="hover:bg-[#f5f0e8] transition-colors">
                    <td className="p-4 border-r-2 border-[#1a1a1a]/10">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[#1a1a1a] border-2 border-[#1a1a1a] flex items-center justify-center shrink-0">
                          <Icon name="category" size="sm" className="text-white" />
                        </div>
                        <div>
                          <p className="font-headline font-black uppercase text-sm">{category.name}</p>
                          <p className="text-[10px] font-bold opacity-40 uppercase">{category.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 border-r-2 border-[#1a1a1a]/10">
                      <p className="text-sm font-body opacity-70 max-w-xs truncate">{category.description || '—'}</p>
                    </td>
                    <td className="p-4 border-r-2 border-[#1a1a1a]/10">
                      <span className="font-headline font-black text-2xl">{category._count.products}</span>
                      <span className="text-xs font-bold opacity-50 ml-1 uppercase">items</span>
                    </td>
                    <td className="p-4 border-r-2 border-[#1a1a1a]/10">
                      <span className="px-3 py-1 text-[10px] font-headline font-black uppercase border-2 border-[#1a1a1a] bg-[#1a1a1a] text-white">Active</span>
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <button onClick={() => openModal(category)} className="flex items-center gap-1 px-3 py-2 border-2 border-[#1a1a1a] font-headline font-black uppercase text-xs hover:bg-[#ffcc00] transition-colors">
                          <Icon name="edit" size="sm" /> Edit
                        </button>
                        <button onClick={() => setDeleteCategory(category)} className="flex items-center gap-1 px-3 py-2 border-2 border-[#1a1a1a] font-headline font-black uppercase text-xs hover:bg-[#e63b2e] hover:text-white transition-colors">
                          <Icon name="delete" size="sm" /> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Stats Footer */}
          <div className="border-t-8 border-[#1a1a1a] pt-8 flex flex-wrap gap-12 pb-12">
            <div>
              <span className="block text-xs font-headline font-black uppercase tracking-widest opacity-50 mb-1">Total Categories</span>
              <span className="text-5xl font-headline font-black tracking-tighter">{String(categories.length).padStart(2, '0')}</span>
            </div>
            <div>
              <span className="block text-xs font-headline font-black uppercase tracking-widest opacity-50 mb-1">Total Products</span>
              <span className="text-5xl font-headline font-black tracking-tighter">{totalProducts.toLocaleString()}</span>
            </div>
            <div>
              <span className="block text-xs font-headline font-black uppercase tracking-widest opacity-50 mb-1">Last Update</span>
              <span className="text-5xl font-headline font-black tracking-tighter">
                {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })} <span className="text-xl">GMT</span>
              </span>
            </div>
          </div>
        </>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1a1a1a]/60">
          <div className="w-full max-w-md bg-[#f5f0e8] border-4 border-[#1a1a1a] p-8 shadow-[8px_8px_0px_0px_rgba(26,26,26,1)]">
            <h2 className="font-headline font-black uppercase text-3xl mb-6 border-b-4 border-[#1a1a1a] pb-4">
              {editingCategory ? 'Edit Category' : 'New Category'}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block font-headline font-bold uppercase text-xs mb-2">Category Name *</label>
                <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="e.g., Electronics, Clothing" className="w-full bg-white border-2 border-[#1a1a1a] p-4 font-headline font-bold focus:bg-[#fffbe6] focus:outline-none transition-colors" onKeyDown={e => e.key === 'Enter' && handleSave()} />
              </div>
              <div>
                <label className="block font-headline font-bold uppercase text-xs mb-2">Description (Optional)</label>
                <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Brief description" rows={3} className="w-full bg-white border-2 border-[#1a1a1a] p-4 font-body text-sm focus:bg-[#fffbe6] focus:outline-none transition-colors resize-none" />
              </div>
            </div>
            <div className="mt-6 flex gap-3">
              <button onClick={closeModal} className="flex-1 border-2 border-[#1a1a1a] px-4 py-3 font-headline font-bold uppercase hover:bg-[#eee9e0] transition-colors">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="flex-1 bg-[#ffcc00] border-2 border-[#1a1a1a] px-4 py-3 font-headline font-black uppercase shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] hover:bg-[#1a1a1a] hover:text-white transition-all active:translate-x-1 active:translate-y-1 active:shadow-none disabled:opacity-50">
                {saving ? 'Saving...' : (editingCategory ? 'Update' : 'Create')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1a1a1a]/60">
          <div className="w-full max-w-sm bg-[#f5f0e8] border-4 border-[#1a1a1a] p-8 shadow-[8px_8px_0px_0px_rgba(26,26,26,1)]">
            <h2 className="font-headline font-black uppercase text-2xl mb-2">Delete Category?</h2>
            <p className="font-body text-sm mb-6 opacity-70">Products in <strong>"{deleteCategory.name}"</strong> will become uncategorized.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteCategory(null)} className="flex-1 border-2 border-[#1a1a1a] py-3 font-headline font-black uppercase hover:bg-[#eee9e0] transition-colors">Cancel</button>
              <button onClick={handleDelete} disabled={deleting} className="flex-1 bg-[#e63b2e] text-white border-2 border-[#1a1a1a] py-3 font-headline font-black uppercase hover:bg-[#1a1a1a] transition-colors disabled:opacity-50">
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}
