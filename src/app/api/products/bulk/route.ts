export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.storeId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { action, productIds, data } = await req.json()

    if (!action || !productIds || !Array.isArray(productIds)) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
    }

    switch (action) {
      case 'delete':
        await prisma.product.deleteMany({
          where: {
            id: { in: productIds },
            storeId: session.user.storeId,
          },
        })
        return NextResponse.json({ success: true, message: `${productIds.length} products deleted` })

      case 'updateStatus':
        if (!data?.status) {
          return NextResponse.json({ error: 'Status is required' }, { status: 400 })
        }
        await prisma.product.updateMany({
          where: {
            id: { in: productIds },
            storeId: session.user.storeId,
          },
          data: { status: data.status },
        })
        return NextResponse.json({ success: true, message: `${productIds.length} products updated` })

      case 'updateCategory':
        await prisma.product.updateMany({
          where: {
            id: { in: productIds },
            storeId: session.user.storeId,
          },
          data: { categoryId: data?.categoryId || null },
        })
        return NextResponse.json({ success: true, message: `${productIds.length} products updated` })

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    console.error('Bulk action error:', error)
    return NextResponse.json({ error: 'Failed to perform bulk action' }, { status: 500 })
  }
}
