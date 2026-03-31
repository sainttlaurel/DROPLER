import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'
import Stripe from 'stripe'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')

  if (!sig) {
    return NextResponse.json({ error: 'Missing stripe signature' }, { status: 400 })
  }

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err) {
    console.error('Webhook signature failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const getPlanFromPriceId = (priceId: string): string => {
    if (priceId === process.env.STRIPE_PRICE_STARTER) return 'STARTER'
    if (priceId === process.env.STRIPE_PRICE_PRO) return 'PRO'
    if (priceId === process.env.STRIPE_PRICE_ENTERPRISE) return 'ENTERPRISE'
    return 'FREE'
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const storeId = session.metadata?.storeId
        if (!storeId || session.mode !== 'subscription') break

        const subscription = await stripe.subscriptions.retrieve(
          session.subscription as string
        )

        const priceId = subscription.items.data[0]?.price.id
        if (!priceId) break

        const plan = getPlanFromPriceId(priceId)

        const customerId =
          typeof session.customer === 'string'
            ? session.customer
            : (session.customer as Stripe.Customer).id

        await prisma.subscription.upsert({
          where: { storeId },
          update: {
            plan,
            status: 'ACTIVE',
            stripeSubscriptionId: subscription.id,
            stripePriceId: priceId,
            stripeCurrentPeriodEnd: new Date(subscription.current_period_end * 1000),
            stripeCustomerId: customerId,
          },
          create: {
            storeId,
            plan,
            status: 'ACTIVE',
            stripeCustomerId: customerId,
            stripeSubscriptionId: subscription.id,
            stripePriceId: priceId,
            stripeCurrentPeriodEnd: new Date(subscription.current_period_end * 1000),
          },
        })

        break
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        const storeId = subscription.metadata?.storeId
        if (!storeId) break

        const priceId = subscription.items.data[0]?.price.id
        if (!priceId) break

        const plan = getPlanFromPriceId(priceId)
        const status = subscription.status === 'active' ? 'ACTIVE' : 'INACTIVE'

        await prisma.subscription.updateMany({
          where: { storeId },
          data: {
            plan,
            status,
            stripePriceId: priceId,
            stripeCurrentPeriodEnd: new Date(subscription.current_period_end * 1000),
            stripeSubscriptionId: subscription.id,
          },
        })
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        const storeId = subscription.metadata?.storeId
        if (!storeId) break

        await prisma.subscription.updateMany({
          where: { storeId },
          data: {
            plan: 'FREE',
            status: 'INACTIVE',
            stripeSubscriptionId: null,
            stripePriceId: null,
          },
        })
        break
      }
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook handler error:', error)
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 })
  }
}