'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Icon } from '@/components/ui/Icon'
import { cn } from '@/lib/utils'
import { signOut } from 'next-auth/react'

const navItems = [
  { href: '/dashboard', icon: 'dashboard', label: 'Dashboard' },
  { href: '/dashboard/products', icon: 'inventory_2', label: 'Products' },
  { href: '/dashboard/orders', icon: 'shopping_cart', label: 'Orders' },
  { href: '/dashboard/analytics', icon: 'analytics', label: 'Analytics' },
  { href: '/dashboard/categories', icon: 'category', label: 'Categories' },
  { href: '/dashboard/suppliers', icon: 'local_shipping', label: 'Suppliers' },
  { href: '/dashboard/appearance', icon: 'palette', label: 'Appearance' },
  { href: '/dashboard/settings', icon: 'settings', label: 'Settings' },
]

export function SideNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed left-0 top-20 h-[calc(100vh-5rem)] w-64 bg-background border-r-4 border-[#1a1a1a] flex flex-col z-40 hidden md:flex">
      {/* Admin label */}
      <div className="px-6 py-4 border-b-4 border-[#1a1a1a] shrink-0">
        <p className="text-sm font-black font-headline uppercase tracking-tighter text-[#1a1a1a]">
          DROPLER ADMIN
        </p>
        <p className="text-[10px] font-bold uppercase tracking-widest opacity-60">
          DROPSHIPPING HUB
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(item.href + '/')

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-4 py-3 font-headline font-bold uppercase tracking-tighter transition-all duration-75 active:translate-x-1 active:translate-y-1',
                isActive
                  ? 'bg-[#ffcc00] text-[#1a1a1a] border-2 border-[#1a1a1a] -ml-2 mr-2 shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] active:shadow-none'
                  : 'text-[#1a1a1a] hover:bg-[#0055ff] hover:text-white'
              )}
            >
              <Icon name={item.icon} size="sm" />
              <span>{item.label}</span>
            </Link>
          )
        })}
      </div>

      <div className="shrink-0 p-4 border-t-4 border-[#1a1a1a] flex flex-col gap-2">
        <Link href="/dashboard/products/new">
          <button className="w-full bg-[#1a1a1a] text-white font-headline font-bold uppercase py-3 border-2 border-[#1a1a1a] hover:bg-[#ffcc00] hover:text-[#1a1a1a] transition-all mb-4 shadow-[4px_4px_0px_0px_rgba(255,204,0,1)] active:translate-x-1 active:translate-y-1 active:shadow-none">
            + Add Product
          </button>
        </Link>

        <Link
          href="/dashboard/support"
          className="flex items-center gap-3 px-4 py-2 text-xs font-headline font-bold uppercase text-[#1a1a1a] hover:text-[#0055ff] transition-colors"
        >
          <Icon name="contact_support" size="sm" />
          <span>Support</span>
        </Link>

        <button
          onClick={() => signOut()}
          className="flex items-center gap-3 px-4 py-2 text-xs font-headline font-bold uppercase text-[#e63b2e] hover:bg-[#e63b2e] hover:text-white transition-colors w-full"
        >
          <Icon name="logout" size="sm" />
          <span>Log Out</span>
        </button>
      </div>
    </nav>
  )
}
