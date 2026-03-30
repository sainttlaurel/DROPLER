import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's store
    const store = await prisma.store.findUnique({
      where: { userId: session.user.id },
      include: { legalPages: true },
    })

    if (!store) {
      return NextResponse.json({ error: 'Store not found' }, { status: 404 })
    }

    return NextResponse.json({
      privacyPolicy: store.legalPages?.privacyPolicy || '',
      termsOfService: store.legalPages?.termsOfService || '',
      storeSlug: store.slug,
    })
  } catch (error) {
    console.error('Legal pages fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch legal pages' },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { privacyPolicy, termsOfService } = await req.json()

    // Get user's store
    const store = await prisma.store.findUnique({
      where: { userId: session.user.id },
    })

    if (!store) {
      return NextResponse.json({ error: 'Store not found' }, { status: 404 })
    }

    // Upsert legal pages
    const legalPages = await prisma.legalPage.upsert({
      where: { storeId: store.id },
      update: {
        privacyPolicy: privacyPolicy || '',
        termsOfService: termsOfService || '',
      },
      create: {
        storeId: store.id,
        privacyPolicy: privacyPolicy || '',
        termsOfService: termsOfService || '',
      },
    })

    return NextResponse.json(legalPages)
  } catch (error) {
    console.error('Legal pages update error:', error)
    return NextResponse.json(
      { error: 'Failed to update legal pages' },
      { status: 500 }
    )
  }
}
