export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { stripe } from '@/lib/stripe'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        store: {
          include: { subscription: true },
        },
      },
    })

    if (!user?.store?.subscription?.stripeCustomerId) {
      return NextResponse.json({ paymentMethods: [] })
    }

    const paymentMethods = await stripe.paymentMethods.list({
      customer: user.store.subscription.stripeCustomerId,
      type: 'card',
    })

    return NextResponse.json({
      paymentMethods: paymentMethods.data.map(pm => ({
        id: pm.id,
        brand: pm.card?.brand,
        last4: pm.card?.last4,
        expMonth: pm.card?.exp_month,
        expYear: pm.card?.exp_year,
        isDefault: pm.id === user.store?.subscription?.defaultPaymentMethodId,
      })),
    })
  } catch (error) {
    console.error('Payment methods error:', error)
    return NextResponse.json({ error: 'Failed to fetch payment methods' }, { status: 500 })
  }
}
