'use client'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Icon } from '@/components/ui/Icon'
import { CURRENCIES, TIMEZONES } from '@/lib/constants'
import { useStore } from '@/contexts/StoreContext'

interface ToggleProps {
  checked: boolean
  onChange: (v: boolean) => void
  disabled?: boolean
}

function Toggle({ checked, onChange, disabled }: ToggleProps) {
  return (
    <div
      onClick={() => !disabled && onChange(!checked)}
      className={`w-14 h-8 border-2 border-[#1a1a1a] relative cursor-pointer transition-colors ${disabled ? 'opacity-40 cursor-not-allowed' : ''} ${checked ? 'bg-[#0055ff]' : 'bg-[#d6d1c9]'}`}
    >
      <div className={`absolute top-1 w-5 h-5 bg-[#1a1a1a] transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'}`}></div>
    </div>
  )
}

export default function SettingsPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)
  const [storeName, setStoreName] = useState('')
  const [storeSlug, setStoreSlug] = useState('')
  const [currency, setCurrency] = useState('USD')
  const [timezone, setTimezone] = useState('America/New_York')
  const [userName, setUserName] = useState('')
  const [userEmail, setUserEmail] = useState('')
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [orderNotifications, setOrderNotifications] = useState(true)
  const [shippingNotifications, setShippingNotifications] = useState(true)
  const [productNotifications, setProductNotifications] = useState(true)
  const [lowStockAlerts, setLowStockAlerts] = useState(true)
  const [dailySummary, setDailySummary] = useState(false)
  const [weeklySummary, setWeeklySummary] = useState(true)
  const { refreshSettings } = useStore()

  useEffect(() => { fetchSettings() }, [])

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/settings')
      const data = await res.json()
      setStoreName(data.store?.name || '')
      setStoreSlug(data.store?.slug || '')
      setCurrency(data.store?.currency || 'USD')
      setTimezone(data.store?.timezone || 'America/New_York')
      setUserName(data.user?.name || '')
      setUserEmail(data.user?.email || '')
    } catch { toast.error('Failed to load settings') }
    finally { setLoading(false) }
  }

  const markChanged = () => setHasChanges(true)

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          storeName, currency, timezone, userName,
          emailNotifications, orderNotifications, shippingNotifications,
          productNotifications, lowStockAlerts, dailySummary, weeklySummary,
        }),
      })
      if (res.ok) {
        toast.success('Settings saved successfully!')
        await refreshSettings()
        setHasChanges(false)
      } else {
        toast.error('Failed to save settings')
      }
    } catch { toast.error('Failed to save settings') }
    finally { setSaving(false) }
  }

  const inputClass = "w-full bg-white border-2 border-[#1a1a1a] p-4 font-headline font-bold focus:bg-[#ffcc00] focus:outline-none transition-colors"
  const labelClass = "font-headline font-bold uppercase tracking-tight text-sm"

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Icon name="refresh" size="xl" className="animate-spin" />
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      {/* Page Header */}
      <div className="space-y-2 mb-12">
        <h2 className="text-6xl font-black font-headline tracking-tighter uppercase leading-none">Settings</h2>
        <p className="text-lg font-medium opacity-70 max-w-2xl">Configure your store's fundamental identity and operational rules. Changes are global and reflect immediately.</p>
      </div>

      {/* Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pb-32">
        {/* Store Identity */}
        <div className="md:col-span-8 bg-[#eee9e0] border-4 border-[#1a1a1a] p-8 shadow-[8px_8px_0px_0px_rgba(26,26,26,1)]">
          <div className="flex items-center gap-3 mb-8">
            <Icon name="storefront" className="text-3xl" />
            <h3 className="text-3xl font-headline font-black uppercase">Store Identity</h3>
          </div>
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className={labelClass}>Store Name</label>
                <input type="text" value={storeName} onChange={(e) => { setStoreName(e.target.value); markChanged() }} placeholder="My Awesome Store" className={inputClass} />
              </div>
              <div className="space-y-2">
                <label className={labelClass}>Store Slug</label>
                <div className="flex items-center border-2 border-[#1a1a1a] bg-white overflow-hidden">
                  <span className="px-3 py-4 bg-[#d6d1c9] font-headline text-xs border-r-2 border-[#1a1a1a] opacity-70 whitespace-nowrap">dropler.io/</span>
                  <input type="text" value={storeSlug} onChange={(e) => { setStoreSlug(e.target.value); markChanged() }} className="flex-1 p-4 font-headline font-bold focus:bg-[#ffcc00] focus:outline-none transition-colors" />
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className={labelClass}>Primary Currency</label>
                <select value={currency} onChange={(e) => { setCurrency(e.target.value); markChanged() }} className={`${inputClass} appearance-none cursor-pointer`}>
                  {CURRENCIES.map((curr) => (
                    <option key={curr.code} value={curr.code}>{curr.symbol} {curr.code} - {curr.name}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className={labelClass}>Timezone</label>
                <select value={timezone} onChange={(e) => { setTimezone(e.target.value); markChanged() }} className={`${inputClass} appearance-none cursor-pointer`}>
                  {TIMEZONES.map((tz) => (
                    <option key={tz.value} value={tz.value}>{tz.label}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className={labelClass}>Your Name</label>
                <input type="text" value={userName} onChange={(e) => { setUserName(e.target.value); markChanged() }} placeholder="John Doe" className={inputClass} />
              </div>
              <div className="space-y-2">
                <label className={labelClass}>Email (Read Only)</label>
                <input type="email" value={userEmail} disabled className="w-full bg-[#d6d1c9] border-2 border-[#1a1a1a] p-4 font-headline font-bold opacity-60 cursor-not-allowed" />
              </div>
            </div>
          </div>
        </div>

        {/* Store Status */}
        <div className="md:col-span-4 flex flex-col gap-8">
          <div className="bg-[#ffcc00] border-4 border-[#1a1a1a] p-8 shadow-[8px_8px_0px_0px_rgba(26,26,26,1)] h-full">
            <h3 className="text-2xl font-headline font-black uppercase mb-4">Store Status</h3>
            <div className="flex items-center gap-4 mb-6">
              <div className="w-4 h-4 rounded-full bg-[#1a1a1a] animate-pulse"></div>
              <span className="font-headline font-bold text-xl uppercase">Live & Online</span>
            </div>
            <p className="font-medium text-sm leading-tight mb-8">All systems functional. Global checkout is active for all territories.</p>
            <button className="w-full bg-white text-[#1a1a1a] border-2 border-[#1a1a1a] p-3 font-headline font-bold uppercase hover:bg-[#1a1a1a] hover:text-white transition-all">
              Maintenance Mode
            </button>
          </div>
        </div>

        {/* Notifications */}
        <div className="md:col-span-12 lg:col-span-7 bg-[#eee9e0] border-4 border-[#1a1a1a] p-8 shadow-[8px_8px_0px_0px_rgba(26,26,26,1)]">
          <div className="flex items-center gap-3 mb-8">
            <Icon name="notifications_active" className="text-3xl" />
            <h3 className="text-3xl font-headline font-black uppercase">Notifications</h3>
          </div>
          <div className="space-y-0">
            {/* Master Toggle */}
            <div className="flex items-center justify-between p-4 border-b-2 border-[#1a1a1a]/20 bg-white border-2 border-[#1a1a1a] mb-4">
              <div>
                <h4 className="font-headline font-bold uppercase">Master Email Notifications</h4>
                <p className="text-sm opacity-70">Turn off to disable all email notifications</p>
              </div>
              <Toggle checked={emailNotifications} onChange={(v) => { setEmailNotifications(v); markChanged() }} />
            </div>

            {[
              { label: 'Order Updates', desc: 'Get notified when a new order is placed or fulfilled.', checked: orderNotifications, onChange: setOrderNotifications },
              { label: 'Inventory Alerts', desc: 'Low stock warnings and out-of-stock notifications.', checked: lowStockAlerts, onChange: setLowStockAlerts },
              { label: 'Shipping Updates', desc: 'Notify customers when orders ship.', checked: shippingNotifications, onChange: setShippingNotifications },
              { label: 'Product Updates', desc: 'Alert when products are added/updated.', checked: productNotifications, onChange: setProductNotifications },
              { label: 'Daily Summary', desc: 'Daily report of sales and orders.', checked: dailySummary, onChange: setDailySummary },
              { label: 'Weekly Summary', desc: 'Weekly performance report.', checked: weeklySummary, onChange: setWeeklySummary },
            ].map(({ label, desc, checked, onChange }) => (
              <div key={label} className="flex items-center justify-between p-4 border-b-2 border-[#1a1a1a]/20">
                <div>
                  <h4 className="font-headline font-bold uppercase">{label}</h4>
                  <p className="text-sm opacity-70">{desc}</p>
                </div>
                <Toggle checked={checked} onChange={(v) => { onChange(v); markChanged() }} disabled={!emailNotifications} />
              </div>
            ))}
          </div>
        </div>

        {/* Danger Zone */}
        <div className="md:col-span-12 border-4 border-[#e63b2e] bg-[#ffdad6] p-8 shadow-[8px_8px_0px_0px_rgba(230,59,46,1)]">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <h3 className="text-3xl font-headline font-black uppercase text-[#e63b2e]">Danger Zone</h3>
              <p className="font-medium text-[#93000a] max-w-xl">Once you delete a store, there is no going back. All products, order history, and customer data will be permanently wiped from our servers.</p>
            </div>
            <button className="bg-[#e63b2e] text-white border-2 border-[#1a1a1a] font-headline uppercase font-bold px-8 py-4 shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] hover:bg-white hover:text-[#e63b2e] transition-all active:shadow-none active:translate-x-1 active:translate-y-1 shrink-0">
              Delete Store Permanently
            </button>
          </div>
        </div>
      </div>

      {/* Sticky Save Bar */}
      {hasChanges && (
        <div className="fixed bottom-0 left-0 md:left-64 right-0 bg-[#f5f0e8]/90 backdrop-blur-sm border-t-4 border-[#1a1a1a] p-4 flex justify-between items-center px-8 z-30">
          <div className="flex items-center gap-2">
            <Icon name="info" className="text-[#0055ff]" size="sm" />
            <span className="font-headline font-bold text-sm uppercase">Unsaved Changes Detected</span>
          </div>
          <div className="flex gap-4">
            <button onClick={() => { fetchSettings(); setHasChanges(false) }} className="px-6 py-2 font-headline font-bold uppercase border-2 border-[#1a1a1a] hover:bg-[#d6d1c9] transition-colors">
              Discard
            </button>
            <button onClick={handleSave} disabled={saving} className="px-10 py-2 font-headline font-bold uppercase bg-[#ffcc00] border-2 border-[#1a1a1a] shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] active:shadow-none active:translate-x-1 active:translate-y-1 transition-all disabled:opacity-50">
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}
