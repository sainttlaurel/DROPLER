export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.storeId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const storeId = session.user.storeId

    const now = new Date()
    const thirtyDaysAgo = new Date(now)
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    const sixtyDaysAgo = new Date(now)
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60)

    // Current 30 days analytics
    const analytics = await prisma.analytics.findMany({
      where: { storeId, date: { gte: thirtyDaysAgo } },
      orderBy: { date: 'asc' },
    })

    // Previous 30 days for trend comparison
    const prevAnalytics = await prisma.analytics.findMany({
      where: { storeId, date: { gte: sixtyDaysAgo, lt: thirtyDaysAgo } },
      orderBy: { date: 'asc' },
    })

    // Top selling products by order items (exclude cancelled orders)
    const topProducts = await prisma.orderItem.groupBy({
      by: ['productId', 'name', 'image'],
      where: { order: { storeId, status: { not: 'CANCELLED' } } },
      _sum: { quantity: true, price: true },
      orderBy: { _sum: { quantity: 'desc' } },
      take: 4,
    })

    // Low inventory products (below 5% of typical stock = below 10 units)
    const lowInventoryProducts = await prisma.product.findMany({
      where: { storeId, status: 'ACTIVE', inventory: { lte: 10, gt: 0 } },
      select: { name: true, inventory: true },
      take: 3,
    })

    const outOfStockProducts = await prisma.product.findMany({
      where: { storeId, status: 'ACTIVE', inventory: 0 },
      select: { name: true },
      take: 3,
    })

    // Compute totals from real non-cancelled orders (source of truth, not the Analytics table)
    const [currentOrders, prevOrders30] = await Promise.all([
      prisma.order.findMany({
        where: { storeId, status: { not: 'CANCELLED' }, createdAt: { gte: thirtyDaysAgo } },
        select: { total: true, profit: true },
      }),
      prisma.order.findMany({
        where: { storeId, status: { not: 'CANCELLED' }, createdAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo } },
        select: { total: true, profit: true },
      }),
    ])

    const totalRevenue = currentOrders.reduce((s, o) => s + o.total, 0)
    const totalOrders = currentOrders.length
    const totalProfit = currentOrders.reduce((s, o) => s + (o.profit || 0), 0)
    const avgConversion = analytics.length > 0
      ? analytics.reduce((s, a) => s + a.conversionRate, 0) / analytics.length
      : 0

    const prevRevenue = prevOrders30.reduce((s, o) => s + o.total, 0)
    const prevOrderCount = prevOrders30.length
    const prevConversion = 0 // no reliable prev conversion data

    const revenueTrend = prevRevenue > 0 ? ((totalRevenue - prevRevenue) / prevRevenue) * 100 : 0
    const ordersTrend = prevOrderCount > 0 ? ((totalOrders - prevOrderCount) / prevOrderCount) * 100 : 0
    const conversionTrend = 0

    const avgOrder = totalOrders > 0 ? totalRevenue / totalOrders : 0
    const prevAvgOrder = prevOrderCount > 0 ? prevRevenue / prevOrderCount : 0
    const avgOrderTrend = prevAvgOrder > 0 ? ((avgOrder - prevAvgOrder) / prevAvgOrder) * 100 : 0

    // Build alerts from real data
    const alerts: { type: 'warning' | 'error'; message: string }[] = []
    if (outOfStockProducts.length > 0) {
      alerts.push({ type: 'error', message: `${outOfStockProducts.map(p => p.name).join(', ')} ${outOfStockProducts.length === 1 ? 'is' : 'are'} out of stock.` })
    }
    if (lowInventoryProducts.length > 0) {
      alerts.push({ type: 'warning', message: `Low inventory: ${lowInventoryProducts.map(p => `${p.name} (${p.inventory} left)`).join(', ')}.` })
    }

    return NextResponse.json({
      analytics,
      summary: {
        totalRevenue,
        totalOrders,
        totalProfit,
        avgConversion,
        avgOrder,
        revenueTrend: Math.round(revenueTrend * 10) / 10,
        ordersTrend: Math.round(ordersTrend * 10) / 10,
        conversionTrend: Math.round(conversionTrend * 10) / 10,
        avgOrderTrend: Math.round(avgOrderTrend * 10) / 10,
      },
      topProducts: topProducts.map(p => ({
        productId: p.productId,
        name: p.name,
        image: p.image,
        totalSold: p._sum.quantity ?? 0,
        totalRevenue: p._sum.price ?? 0,
      })),
      alerts,
    })
  } catch (error) {
    console.error('Analytics fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 })
  }
}
