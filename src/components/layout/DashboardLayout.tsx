'use client'

import { DashboardTopNav } from './DashboardTopNav'
import { SideNav } from './SideNav'
import { MobileNav } from './MobileNav'

interface DashboardLayoutProps {
  children: React.ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top nav spans full width */}
      <DashboardTopNav />

      {/* Below top nav: sidebar + content side by side */}
      <div className="flex flex-1 pt-20">
        <SideNav />
        <main className="flex-1 md:ml-64 min-h-screen p-6 lg:p-8">
          {children}
        </main>
      </div>

      <MobileNav />
    </div>
  )
}
