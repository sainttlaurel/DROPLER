import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashPassword, createCustomerToken } from '@/lib/customer-auth'
import { customerRegistrationSchema } from '@/lib/validations/auth'
import { ZodError } from 'zod'

export async function POST(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const body = await req.json()

    // Validate input with Zod schema
    const validated = customerRegistrationSchema.parse(body)

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

    // Check if customer already exists for this store
    const existingCustomer = await prisma.customer.findUnique({
      where: {
        storeId_email: {
          storeId: store.id,
          email: validated.email.toLowerCase(),
        },
      },
    })

    if (existingCustomer) {
      return NextResponse.json(
        { message: 'Email already registered for this store' },
        { status: 409 }
      )
    }

    // Hash password with bcrypt (10 rounds)
    const hashedPassword = await hashPassword(validated.password)

    // Create customer record in database
    const customer = await prisma.customer.create({
      data: {
        name: validated.name,
        email: validated.email.toLowerCase(),
        password: hashedPassword,
        storeId: store.id,
      },
    })

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

    console.error('Customer registration error:', error)
    return NextResponse.json(
      { message: 'Registration failed' },
      { status: 500 }
    )
  }
}
