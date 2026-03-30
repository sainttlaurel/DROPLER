import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyPassword, createCustomerToken } from '@/lib/customer-auth'
import { customerLoginSchema } from '@/lib/validations/auth'
import { ZodError } from 'zod'

export async function POST(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const body = await req.json()

    // Validate input with Zod schema
    const validated = customerLoginSchema.parse(body)

    // Get store by slug
    const store = await prisma.store.findUnique({
      where: { slug: params.slug },
    })

    if (!store) {
      return NextResponse.json(
        { message: 'Store not found' },
        { status: 404 }
      )
    }

    // Find customer by email and storeId
    const customer = await prisma.customer.findUnique({
      where: {
        storeId_email: {
          storeId: store.id,
          email: validated.email.toLowerCase(),
        },
      },
    })

    if (!customer) {
      return NextResponse.json(
        { message: 'Invalid email or password' },
        { status: 401 }
      )
    }

    // Verify password using bcrypt.compare
    const isValid = await verifyPassword(validated.password, customer.password)

    if (!isValid) {
      return NextResponse.json(
        { message: 'Invalid email or password' },
        { status: 401 }
      )
    }

    // Create JWT token
    const token = await createCustomerToken({
      id: customer.id,
      email: customer.email,
      name: customer.name,
      storeId: customer.storeId,
    })

    // Return customer data (without password)
    const { password: _, ...customerData } = customer

    return NextResponse.json({
      customer: customerData,
      token,
    })
  } catch (error) {
    // Handle Zod validation errors
    if (error instanceof ZodError) {
      return NextResponse.json(
        { 
          message: 'Validation failed',
          errors: error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message
          }))
        },
        { status: 400 }
      )
    }

    console.error('Customer login error:', error)
    return NextResponse.json(
      { message: 'Login failed' },
      { status: 500 }
    )
  }
}
