import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET — customer fetches their own messages by email
export async function GET(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const email = req.nextUrl.searchParams.get('email')
    if (!email) return NextResponse.json({ error: 'Email required' }, { status: 400 })

    const store = await prisma.store.findUnique({ where: { slug: params.slug } })
    if (!store) return NextResponse.json({ error: 'Store not found' }, { status: 404 })

    const messages = await prisma.supportMessage.findMany({
      where: { storeId: store.id, email },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        subject: true,
        message: true,
        status: true,
        reply: true,
        repliedAt: true,
        createdAt: true,
      },
    })

    return NextResponse.json(messages)
  } catch (error) {
    console.error('Support GET error:', error)
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 })
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { name, email, subject, message } = await req.json()

    // Validate input
    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      )
    }

    // Get store
    const store = await prisma.store.findUnique({
      where: { slug: params.slug },
      include: {
        user: {
          select: {
            email: true,
            name: true,
          },
        },
      },
    })

    if (!store) {
      return NextResponse.json(
        { error: 'Store not found' },
        { status: 404 }
      )
    }

    // Create support message
    await prisma.supportMessage.create({
      data: {
        name,
        email,
        subject,
        message,
        storeId: store.id,
      },
    })

    // TODO: In production, also send email to store owner
    // await sendEmail({
    //   to: store.user.email,
    //   subject: `Support Request: ${subject}`,
    //   body: `You have a new support message from ${name} (${email}):\n\n${message}`
    // })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Support message error:', error)
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    )
  }
}
