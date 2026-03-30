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

    const suppliers = await prisma.supplier.findMany({
      where: { storeId: session.user.storeId },
      include: {
        _count: {
          select: { products: true },
        },
      },
    })

    return NextResponse.json(suppliers)
  } catch (error) {
    console.error('Suppliers fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch suppliers' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.storeId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, platform, website, email, country, notes, isActive } = body

    if (!name || !platform) {
      return NextResponse.json({ error: 'Name and platform are required' }, { status: 400 })
    }

    const supplier = await prisma.supplier.create({
      data: {
        name,
        platform,
        website,
        email,
        country,
        notes,
        isActive,
        storeId: session.user.storeId,
      },
    })

    return NextResponse.json(supplier)
  } catch (error) {
    console.error('Supplier create error:', error)
    return NextResponse.json({ error: 'Failed to create supplier' }, { status: 500 })
  }
}
