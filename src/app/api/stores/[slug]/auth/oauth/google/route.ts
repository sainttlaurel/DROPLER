import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.NEXTAUTH_SECRET || 'your-secret-key'

export async function POST(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { token } = await request.json()
    const { slug } = params

    // Verify the Google token
    const response = await fetch(`https://www.googleapis.com/oauth2/v3/userinfo`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      return NextResponse.json(
        { message: 'Invalid Google token' },
        { status: 401 }
      )
    }

    const googleUser = await response.json()

    // Find the store
    const store = await prisma.store.findUnique({
      where: { slug },
    })

    if (!store) {
      return NextResponse.json(
        { message: 'Store not found' },
        { status: 404 }
      )
    }

    // Check if customer exists
    let customer = await prisma.customer.findUnique({
      where: {
        storeId_email: {
          storeId: store.id,
          email: googleUser.email,
        },
      },
    })

    // Create customer if doesn't exist
    if (!customer) {
      customer = await prisma.customer.create({
        data: {
          email: googleUser.email,
          name: googleUser.name || googleUser.email.split('@')[0],
          password: '', // No password for OAuth customers
          storeId: store.id,
        },
      })
    }

    // Generate JWT token
    const customerToken = jwt.sign(
      { customerId: customer.id, storeId: store.id },
      JWT_SECRET,
      { expiresIn: '7d' }
    )

    return NextResponse.json({
      customer: {
        id: customer.id,
        email: customer.email,
        name: customer.name,
      },
      token: customerToken,
    })
  } catch (error) {
    console.error('Google OAuth error:', error)
    return NextResponse.json(
      { message: 'Authentication failed' },
      { status: 500 }
    )
  }
}
