'use client'

import { useState, useEffect, useCallback } from 'react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Icon } from '@/components/ui/Icon'
import { useStore } from '@/contexts/StoreContext'

interface AnalyticsRecord {
  date: string
  revenue: number
  orders: number
  profit: number
  conversionRate: number
}

interface Summary {
  totalRevenue: number
  totalOrders: number
  totalProfit: number
  avgConversion: number
  avgOrder: number
  revenueTrend: number
  ordersTrend: number
  conversionTrend: number
  avgOrderTrend: number
}

interface TopProduct {
  productId: string
  name: string
  image: string | null
  totalSold: number
  totalRevenue: number
}

interface Alert {
  type: 'warning' | 'error'
  message: string
}

interface AnalyticsData {
  analytics: AnalyticsRecord[]
  summary: Summary
  topProducts: TopProduct[]
  alerts: Alert[]
}

function TrendBadge({ value, invert = false }: { value: number; invert?: boolean }) {
  const isGood = invert ? value < 0 : value > 0
  const isNeutral = value === 0
  if (isNeutral) return <span className="font-headline font-black uppercase text-sm opacity-60">No change</span>
  return (
    <span className={`font-headline font-black uppercase text-sm flex items-center gap-1 ${isGood ? 'text-[#1a1a1a]' : 'text-[#e63b2e]'}`}>
      <Icon name={isGood ? 'trending_up' : 'trending_down'} size="sm" />
      {value > 0 ? '+' : ''}{value}% vs last 30d
    </span>
  )
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const { formatCurrency } = useStore()

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch('/api/analytics')
      if (res.ok) {
        const json = await res.json()
        setData(json)
      }
    } catch (error) {
      console.error('Failed to fetch analytics:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
    // Refresh every 60 seconds
    const interval = setInterval(fetchData, 60_000)
    return () => clearInterval(interval)
  }, [fetchData])

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Icon name="refresh" size="xl" className="animate-spin text-[#1a1a1a]" />
        </div>
      </DashboardLayout>
    )
  }

  const summary = data?.summary ?? {
    totalRevenue: 0, totalOrders: 0, totalProfit: 0,
    avgConversion: 0, avgOrder: 0,
    revenueTrend: 0, ordersTrend: 0, conversionTrend: 0, avgOrderTrend: 0,
  }
  const analytics = data?.analytics ?? []
  const topProducts = data?.topProducts ?? []
  const alerts = data?.alerts ?? []

  // Build chart bars from real daily analytics (last 12 data points)
  const chartData = analytics.slice(-12)
  const maxRevenue = Math.max(...chartData.map(a => a.revenue), 1)
  const peakIndex = chartData.reduce((maxI, a, i, arr) => a.revenue > arr[maxI].revenue ? i : maxI, 0)

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-6 border-b-8 border-[#1a1a1a] pb-8 mb-8">
        <div>
          <h1 className="font-headline font-black text-7xl md:text-8xl leading-none tracking-tighter uppercase">Analytics</h1>
          <p className="font-body text-xl font-bold mt-2 text-[#0055ff] uppercase">Performance Metrics / Period: Last 30 Days</p>
        </div>
        <div className="flex flex-wrap gap-4">
          <button
            onClick={fetchData}
            className="flex items-center gap-2 bg-white border-4 border-[#1a1a1a] px-6 py-2 uppercase font-headline font-black shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] hover:invert transition-all active:translate-x-1 active:translate-y-1 active:shadow-none"
          >
            <Icon name="refresh" size="sm" />
            Refresh
          </button>
          <a
            href="/api/orders/export"
            className="flex items-center gap-2 bg-[#ffcc00] border-4 border-[#1a1a1a] px-6 py-2 uppercase font-headline font-black shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] hover:invert transition-all active:translate-x-1 active:translate-y-1 active:shadow-none"
          >
            <Icon name="download" size="sm" />
            Export Report
          </a>
        </div>
      </div>

      {/* Bento Grid Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {/* Revenue Card */}
        <div className="md:col-span-2 bg-[#ffcc00] border-4 border-[#1a1a1a] p-6 shadow-[6px_6px_0px_0px_rgba(26,26,26,1)] relative overflow-hidden group">
          <div className="relative z-10">
            <div className="flex justify-between items-start">
              <span className="font-headline font-black text-2xl uppercase border-b-4 border-[#1a1a1a]">Gross Revenue</span>
              <span className={`px-2 py-1 text-xs font-headline font-black uppercase ${summary.revenueTrend >= 0 ? 'bg-[#1a1a1a] text-white' : 'bg-[#e63b2e] text-white'}`}>
                {summary.revenueTrend >= 0 ? '+' : ''}{summary.revenueTrend}%
              </span>
            </div>
            <div className="mt-8 font-headline font-black text-7xl leading-none">{formatCurrency(summary.totalRevenue)}</div>
            <div className="mt-4 flex gap-1 h-12 items-end">
              {chartData.length > 0
                ? chartData.map((a, i) => (
                    <div
                      key={i}
                      className="flex-1 bg-[#1a1a1a]"
                      style={{ height: `${Math.max(8, (a.revenue / maxRevenue) * 100)}%` }}
                    />
                  ))
                : [25, 50, 75, 50, 100, 75].map((h, i) => (
                    <div key={i} className="flex-1 bg-[#1a1a1a] opacity-20" style={{ height: `${h}%` }} />
                  ))
              }
            </div>
          </div>
          <span className="absolute -right-8 -bottom-8 material-symbols-outlined text-[12rem] opacity-10 rotate-12 pointer-events-none">payments</span>
        </div>

        {/* Conversion Card */}
        <div className="bg-white border-4 border-[#1a1a1a] p-6 shadow-[6px_6px_0px_0px_rgba(26,26,26,1)]">
          <span className="font-headline font-black text-2xl uppercase block border-b-4 border-[#1a1a1a] w-fit mb-6">Conv Rate</span>
          <div className="font-headline font-black text-7xl">{summary.avgConversion.toFixed(2)}%</div>
          <div className="mt-4">
            <TrendBadge value={summary.conversionTrend} />
          </div>
        </div>

        {/* Avg Order Card */}
        <div className="bg-[#0055ff] text-white border-4 border-[#1a1a1a] p-6 shadow-[6px_6px_0px_0px_rgba(26,26,26,1)]">
          <span className="font-headline font-black text-2xl uppercase block border-b-4 border-white w-fit mb-6">Avg Order</span>
          <div className="font-headline font-black text-7xl">{formatCurrency(summary.avgOrder)}</div>
          <div className="mt-4 text-[#ffcc00] font-headline font-black uppercase text-sm flex items-center gap-1">
            <Icon name={summary.avgOrderTrend >= 0 ? 'trending_up' : 'trending_down'} size="sm" />
            {summary.avgOrderTrend >= 0 ? '+' : ''}{summary.avgOrderTrend}% vs last 30d
          </div>
        </div>
      </div>

      {/* Chart + Top Products */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* Revenue Trend Chart */}
        <div className="lg:col-span-2 bg-white border-4 border-[#1a1a1a] p-8 shadow-[6px_6px_0px_0px_rgba(26,26,26,1)]">
          <div className="flex justify-between items-center mb-12">
            <h3 className="font-headline font-black text-4xl uppercase tracking-tighter">Revenue_Trends</h3>
            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-[#ffcc00] border-2 border-[#1a1a1a]"></div>
                <span className="text-xs font-headline font-black uppercase">Daily</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-[#0055ff] border-2 border-[#1a1a1a]"></div>
                <span className="text-xs font-headline font-black uppercase">Peak</span>
              </div>
            </div>
          </div>
          <div className="h-64 flex items-end gap-2 relative border-b-4 border-l-4 border-[#1a1a1a] pb-2 pl-2">
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-10">
              {[0, 1, 2, 3].map(i => <div key={i} className="border-t-2 border-[#1a1a1a] w-full" />)}
            </div>
            {chartData.length === 0 ? (
              <div className="flex-1 flex items-center justify-center opacity-30">
                <span className="font-headline font-black uppercase text-sm">No data yet</span>
              </div>
            ) : chartData.map((a, index) => {
              const heightPct = Math.max(4, (a.revenue / maxRevenue) * 100)
              const isPeak = index === peakIndex
              return (
                <div
                  key={index}
                  className="flex-1 border-4 border-[#1a1a1a] group relative hover:opacity-80 transition-opacity cursor-pointer"
                  style={{ height: `${heightPct}%`, backgroundColor: isPeak ? '#0055ff' : '#ffcc00' }}
                >
                  <div className="hidden group-hover:block absolute -top-12 left-1/2 -translate-x-1/2 bg-[#1a1a1a] text-white px-2 py-1 text-[10px] whitespace-nowrap font-headline font-black z-10">
                    {formatCurrency(a.revenue)}
                  </div>
                </div>
              )
            })}
          </div>
          <div className="flex justify-between mt-4 px-2 font-headline font-black text-xs uppercase opacity-60">
            {chartData.length > 0 ? (
              <>
                <span>{new Date(chartData[0].date).toLocaleDateString('en', { month: 'short', day: 'numeric' })}</span>
                {chartData.length > 3 && <span>{new Date(chartData[Math.floor(chartData.length / 3)].date).toLocaleDateString('en', { month: 'short', day: 'numeric' })}</span>}
                {chartData.length > 6 && <span>{new Date(chartData[Math.floor(chartData.length * 2 / 3)].date).toLocaleDateString('en', { month: 'short', day: 'numeric' })}</span>}
                <span>{new Date(chartData[chartData.length - 1].date).toLocaleDateString('en', { month: 'short', day: 'numeric' })}</span>
              </>
            ) : (
              <><span>WK01</span><span>WK02</span><span>WK03</span><span>WK04</span></>
            )}
          </div>
        </div>

        {/* Top Selling Products */}
        <div className="bg-white border-4 border-[#1a1a1a] shadow-[6px_6px_0px_0px_rgba(26,26,26,1)] flex flex-col">
          <div className="bg-[#1a1a1a] text-white p-6">
            <h3 className="font-headline font-black text-3xl uppercase tracking-tighter">Top_Selling</h3>
            <p className="text-[10px] uppercase tracking-widest text-[#ffcc00]">Most Wanted Units_</p>
          </div>
          <div className="flex-1 p-6 space-y-4">
            {topProducts.length === 0 ? (
              <p className="font-headline font-bold uppercase opacity-40 text-sm">No sales data yet</p>
            ) : (
              topProducts.map((product, i) => (
                <div key={product.productId} className="flex items-center gap-4 p-2 border-b-2 border-[#1a1a1a]/10 hover:bg-[#f5f0e8] transition-colors group">
                  <div className="w-12 h-12 border-2 border-[#1a1a1a] overflow-hidden shrink-0 bg-[#d6d1c9]">
                    {product.image ? (
                      <img src={product.image} alt={product.name} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center font-headline font-black text-lg opacity-30">{i + 1}</div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-headline font-black uppercase text-sm leading-none truncate">{product.name}</div>
                    <div className="text-[10px] font-bold opacity-50 uppercase">{product.totalSold} Sold</div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="font-headline font-black text-lg">{formatCurrency(product.totalRevenue)}</div>
                    <div className="text-[10px] font-headline font-black text-[#0055ff] uppercase">{product.totalSold} Units</div>
                  </div>
                </div>
              ))
            )}
          </div>
          <a href="/dashboard/products" className="w-full p-4 font-headline font-black uppercase border-t-4 border-[#1a1a1a] hover:bg-[#1a1a1a] hover:text-white transition-all text-sm text-center block">
            View Inventory Matrix
          </a>
        </div>
      </div>

      {/* Alerts + Orders Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start pb-12">
        {/* Alerts */}
        <div className="border-4 border-[#1a1a1a] bg-[#e63b2e] p-8 shadow-[6px_6px_0px_0px_rgba(26,26,26,1)] rotate-1">
          <h4 className="font-headline font-black text-4xl text-white uppercase mb-4">Critical_Alerts</h4>
          <div className="space-y-4">
            {alerts.length === 0 ? (
              <div className="bg-white border-2 border-[#1a1a1a] p-4 flex items-center gap-4">
                <Icon name="check_circle" className="text-3xl shrink-0 text-green-600" />
                <span className="font-bold uppercase text-xs">All systems normal. No critical alerts.</span>
              </div>
            ) : (
              alerts.map((alert, i) => (
                <div key={i} className="bg-white border-2 border-[#1a1a1a] p-4 flex items-center gap-4">
                  <Icon name={alert.type === 'error' ? 'report' : 'warning'} className="text-3xl shrink-0" />
                  <span className="font-bold uppercase text-xs">{alert.message}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Orders Summary */}
        <div className="p-8 border-4 border-[#1a1a1a] bg-white shadow-[6px_6px_0px_0px_rgba(26,26,26,1)] -rotate-1">
          <h4 className="font-headline font-black text-4xl uppercase mb-4">Orders_Summary</h4>
          <div className="flex items-center gap-4 mb-6">
            <div className="w-4 h-4 rounded-full bg-[#0055ff] animate-pulse"></div>
            <span className="font-headline font-black text-6xl">{summary.totalOrders}</span>
            <span className="text-xs font-headline font-black uppercase">Total Orders (30d)</span>
          </div>
          <div className="space-y-3">
            {[
              { label: 'Revenue', value: formatCurrency(summary.totalRevenue), color: '#0055ff' },
              { label: 'Profit', value: formatCurrency(summary.totalProfit), color: '#1a1a1a' },
              { label: 'Avg Order', value: formatCurrency(summary.avgOrder), color: '#ffcc00' },
            ].map(({ label, value, color }) => (
              <div key={label} className="flex justify-between items-center text-xs font-headline font-black uppercase border-b-2 border-[#1a1a1a]/10 pb-2">
                <span className="w-20" style={{ color }}>{label}</span>
                <span className="font-black text-base">{value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
