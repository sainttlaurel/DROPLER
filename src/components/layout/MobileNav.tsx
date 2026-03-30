'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Icon } from '@/components/ui/Icon'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/dashboard', icon: 'dashboard', label: 'Home' },
  { href: '/dashboard/orders', icon: 'shopping_cart', label: 'Orders' },
  { href: '/dashboard/products/new', icon: 'add', label: 'Add', isSpecial: true },
  { href: '/dashboard/analytics', icon: 'analytics', label: 'Stats' },
  { href: '/dashboard/settings', icon: 'settings', label: 'Setup' },
]

export function MobileNav() {
  const pathname = usePathname()

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t-4 border-[#1a1a1a] flex justify-around items-center h-20 z-50 px-4">
      {navItems.map((item) => {
        const isActive = pathname === item.href || pathname?.startsWith(item.href + '/')

        if (item.isSpecial) {
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col items-center justify-center -mt-10 w-14 h-14 bg-[#ffcc00] border-4 border-[#1a1a1a] shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all"
            >
              <Icon name={item.icon} size="sm" className="font-black" />
            </Link>
          )
        }

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex flex-col items-center justify-center transition-colors px-3 py-2',
              isActive
                ? 'text-[#1a1a1a] bg-[#ffcc00] border-2 border-[#1a1a1a]'
                : 'text-[#1a1a1a] opacity-40 hover:opacity-100'
            )}
          >
            <Icon
              name={item.icon}
              size="sm"
              filled={isActive}
            />
            <span className="text-[10px] font-headline font-black uppercase mt-1">
              {item.label}
            </span>
          </Link>
        )
      })}
    </div>
  )
}
