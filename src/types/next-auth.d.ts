import 'next-auth'
import { SubscriptionPlan } from '@/lib/constants'

declare module 'next-auth' {
  interface User {
    id: string
    storeId?: string
    plan?: SubscriptionPlan
  }

  interface Session {
    user: {
      id: string
      email: string
      name?: string | null
      image?: string | null
      storeId?: string
      plan?: SubscriptionPlan
    }
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    storeId?: string
    plan?: SubscriptionPlan
  }
}
