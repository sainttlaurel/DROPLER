'use client'

import Link from 'next/link'
import { Order, ORDER_STATUS_CONFIG } from '@/types/customer'
import { Button } from '@/components/ui/Button'
import { formatDate } from '@/lib/utils/formatting'

interface OrderHistoryTableProps {
  orders: Order[]
  slug: string
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}

export function OrderHistoryTable({
  orders,
  slug,
  currentPage,
  totalPages,
  onPageChange,
}: OrderHistoryTableProps) {
  if (orders.length === 0) {
    return (
      <div className="text-center py-16 border-4 border-black bg-white shadow-[4px_4px_0px_0px_#1a1a1a]">
        <p className="font-headline font-black text-6xl mb-4 opacity-10">0</p>
        <p className="font-headline font-black text-xl uppercase tracking-tighter mb-2">
          No orders yet
        </p>
        <p className="font-body text-sm opacity-60 mb-6">
          Your order history will appear here once you make a purchase.
        </p>
        <Link href={`/stores/${slug}`}>
          <Button variant="yellow" size="md">Start Shopping</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Desktop table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full border-4 border-black shadow-[4px_4px_0px_0px_#1a1a1a] bg-white">
          <thead>
            <tr className="border-b-4 border-black bg-black text-white">
              <th className="px-4 py-3 text-left font-headline font-black uppercase text-xs tracking-widest">Order</th>
              <th className="px-4 py-3 text-left font-headline font-black uppercase text-xs tracking-widest">Date</th>
              <th className="px-4 py-3 text-left font-headline font-black uppercase text-xs tracking-widest">Status</th>
              <th className="px-4 py-3 text-left font-headline font-black uppercase text-xs tracking-widest">Items</th>
              <th className="px-4 py-3 text-right font-headline font-black uppercase text-xs tracking-widest">Total</th>
              <th className="px-4 py-3 text-center font-headline font-black uppercase text-xs tracking-widest">Details</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order, i) => {
              const statusConfig = ORDER_STATUS_CONFIG[order.status] ?? { color: 'bg-gray-300 text-black', label: order.status }
              return (
                <tr key={order.id} className={`border-b-2 border-black ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                  <td className="px-4 py-3 font-headline font-bold text-sm">#{order.orderNumber}</td>
                  <td className="px-4 py-3 font-body text-sm">{formatDate(order.createdAt)}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-block px-2 py-1 text-xs font-headline font-black uppercase tracking-wider border-2 border-black ${statusConfig.color}`}>
                      {statusConfig.label}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-body text-sm">{order.items.length} item{order.items.length !== 1 ? 's' : ''}</td>
                  <td className="px-4 py-3 text-right font-headline font-bold text-sm">${order.total.toFixed(2)}</td>
                  <td className="px-4 py-3 text-center">
                    <Link
                      href={`/stores/${slug}/orders/${order.id}`}
                      className="inline-block px-3 py-1 border-2 border-black font-headline font-black uppercase text-xs tracking-tighter shadow-[2px_2px_0px_0px_#1a1a1a] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_0px_#1a1a1a] transition-all bg-white"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden space-y-3">
        {orders.map((order) => {
          const statusConfig = ORDER_STATUS_CONFIG[order.status] ?? { color: 'bg-gray-300 text-black', label: order.status }
          return (
            <Link
              key={order.id}
              href={`/stores/${slug}/orders/${order.id}`}
              className="block border-4 border-black bg-white shadow-[4px_4px_0px_0px_#1a1a1a] p-4 hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_#1a1a1a] transition-all"
            >
              <div className="flex items-start justify-between mb-2">
                <span className="font-headline font-black text-sm">#{order.orderNumber}</span>
                <span className={`inline-block px-2 py-1 text-xs font-headline font-black uppercase tracking-wider border-2 border-black ${statusConfig.color}`}>
                  {statusConfig.label}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="font-body opacity-60">{formatDate(order.createdAt)}</span>
                <span className="font-headline font-bold">${order.total.toFixed(2)}</span>
              </div>
              <p className="font-body text-xs opacity-60 mt-1">{order.items.length} item{order.items.length !== 1 ? 's' : ''}</p>
            </Link>
          )
        })}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-4 border-black bg-white shadow-[4px_4px_0px_0px_#1a1a1a] px-4 py-3">
          <Button variant="ghost" size="sm" onClick={() => onPageChange(currentPage - 1)} disabled={currentPage <= 1}>
            ← Prev
          </Button>
          <span className="font-headline font-black text-sm uppercase tracking-tighter">
            Page {currentPage} of {totalPages}
          </span>
          <Button variant="ghost" size="sm" onClick={() => onPageChange(currentPage + 1)} disabled={currentPage >= totalPages}>
            Next →
          </Button>
        </div>
      )}
    </div>
  )
}
