import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { slugify } from '@/lib/utils'

export async function POST(req: Request) {
  try {
    const { name, email, password, storeName } = await req.json()

    if (!email || !password || !name || !storeName) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 400 }
      )
    }

    const hashedPassword = await bcrypt.hash(password, 10)
    const storeSlug = slugify(storeName)

    // Create user, store, and subscription in one transaction
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        store: {
          create: {
            name: storeName,
            slug: storeSlug,
            subscription: {
              create: {
                plan: 'FREE',
                status: 'ACTIVE',
              },
            },
          },
        },
      },
      include: {
        store: {
          include: {
            subscription: true,
          },
        },
      },
    })

    return NextResponse.json(
      {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    )
  }
}
