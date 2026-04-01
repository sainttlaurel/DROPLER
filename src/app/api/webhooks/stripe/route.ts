export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * Stripe webhook handler
 * Handles subscription events and customer updates
 *
 * Make sure to:
 * 1. Set STRIPE_WEBHOOK_SECRET in environment variables
 * 2. Add webhook endpoint to Stripe dashboard:
 *    https://dashboard.stripe.com/account/webhooks
 * 3. Select events: customer.subscription.updated, customer.deleted
 */

export async function POST(req: NextRequest) {
  try {
    const body = await req.text()
    const signature = req.headers.get('stripe-signature')

    if (!signature) {
      return NextResponse.json(
        { error: 'Missing stripe-signature header' },
        { status: 400 }
      )
    }

    // TODO: Verify webhook signature with Stripe
    // For now, accepting all webhooks (UNSAFE - implement signature verification in production)
    // Use: stripe.webhooks.constructEvent(body, signature, webhookSecret)
    // See: https://stripe.com/docs/webhooks/signatures

    let event
    try {
      event = JSON.parse(body)
    } catch (error) {
      console.error('Failed to parse webhook body:', error)
      return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
    }

    const eventType = event.type
    const data = event.data.object

    console.log(`[Stripe Webhook] Received event: ${eventType}`)

    // Handle subscription updated event
    if (eventType === 'customer.subscription.updated') {
      return await handleSubscriptionUpdated(data)
    }

    // Handle subscription deleted event
    if (eventType === 'customer.subscription.deleted') {
      return await handleSubscriptionDeleted(data)
    }

    // Handle customer deleted event
    if (eventType === 'customer.deleted') {
      return await handleCustomerDeleted(data)
    }

    // Log unhandled events
    console.log(`[Stripe Webhook] Unhandled event type: ${eventType}`)

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('[Stripe Webhook] Error:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}

async function handleSubscriptionUpdated(subscription: any) {
  try {
    const customerId = subscription.customer

    // Find store with this Stripe customer ID
    const store = await prisma.store.findFirst({
      where: {
        subscription: {
          stripeCustomerId: customerId,
        },
      },
      include: { subscription: true },
    })

    if (!store) {
      console.warn(
        `[Stripe Webhook] No store found for customer: ${customerId}`
      )
      return NextResponse.json({ received: true })
    }

    // Map Stripe status to app status
    const statusMap: Record<string, string> = {
      active: 'ACTIVE',
      past_due: 'PAST_DUE',
      unpaid: 'UNPAID',
      canceled: 'CANCELED',
      incomplete: 'INCOMPLETE',
      incomplete_expired: 'EXPIRED',
      trialing: 'TRIALING',
    }

    const appStatus = statusMap[subscription.status] || subscription.status
    const periodEnd = new Date(subscription.current_period_end * 1000)

    // Update subscription in database
    await prisma.subscription.update({
      where: { storeId: store.id },
      data: {
        status: appStatus,
        stripeSubscriptionId: subscription.id,
        stripeCurrentPeriodEnd: periodEnd,
      },
    })

    console.log(
      `[Stripe Webhook] Updated subscription for store ${store.id}: status=${appStatus}`
    )

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('[Stripe Webhook] Error handling subscription update:', error)
    return NextResponse.json(
      { error: 'Failed to handle subscription update' },
      { status: 500 }
    )
  }
}

async function handleSubscriptionDeleted(subscription: any) {
  try {
    const customerId = subscription.customer

    // Find store with this Stripe customer ID
    const store = await prisma.store.findFirst({
      where: {
        subscription: {
          stripeCustomerId: customerId,
        },
      },
    })

    if (!store) {
      console.warn(
        `[Stripe Webhook] No store found for customer: ${customerId}`
      )
      return NextResponse.json({ received: true })
    }

    // Set subscription back to FREE plan
    await prisma.subscription.update({
      where: { storeId: store.id },
      data: {
        plan: 'FREE',
        status: 'CANCELED',
        stripeSubscriptionId: null,
        stripeCurrentPeriodEnd: null,
      },
    })

    console.log(
      `[Stripe Webhook] Subscription canceled for store ${store.id}, reverted to FREE plan`
    )

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('[Stripe Webhook] Error handling subscription deletion:', error)
    return NextResponse.json(
      { error: 'Failed to handle subscription deletion' },
      { status: 500 }
    )
  }
}

async function handleCustomerDeleted(customer: any) {
  try {
    const customerId = customer.id

    // Find store with this Stripe customer ID
    const store = await prisma.store.findFirst({
      where: {
        subscription: {
          stripeCustomerId: customerId,
        },
      },
    })

    if (!store) {
      console.warn(
        `[Stripe Webhook] No store found for customer: ${customerId}`
      )
      return NextResponse.json({ received: true })
    }

    // Clear Stripe customer ID but keep subscription record
    await prisma.subscription.update({
      where: { storeId: store.id },
      data: {
        stripeCustomerId: null,
        stripeSubscriptionId: null,
      },
    })

    console.log(
      `[Stripe Webhook] Customer deleted, cleared Stripe data for store ${store.id}`
    )

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('[Stripe Webhook] Error handling customer deletion:', error)
    return NextResponse.json(
      { error: 'Failed to handle customer deletion' },
      { status: 500 }
    )
  }
}
