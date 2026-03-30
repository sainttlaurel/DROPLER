import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { searchParams } = new URL(req.url)
    const page = searchParams.get('page') // 'privacy' or 'terms'

    // Get store with legal pages
    const store = await prisma.store.findUnique({
      where: { slug: params.slug },
      include: { legalPages: true },
    })

    if (!store) {
      return NextResponse.json({ error: 'Store not found' }, { status: 404 })
    }

    const content = page === 'privacy'
      ? store.legalPages?.privacyPolicy
      : store.legalPages?.termsOfService

    return NextResponse.json({
      content: content || null,
      storeName: store.name,
    })
  } catch (error) {
    console.error('Legal page fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch legal page' },
      { status: 500 }
    )
  }
}
