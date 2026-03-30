'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { toast } from 'sonner'
import { useStore } from '@/contexts/StoreContext'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import { Badge } from '@/components/ui/Badge'

interface Order {
  id: string
  orderNumber: string
  customerName: string
  customerEmail: string
  total: number
  status: string
  createdAt: string
  items: number
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [searchQuery, setSearchQuery] = useState('')
  const { formatCurrency } = useStore()

  useEffect(() => {
    fetchOrders()
  }, [])

  useEffect(() => {
    filterOrders()
  }, [orders, statusFilter, searchQuery])

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/orders')
      const data = await res.json()
      setOrders(Array.isArray(data) ? data : (data.orders ?? []))
    } catch (error) {
      toast.error('Failed to load orders')
    } finally {
      setLoading(false)
    }
  }

  const filterOrders = () => {
    let filtered = orders

    if (searchQuery) {
      filtered = filtered.filter(
        (o) =>
          o.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
          o.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          o.customerEmail.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    if (statusFilter !== 'ALL') {
      filtered = filtered.filter((o) => o.status === statusFilter)
    }

    setFilteredOrders(filtered)
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'success' | 'warning' | 'danger' | 'info' | 'default'> = {
      DELIVERED: 'success',
      SHIPPED: 'info',
      PROCESSING: 'warning',
      PENDING: 'danger',
      CANCELLED: 'default',
    }
    return variants[status] || 'default'
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      DELIVERED: 'bg-primary text-white',
      SHIPPED: 'bg-tertiary text-white',
      PROCESSING: 'bg-primary-container text-primary',
      PENDING: 'bg-secondary text-white',
      CANCELLED: 'bg-surface-container-high text-primary',
    }
    return colors[status] || 'bg-surface-container text-primary'
  }

  const stats = {
    total: orders.length,
    pending: orders.filter((o) => o.status === 'PENDING').length,
    shipped: orders.filter((o) => o.status === 'SHIPPED').length,
  }

  const exportToCSV = () => {
    const headers = ['Order ID', 'Customer', 'Email', 'Date', 'Total', 'Status', 'Items']
    const rows = filteredOrders.map((o) => [
      o.orderNumber,
      o.customerName,
      o.customerEmail,
      new Date(o.createdAt).toLocaleDateString(),
      o.total,
      o.status,
      o.items,
    ])

    const csv = [headers, ...rows].map((row) => row.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `orders-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    toast.success('Orders exported to CSV')
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Icon name="refresh" size="xl" className="animate-spin text-primary mb-4" />
            <p className="font-headline font-bold uppercase text-lg">Loading Orders...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      {/* Page Header */}
      <header className="mb-12">
        <h1 className="text-7xl font-black uppercase tracking-tighter leading-none mb-4 font-headline">
          Order Log
        </h1>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <p className="font-headline font-medium text-xl max-w-xl border-l-8 border-primary-container pl-4">
            System status: Active. Monitoring real-time shipments and transaction fulfillment across all global nodes.
          </p>
          <Button variant="secondary" size="md" onClick={exportToCSV}>
            <Icon name="download" size="sm" />
            Export to CSV
          </Button>
        </div>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="p-6 border-4 border-primary bg-primary-container neo-shadow">
          <div className="font-headline font-black text-sm uppercase mb-2">Total Volume</div>
          <div className="font-headline font-black text-4xl">{stats.total}</div>
        </div>
        <div className="p-6 border-4 border-primary bg-white neo-shadow">
          <div className="font-headline font-black text-sm uppercase mb-2">Pending Queue</div>
          <div className="font-headline font-black text-4xl text-secondary">{stats.pending}</div>
        </div>
        <div className="p-6 border-4 border-primary bg-white neo-shadow">
          <div className="font-headline font-black text-sm uppercase mb-2">Transit Flow</div>
          <div className="font-headline font-black text-4xl text-tertiary">{stats.shipped}</div>
        </div>
        <div className="p-6 border-4 border-primary bg-white neo-shadow flex items-center justify-center">
          <button className="flex items-center gap-2 font-headline font-black uppercase text-xl">
            <Icon name="tune" size="lg" />
            Advanced Filter
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-8 grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-8 relative">
          <Icon name="search" className="absolute left-4 top-1/2 -translate-y-1/2 text-primary" size="sm" />
          <input
            className="w-full h-16 bg-surface-container border-b-4 border-primary pl-12 pr-4 font-headline font-bold focus:outline-none focus:bg-white transition-colors uppercase placeholder:opacity-40 placeholder:normal-case"
            placeholder="Search orders, customers, or emails..."
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="lg:col-span-4">
          <select
            className="w-full h-16 bg-surface-container border-b-4 border-primary px-4 font-headline font-bold appearance-none focus:outline-none focus:bg-white uppercase"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="ALL">All Status</option>
            <option value="PENDING">Pending</option>
            <option value="PROCESSING">Processing</option>
            <option value="SHIPPED">Shipped</option>
            <option value="DELIVERED">Delivered</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="border-4 border-primary bg-white neo-shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead>
              <tr className="border-b-4 border-primary bg-primary-container">
                <th className="p-4 font-headline font-black uppercase tracking-tight border-r-2 border-primary">
                  ID Code
                </th>
                <th className="p-4 font-headline font-black uppercase tracking-tight border-r-2 border-primary">
                  Recipient
                </th>
                <th className="p-4 font-headline font-black uppercase tracking-tight border-r-2 border-primary">
                  Timestamp
                </th>
                <th className="p-4 font-headline font-black uppercase tracking-tight border-r-2 border-primary">
                  Revenue
                </th>
                <th className="p-4 font-headline font-black uppercase tracking-tight border-r-2 border-primary">
                  Condition
                </th>
                <th className="p-4 font-headline font-black uppercase tracking-tight">Control</th>
              </tr>
            </thead>
            <tbody className="font-headline font-medium">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center">
                    <Icon name="shopping_cart" size="xl" className="mx-auto mb-4 opacity-20" />
                    <p className="font-headline font-bold uppercase text-lg mb-2">No Orders Found</p>
                    <p className="text-sm opacity-60">
                      {searchQuery || statusFilter !== 'ALL'
                        ? 'Try adjusting your filters'
                        : 'Orders will appear here once customers make purchases'}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr
                    key={order.id}
                    className="border-b-2 border-primary hover:bg-surface-container transition-colors"
                  >
                    <td className="p-4 font-black border-r-2 border-primary">{order.orderNumber}</td>
                    <td className="p-4 border-r-2 border-primary">
                      <div>
                        <p className="font-bold uppercase">{order.customerName}</p>
                        <p className="text-xs opacity-60">{order.customerEmail}</p>
                      </div>
                    </td>
                    <td className="p-4 border-r-2 border-primary text-xs">
                      {new Date(order.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit',
                      })}{' '}
                      |{' '}
                      {new Date(order.createdAt).toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="p-4 border-r-2 border-primary font-black text-xl">
                      {formatCurrency(order.total)}
                    </td>
                    <td className="p-4 border-r-2 border-primary">
                      <span
                        className={`px-3 py-1 font-black uppercase text-[10px] border-2 border-primary ${getStatusColor(
                          order.status
                        )}`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <Link href={`/dashboard/orders/${order.id}`}>
                          <button className="p-1 hover:bg-primary-container border border-transparent hover:border-primary transition-all">
                            <Icon name="visibility" size="sm" />
                          </button>
                        </Link>
                        <Link href={`/dashboard/orders/${order.id}?edit=1`}>
                          <button className="p-1 hover:bg-[#ffcc00] border border-transparent hover:border-primary transition-all">
                            <Icon name="edit" size="sm" />
                          </button>
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-4 flex flex-col md:flex-row justify-between items-center gap-4 border-t-4 border-primary font-headline font-black uppercase text-xs">
          <div>
            Showing 1-{filteredOrders.length} of {orders.length} results
          </div>
          <div className="flex gap-2">
            <button className="px-4 py-2 border-2 border-primary hover:bg-primary-container transition-all disabled:opacity-30" disabled>
              Prev
            </button>
            <button className="px-4 py-2 border-2 border-primary bg-primary text-white">01</button>
            <button className="px-4 py-2 border-2 border-primary hover:bg-primary-container transition-all">
              02
            </button>
            <button className="px-4 py-2 border-2 border-primary hover:bg-primary-container transition-all">
              03
            </button>
            <button className="px-4 py-2 border-2 border-primary hover:bg-primary-container transition-all">
              Next
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
