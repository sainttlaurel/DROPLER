export const dynamic = 'force-dynamic'

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

    const products = await prisma.product.findMany({
      where: { storeId: session.user.storeId },
      include: { supplier: true },
      orderBy: { createdAt: 'desc' },
    })

    // Generate CSV
    const headers = [
      'Name',
      'SKU',
      'Price',
      'Cost',
      'Margin %',
      'Inventory',
      'Status',
      'Supplier',
      'Supplier URL',
    ]

    const rows = products.map((product) => {
      const margin = ((product.price - product.cost) / product.price) * 100
      return [
        product.name,
        product.sku,
        product.price.toFixed(2),
        product.cost.toFixed(2),
        margin.toFixed(1),
        product.inventory.toString(),
        product.status,
        product.supplier?.name || '',
        product.supplierUrl || '',
      ]
    })

    const csv = [
      headers.join(','),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
    ].join('\n')

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="products-${Date.now()}.csv"`,
      },
    })
  } catch (error) {
    console.error('Export error:', error)
    return NextResponse.json({ error: 'Failed to export products' }, { status: 500 })
  }
}
