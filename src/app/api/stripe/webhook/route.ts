import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { prisma } from '@/lib/prisma'

function getPlanFromPriceId(priceId: string): string {
  const priceMap: Record<string, string> = {
    'price_1TGb744DtPVuhqnvvqeonWO2': 'STARTER',
    'price_1TGb6d4DtPVuhqnvgghek4QU': 'PRO',
    'price_1TGb6I4DtPVuhqnvZbqWc2P9': 'ENTERPRISE',
  }
  return priceMap[priceId] ?? 'FREE'
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16' as any,
})

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')!

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  try {

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const userId = session.metadata?.userId
        if (!userId) break

        const store = await prisma.store.findUnique({ where: { userId } })
        if (!store) break

        const plan = getPlanFromPriceId(session.metadata?.priceId ?? '')

        await prisma.subscription.upsert({
          where: { storeId: store.id },
          update: {
            stripeCustomerId: session.customer as string,
            stripeSubscriptionId: session.subscription as string,
            stripePriceId: session.metadata?.priceId,
            status: 'ACTIVE',
            plan,
          },
          create: {
            storeId: store.id,
            stripeCustomerId: session.customer as string,
            stripeSubscriptionId: session.subscription as string,
            stripePriceId: session.metadata?.priceId,
            status: 'ACTIVE',
            plan,
          },
        })
        break
      }

      case 'customer.subscription.deleted':
      case 'customer.subscription.paused': {
        const subscription = event.data.object as Stripe.Subscription
        await prisma.subscription.updateMany({
          where: { stripeCustomerId: subscription.customer as string },
          data: { status: 'INACTIVE', plan: 'FREE' },
        })
        break
      }

      case 'customer.subscription.resumed':
      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as any
        await prisma.subscription.updateMany({
          where: { stripeCustomerId: invoice.customer as string },
          data: { status: 'ACTIVE' },
        })
        break
      }
    }
  } catch (error) {
    console.error('Webhook handler error:', error)
  }

  return NextResponse.json({ received: true })
}