'use client'

import { useState, useEffect } from 'react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Icon } from '@/components/ui/Icon'
import { PLAN_DETAILS, SubscriptionPlan, SUBSCRIPTION_PLANS } from '@/lib/constants'
import { formatCurrency } from '@/lib/utils'
import Link from 'next/link'

const STARTER_PRICE_ID = 'price_1TGb744DtPVuhqnvvqeonWO2'
const PRO_PRICE_ID = 'price_1TGb6d4DtPVuhqnvgghek4QU'
const ENTERPRISE_PRICE_ID = 'price_1TGb6I4DtPVuhqnvZbqWc2P9'

const PRICE_IDS: Partial<Record<SubscriptionPlan, string>> = {
  STARTER: STARTER_PRICE_ID,
  PRO: PRO_PRICE_ID,
  ENTERPRISE: ENTERPRISE_PRICE_ID,
}

const UPGRADE_PLANS = [
  { key: 'STARTER',    name: 'Starter',    price: 19, features: ['500 products', '1,000 orders/mo', 'Priority support'] },
  { key: 'PRO',        name: 'Pro',        price: 49, features: ['5,000 products', 'Unlimited orders', 'Analytics'] },
  { key: 'ENTERPRISE', name: 'Enterprise', price: 99, features: ['Unlimited products', 'Unlimited orders', 'Dedicated support'] },
]

interface BillingData {
  plan: SubscriptionPlan
  productCount: number
  orderCount: number
  hasStripeCustomer: boolean
  subscriptionStatus?: string
  stripeCurrentPeriodEnd?: string
  currency: string
}

const mockBillingHistory = [
  { id: '#INV-2024-001', date: 'Oct 12, 2024', amount: 249, status: 'Paid' },
  { id: '#INV-2024-002', date: 'Sep 12, 2024', amount: 249, status: 'Paid' },
  { id: '#INV-2024-003', date: 'Aug 12, 2024', amount: 249, status: 'Paid' },
]

const visiblePlans: SubscriptionPlan[] = [
  SUBSCRIPTION_PLANS.STARTER,
  SUBSCRIPTION_PLANS.PRO,
  SUBSCRIPTION_PLANS.ENTERPRISE,
]

export default function BillingPage() {
  const [billingData, setBillingData] = useState<BillingData | null>(null)
  const [loading, setLoading] = useState(true)
  const [billingLoading, setBillingLoading] = useState(false)

  useEffect(() => {
    fetchBillingData()
  }, [])

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get('success')) {
      alert('🎉 Subscription activated! Your plan has been upgraded.')
      window.history.replaceState({}, '', '/dashboard/billing')
      fetchBillingData()
    }
    if (params.get('canceled')) {
      alert('Checkout canceled. No changes were made.')
      window.history.replaceState({}, '', '/dashboard/billing')
    }
  }, [])

  const fetchBillingData = async () => {
    try {
      const [settingsRes, productsRes, ordersRes] = await Promise.all([
        fetch('/api/settings'),
        fetch('/api/products'),
        fetch('/api/orders?limit=1000'),
      ])
      const settings = await settingsRes.json()
      const products = await productsRes.json()
      const orders = await ordersRes.json()

      const productsList = Array.isArray(products) ? products : (products.products ?? [])
      const ordersList = Array.isArray(orders) ? orders : (orders.orders ?? [])

      setBillingData({
        plan: (settings.store?.subscription?.plan || SUBSCRIPTION_PLANS.FREE) as SubscriptionPlan,
        productCount: productsList.length,
        orderCount: ordersList.length,
        hasStripeCustomer: !!settings.store?.subscription?.stripeCustomerId,
        subscriptionStatus: settings.store?.subscription?.status,
        stripeCurrentPeriodEnd: settings.store?.subscription?.stripeCurrentPeriodEnd,
        currency: settings.store?.currency || 'USD',
      })
    } catch {
      setBillingData({
        plan: SUBSCRIPTION_PLANS.FREE,
        productCount: 0,
        orderCount: 0,
        hasStripeCustomer: false,
        currency: 'USD',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleUpgrade = async (priceId: string) => {
    setBillingLoading(true)
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId }),
      })
      const data = await res.json()
      if (data.url) window.location.href = data.url
    } catch {
    } finally {
      setBillingLoading(false)
    }
  }

  const handleManageBilling = async () => {
    setBillingLoading(true)
    try {
      const res = await fetch('/api/stripe/portal', { method: 'POST' })
      const data = await res.json()
      if (data.url) window.location.href = data.url
    } catch {
    } finally {
      setBillingLoading(false)
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Icon name="refresh" size="xl" className="animate-spin text-[#1a1a1a] mb-4" />
            <p className="font-headline font-bold uppercase text-lg">Loading Billing...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (!billingData) return null

  const currentPlan = billingData.plan || SUBSCRIPTION_PLANS.FREE
  const currentPlanDetails = PLAN_DETAILS[currentPlan] || PLAN_DETAILS.FREE
  const billingCurrency = billingData.currency || 'USD'
  const hasPaidPlan = currentPlan !== SUBSCRIPTION_PLANS.FREE
  const productsLimit = currentPlanDetails.limits.products
  const ordersLimit = currentPlanDetails.limits.orders
  const productPct =
    productsLimit === Infinity ? 10 : Math.min(100, Math.round((billingData.productCount / productsLimit) * 100))
  const orderPct =
    ordersLimit === Infinity ? 10 : Math.min(100, Math.round((billingData.orderCount / ordersLimit) * 100))

  return (
    <DashboardLayout>
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6 border-b-8 border-[#1a1a1a] pb-8">
        <div>
          <h1 className="text-7xl md:text-8xl font-black uppercase tracking-tighter leading-none mb-2 font-headline">
            Billing
          </h1>
          <p className="font-bold text-xl border-l-8 border-[#ffcc00] pl-4 uppercase">
            Manage your plan and payment details.
          </p>
        </div>
        <div className="flex gap-4">
          <button className="flex items-center gap-2 px-6 py-3 border-4 border-[#1a1a1a] font-headline font-black uppercase shadow-[6px_6px_0px_0px_rgba(26,26,26,1)] hover:bg-[#1a1a1a] hover:text-white transition-all active:translate-x-1 active:translate-y-1 active:shadow-none">
            <Icon name="download" size="sm" />
            Export
          </button>
          {!hasPaidPlan && (
            <button
              onClick={() => handleUpgrade(PRO_PRICE_ID)}
              disabled={billingLoading}
              className="flex items-center gap-2 px-6 py-3 bg-[#ffcc00] border-4 border-[#1a1a1a] font-headline font-black uppercase shadow-[6px_6px_0px_0px_rgba(26,26,26,1)] hover:bg-[#1a1a1a] hover:text-white transition-all active:translate-x-1 active:translate-y-1 active:shadow-none disabled:opacity-50"
            >
              <Icon name="upgrade" size="sm" />
              {billingLoading ? 'Loading...' : 'Upgrade Plan'}
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-10">
        <div className="md:col-span-4 bg-[#ffcc00] border-4 border-[#1a1a1a] p-6 shadow-[8px_8px_0px_0px_rgba(26,26,26,1)] flex flex-col justify-between min-h-[220px]">
          <div>
            <div className="font-headline font-black text-xs uppercase tracking-widest mb-2">Active Plan</div>
            <div className="font-headline font-black text-5xl tracking-tighter leading-none">{currentPlanDetails.name}</div>
            <div className="mt-2 font-bold text-sm uppercase opacity-70">{currentPlanDetails.features[0]}</div>
            {billingData.subscriptionStatus && (
              <div className="mt-4 inline-flex bg-[#1a1a1a] text-white px-3 py-1 text-[10px] font-headline font-black uppercase tracking-widest border-2 border-[#1a1a1a]">
                {billingData.subscriptionStatus}
              </div>
            )}
          </div>
          <div>
            <div className="font-headline font-black text-4xl tracking-tighter mb-4">
              {formatCurrency(currentPlanDetails.price, billingCurrency)}<span className="text-lg opacity-60">/mo</span>
            </div>
            {hasPaidPlan ? (
              <button
                onClick={handleManageBilling}
                disabled={billingLoading}
                className="w-full bg-[#1a1a1a] text-white py-3 font-headline font-black uppercase tracking-tighter text-sm hover:bg-[#0055ff] transition-colors border-2 border-[#1a1a1a] disabled:opacity-50"
              >
                {billingLoading ? 'Loading...' : 'Manage Subscription'}
              </button>
            ) : (
              <button
                onClick={() => handleUpgrade(PRO_PRICE_ID)}
                disabled={billingLoading}
                className="w-full bg-[#1a1a1a] text-white py-3 font-headline font-black uppercase tracking-tighter text-sm hover:bg-[#0055ff] transition-colors border-2 border-[#1a1a1a] disabled:opacity-50"
              >
                {billingLoading ? 'Loading...' : 'Upgrade Now'}
              </button>
            )}
          </div>
        </div>

        <div className="md:col-span-4 p-6 border-4 border-[#1a1a1a] bg-white shadow-[8px_8px_0px_0px_rgba(26,26,26,1)]">
          <div className="flex justify-between items-start mb-4">
            <Icon name="inventory_2" className="text-3xl" />
            <span className="font-headline font-bold text-xs bg-[#eee9e0] px-2 py-1 border-2 border-[#1a1a1a]">{productPct}% USED</span>
          </div>
          <div className="font-headline font-black text-xs uppercase tracking-widest mb-1">Products Imported</div>
          <div className="font-headline font-black text-4xl tracking-tighter">
            {billingData.productCount.toLocaleString()} / {productsLimit === Infinity ? '∞' : productsLimit.toLocaleString()}
          </div>
          <div className="mt-4 h-4 bg-[#e8e3da] border-2 border-[#1a1a1a] w-full overflow-hidden">
            <div className="h-full bg-[#0055ff] border-r-2 border-[#1a1a1a]" style={{ width: `${productPct}%` }} />
          </div>
        </div>

        <div className="md:col-span-4 p-6 border-4 border-[#1a1a1a] bg-white shadow-[8px_8px_0px_0px_rgba(26,26,26,1)]">
          <div className="flex justify-between items-start mb-4">
            <Icon name="rocket_launch" className="text-3xl" />
            <span className="font-headline font-bold text-xs bg-[#eee9e0] px-2 py-1 border-2 border-[#1a1a1a]">{orderPct}% USED</span>
          </div>
          <div className="font-headline font-black text-xs uppercase tracking-widest mb-1">Orders This Month</div>
          <div className="font-headline font-black text-4xl tracking-tighter">
            {billingData.orderCount.toLocaleString()} / {ordersLimit === Infinity ? '∞' : ordersLimit.toLocaleString()}
          </div>
          <div className="mt-4 h-4 bg-[#e8e3da] border-2 border-[#1a1a1a] w-full overflow-hidden">
            <div className="h-full bg-[#e63b2e] border-r-2 border-[#1a1a1a]" style={{ width: `${orderPct}%` }} />
          </div>
        </div>
      </div>

      {!hasPaidPlan && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {visiblePlans.map((planKey) => {
            const plan = PLAN_DETAILS[planKey]
            const priceId = PRICE_IDS[planKey]
            const ctaLabel = `Get ${plan.name}`

            return (
              <div
                key={planKey}
                className={`border-4 border-[#1a1a1a] p-6 shadow-[8px_8px_0px_0px_rgba(26,26,26,1)] flex flex-col justify-between relative ${
                  plan.popular ? 'bg-[#ffcc00]' : 'bg-white'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#1a1a1a] text-white font-headline font-black uppercase text-xs px-4 py-1">
                    Most Popular
                  </div>
                )}
                <div>
                  <h3 className="font-headline font-black uppercase text-2xl mb-1">{plan.name}</h3>
                  <div className="font-headline font-black text-4xl mb-4">
                    {formatCurrency(plan.price, billingCurrency)}<span className="text-lg opacity-60">/mo</span>
                  </div>
                  <ul className="space-y-1 mb-6 text-sm font-bold uppercase">
                    {plan.features.slice(0, 4).map((feature) => (
                      <li key={feature}>✓ {feature}</li>
                    ))}
                  </ul>
                </div>
                <button
                  onClick={() => priceId && handleUpgrade(priceId)}
                  disabled={billingLoading || !priceId}
                  className="w-full py-3 bg-[#1a1a1a] text-white border-2 border-[#1a1a1a] font-headline font-black uppercase hover:bg-[#0055ff] transition-colors disabled:opacity-50"
                >
                  {billingLoading ? 'Loading...' : ctaLabel}
                </button>
              </div>
            )
          })}
        </div>
      )}

      <div className="border-4 border-[#1a1a1a] bg-white shadow-[8px_8px_0px_0px_rgba(26,26,26,1)] overflow-hidden mb-10">
        <div className="p-6 border-b-4 border-[#1a1a1a] flex justify-between items-center bg-[#eee9e0]">
          <h3 className="text-2xl font-black uppercase tracking-tight font-headline">Billing History</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#ffcc00] font-headline font-black uppercase text-xs tracking-widest border-b-4 border-[#1a1a1a]">
                <th className="p-4 border-r-2 border-[#1a1a1a]">Invoice ID</th>
                <th className="p-4 border-r-2 border-[#1a1a1a]">Date</th>
                <th className="p-4 border-r-2 border-[#1a1a1a]">Amount</th>
                <th className="p-4 border-r-2 border-[#1a1a1a]">Status</th>
                <th className="p-4">Action</th>
              </tr>
            </thead>
            <tbody className="font-headline font-medium divide-y-2 divide-[#1a1a1a]/10">
              {mockBillingHistory.map((invoice) => (
                <tr key={invoice.id} className="hover:bg-[#f5f0e8] transition-colors">
                  <td className="p-4 font-headline font-black">{invoice.id}</td>
                  <td className="p-4 font-bold uppercase text-sm">{invoice.date}</td>
                  <td className="p-4 font-headline font-black">{formatCurrency(invoice.amount, billingCurrency)}</td>
                  <td className="p-4">
                    <span className="bg-[#1a1a1a] text-white px-3 py-1 text-[10px] font-headline font-black uppercase tracking-widest border-2 border-[#1a1a1a]">
                      {invoice.status}
                    </span>
                  </td>
                  <td className="p-4">
                    <button className="flex items-center gap-2 bg-[#1a1a1a] text-white px-4 py-2 text-xs font-headline font-black uppercase hover:bg-[#0055ff] transition-colors border-2 border-[#1a1a1a]">
                      <Icon name="download" size="sm" /> Download
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="p-6 bg-[#eee9e0] border-t-4 border-[#1a1a1a] text-center">
          <span className="font-headline font-black uppercase tracking-tighter text-sm opacity-50">
            Showing last 3 invoices
          </span>
        </div>
      </div>

      <div className="mb-10 border-4 border-[#1a1a1a] bg-[#f5f0e8] p-6 shadow-[8px_8px_0px_0px_rgba(26,26,26,1)]">
        <h3 className="text-2xl font-black uppercase tracking-tight font-headline mb-3">Plan Notes</h3>
        <ul className="space-y-2 text-sm font-bold uppercase">
          <li>✓ Product and monthly order limits are now enforced by your active subscription.</li>
          <li>✓ Pricing cards and billing limits now use the shared subscription definitions.</li>
          <li>⚠ Multi-store limits require a future schema update because the current system supports one store per user.</li>
        </ul>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-12">
        <Link href="/dashboard/support">
          <div className="bg-[#1a1a1a] p-8 flex items-center justify-between group cursor-pointer hover:bg-[#0055ff] transition-colors border-4 border-[#1a1a1a] shadow-[6px_6px_0px_0px_rgba(26,26,26,1)]">
            <div className="text-white">
              <h4 className="text-2xl font-black uppercase tracking-tight font-headline">Need Support?</h4>
              <p className="font-bold opacity-80">Our team is available 24/7 for you.</p>
            </div>
            <Icon name="arrow_forward" size="lg" className="text-white group-hover:translate-x-2 transition-transform" />
          </div>
        </Link>
        <Link href="/dashboard/settings">
          <div className="bg-[#e63b2e] p-8 flex items-center justify-between group cursor-pointer hover:bg-[#1a1a1a] transition-colors border-4 border-[#1a1a1a] shadow-[6px_6px_0px_0px_rgba(26,26,26,1)]">
            <div className="text-white">
              <h4 className="text-2xl font-black uppercase tracking-tight font-headline">Store Settings</h4>
              <p className="font-bold opacity-80">Configure your store preferences.</p>
            </div>
            <Icon name="settings" size="lg" className="text-white group-hover:rotate-90 transition-transform duration-300" />
          </div>
        </Link>
      </div>
    </DashboardLayout>
  )
}