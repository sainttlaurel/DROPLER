export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// Validation schema with field length limits
const appearanceSchema = z.object({
  heroHeadline: z.string().max(80, 'Headline must be 80 characters or less').optional(),
  heroSubheadline: z.string().max(100, 'Subheadline must be 100 characters or less').optional(),
  heroDescription: z.string().max(200, 'Description must be 200 characters or less').optional(),
  heroCta1Text: z.string().max(30, 'Button text must be 30 characters or less').optional(),
  heroCta2Text: z.string().max(30, 'Button text must be 30 characters or less').optional(),
  announcementText: z.string().max(100, 'Announcement must be 100 characters or less').optional(),
  announcementEnabled: z.boolean().optional(),
  trustBadge1Title: z.string().max(50, 'Title must be 50 characters or less').optional(),
  trustBadge1Desc: z.string().max(150, 'Description must be 150 characters or less').optional(),
  trustBadge2Title: z.string().max(50, 'Title must be 50 characters or less').optional(),
  trustBadge2Desc: z.string().max(150, 'Description must be 150 characters or less').optional(),
  trustBadge3Title: z.string().max(50, 'Title must be 50 characters or less').optional(),
  trustBadge3Desc: z.string().max(150, 'Description must be 150 characters or less').optional(),
  searchPlaceholder: z.string().max(50, 'Placeholder must be 50 characters or less').optional(),
  metaTitle: z.string().max(60, 'Meta title must be 60 characters or less').optional(),
  metaDescription: z.string().max(160, 'Meta description must be 160 characters or less').optional(),
  ogImageUrl: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  stat1Label: z.string().max(30, 'Label must be 30 characters or less').optional(),
  stat1Value: z.string().max(20, 'Value must be 20 characters or less').optional(),
  stat2Label: z.string().max(30, 'Label must be 30 characters or less').optional(),
  stat2Value: z.string().max(20, 'Value must be 20 characters or less').optional(),
})

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        store: {
          include: {
            theme: true,
          },
        },
      },
    })

    if (!user?.store) {
      return NextResponse.json({ error: 'Store not found' }, { status: 404 })
    }

    return NextResponse.json({ theme: user.store.theme })
  } catch (error) {
    console.error('Error fetching appearance:', error)
    return NextResponse.json({ error: 'Failed to fetch appearance' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { store: true },
    })

    if (!user?.store) {
      return NextResponse.json({ error: 'Store not found' }, { status: 404 })
    }

    const body = await request.json()
    
    // Validate input with Zod
    const validation = appearanceSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.errors },
        { status: 400 }
      )
    }

    const data = validation.data

    // Update or create theme (ownership already verified via user.store)
    const theme = await prisma.storeTheme.upsert({
      where: { storeId: user.store.id },
      update: data,
      create: {
        storeId: user.store.id,
        ...data,
      },
    })

    return NextResponse.json({ theme })
  } catch (error) {
    console.error('Error updating appearance:', error)
    return NextResponse.json({ error: 'Failed to update appearance' }, { status: 500 })
  }
}
