import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import * as z from 'zod'
import { prisma } from '@/lib/prisma'
import { slugify } from '@/lib/utils'

const registerSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters'),
  email: z.string().trim().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  storeName: z.string().trim().min(2, 'Store name must be at least 2 characters'),
})

export async function POST(req: Request) {
  try {
    const parsed = registerSchema.safeParse(await req.json())

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || 'Invalid registration data' },
        { status: 400 }
      )
    }

    const { name, email, password, storeName } = parsed.data

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

    if (!storeSlug) {
      return NextResponse.json(
        { error: 'Store name must contain letters or numbers' },
        { status: 400 }
      )
    }

    const existingStore = await prisma.store.findUnique({
      where: { slug: storeSlug },
      select: { id: true },
    })

    if (existingStore) {
      return NextResponse.json(
        { error: 'Store URL is already taken' },
        { status: 400 }
      )
    }

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
