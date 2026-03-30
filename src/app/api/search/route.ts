import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.storeId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')

    if (!query || query.length < 2) {
      return NextResponse.json([])
    }

    const searchTerm = query.toLowerCase()

    // Search products
    const products = await prisma.product.findMany({
      where: {
        storeId: session.user.storeId,
        OR: [
          { name: { contains: searchTerm } },
          { sku: { contains: searchTerm } },
        ],
      },
      take: 5,
      select: {
        id: true,
        name: true,
        sku: true,
      },
    })

    // Search orders
    const orders = await prisma.order.findMany({
      where: {
        storeId: session.user.storeId,
        OR: [
          { orderNumber: { contains: searchTerm } },
          { customerName: { contains: searchTerm } },
          { customerEmail: { contains: searchTerm } },
        ],
      },
      take: 5,
      select: {
        id: true,
        orderNumber: true,
        customerName: true,
      },
    })

    // Search suppliers
    const suppliers = await prisma.supplier.findMany({
      where: {
        storeId: session.user.storeId,
        name: { contains: searchTerm },
      },
      take: 5,
      select: {
        id: true,
        name: true,
      },
    })

    // Format results
    const results = [
      ...products.map(p => ({
        id: p.id,
        name: p.name,
        type: 'product' as const,
        sku: p.sku,
      })),
      ...orders.map(o => ({
        id: o.id,
        name: o.customerName,
        type: 'order' as const,
        orderNumber: o.orderNumber,
      })),
      ...suppliers.map(s => ({
        id: s.id,
        name: s.name,
        type: 'supplier' as const,
      })),
    ]

    return NextResponse.json(results)
  } catch (error) {
    console.error('Search error:', error)
    return NextResponse.json({ error: 'Search failed' }, { status: 500 })
  }
}
