export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const [store, user] = await Promise.all([
      session.user.storeId
        ? prisma.store.findUnique({
            where: { id: session.user.storeId },
            include: { subscription: true },
          })
        : null,
      prisma.user.findUnique({ where: { id: session.user.id } }),
    ])

    return NextResponse.json({ store, user })
  } catch (error) {
    console.error('Settings fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { storeName, currency, timezone, userName } = body

    // Update store settings
    if (session.user.storeId) {
      await prisma.store.update({
        where: { id: session.user.storeId },
        data: {
          name: storeName,
          currency,
          timezone,
        },
      })
    }

    // Update user profile
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name: userName,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Settings update error:', error)
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 })
  }
}
