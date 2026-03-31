import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { stripe, PLANS } from '@/lib/stripe'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const plan = body.plan as string

    const planData = PLANS[plan as keyof typeof PLANS]
    if (!planData) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        store: {
          include: { subscription: true },
        },
      },
    })

    if (!user?.store) {
      return NextResponse.json({ error: 'Store not found' }, { status: 404 })
    }

    const subscription = user.store.subscription
    let customerId = subscription?.stripeCustomerId

    // Create Stripe customer if doesn't exist
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email ?? undefined,
        name: user.name ?? undefined,
        metadata: { storeId: user.store.id, userId: user.id },
      })
      customerId = customer.id

      await prisma.subscription.upsert({
        where: { storeId: user.store.id },
        update: { stripeCustomerId: customerId },
        create: {
          storeId: user.store.id,
          stripeCustomerId: customerId,
          plan: 'FREE',
          status: 'INACTIVE',
        },
      })
    }

    const appUrl = process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

    // Create Stripe Checkout session
    const checkoutSession = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      line_items: [{ price: planData.priceId, quantity: 1 }],
      success_url: `${appUrl}/dashboard/billing?success=true&plan=${plan}`,
      cancel_url: `${appUrl}/dashboard/billing?canceled=true`,
      metadata: { storeId: user.store.id, plan },
      subscription_data: {
        metadata: { storeId: user.store.id, plan },
      },
    })

    return NextResponse.json({ url: checkoutSession.url })
  } catch (error) {
    console.error('Checkout error:', error)
    return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 })
  }
}