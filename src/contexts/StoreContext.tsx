'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface StoreSettings {
  currency: string
  timezone: string
  name: string
  slug?: string
}

interface StoreContextType {
  settings: StoreSettings
  store: { slug?: string; name: string } | null
  refreshSettings: () => Promise<void>
  formatCurrency: (amount: number) => string
}

const StoreContext = createContext<StoreContextType | undefined>(undefined)

export function StoreProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<StoreSettings>({
    currency: 'USD',
    timezone: 'America/New_York',
    name: 'My Store',
    slug: undefined,
  })
  const [store, setStore] = useState<{ slug?: string; name: string } | null>(null)

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/settings')
      const data = await res.json()
      if (data.store) {
        setSettings({
          currency: data.store.currency || 'USD',
          timezone: data.store.timezone || 'America/New_York',
          name: data.store.name || 'My Store',
          slug: data.store.slug,
        })
        setStore({
          slug: data.store.slug,
          name: data.store.name || 'My Store',
        })
      }
    } catch (error) {
      console.error('Failed to fetch store settings:', error)
    }
  }

  const formatCurrency = (amount: number): string => {
    const currencyMap: Record<string, { locale: string; symbol?: string }> = {
      USD: { locale: 'en-US' },
      EUR: { locale: 'de-DE' },
      GBP: { locale: 'en-GB' },
      JPY: { locale: 'ja-JP' },
      AUD: { locale: 'en-AU' },
      CAD: { locale: 'en-CA' },
      CHF: { locale: 'de-CH' },
      CNY: { locale: 'zh-CN' },
      INR: { locale: 'en-IN' },
      MXN: { locale: 'es-MX' },
      BRL: { locale: 'pt-BR' },
      ZAR: { locale: 'en-ZA' },
      SGD: { locale: 'en-SG' },
      HKD: { locale: 'zh-HK' },
      NZD: { locale: 'en-NZ' },
      SEK: { locale: 'sv-SE' },
      NOK: { locale: 'nb-NO' },
      DKK: { locale: 'da-DK' },
      PLN: { locale: 'pl-PL' },
      THB: { locale: 'th-TH' },
      MYR: { locale: 'ms-MY' },
      PHP: { locale: 'en-PH' },
      IDR: { locale: 'id-ID' },
      AED: { locale: 'ar-AE' },
      SAR: { locale: 'ar-SA' },
    }

    const config = currencyMap[settings.currency] || { locale: 'en-US' }

    try {
      return new Intl.NumberFormat(config.locale, {
        style: 'currency',
        currency: settings.currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(amount)
    } catch (error) {
      // Fallback if currency is not supported
      return `${settings.currency} ${amount.toFixed(2)}`
    }
  }

  return (
    <StoreContext.Provider value={{ settings, store, refreshSettings: fetchSettings, formatCurrency }}>
      {children}
    </StoreContext.Provider>
  )
}

export function useStore() {
  const context = useContext(StoreContext)
  if (context === undefined) {
    throw new Error('useStore must be used within a StoreProvider')
  }
  return context
}
