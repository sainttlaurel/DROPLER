import { prisma } from '@/lib/prisma'
import { PLAN_DETAILS, SUBSCRIPTION_PLANS, type SubscriptionPlan } from '@/lib/constants'

export class SubscriptionLimitError extends Error {
  status: number

  constructor(message: string, status = 403) {
    super(message)
    this.name = 'SubscriptionLimitError'
    this.status = status
  }
}

export async function getStoreSubscriptionPlan(storeId: string): Promise<SubscriptionPlan> {
  const subscription = await prisma.subscription.findUnique({
    where: { storeId },
    select: { plan: true },
  })

  const plan = subscription?.plan as SubscriptionPlan | undefined
  return plan && plan in PLAN_DETAILS ? plan : SUBSCRIPTION_PLANS.FREE
}

export async function getStorePlanDetails(storeId: string) {
  const plan = await getStoreSubscriptionPlan(storeId)
  return {
    plan,
    details: PLAN_DETAILS[plan],
  }
}

export async function enforceProductLimit(storeId: string) {
  const [{ plan, details }, productCount] = await Promise.all([
    getStorePlanDetails(storeId),
    prisma.product.count({ where: { storeId } }),
  ])

  if (details.limits.products !== Infinity && productCount >= details.limits.products) {
    throw new SubscriptionLimitError(
      `${details.name} plan allows up to ${details.limits.products.toLocaleString()} products. Upgrade your subscription to add more products.`
    )
  }

  return {
    plan,
    details,
    usage: {
      products: productCount,
    },
  }
}

export async function enforceMonthlyOrderLimit(storeId: string) {
  const [{ plan, details }, orderCount] = await Promise.all([
    getStorePlanDetails(storeId),
    prisma.order.count({
      where: {
        storeId,
        createdAt: {
          gte: startOfCurrentMonth(),
        },
      },
    }),
  ])

  if (details.limits.orders !== Infinity && orderCount >= details.limits.orders) {
    throw new SubscriptionLimitError(
      `${details.name} plan allows up to ${details.limits.orders.toLocaleString()} orders per month. Upgrade your subscription to continue processing orders.`
    )
  }

  return {
    plan,
    details,
    usage: {
      monthlyOrders: orderCount,
    },
  }
}

export function startOfCurrentMonth() {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth(), 1)
}
