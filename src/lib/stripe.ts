import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
})

export const PLANS = {
  STARTER: {
    name: 'Starter',
    priceId: process.env.STRIPE_PRICE_STARTER!,
    price: 19,
    limits: { products: 500, orders: 1000 },
  },
  PRO: {
    name: 'Pro',
    priceId: process.env.STRIPE_PRICE_PRO!,
    price: 49,
    limits: { products: 5000, orders: Infinity },
  },
  ENTERPRISE: {
    name: 'Enterprise',
    priceId: process.env.STRIPE_PRICE_ENTERPRISE!,
    price: 99,
    limits: { products: Infinity, orders: Infinity },
  },
} as const