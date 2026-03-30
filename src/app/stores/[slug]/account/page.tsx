'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { StorefrontLayout } from '@/components/layout/StorefrontLayout'
import { OrderHistoryTable } from '@/components/account/OrderHistoryTable'
import { EditProfileForm } from '@/components/account/EditProfileForm'
import { ChangePasswordForm } from '@/components/account/ChangePasswordForm'
import { Button } from '@/components/ui/Button'
import { Order, Customer } from '@/types/customer'

interface CustomerPayload {
  id: string
  email: string
  name: string
  storeId: string
  role: string
}

export default function CustomerAccountPage() {
  const params = useParams()
  const router = useRouter()
  const slug = params.slug as string

  const [customer, setCustomer] = useState<CustomerPayload | null>(null)
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [ordersLoading, setOrdersLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [showEditProfile, setShowEditProfile] = useState(false)
  const [showChangePassword, setShowChangePassword] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem(`customer_token_${slug}`)
    if (!token) {
      router.push(`/stores/${slug}/auth`)
      return
    }

    try {
      const payload = JSON.parse(atob(token.split('.')[1])) as CustomerPayload
      setCustomer(payload)
    } catch {
      localStorage.removeItem(`customer_token_${slug}`)
      router.push(`/stores/${slug}/auth`)
      return
    }

    setLoading(false)
  }, [slug, router])

  useEffect(() => {
    if (customer) {
      fetchOrders(currentPage)
    }
  }, [customer, currentPage])

  const fetchOrders = async (page: number) => {
    setOrdersLoading(true)
    try {
      const token = localStorage.getItem(`customer_token_${slug}`)
      const res = await fetch(`/api/orders?page=${page}&limit=10`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) throw new Error('Failed to fetch orders')
      const data = await res.json()
      setOrders(data.orders ?? [])
      setTotalPages(data.totalPages ?? 1)
    } catch {
      toast.error('Failed to load orders. Please try again.')
    } finally {
      setOrdersLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem(`customer_token_${slug}`)
    router.push(`/stores/${slug}/auth`)
    toast.success('Logged out successfully.')
  }

  if (loading) {
    return (
      <StorefrontLayout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="border-4 border-black bg-white shadow-[4px_4px_0px_0px_#1a1a1a] p-12 text-center">
            <div className="w-12 h-12 border-4 border-black border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="font-headline font-black uppercase tracking-tighter">Loading…</p>
          </div>
        </div>
      </StorefrontLayout>
    )
  }

  if (!customer) return null

  const customerForForm: Customer = {
    id: customer.id,
    email: customer.email,
    name: customer.name,
    storeId: customer.storeId,
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  return (
    <StorefrontLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <header className="mb-10">
          <h1 className="font-headline font-black uppercase tracking-tighter text-5xl sm:text-7xl leading-none mb-2">
            My Account
          </h1>
          <p className="font-headline font-medium text-lg sm:text-xl">
            Welcome back, {customer.name}
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Profile sidebar */}
          <aside className="lg:col-span-4 space-y-6">
            <div className="border-4 border-black bg-white shadow-[4px_4px_0px_0px_#1a1a1a] p-6">
              <h2 className="font-headline font-black uppercase text-xl tracking-tighter border-b-4 border-black pb-3 mb-5">
                Profile
              </h2>
              <div className="space-y-4 mb-6">
                <div>
                  <p className="font-headline font-bold text-xs uppercase opacity-60 mb-1">Name</p>
                  <p className="font-headline font-bold text-base">{customer.name}</p>
                </div>
                <div>
                  <p className="font-headline font-bold text-xs uppercase opacity-60 mb-1">Email</p>
                  <p className="font-headline font-bold text-base break-all">{customer.email}</p>
                </div>
              </div>
              <div className="space-y-3">
                <Button
                  variant="secondary"
                  size="md"
                  className="w-full"
                  onClick={() => { setShowEditProfile(!showEditProfile); setShowChangePassword(false) }}
                >
                  {showEditProfile ? 'Cancel Edit' : 'Edit Profile'}
                </Button>
                <Button
                  variant="ghost"
                  size="md"
                  className="w-full"
                  onClick={() => { setShowChangePassword(!showChangePassword); setShowEditProfile(false) }}
                >
                  {showChangePassword ? 'Cancel' : 'Change Password'}
                </Button>
                <Button variant="ghost" size="md" className="w-full" onClick={handleLogout}>
                  Logout
                </Button>
              </div>
            </div>

            {showEditProfile && (
              <EditProfileForm customer={customerForForm} slug={slug} onSuccess={() => setShowEditProfile(false)} />
            )}
            {showChangePassword && (
              <ChangePasswordForm slug={slug} />
            )}
          </aside>

          {/* Order history */}
          <section className="lg:col-span-8">
            <div className="border-4 border-black bg-white shadow-[4px_4px_0px_0px_#1a1a1a] p-6">
              <h2 className="font-headline font-black uppercase text-xl tracking-tighter border-b-4 border-black pb-3 mb-5">
                Order History
              </h2>
              {ordersLoading ? (
                <div className="py-16 flex flex-col items-center gap-4">
                  <div className="w-10 h-10 border-4 border-black border-t-transparent rounded-full animate-spin" />
                  <p className="font-headline font-black uppercase text-sm tracking-tighter opacity-60">Loading orders…</p>
                </div>
              ) : (
                <OrderHistoryTable
                  orders={orders}
                  slug={slug}
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                />
              )}
            </div>
          </section>
        </div>
      </div>
    </StorefrontLayout>
  )
}
