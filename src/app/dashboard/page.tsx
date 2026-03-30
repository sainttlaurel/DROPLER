'use client'

import { useState, useEffect, useMemo } from 'react'
import { useStore } from '@/contexts/StoreContext'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Icon } from '@/components/ui/Icon'
import Link from 'next/link'

interface Order {
  id: string
  orderNumber: string
  customerName: string
  customerEmail: string
  total: number
  profit: number
  status: string
  createdAt: string
  items: any[]
}

interface Product {
  id: string
  name: string
  price: number
  image: string | null
  status: string
}

const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    DELIVERED: 'bg-[#1a1a1a] text-white',
    SHIPPED: 'bg-[#0055ff] text-white',
    PROCESSING: 'bg-[#ffcc00] text-[#1a1a1a]',
    PENDING: 'bg-[#e63b2e] text-white',
    CANCELLED: 'bg-[#eee9e0] text-[#1a1a1a]',
  }
  return colors[status] || 'bg-[#eee9e0] text-[#1a1a1a]'
}

// Build weekly chart: group NON-CANCELLED orders by day-of-week for the last 7 days
function buildWeeklyData(orders: Order[]) {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  const now = new Date()
  const totals = new Array(7).fill(0)

  orders.forEach((order) => {
    if (order.status === 'CANCELLED') return
    const d = new Date(order.createdAt)
    const diffMs = now.getTime() - d.getTime()
    const diffDays = Math.floor(diffMs / 86400000)
    if (diffDays < 7) {
      const dow = (d.getDay() + 6) % 7
      totals[dow] += order.total
    }
  })

  return days.map((label, i) => ({ label, value: totals[i] }))
}

// Build monthly chart: group NON-CANCELLED orders by week-of-month for the last 4 weeks
function buildMonthlyData(orders: Order[]) {
  const labels = ['Week 1', 'Week 2', 'Week 3', 'Week 4']
  const now = new Date()
  const totals = new Array(4).fill(0)

  orders.forEach((order) => {
    if (order.status === 'CANCELLED') return
    const d = new Date(order.createdAt)
    const diffMs = now.getTime() - d.getTime()
    const diffDays = Math.floor(diffMs / 86400000)
    if (diffDays < 28) {
      const weekIndex = Math.min(3, Math.floor(diffDays / 7))
      totals[3 - weekIndex] += order.total
    }
  })

  return labels.map((label, i) => ({ label, value: totals[i] }))
}

const BAR_COLORS = ['#1a1a1a', '#0055ff', '#1a1a1a', '#ffcc00', '#1a1a1a', '#e63b2e', '#1a1a1a']

export default function DashboardPage() {
  const [loading, setLoading] = useState(true)
  const [allOrders, setAllOrders] = useState<Order[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [chartMode, setChartMode] = useState<'weekly' | 'monthly'>('weekly')
  const { formatCurrency } = useStore()

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const [ordersRes, productsRes] = await Promise.all([
        fetch('/api/orders?limit=1000'),
        fetch('/api/products'),
      ])

      const ordersData = await ordersRes.json()
      const productsData = await productsRes.json()

      const ordersList: Order[] = Array.isArray(ordersData) ? ordersData : (ordersData.orders ?? [])
      const productsList = Array.isArray(productsData) ? productsData : (productsData.products ?? [])

      setAllOrders(ordersList)
      setProducts(productsList.slice(0, 4))
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const activeOrders = useMemo(() => allOrders.filter(o => o.status !== 'CANCELLED'), [allOrders])
  const recentOrders = allOrders.slice(0, 3)
  const totalRevenue = activeOrders.reduce((sum, o) => sum + o.total, 0)
  const totalOrders = activeOrders.length
  const totalProfit = activeOrders.reduce((sum, o) => sum + (o.profit || 0), 0)

  // Trend vs previous 30 days
  const now = Date.now()
  const thirtyDaysAgo = now - 30 * 86400000
  const sixtyDaysAgo = now - 60 * 86400000
  const currentPeriod = activeOrders.filter(o => new Date(o.createdAt).getTime() >= thirtyDaysAgo)
  const prevPeriod = activeOrders.filter(o => {
    const t = new Date(o.createdAt).getTime()
    return t >= sixtyDaysAgo && t < thirtyDaysAgo
  })
  const prevRevenue = prevPeriod.reduce((s, o) => s + o.total, 0)
  const prevProfit = prevPeriod.reduce((s, o) => s + (o.profit || 0), 0)
  const revTrend = prevRevenue > 0 ? ((currentPeriod.reduce((s, o) => s + o.total, 0) - prevRevenue) / prevRevenue * 100).toFixed(1) : null
  const ordersTrend = prevPeriod.length > 0 ? ((currentPeriod.length - prevPeriod.length) / prevPeriod.length * 100).toFixed(1) : null
  const profitTrend = prevProfit > 0 ? ((currentPeriod.reduce((s, o) => s + (o.profit || 0), 0) - prevProfit) / prevProfit * 100).toFixed(1) : null

  const chartData = useMemo(
    () => chartMode === 'weekly' ? buildWeeklyData(activeOrders) : buildMonthlyData(activeOrders),
    [activeOrders, chartMode]
  )

  const maxChartValue = Math.max(...chartData.map((d) => d.value), 1)

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Icon name="refresh" size="xl" className="animate-spin text-[#1a1a1a] mb-4" />
            <p className="font-headline font-bold uppercase text-lg">Loading Dashboard...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6 border-b-8 border-[#1a1a1a] pb-8">
        <div>
          <h1 className="text-7xl md:text-8xl font-black uppercase tracking-tighter leading-none mb-2 font-headline">
            Dashboard
          </h1>
          <p className="font-bold text-xl border-l-8 border-[#ffcc00] pl-4 uppercase">
            Overview of your dropshipping empire.
          </p>
        </div>
        <div className="flex gap-4">
          <button className="flex items-center gap-2 px-6 py-3 border-4 border-[#1a1a1a] font-headline font-black uppercase shadow-[6px_6px_0px_0px_rgba(26,26,26,1)] hover:bg-[#1a1a1a] hover:text-white transition-all active:translate-x-1 active:translate-y-1 active:shadow-none">
            <Icon name="download" size="sm" />
            Export
          </button>
          <Link href="/dashboard/products/new">
            <button className="flex items-center gap-2 px-6 py-3 bg-[#ffcc00] border-4 border-[#1a1a1a] font-headline font-black uppercase shadow-[6px_6px_0px_0px_rgba(26,26,26,1)] hover:bg-[#1a1a1a] hover:text-white transition-all active:translate-x-1 active:translate-y-1 active:shadow-none">
              <Icon name="add" size="sm" />
              New Product
            </button>
          </Link>
        </div>
      </div>

      {/* Metric Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
        {/* Gross Revenue */}
        <div className="relative p-6 border-4 border-[#1a1a1a] bg-white shadow-[8px_8px_0px_0px_rgba(26,26,26,1)] overflow-hidden flex flex-col justify-between min-h-[140px]">
          <span className="material-icons absolute right-4 top-4 text-[80px] opacity-[0.06] select-none pointer-events-none">photo_camera</span>
          <div>
            <div className="font-headline font-black text-xs uppercase tracking-widest mb-2">Gross Revenue</div>
            <div className="font-headline font-black text-4xl tracking-tighter leading-none">
              {formatCurrency(totalRevenue)}
              {revTrend !== null && (
                <span className={`font-black text-sm ml-2 ${Number(revTrend) >= 0 ? 'text-[#0055ff]' : 'text-[#e63b2e]'}`}>
                  {Number(revTrend) >= 0 ? '+' : ''}{revTrend}%
                </span>
              )}
            </div>
          </div>
          <div className="mt-4 h-1.5 bg-[#e8e3da] w-full overflow-hidden">
            <div className="h-full bg-[#ffcc00]" style={{ width: '65%' }} />
          </div>
        </div>

        {/* Total Orders */}
        <div className="relative p-6 border-4 border-[#1a1a1a] bg-white shadow-[8px_8px_0px_0px_rgba(26,26,26,1)] overflow-hidden flex flex-col justify-between min-h-[140px]">
          <span className="material-icons absolute right-4 top-4 text-[80px] opacity-[0.06] select-none pointer-events-none">shopping_bag</span>
          <div>
            <div className="font-headline font-black text-xs uppercase tracking-widest mb-2">Total Orders</div>
            <div className="font-headline font-black text-4xl tracking-tighter leading-none">
              {totalOrders}
              {ordersTrend !== null && (
                <span className={`font-black text-sm ml-2 ${Number(ordersTrend) >= 0 ? 'text-[#0055ff]' : 'text-[#e63b2e]'}`}>
                  {Number(ordersTrend) >= 0 ? '+' : ''}{ordersTrend}%
                </span>
              )}
            </div>
          </div>
          <div className="mt-4 h-1.5 bg-[#e8e3da] w-full overflow-hidden">
            <div className="h-full bg-[#0055ff]" style={{ width: '45%' }} />
          </div>
        </div>

        {/* Net Profit - Yellow */}
        <div className="relative p-6 border-4 border-[#1a1a1a] bg-[#ffcc00] shadow-[8px_8px_0px_0px_rgba(26,26,26,1)] overflow-hidden flex flex-col justify-between min-h-[140px]">
          <span className="material-icons absolute right-4 top-4 text-[80px] opacity-[0.08] select-none pointer-events-none">trending_up</span>
          <div>
            <div className="font-headline font-black text-xs uppercase tracking-widest mb-2">Net Profit</div>
            <div className="font-headline font-black text-4xl tracking-tighter leading-none">
              {formatCurrency(totalProfit)}
              {profitTrend !== null && (
                <span className={`font-black text-sm ml-2 ${Number(profitTrend) >= 0 ? '' : 'text-[#e63b2e]'}`}>
                  {Number(profitTrend) >= 0 ? '+' : ''}{profitTrend}%
                </span>
              )}
            </div>
          </div>
          <div className="mt-4 h-1.5 bg-[#1a1a1a]/20 w-full overflow-hidden">
            <div className="h-full bg-[#1a1a1a]" style={{ width: '80%' }} />
          </div>
        </div>

        {/* Analytics CTA */}
        <div className="p-6 border-4 border-[#1a1a1a] bg-white shadow-[8px_8px_0px_0px_rgba(26,26,26,1)] flex items-center justify-center">
          <Link href="/dashboard/analytics" className="flex items-center gap-2 font-headline font-black uppercase text-lg hover:text-[#0055ff] transition-colors">
            <Icon name="analytics" size="lg" />
            Analytics
          </Link>
        </div>
      </div>

      {/* Chart & Products Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
        {/* Sales Chart */}
        <div className="lg:col-span-2 bg-white border-4 border-[#1a1a1a] p-8 shadow-[8px_8px_0px_0px_rgba(26,26,26,1)]">
          <div className="flex justify-between items-center mb-10">
            <h3 className="text-3xl font-black uppercase tracking-tight font-headline">
              Sales Velocity
            </h3>
            <div className="flex gap-2">
              <button
                onClick={() => setChartMode('weekly')}
                className={`px-3 py-1 border-2 border-[#1a1a1a] font-headline font-black text-xs uppercase transition-all ${chartMode === 'weekly' ? 'bg-[#ffcc00] shadow-[2px_2px_0px_0px_rgba(26,26,26,1)]' : 'hover:bg-[#eee9e0]'}`}
              >
                Weekly
              </button>
              <button
                onClick={() => setChartMode('monthly')}
                className={`px-3 py-1 border-2 border-[#1a1a1a] font-headline font-black text-xs uppercase transition-all ${chartMode === 'monthly' ? 'bg-[#ffcc00] shadow-[2px_2px_0px_0px_rgba(26,26,26,1)]' : 'hover:bg-[#eee9e0]'}`}
              >
                Monthly
              </button>
            </div>
          </div>

          {allOrders.length === 0 ? (
            <div className="flex items-center justify-center h-56 border-b-4 border-l-4 border-[#1a1a1a]">
              <p className="font-headline font-bold uppercase opacity-30 text-sm">No orders yet</p>
            </div>
          ) : (
            <div className="flex items-end gap-3 h-56 w-full border-b-4 border-l-4 border-[#1a1a1a] pb-2 pl-2">
              {chartData.map((bar, index) => {
                const heightPct = maxChartValue > 0 ? Math.max(4, (bar.value / maxChartValue) * 100) : 4
                return (
                  <div
                    key={index}
                    className="flex-1 group relative border-t-4 border-l-2 border-r-2 border-[#1a1a1a] hover:opacity-80 transition-opacity cursor-pointer"
                    style={{ height: `${heightPct}%`, backgroundColor: BAR_COLORS[index % BAR_COLORS.length] }}
                  >
                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-white border-2 border-[#1a1a1a] px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity text-xs font-headline font-black whitespace-nowrap z-10">
                      {formatCurrency(bar.value)}
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          <div className="flex justify-between mt-4 text-xs font-headline font-black uppercase opacity-60">
            {chartData.map((bar) => (
              <span key={bar.label}>{bar.label}</span>
            ))}
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-white border-4 border-[#1a1a1a] shadow-[8px_8px_0px_0px_rgba(26,26,26,1)] flex flex-col">
          <div className="bg-[#1a1a1a] text-white p-6">
            <h3 className="text-2xl font-black uppercase tracking-tight font-headline">Top Products</h3>
            <p className="text-[10px] uppercase tracking-widest text-[#ffcc00]">Most Wanted Units_</p>
          </div>
          <div className="flex-1 p-6 space-y-4">
            {products.map((product) => (
              <div key={product.id} className="flex items-center gap-4 p-2 border-b-2 border-[#1a1a1a]/10 hover:bg-[#f5f0e8] transition-colors group">
                <div className="w-12 h-12 border-2 border-[#1a1a1a] overflow-hidden shrink-0 bg-[#eee9e0]">
                  {product.image ? (
                    <img src={product.image} alt={product.name} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Icon name="image" size="sm" className="opacity-40" />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-headline font-black uppercase text-sm leading-none mb-1">{product.name}</p>
                <p className="text-[10px] font-bold opacity-50 uppercase">
                    {activeOrders.reduce((sum, o) => sum + (o.items?.filter((i: any) => i.productId === product.id).reduce((s: number, i: any) => s + i.quantity, 0) || 0), 0)} Sold
                  </p>
                </div>
                <span className="font-headline font-black text-[#0055ff]">{formatCurrency(product.price)}</span>
              </div>
            ))}
          </div>
          <Link href="/dashboard/products">
            <button className="w-full p-4 font-headline font-black uppercase border-t-4 border-[#1a1a1a] hover:bg-[#1a1a1a] hover:text-white transition-all text-sm">
              View All Products
            </button>
          </Link>
        </div>
      </div>

      {/* Recent Orders Table */}
      <div className="border-4 border-[#1a1a1a] bg-white shadow-[8px_8px_0px_0px_rgba(26,26,26,1)] overflow-hidden mb-10">
        <div className="p-6 border-b-4 border-[#1a1a1a] flex justify-between items-center bg-[#eee9e0]">
          <h3 className="text-2xl font-black uppercase tracking-tight font-headline">Recent Orders</h3>
          <div className="flex gap-4">
            <span className="flex items-center gap-2 text-xs font-headline font-black uppercase">
              <span className="w-3 h-3 bg-[#0055ff] border-2 border-[#1a1a1a]"></span> Shipped
            </span>
            <span className="flex items-center gap-2 text-xs font-headline font-black uppercase">
              <span className="w-3 h-3 bg-[#ffcc00] border-2 border-[#1a1a1a]"></span> Pending
            </span>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#ffcc00] font-headline font-black uppercase text-xs tracking-widest border-b-4 border-[#1a1a1a]">
                <th className="p-4 border-r-2 border-[#1a1a1a]">Order ID</th>
                <th className="p-4 border-r-2 border-[#1a1a1a]">Customer</th>
                <th className="p-4 border-r-2 border-[#1a1a1a]">Status</th>
                <th className="p-4 border-r-2 border-[#1a1a1a]">Items</th>
                <th className="p-4 border-r-2 border-[#1a1a1a]">Total</th>
                <th className="p-4">Action</th>
              </tr>
            </thead>
            <tbody className="font-headline font-medium divide-y-2 divide-[#1a1a1a]/10">
              {recentOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center font-headline font-bold uppercase opacity-40">
                    No orders yet
                  </td>
                </tr>
              ) : (
                recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-[#f5f0e8] transition-colors">
                    <td className="p-4 font-headline font-black">{order.orderNumber}</td>
                    <td className="p-4 font-bold uppercase text-sm">{order.customerName}</td>
                    <td className="p-4">
                      <span className={`px-3 py-1 font-headline font-black uppercase text-[10px] border-2 border-[#1a1a1a] ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="p-4 font-medium">{order.items?.length || 0} Products</td>
                    <td className="p-4 font-headline font-black">{formatCurrency(order.total)}</td>
                    <td className="p-4">
                      <Link href={`/dashboard/orders/${order.id}`}>
                        <button className="p-2 border-2 border-[#1a1a1a] hover:bg-[#ffcc00] transition-colors">
                          <Icon name="visibility" size="sm" />
                        </button>
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="p-6 bg-[#eee9e0] border-t-4 border-[#1a1a1a] text-center">
          <Link href="/dashboard/orders" className="font-headline font-black uppercase tracking-tighter text-sm hover:text-[#0055ff] transition-colors">
            View Complete Transaction History →
          </Link>
        </div>
      </div>

      {/* Bottom CTAs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-12">
        <Link href="/dashboard/support">
          <div className="bg-[#1a1a1a] p-8 flex items-center justify-between group cursor-pointer hover:bg-[#0055ff] transition-colors border-4 border-[#1a1a1a] shadow-[6px_6px_0px_0px_rgba(26,26,26,1)]">
            <div className="text-white">
              <h4 className="text-2xl font-black uppercase tracking-tight font-headline">Need Support?</h4>
              <p className="font-bold opacity-80">Our team is available 24/7 for you.</p>
            </div>
            <Icon name="arrow_forward" size="lg" className="text-white group-hover:translate-x-2 transition-transform" />
          </div>
        </Link>
        <Link href="/dashboard/products">
          <div className="bg-[#e63b2e] p-8 flex items-center justify-between group cursor-pointer hover:bg-[#1a1a1a] transition-colors border-4 border-[#1a1a1a] shadow-[6px_6px_0px_0px_rgba(26,26,26,1)]">
            <div className="text-white">
              <h4 className="text-2xl font-black uppercase tracking-tight font-headline">Product Alerts</h4>
              <p className="font-bold opacity-80">
                {allOrders.length === 0
                  ? 'Check your inventory levels.'
                  : `${products.filter((p: any) => p.inventory === 0).length} item${products.filter((p: any) => p.inventory === 0).length !== 1 ? 's' : ''} out of stock.`}
              </p>
            </div>
            <Icon name="error" size="lg" className="text-white group-hover:rotate-12 transition-transform" />
          </div>
        </Link>
      </div>
    </DashboardLayout>
  )
}
