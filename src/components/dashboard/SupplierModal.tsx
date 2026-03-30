'use client'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { Icon } from '@/components/ui/Icon'

interface SupplierModalProps {
  isOpen: boolean
  onClose: () => void
  supplier?: {
    id: string
    name: string
    platform: string
    website: string | null
    email: string | null
    country: string | null
    notes: string | null
    isActive: boolean
  } | null
}

const PLATFORMS = [
  { value: 'ALIEXPRESS',     label: 'AliExpress' },
  { value: 'CJ_DROPSHIPPING', label: 'CJ Dropshipping' },
  { value: 'SPOCKET',        label: 'Spocket' },
  { value: 'CUSTOM',         label: 'Custom' },
]

const inputClass = "w-full bg-[#f5f0e8] border-b-4 border-[#1a1a1a] px-3 py-3 font-body font-semibold focus:outline-none focus:bg-[#fffbe6] transition-colors"
const labelClass = "block font-headline font-black uppercase text-[10px] tracking-widest mb-2"

export default function SupplierModal({ isOpen, onClose, supplier }: SupplierModalProps) {
  const [loading, setLoading] = useState(false)
  const [name, setName] = useState('')
  const [platform, setPlatform] = useState('ALIEXPRESS')
  const [website, setWebsite] = useState('')
  const [email, setEmail] = useState('')
  const [country, setCountry] = useState('')
  const [notes, setNotes] = useState('')
  const [isActive, setIsActive] = useState(true)

  useEffect(() => {
    if (supplier) {
      setName(supplier.name)
      setPlatform(supplier.platform)
      setWebsite(supplier.website || '')
      setEmail(supplier.email || '')
      setCountry(supplier.country || '')
      setNotes(supplier.notes || '')
      setIsActive(supplier.isActive)
    } else {
      setName('')
      setPlatform('ALIEXPRESS')
      setWebsite('')
      setEmail('')
      setCountry('')
      setNotes('')
      setIsActive(true)
    }
  }, [supplier, isOpen])

  const handleSubmit = async () => {
    if (!name.trim()) {
      toast.error('Supplier name is required')
      return
    }

    setLoading(true)
    try {
      const url = supplier ? `/api/suppliers/${supplier.id}` : '/api/suppliers'
      const method = supplier ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          platform,
          website: website.trim() || null,
          email: email.trim() || null,
          country: country.trim() || null,
          notes: notes.trim() || null,
          isActive,
        }),
      })

      if (res.ok) {
        toast.success(supplier ? 'Supplier updated!' : 'Supplier added!')
        onClose()
      } else {
        const data = await res.json()
        toast.error(data.error || 'Failed to save supplier')
      }
    } catch {
      toast.error('Failed to save supplier')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1a1a1a]/70 p-4">
      <div className="w-full max-w-xl max-h-[90vh] overflow-y-auto bg-[#f5f0e8] border-4 border-[#1a1a1a] shadow-[8px_8px_0px_0px_rgba(26,26,26,1)]">

        {/* Header */}
        <div className="flex items-center justify-between bg-[#1a1a1a] text-white px-6 py-4">
          <h2 className="font-headline font-black uppercase text-2xl tracking-tighter">
            {supplier ? 'Edit Supplier' : 'Add Supplier'}
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center border-2 border-white hover:bg-white hover:text-[#1a1a1a] transition-colors"
          >
            <Icon name="close" size="sm" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          {/* Name */}
          <div>
            <label className={labelClass}>Supplier Name *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., AliExpress Global"
              className={inputClass}
            />
          </div>

          {/* Platform + Country */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Platform *</label>
              <select
                value={platform}
                onChange={(e) => setPlatform(e.target.value)}
                className={inputClass}
              >
                {PLATFORMS.map((p) => (
                  <option key={p.value} value={p.value}>{p.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Country</label>
              <input
                type="text"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                placeholder="e.g., China"
                className={inputClass}
              />
            </div>
          </div>

          {/* Website */}
          <div>
            <label className={labelClass}>Website</label>
            <input
              type="url"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              placeholder="https://example.com"
              className={inputClass}
            />
          </div>

          {/* Email */}
          <div>
            <label className={labelClass}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="contact@supplier.com"
              className={inputClass}
            />
          </div>

          {/* Notes */}
          <div>
            <label className={labelClass}>Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Additional notes about this supplier..."
              rows={3}
              className={`${inputClass} resize-none`}
            />
          </div>

          {/* Active toggle */}
          <div className="flex items-center justify-between bg-white border-2 border-[#1a1a1a] px-4 py-3">
            <div>
              <p className="font-headline font-black uppercase text-sm">Active Supplier</p>
              <p className="text-[10px] font-body opacity-60">Visible in product organization</p>
            </div>
            <button
              type="button"
              onClick={() => setIsActive(!isActive)}
              className={`w-14 h-7 border-2 border-[#1a1a1a] relative transition-colors ${isActive ? 'bg-[#ffcc00]' : 'bg-[#d6d1c9]'}`}
            >
              <div className={`absolute top-1 w-4 h-4 bg-[#1a1a1a] transition-all ${isActive ? 'right-1' : 'left-1'}`} />
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 px-6 pb-6">
          <button
            onClick={onClose}
            className="flex-1 py-3 border-4 border-[#1a1a1a] bg-white font-headline font-black uppercase text-sm hover:bg-[#f5f0e8] transition-colors shadow-[3px_3px_0px_0px_rgba(26,26,26,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1 py-3 border-4 border-[#1a1a1a] bg-[#ffcc00] font-headline font-black uppercase text-sm hover:bg-[#1a1a1a] hover:text-white transition-colors shadow-[3px_3px_0px_0px_rgba(26,26,26,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none disabled:opacity-50"
          >
            {loading ? 'Saving...' : supplier ? 'Update Supplier' : 'Add Supplier'}
          </button>
        </div>
      </div>
    </div>
  )
}
