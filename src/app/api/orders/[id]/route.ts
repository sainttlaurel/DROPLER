export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.storeId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const order = await prisma.order.findFirst({
      where: { id: params.id, storeId: session.user.storeId },
      include: { items: true },
    })

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    return NextResponse.json(order)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch order' }, { status: 500 })
  }
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.storeId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const data = await req.json()

    // Fetch the current order before updating
    const existing = await prisma.order.findFirst({
      where: { id: params.id, storeId: session.user.storeId },
    })

    if (!existing) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    const order = await prisma.order.update({
      where: { id: params.id, storeId: session.user.storeId },
      data,
    })

    // If order is being cancelled and wasn't already cancelled, reverse analytics
    if (data.status === 'CANCELLED' && existing.status !== 'CANCELLED') {
      const orderDate = new Date(existing.createdAt)
      orderDate.setHours(0, 0, 0, 0)

      await prisma.analytics.updateMany({
        where: { storeId: session.user.storeId, date: orderDate },
        data: {
          revenue: { decrement: existing.total },
          orders: { decrement: 1 },
          profit: { decrement: existing.profit },
        },
      })
    }

    // If order is being un-cancelled (restored), add back to analytics
    if (existing.status === 'CANCELLED' && data.status && data.status !== 'CANCELLED') {
      const orderDate = new Date(existing.createdAt)
      orderDate.setHours(0, 0, 0, 0)

      await prisma.analytics.upsert({
        where: { storeId_date: { storeId: session.user.storeId, date: orderDate } },
        update: {
          revenue: { increment: existing.total },
          orders: { increment: 1 },
          profit: { increment: existing.profit },
        },
        create: {
          storeId: session.user.storeId,
          date: orderDate,
          revenue: existing.total,
          orders: 1,
          profit: existing.profit,
          conversionRate: 0,
        },
      })
    }

    return NextResponse.json(order)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update order' }, { status: 500 })
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.storeId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await prisma.order.delete({
      where: { id: params.id, storeId: session.user.storeId },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete order' }, { status: 500 })
  }
}
