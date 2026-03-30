'use client'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Icon } from '@/components/ui/Icon'
import SupplierModal from '@/components/dashboard/SupplierModal'

interface Supplier {
  id: string
  name: string
  platform: string
  website: string | null
  email: string | null
  country: string | null
  notes: string | null
  isActive: boolean
  _count: { products: number }
}

const supplierCardStyles = [
  { bg: 'bg-[#f2ede5]', btn: 'bg-[#0055ff] text-white hover:bg-[#1a1a1a]' },
  { bg: 'bg-[#ffcc00]', btn: 'bg-[#1a1a1a] text-white hover:bg-[#0055ff]' },
  { bg: 'bg-[#f2ede5]', btn: 'bg-[#f5f0e8] text-[#1a1a1a] hover:bg-[#1a1a1a] hover:text-white' },
]

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null)

  useEffect(() => { fetchSuppliers() }, [])

  const fetchSuppliers = async () => {
    try {
      const res = await fetch('/api/suppliers')
      const data = await res.json()
      setSuppliers(data)
    } catch { toast.error('Failed to load suppliers') }
    finally { setLoading(false) }
  }

  const handleAddSupplier = () => {
    setSelectedSupplier(null)
    setIsModalOpen(true)
  }

  const handleEditSupplier = (supplier: Supplier) => {
    setSelectedSupplier(supplier)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedSupplier(null)
    fetchSuppliers()
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Icon name="refresh" size="xl" className="animate-spin" />
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      {/* Hero Title */}
      <section className="border-b-8 border-[#1a1a1a] pb-8 mb-12">
        <h1 className="text-7xl md:text-8xl font-black font-headline leading-none tracking-tighter uppercase mb-4">
          Global<br />Suppliers
        </h1>
        <p className="text-xl font-body font-medium max-w-2xl">Manage your external infrastructure. High-reliability connections to international fulfillment networks.</p>
      </section>

      {/* Suppliers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
        {suppliers.map((supplier, index) => {
          const style = supplierCardStyles[index % supplierCardStyles.length]
          return (
            <div key={supplier.id} className={`border-4 border-[#1a1a1a] ${style.bg} p-6 flex flex-col gap-6 shadow-[6px_6px_0px_0px_rgba(26,26,26,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all duration-150`}>
              <div className="flex justify-between items-start">
                <div className="w-16 h-16 bg-[#1a1a1a] flex items-center justify-center border-2 border-[#1a1a1a]">
                  <Icon name="local_shipping" className="text-white text-3xl" />
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-[10px] font-headline font-bold uppercase tracking-widest mb-1">Status</span>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-bold uppercase ${!supplier.isActive ? 'opacity-40' : ''}`}>{supplier.isActive ? 'Active' : 'Inactive'}</span>
                    <div className={`w-12 h-6 border-2 border-[#1a1a1a] relative cursor-pointer ${supplier.isActive ? 'bg-[#ffcc00]' : 'bg-[#f5f0e8]'}`}>
                      <div className={`absolute top-1 w-3 h-3 bg-[#1a1a1a] transition-all ${supplier.isActive ? 'right-1' : 'left-1'}`}></div>
                    </div>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-3xl font-headline font-black uppercase leading-none mb-2">{supplier.name}</h3>
                <p className="text-xs font-bold uppercase tracking-tighter opacity-70">{supplier.platform} · {supplier._count.products} Products</p>
              </div>
              <div className="space-y-3 font-body text-sm font-semibold border-t-2 border-[#1a1a1a]/10 pt-4">
                {supplier.email && (
                  <div className="flex gap-2 items-center">
                    <Icon name="mail" size="sm" />
                    <span>{supplier.email}</span>
                  </div>
                )}
                {supplier.country && (
                  <div className="flex gap-2 items-center">
                    <Icon name="location_on" size="sm" />
                    <span>{supplier.country}</span>
                  </div>
                )}
                {supplier.website && (
                  <div className="flex gap-2 items-center">
                    <Icon name="language" size="sm" />
                    <span className="truncate">{supplier.website}</span>
                  </div>
                )}
              </div>
              <button
                onClick={() => handleEditSupplier(supplier)}
                className={`mt-auto w-full py-3 font-headline font-bold uppercase border-2 border-[#1a1a1a] transition-colors active:translate-x-1 active:translate-y-1 ${style.btn}`}
              >
                Edit Supplier
              </button>
            </div>
          )
        })}

        {/* Add New Card */}
        <div
          onClick={handleAddSupplier}
          className="border-4 border-dashed border-[#1a1a1a]/40 bg-[#f5f0e8] flex flex-col items-center justify-center p-12 group cursor-pointer hover:bg-[#ffcc00] hover:border-solid hover:border-[#1a1a1a] transition-all duration-300"
        >
          <Icon name="add_circle" className="text-6xl mb-4 group-hover:scale-110 transition-transform" />
          <span className="font-headline font-black uppercase text-xl text-center">Add New<br />Supplier</span>
        </div>
      </div>

      {/* Management Section */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-12 pt-12 pb-12">
        {/* Global Integration Hub */}
        <div className="bg-[#1a1a1a] text-[#f5f0e8] p-10 flex flex-col justify-between shadow-[6px_6px_0px_0px_rgba(26,26,26,1)]">
          <div>
            <h2 className="text-5xl font-headline font-black uppercase mb-6 leading-none">Global Integration Hub</h2>
            <p className="font-body text-lg opacity-80 mb-8">Connect your API keys and webhook listeners to automate order fulfillment across all active suppliers.</p>
          </div>
          <div className="flex gap-4">
            <button className="bg-[#ffcc00] text-[#1a1a1a] px-8 py-4 font-headline font-bold uppercase border-2 border-[#f5f0e8] hover:invert active:translate-x-1 active:translate-y-1 transition-all">Configure APIs</button>
            <button className="border-2 border-[#f5f0e8] px-8 py-4 font-headline font-bold uppercase hover:bg-[#f5f0e8] hover:text-[#1a1a1a] active:translate-x-1 active:translate-y-1 transition-all">Logs</button>
          </div>
        </div>

        {/* Supplier Performance */}
        <div className="border-4 border-[#1a1a1a] p-10 bg-white shadow-[6px_6px_0px_0px_rgba(26,26,26,1)]">
          <h2 className="text-4xl font-headline font-black uppercase mb-8 leading-none">Supplier Performance</h2>
          <div className="space-y-6">
            {[
              { label: 'Fulfillment Rate', value: '98.2%', pct: 98.2, color: '#0055ff' },
              { label: 'Average Shipping Time', value: '4.2 Days', pct: 65, color: '#ffcc00' },
              { label: 'Quality Dispute Ratio', value: '0.4%', pct: 12, color: '#e63b2e' },
            ].map(({ label, value, pct, color }) => (
              <div key={label} className="space-y-2">
                <div className="flex justify-between font-headline font-bold uppercase text-xs">
                  <span>{label}</span>
                  <span>{value}</span>
                </div>
                <div className="w-full h-8 bg-[#f5f0e8] border-2 border-[#1a1a1a] relative">
                  <div className="absolute inset-0" style={{ width: `${pct}%`, backgroundColor: color }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <SupplierModal isOpen={isModalOpen} onClose={handleCloseModal} supplier={selectedSupplier} />
    </DashboardLayout>
  )
}
