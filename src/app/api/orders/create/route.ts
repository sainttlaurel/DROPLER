import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { SubscriptionLimitError, enforceMonthlyOrderLimit } from '@/lib/subscription'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      storeId,
      customerName,
      customerEmail,
      shippingAddress,
      items,
      subtotal,
      shipping,
      tax,
      total,
      customerId, // Optional - if customer is logged in
    } = body

    // Validate required fields
    if (!storeId || !customerName || !customerEmail || !shippingAddress || !items || items.length === 0) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    await enforceMonthlyOrderLimit(storeId)

    // Generate order number
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`

    // Calculate profit
    let totalProfit = 0
    const orderItems = []

    for (const item of items) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
      })

      if (!product) {
        return NextResponse.json(
          { error: `Product ${item.productId} not found` },
          { status: 404 }
        )
      }

      const itemProfit = (product.price - product.cost) * item.quantity
      totalProfit += itemProfit

      orderItems.push({
        productId: product.id,
        name: product.name,
        sku: product.sku,
        price: product.price,
        cost: product.cost,
        quantity: item.quantity,
        image: product.image,
      })

      // Update inventory
      await prisma.product.update({
        where: { id: product.id },
        data: {
          inventory: {
            decrement: item.quantity,
          },
        },
      })
    }

    // Create order
    const order = await prisma.order.create({
      data: {
        orderNumber,
        customerName,
        customerEmail,
        shippingAddress,
        subtotal,
        shipping,
        tax,
        total,
        profit: totalProfit,
        status: 'PENDING',
        storeId,
        customerId: customerId || null, // Link to customer if logged in
        items: {
          create: orderItems,
        },
      },
      include: {
        items: true,
      },
    })

    // Update analytics
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    await prisma.analytics.upsert({
      where: {
        storeId_date: {
          storeId,
          date: today,
        },
      },
      update: {
        revenue: {
          increment: total,
        },
        orders: {
          increment: 1,
        },
        profit: {
          increment: totalProfit,
        },
      },
      create: {
        storeId,
        date: today,
        revenue: total,
        orders: 1,
        profit: totalProfit,
        conversionRate: 0,
      },
    })

    return NextResponse.json(order)
  } catch (error) {
    if (error instanceof SubscriptionLimitError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status }
      )
    }

    console.error('Order creation error:', error)
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    )
  }
}
