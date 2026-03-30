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
    const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // last 7 days

    const [recentOrders, lowStockProducts, outOfStockProducts, recentCustomers] = await Promise.all([
      // New orders in last 7 days (non-cancelled)
      prisma.order.findMany({
        where: { storeId, status: { not: 'CANCELLED' }, createdAt: { gte: since } },
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: { id: true, orderNumber: true, customerName: true, total: true, createdAt: true, status: true },
      }),
      // Low stock (1–10 units)
      prisma.product.findMany({
        where: { storeId, status: 'ACTIVE', inventory: { gt: 0, lte: 10 } },
        select: { id: true, name: true, inventory: true },
      }),
      // Out of stock
      prisma.product.findMany({
        where: { storeId, status: 'ACTIVE', inventory: 0 },
        select: { id: true, name: true },
      }),
      // New customers in last 7 days
      prisma.customer.findMany({
        where: { storeId, createdAt: { gte: since } },
        orderBy: { createdAt: 'desc' },
        take: 3,
        select: { id: true, name: true, createdAt: true },
      }),
    ])

    const notifications: {
      id: string
      type: 'order' | 'stock' | 'customer'
      title: string
      body: string
      createdAt: string
      href: string
    }[] = []

    // Order notifications
    recentOrders.forEach(o => {
      notifications.push({
        id: `order-${o.id}`,
        type: 'order',
        title: 'New Order Received',
        body: `${o.orderNumber} — ${o.customerName}`,
        createdAt: o.createdAt.toISOString(),
        href: `/dashboard/orders/${o.id}`,
      })
    })

    // Out of stock (higher priority)
    if (outOfStockProducts.length > 0) {
      notifications.push({
        id: 'stock-out',
        type: 'stock',
        title: `${outOfStockProducts.length} Product${outOfStockProducts.length > 1 ? 's' : ''} Out of Stock`,
        body: outOfStockProducts.slice(0, 3).map(p => p.name).join(', '),
        createdAt: new Date().toISOString(),
        href: '/dashboard/products',
      })
    }

    // Low stock
    if (lowStockProducts.length > 0) {
      notifications.push({
        id: 'stock-low',
        type: 'stock',
        title: `Low Stock: ${lowStockProducts.length} Product${lowStockProducts.length > 1 ? 's' : ''}`,
        body: lowStockProducts.slice(0, 3).map(p => `${p.name} (${p.inventory} left)`).join(', '),
        createdAt: new Date().toISOString(),
        href: '/dashboard/products',
      })
    }

    // Customer notifications
    recentCustomers.forEach(c => {
      notifications.push({
        id: `customer-${c.id}`,
        type: 'customer',
        title: 'New Customer Registered',
        body: c.name,
        createdAt: c.createdAt.toISOString(),
        href: '/dashboard/orders',
      })
    })

    // Sort by most recent first
    notifications.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    return NextResponse.json(notifications.slice(0, 10))
  } catch (error) {
    console.error('Notifications fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 })
  }
}
