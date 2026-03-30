'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { Icon } from '@/components/ui/Icon'

interface Notification {
  id: string
  type: 'order' | 'stock' | 'customer'
  title: string
  body: string
  createdAt: string
  href: string
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

const NOTIF_ICON: Record<string, { icon: string; color: string }> = {
  order:    { icon: 'shopping_cart', color: 'bg-[#ffcc00] text-[#1a1a1a]' },
  stock:    { icon: 'inventory_2',   color: 'bg-[#e63b2e] text-white' },
  customer: { icon: 'person',        color: 'bg-[#0055ff] text-white' },
}

export function DashboardTopNav() {
  const { data: session } = useSession()
  const [storeSlug, setStoreSlug] = useState<string | null>(null)
  const [showNotifications, setShowNotifications] = useState(false)
  const [showProfile, setShowProfile] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const notifRef = useRef<HTMLDivElement>(null)
  const profileRef = useRef<HTMLDivElement>(null)

  const loadNotifications = useCallback(async () => {
    try {
      const res = await fetch('/api/notifications')
      if (res.ok) setNotifications(await res.json())
    } catch {}
  }, [])

  useEffect(() => {
    if (!session?.user?.storeId) return
    fetch('/api/settings')
      .then(r => r.json())
      .then(data => { if (data?.store?.slug) setStoreSlug(data.store.slug) })
      .catch(() => {})
    loadNotifications()
    // Refresh every 60s
    const t = setInterval(loadNotifications, 60_000)
    return () => clearInterval(t)
  }, [session?.user?.storeId, loadNotifications])

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setShowNotifications(false)
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setShowProfile(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#f5f0e8] border-b-4 border-[#1a1a1a] flex justify-between items-center px-6 h-20">
      {/* Left: Logo + Search */}
      <div className="flex items-center gap-6 flex-1">
        <Link href="/dashboard" className="font-black font-headline uppercase tracking-tighter text-[#1a1a1a] text-xl hover:text-[#0055ff] transition-colors shrink-0 w-52 hidden md:block">
          DROPLER
        </Link>
        <div className="hidden md:flex items-center bg-white border-2 border-[#1a1a1a] px-3 py-2 shadow-[2px_2px_0px_0px_rgba(26,26,26,1)] max-w-xs w-full">
          <Icon name="search" className="text-[#1a1a1a] mr-2 opacity-60" size="sm" />
          <input
            className="bg-transparent border-none focus:ring-0 text-sm font-headline font-bold uppercase placeholder:opacity-40 placeholder:normal-case focus:outline-none w-full"
            placeholder="Search orders..."
            type="text"
          />
        </div>
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-2">
        {storeSlug && (
          <Link
            href={`/stores/${storeSlug}`}
            target="_blank"
            className="hidden md:flex items-center gap-2 font-headline font-bold uppercase tracking-tighter text-[#1a1a1a] hover:bg-[#0055ff] hover:text-white transition-colors px-3 py-2 border-2 border-[#1a1a1a] text-sm"
          >
            <Icon name="open_in_new" size="sm" />
            View Store
          </Link>
        )}

        {/* Notifications */}
        <div ref={notifRef} className="relative">
          <button
            onClick={() => { setShowNotifications(!showNotifications); setShowProfile(false) }}
            className="p-2 border-2 border-[#1a1a1a] hover:bg-[#ffcc00] transition-all relative"
          >
            <Icon name="notifications" size="sm" />
            {notifications.length > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#e63b2e] border-2 border-[#1a1a1a] text-white font-headline font-black text-[9px] flex items-center justify-center">
                {notifications.length > 9 ? '9+' : notifications.length}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 top-full mt-2 w-80 bg-white border-4 border-[#1a1a1a] shadow-[6px_6px_0px_0px_rgba(26,26,26,1)] z-50">
              <div className="bg-[#1a1a1a] text-white px-4 py-3 font-headline font-black uppercase text-sm">
                Notifications
              </div>
              {notifications.length === 0 ? (
                <div className="p-6 text-center font-headline font-bold uppercase text-xs opacity-40">
                  All clear — no alerts
                </div>
              ) : (
                notifications.slice(0, 5).map(n => {
                  const cfg = NOTIF_ICON[n.type] ?? NOTIF_ICON.order
                  return (
                    <Link key={n.id} href={n.href} onClick={() => setShowNotifications(false)}>
                      <div className="flex items-start gap-3 p-4 border-b-2 border-[#1a1a1a]/10 hover:bg-[#f5f0e8] cursor-pointer transition-colors">
                        <div className={`w-8 h-8 border-2 border-[#1a1a1a] flex items-center justify-center shrink-0 ${cfg.color}`}>
                          <Icon name={cfg.icon} size="sm" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-headline font-bold text-sm uppercase leading-tight">{n.title}</p>
                          <p className="font-body text-xs opacity-60 truncate">{n.body}</p>
                          <p className="font-body text-[10px] opacity-40 mt-0.5">{timeAgo(n.createdAt)}</p>
                        </div>
                      </div>
                    </Link>
                  )
                })
              )}
              <Link href="/dashboard/orders" onClick={() => setShowNotifications(false)}>
                <div className="p-3 text-center font-headline font-black uppercase text-xs hover:bg-[#ffcc00] transition-colors cursor-pointer border-t-2 border-[#1a1a1a]">
                  View All
                </div>
              </Link>
            </div>
          )}
        </div>

        {/* Help */}
        <Link href="/dashboard/support">
          <button className="p-2 border-2 border-[#1a1a1a] hover:bg-[#ffcc00] transition-all">
            <Icon name="help" size="sm" />
          </button>
        </Link>

        {/* Profile */}
        <div ref={profileRef} className="relative">
          <button
            onClick={() => { setShowProfile(!showProfile); setShowNotifications(false) }}
            className="w-10 h-10 border-2 border-[#1a1a1a] overflow-hidden cursor-pointer hover:border-[#0055ff] transition-colors shadow-[2px_2px_0px_0px_rgba(26,26,26,1)]"
          >
            <div className="w-full h-full bg-[#ffcc00] flex items-center justify-center font-headline font-black text-lg text-[#1a1a1a]">
              {session?.user?.name?.[0]?.toUpperCase() || 'U'}
            </div>
          </button>

          {showProfile && (
            <div className="absolute right-0 top-full mt-2 w-56 bg-white border-4 border-[#1a1a1a] shadow-[6px_6px_0px_0px_rgba(26,26,26,1)] z-50">
              <div className="bg-[#ffcc00] px-4 py-3 border-b-4 border-[#1a1a1a]">
                <p className="font-headline font-black uppercase text-sm">{session?.user?.name || 'Admin'}</p>
                <p className="font-body text-xs opacity-70 truncate">{session?.user?.email}</p>
              </div>
              <Link href="/dashboard/settings">
                <div className="flex items-center gap-3 px-4 py-3 hover:bg-[#f5f0e8] cursor-pointer border-b-2 border-[#1a1a1a]/10 font-headline font-bold uppercase text-sm transition-colors">
                  <Icon name="settings" size="sm" />
                  Settings
                </div>
              </Link>
              <Link href="/dashboard/billing">
                <div className="flex items-center gap-3 px-4 py-3 hover:bg-[#f5f0e8] cursor-pointer border-b-2 border-[#1a1a1a]/10 font-headline font-bold uppercase text-sm transition-colors">
                  <Icon name="payments" size="sm" />
                  Billing
                </div>
              </Link>
              {storeSlug && (
                <Link href={`/stores/${storeSlug}`} target="_blank">
                  <div className="flex items-center gap-3 px-4 py-3 hover:bg-[#f5f0e8] cursor-pointer border-b-2 border-[#1a1a1a]/10 font-headline font-bold uppercase text-sm transition-colors">
                    <Icon name="store" size="sm" />
                    View Store
                  </div>
                </Link>
              )}
              <button
                onClick={() => signOut()}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[#e63b2e] hover:text-white cursor-pointer font-headline font-bold uppercase text-sm text-[#e63b2e] transition-colors"
              >
                <Icon name="logout" size="sm" />
                Log Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
