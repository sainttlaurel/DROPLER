export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import * as z from 'zod'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { CURRENCIES, TIMEZONES } from '@/lib/constants'

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

const settingsSchema = z.object({
  storeName: z.string().trim().min(2, 'Store name must be at least 2 characters').optional(),
  currency: z.enum(CURRENCIES.map(({ code }) => code) as [string, ...string[]]).optional(),
  timezone: z.enum(TIMEZONES.map(({ value }) => value) as [string, ...string[]]).optional(),
  userName: z.string().trim().min(2, 'User name must be at least 2 characters').optional(),
})

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const parsed = settingsSchema.safeParse(await request.json())

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || 'Invalid settings payload' },
        { status: 400 }
      )
    }

    const { storeName, currency, timezone, userName } = parsed.data

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
