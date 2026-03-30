export const CURRENCIES = [
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'GBP', name: 'British Pound', symbol: '£' },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$' },
  { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF' },
  { code: 'CNY', name: 'Chinese Yuan', symbol: '¥' },
  { code: 'INR', name: 'Indian Rupee', symbol: '₹' },
  { code: 'MXN', name: 'Mexican Peso', symbol: '$' },
  { code: 'BRL', name: 'Brazilian Real', symbol: 'R$' },
  { code: 'ZAR', name: 'South African Rand', symbol: 'R' },
  { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$' },
  { code: 'HKD', name: 'Hong Kong Dollar', symbol: 'HK$' },
  { code: 'NZD', name: 'New Zealand Dollar', symbol: 'NZ$' },
  { code: 'SEK', name: 'Swedish Krona', symbol: 'kr' },
  { code: 'NOK', name: 'Norwegian Krone', symbol: 'kr' },
  { code: 'DKK', name: 'Danish Krone', symbol: 'kr' },
  { code: 'PLN', name: 'Polish Zloty', symbol: 'zł' },
  { code: 'THB', name: 'Thai Baht', symbol: '฿' },
  { code: 'MYR', name: 'Malaysian Ringgit', symbol: 'RM' },
  { code: 'PHP', name: 'Philippine Peso', symbol: '₱' },
  { code: 'IDR', name: 'Indonesian Rupiah', symbol: 'Rp' },
  { code: 'AED', name: 'UAE Dirham', symbol: 'د.إ' },
  { code: 'SAR', name: 'Saudi Riyal', symbol: '﷼' },
]

export const TIMEZONES = [
  { value: 'America/New_York', label: 'Eastern Time (US & Canada)' },
  { value: 'America/Chicago', label: 'Central Time (US & Canada)' },
  { value: 'America/Denver', label: 'Mountain Time (US & Canada)' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (US & Canada)' },
  { value: 'America/Anchorage', label: 'Alaska' },
  { value: 'Pacific/Honolulu', label: 'Hawaii' },
  { value: 'Europe/London', label: 'London' },
  { value: 'Europe/Paris', label: 'Paris, Berlin, Rome' },
  { value: 'Europe/Athens', label: 'Athens, Istanbul' },
  { value: 'Europe/Moscow', label: 'Moscow' },
  { value: 'Asia/Dubai', label: 'Dubai' },
  { value: 'Asia/Karachi', label: 'Karachi' },
  { value: 'Asia/Kolkata', label: 'Mumbai, Kolkata' },
  { value: 'Asia/Bangkok', label: 'Bangkok, Hanoi' },
  { value: 'Asia/Singapore', label: 'Singapore' },
  { value: 'Asia/Hong_Kong', label: 'Hong Kong' },
  { value: 'Asia/Shanghai', label: 'Beijing, Shanghai' },
  { value: 'Asia/Tokyo', label: 'Tokyo, Osaka' },
  { value: 'Asia/Seoul', label: 'Seoul' },
  { value: 'Australia/Sydney', label: 'Sydney, Melbourne' },
  { value: 'Australia/Perth', label: 'Perth' },
  { value: 'Pacific/Auckland', label: 'Auckland' },
  { value: 'America/Sao_Paulo', label: 'São Paulo' },
  { value: 'America/Mexico_City', label: 'Mexico City' },
  { value: 'America/Toronto', label: 'Toronto' },
  { value: 'Africa/Johannesburg', label: 'Johannesburg' },
  { value: 'Africa/Cairo', label: 'Cairo' },
]

export const SUBSCRIPTION_PLANS = {
  FREE:       'FREE',
  STARTER:    'STARTER',
  PRO:        'PRO',
  ENTERPRISE: 'ENTERPRISE',
} as const

export type SubscriptionPlan = typeof SUBSCRIPTION_PLANS[keyof typeof SUBSCRIPTION_PLANS]

export const SUBSCRIPTION_PLAN_VALUES = Object.values(SUBSCRIPTION_PLANS)

export function isValidSubscriptionPlan(value: string): value is SubscriptionPlan {
  return SUBSCRIPTION_PLAN_VALUES.includes(value as SubscriptionPlan)
}

export const PLAN_DETAILS: Record<SubscriptionPlan, {
  name: string
  price: number
  annualPrice: number
  popular: boolean
  priceId: string | null
  features: string[]
  limits: { products: number; orders: number; stores: number }
}> = {
  FREE: {
    name: 'Free',
    price: 0,
    annualPrice: 0,
    popular: false,
    priceId: null,
    features: [
      '1 store',
      'Up to 50 products',
      'Up to 100 orders/mo',
      'Basic analytics',
      'Order management',
    ],
    limits: { products: 50, orders: 100, stores: 1 },
  },
  STARTER: {
    name: 'Starter',
    price: 19,
    annualPrice: 190,
    popular: false,
    priceId: 'price_1TGb744DtPVuhqnvvqeonWO2',
    features: [
      '1 store',
      'Up to 500 products',
      'Up to 1,000 orders/mo',
      'Basic analytics',
      'Email support',
    ],
    limits: { products: 500, orders: 1000, stores: 1 },
  },
  PRO: {
    name: 'Pro',
    price: 49,
    annualPrice: 490,
    popular: true,
    priceId: 'price_1TGb6d4DtPVuhqnvgghek4QU',
    features: [
      'Up to 3 stores',
      'Up to 5,000 products',
      'Unlimited orders',
      'Advanced analytics',
      'Priority support',
    ],
    limits: { products: 5000, orders: Infinity, stores: 3 },
  },
  ENTERPRISE: {
    name: 'Enterprise',
    price: 99,
    annualPrice: 990,
    popular: false,
    priceId: 'price_1TGb6I4DtPVuhqnvZbqWc2P9',
    features: [
      'Unlimited stores',
      'Unlimited products',
      'Unlimited orders',
      'Advanced analytics',
      'Dedicated support',
      'White-label storefront',
    ],
    limits: { products: Infinity, orders: Infinity, stores: Infinity },
  },
}