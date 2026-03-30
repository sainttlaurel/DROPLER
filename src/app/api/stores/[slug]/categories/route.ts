import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const store = await prisma.store.findUnique({ where: { slug: params.slug } })
    if (!store) return NextResponse.json({ error: 'Store not found' }, { status: 404 })

    const categories = await prisma.category.findMany({
      where: { storeId: store.id },
      include: { _count: { select: { products: { where: { status: 'ACTIVE' } } } } },
      orderBy: { name: 'asc' },
    })

    return NextResponse.json(categories)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 })
  }
}
