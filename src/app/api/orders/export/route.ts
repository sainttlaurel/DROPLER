import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.storeId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const orders = await prisma.order.findMany({
      where: { storeId: session.user.storeId },
      include: { items: true },
      orderBy: { createdAt: 'desc' },
    })

    // Generate CSV
    const headers = [
      'Order Number',
      'Date',
      'Customer Name',
      'Customer Email',
      'Items',
      'Total',
      'Profit',
      'Status',
      'Tracking Number',
    ]

    const rows = orders.map((order) => [
      order.orderNumber,
      new Date(order.createdAt).toLocaleDateString(),
      order.customerName,
      order.customerEmail,
      order.items.length.toString(),
      order.total.toFixed(2),
      order.profit.toFixed(2),
      order.status,
      order.trackingNumber || '',
    ])

    const csv = [
      headers.join(','),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
    ].join('\n')

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="orders-${Date.now()}.csv"`,
      },
    })
  } catch (error) {
    console.error('Export error:', error)
    return NextResponse.json({ error: 'Failed to export orders' }, { status: 500 })
  }
}
