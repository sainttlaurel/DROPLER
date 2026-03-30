'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'sonner'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Icon } from '@/components/ui/Icon'
import { useStore } from '@/contexts/StoreContext'
import { formatDate } from '@/lib/utils'

interface OrderItem {
  id: string
  name: string
  sku: string
  price: number
  cost: number
  quantity: number
  image: string | null
}

interface Order {
  id: string
  orderNumber: string
  customerName: string
  customerEmail: string
  shippingAddress: string
  subtotal: number
  tax: number
  shipping: number
  total: number
  profit: number
  status: string
  createdAt: string
  trackingNumber?: string
  notes?: string
  items: OrderItem[]
}

const STATUS_FLOW = ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED']

const statusStyle = (s: string) => ({
  PENDING:    'bg-[#ffcc00] text-[#1a1a1a]',
  PROCESSING: 'bg-[#0055ff] text-white',
  SHIPPED:    'bg-[#1a1a1a] text-white',
  DELIVERED:  'bg-[#00cc66] text-white',
  CANCELED:   'bg-[#e63b2e] text-white',
}[s] || 'bg-[#eee9e0] text-[#1a1a1a]')

export default function OrderDetailPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const editMode = searchParams.get('edit') === '1'
  const statusRef = useRef<HTMLDivElement>(null)
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [trackingNumber, setTrackingNumber] = useState('')
  const [notes, setNotes] = useState('')
  const [editingNotes, setEditingNotes] = useState(false)
  const { formatCurrency } = useStore()

  useEffect(() => { fetchOrder() }, [])

  // Auto-scroll to status panel when coming from edit button
  useEffect(() => {
    if (editMode && statusRef.current && !loading) {
      setTimeout(() => statusRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 200)
    }
  }, [editMode, loading])

  const fetchOrder = async () => {
    try {
      const res = await fetch(`/api/orders/${params.id}`)
      const data = await res.json()
      setOrder(data)
      setTrackingNumber(data.trackingNumber || '')
      setNotes(data.notes || '')
    } catch { toast.error('Failed to load order') }
    finally { setLoading(false) }
  }

  const updateStatus = async (status: string) => {
    setUpdating(true)
    try {
      const res = await fetch(`/api/orders/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      if (res.ok) { toast.success('Status updated'); fetchOrder() }
      else toast.error('Failed to update status')
    } catch { toast.error('Failed to update status') }
    finally { setUpdating(false) }
  }

  const updateTracking = async () => {
    if (!trackingNumber.trim()) return toast.error('Enter a tracking number')
    setUpdating(true)
    try {
      const res = await fetch(`/api/orders/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trackingNumber, status: 'SHIPPED' }),
      })
      if (res.ok) { toast.success('Tracking saved, order marked as shipped'); fetchOrder() }
      else toast.error('Failed to update tracking')
    } catch { toast.error('Failed to update tracking') }
    finally { setUpdating(false) }
  }

  const updateNotes = async () => {
    setUpdating(true)
    try {
      const res = await fetch(`/api/orders/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes }),
      })
      if (res.ok) { toast.success('Notes saved'); setEditingNotes(false); fetchOrder() }
      else toast.error('Failed to save notes')
    } catch { toast.error('Failed to save notes') }
    finally { setUpdating(false) }
  }

  if (loading) return (
    <DashboardLayout>
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Icon name="refresh" size="xl" className="animate-spin text-[#1a1a1a] mb-4" />
          <p className="font-headline font-bold uppercase text-lg">Loading Order...</p>
        </div>
      </div>
    </DashboardLayout>
  )

  if (!order) return (
    <DashboardLayout>
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="font-headline font-bold uppercase opacity-40">Order not found</p>
      </div>
    </DashboardLayout>
  )

  const currentStep = STATUS_FLOW.indexOf(order.status)

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6 border-b-8 border-[#1a1a1a] pb-8">
        <div>
          <Link href="/dashboard/orders" className="flex items-center gap-1 font-headline font-bold uppercase text-xs opacity-50 hover:opacity-100 mb-3 transition-opacity">
            <Icon name="arrow_back" size="sm" /> Back to Orders
          </Link>
          <h1 className="text-5xl md:text-6xl font-black uppercase tracking-tighter leading-none mb-2 font-headline">{order.orderNumber}</h1>
          <p className="font-bold text-sm border-l-8 border-[#ffcc00] pl-4 uppercase opacity-60">{formatDate(order.createdAt, 'long')}</p>
        </div>
        <div className="flex items-center gap-4">
          <span className={`px-4 py-2 text-sm font-headline font-black uppercase border-2 border-[#1a1a1a] ${statusStyle(order.status)}`}>{order.status}</span>
        </div>
      </div>

      {/* Status Progress */}
      <div ref={statusRef} className={`bg-white border-4 border-[#1a1a1a] p-6 shadow-[8px_8px_0px_0px_rgba(26,26,26,1)] mb-6 ${editMode ? 'ring-4 ring-[#ffcc00]' : ''}`}>
        <h3 className="font-headline font-black uppercase text-sm mb-4 opacity-50">Order Progress</h3>
        <div className="flex items-center gap-0">
          {STATUS_FLOW.map((step, i) => (
            <div key={step} className="flex items-center flex-1">
              <div className={`flex flex-col items-center flex-1 ${i <= currentStep ? '' : 'opacity-30'}`}>
                <div className={`w-8 h-8 border-2 border-[#1a1a1a] flex items-center justify-center font-headline font-black text-xs ${i < currentStep ? 'bg-[#1a1a1a] text-white' : i === currentStep ? 'bg-[#ffcc00]' : 'bg-white'}`}>
                  {i < currentStep ? <Icon name="check" size="sm" /> : i + 1}
                </div>
                <span className="font-headline font-bold uppercase text-[10px] mt-1 text-center">{step}</span>
              </div>
              {i < STATUS_FLOW.length - 1 && (
                <div className={`h-0.5 flex-1 mx-1 mb-4 ${i < currentStep ? 'bg-[#1a1a1a]' : 'bg-[#1a1a1a]/20'}`} />
              )}
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        {order.status !== 'DELIVERED' && order.status !== 'CANCELED' && (
          <div className="mt-6 pt-6 border-t-2 border-[#1a1a1a]/10 flex flex-wrap gap-3">
            {order.status === 'PENDING' && (
              <button onClick={() => updateStatus('PROCESSING')} disabled={updating} className="flex items-center gap-2 px-5 py-3 bg-[#0055ff] text-white border-2 border-[#1a1a1a] font-headline font-black uppercase text-sm shadow-[3px_3px_0px_0px_rgba(26,26,26,1)] hover:translate-x-[3px] hover:translate-y-[3px] hover:shadow-none transition-all disabled:opacity-50">
                <Icon name="play_arrow" size="sm" /> Mark Processing
              </button>
            )}
            {order.status === 'PROCESSING' && (
              <button onClick={() => updateStatus('SHIPPED')} disabled={updating} className="flex items-center gap-2 px-5 py-3 bg-[#1a1a1a] text-white border-2 border-[#1a1a1a] font-headline font-black uppercase text-sm shadow-[3px_3px_0px_0px_rgba(26,26,26,1)] hover:translate-x-[3px] hover:translate-y-[3px] hover:shadow-none transition-all disabled:opacity-50">
                <Icon name="local_shipping" size="sm" /> Mark Shipped
              </button>
            )}
            {order.status === 'SHIPPED' && (
              <button onClick={() => updateStatus('DELIVERED')} disabled={updating} className="flex items-center gap-2 px-5 py-3 bg-[#00cc66] text-white border-2 border-[#1a1a1a] font-headline font-black uppercase text-sm shadow-[3px_3px_0px_0px_rgba(26,26,26,1)] hover:translate-x-[3px] hover:translate-y-[3px] hover:shadow-none transition-all disabled:opacity-50">
                <Icon name="check_circle" size="sm" /> Mark Delivered
              </button>
            )}
            <button onClick={() => updateStatus('CANCELED')} disabled={updating} className="flex items-center gap-2 px-5 py-3 border-2 border-[#e63b2e] text-[#e63b2e] font-headline font-black uppercase text-sm hover:bg-[#e63b2e] hover:text-white transition-colors disabled:opacity-50">
              <Icon name="cancel" size="sm" /> Cancel Order
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Customer */}
        <div className="bg-white border-4 border-[#1a1a1a] p-6 shadow-[8px_8px_0px_0px_rgba(26,26,26,1)]">
          <h3 className="font-headline font-black uppercase text-sm mb-4 border-b-2 border-[#1a1a1a] pb-2">Customer</h3>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-[#ffcc00] border-2 border-[#1a1a1a] flex items-center justify-center font-headline font-black text-lg shrink-0">
              {order.customerName[0]?.toUpperCase()}
            </div>
            <div>
              <p className="font-headline font-black uppercase text-sm">{order.customerName}</p>
              <p className="text-xs font-bold opacity-50">{order.customerEmail}</p>
            </div>
          </div>
        </div>

        {/* Shipping */}
        <div className="bg-white border-4 border-[#1a1a1a] p-6 shadow-[8px_8px_0px_0px_rgba(26,26,26,1)]">
          <h3 className="font-headline font-black uppercase text-sm mb-4 border-b-2 border-[#1a1a1a] pb-2">Shipping Address</h3>
          <p className="text-sm font-body leading-relaxed opacity-70 whitespace-pre-line">{order.shippingAddress}</p>
        </div>

        {/* Notes */}
        <div className="bg-white border-4 border-[#1a1a1a] p-6 shadow-[8px_8px_0px_0px_rgba(26,26,26,1)]">
          <div className="flex justify-between items-center mb-4 border-b-2 border-[#1a1a1a] pb-2">
            <h3 className="font-headline font-black uppercase text-sm">Internal Notes</h3>
            <button onClick={() => setEditingNotes(!editingNotes)} className="font-headline font-bold uppercase text-xs text-[#0055ff] hover:underline">{editingNotes ? 'Cancel' : 'Edit'}</button>
          </div>
          {editingNotes ? (
            <div>
              <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3} placeholder="Add notes..." className="w-full border-2 border-[#1a1a1a] p-3 text-sm font-body focus:bg-[#fffbe6] focus:outline-none resize-none" />
              <button onClick={updateNotes} disabled={updating} className="mt-2 w-full bg-[#1a1a1a] text-white py-2 font-headline font-black uppercase text-xs hover:bg-[#0055ff] transition-colors disabled:opacity-50">
                {updating ? 'Saving...' : 'Save Notes'}
              </button>
            </div>
          ) : (
            <p className="text-sm font-body opacity-60">{order.notes || 'No notes added yet.'}</p>
          )}
        </div>
      </div>

      {/* Tracking */}
      {(order.status === 'PROCESSING' || order.status === 'SHIPPED') && (
        <div className="bg-white border-4 border-[#1a1a1a] p-6 shadow-[8px_8px_0px_0px_rgba(26,26,26,1)] mb-6">
          <h3 className="font-headline font-black uppercase text-sm mb-4 border-b-2 border-[#1a1a1a] pb-2">Tracking Information</h3>
          <div className="flex gap-3">
            <input type="text" value={trackingNumber} onChange={e => setTrackingNumber(e.target.value)} placeholder="Enter tracking number" className="flex-1 border-2 border-[#1a1a1a] p-3 font-headline font-bold text-sm focus:bg-[#fffbe6] focus:outline-none" />
            <button onClick={updateTracking} disabled={updating} className="px-5 py-3 bg-[#1a1a1a] text-white border-2 border-[#1a1a1a] font-headline font-black uppercase text-sm hover:bg-[#0055ff] transition-colors disabled:opacity-50">
              {updating ? 'Saving...' : 'Save & Ship'}
            </button>
          </div>
          {order.trackingNumber && (
            <p className="mt-2 text-xs font-bold opacity-50 uppercase">Current: <span className="font-mono">{order.trackingNumber}</span></p>
          )}
        </div>
      )}

      {/* Order Items */}
      <div className="border-4 border-[#1a1a1a] bg-white shadow-[8px_8px_0px_0px_rgba(26,26,26,1)] overflow-hidden mb-10">
        <div className="p-6 border-b-4 border-[#1a1a1a] bg-[#eee9e0]">
          <h3 className="font-headline font-black uppercase text-lg">Order Items</h3>
        </div>
        <div className="divide-y-2 divide-[#1a1a1a]/10">
          {order.items.map(item => (
            <div key={item.id} className="flex items-center gap-4 p-5 hover:bg-[#f5f0e8] transition-colors">
              <div className="w-14 h-14 border-2 border-[#1a1a1a] shrink-0 bg-[#eee9e0] overflow-hidden">
                {item.image ? <img src={item.image} alt={item.name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><Icon name="image" size="sm" className="opacity-30" /></div>}
              </div>
              <div className="flex-1">
                <p className="font-headline font-black uppercase text-sm">{item.name}</p>
                <p className="text-xs font-bold opacity-50 uppercase">SKU: {item.sku} · Qty: {item.quantity}</p>
              </div>
              <div className="text-right">
                <p className="font-headline font-black text-lg">{formatCurrency(item.price * item.quantity)}</p>
                <p className="text-xs font-bold opacity-50">Cost: {formatCurrency(item.cost * item.quantity)}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Totals */}
        <div className="border-t-4 border-[#1a1a1a] p-6 bg-[#f5f0e8]">
          <div className="max-w-xs ml-auto space-y-2">
            <div className="flex justify-between text-sm font-bold uppercase">
              <span className="opacity-60">Subtotal</span>
              <span>{formatCurrency(order.subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm font-bold uppercase">
              <span className="opacity-60">Tax</span>
              <span>{formatCurrency(order.tax)}</span>
            </div>
            <div className="flex justify-between text-sm font-bold uppercase">
              <span className="opacity-60">Shipping</span>
              <span>{formatCurrency(order.shipping)}</span>
            </div>
            <div className="flex justify-between font-headline font-black text-xl uppercase border-t-4 border-[#1a1a1a] pt-3 mt-3">
              <span>Total</span>
              <span>{formatCurrency(order.total)}</span>
            </div>
            <div className="flex justify-between font-headline font-black text-sm uppercase text-[#0055ff]">
              <span>Profit</span>
              <span>{formatCurrency(order.profit)}</span>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
