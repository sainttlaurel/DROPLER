export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { status, reply } = body

    if (status && !['READ', 'RESOLVED'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    }

    // Get user's store
    const store = await prisma.store.findUnique({
      where: { userId: session.user.id },
    })

    if (!store) {
      return NextResponse.json({ error: 'Store not found' }, { status: 404 })
    }

    // Prepare update data
    const updateData: any = {}
    if (status) updateData.status = status
    if (reply !== undefined) {
      updateData.reply = reply
      updateData.repliedAt = new Date()
    }

    // Update message
    const message = await prisma.supportMessage.update({
      where: {
        id: params.id,
        storeId: store.id, // Ensure message belongs to this store
      },
      data: updateData,
    })

    return NextResponse.json(message)
  } catch (error) {
    console.error('Support message update error:', error)
    return NextResponse.json(
      { error: 'Failed to update message' },
      { status: 500 }
    )
  }
}
