import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { verifyCustomerToken } from '@/lib/customer-auth'

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const customerId = searchParams.get('customerId')
    const page = parseInt(searchParams.get('page') || '1', 10)
    const limit = parseInt(searchParams.get('limit') || '10', 10)

    // Check for customer JWT token in Authorization header
    const authHeader = req.headers.get('Authorization')
    const customerToken = authHeader?.startsWith('Bearer ')
      ? authHeader.slice(7)
      : null

    if (customerToken) {
      // Customer authentication path
      const payload = await verifyCustomerToken(customerToken)
      if (!payload || payload.role !== 'customer') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }

      // Customers can only fetch their own orders — by customerId OR by email (guest orders)
      const skip = (page - 1) * limit

      const [orders, total] = await Promise.all([
        prisma.order.findMany({
          where: {
            OR: [
              { customerId: payload.id },
              { customerEmail: payload.email, customerId: null },
            ],
          },
          include: { items: true },
          orderBy: { createdAt: 'desc' },
          take: limit,
          skip,
        }),
        prisma.order.count({
          where: {
            OR: [
              { customerId: payload.id },
              { customerEmail: payload.email, customerId: null },
            ],
          },
        }),
      ])

      return NextResponse.json({
        orders,
        total,
        page,
        totalPages: Math.ceil(total / limit),
      })
    }

    // Admin authentication path
    const session = await getServerSession(authOptions)
    if (!session?.user?.storeId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Build where clause scoped to the admin's store
    const where: any = { storeId: session.user.storeId }
    if (customerId) {
      where.customerId = customerId
    }

    const skip = (page - 1) * limit

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: { items: true },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip,
      }),
      prisma.order.count({ where }),
    ])

    return NextResponse.json({
      orders,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.storeId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const data = await req.json()
    const order = await prisma.order.create({
      data: {
        ...data,
        storeId: session.user.storeId,
      },
    })

    return NextResponse.json(order, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 })
  }
}
