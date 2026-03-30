import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { sendEmail, generateOrderConfirmationEmail, generateShippingNotificationEmail } from '@/lib/email'

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.storeId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { orderId, type } = await req.json()

    const order = await prisma.order.findFirst({
      where: { id: orderId, storeId: session.user.storeId },
      include: { items: true, store: true },
    })

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    let emailData
    switch (type) {
      case 'order_confirmation':
        emailData = generateOrderConfirmationEmail(order, order.store)
        break
      case 'shipping_notification':
        if (!order.trackingNumber) {
          return NextResponse.json({ error: 'No tracking number' }, { status: 400 })
        }
        emailData = generateShippingNotificationEmail(order, order.trackingNumber)
        break
      default:
        return NextResponse.json({ error: 'Invalid notification type' }, { status: 400 })
    }

    await sendEmail({
      to: order.customerEmail,
      ...emailData,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Notification error:', error)
    return NextResponse.json({ error: 'Failed to send notification' }, { status: 500 })
  }
}
