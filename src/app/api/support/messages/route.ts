import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { supportMessageSchema } from '@/lib/validations/support'
import { z } from 'zod'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    
    // Validate input with Zod schema
    const validated = supportMessageSchema.parse(body)
    
    // Get storeId from request body (should be provided by client)
    const { storeId } = body
    
    if (!storeId) {
      return NextResponse.json(
        { error: 'Store ID is required' },
        { status: 400 }
      )
    }
    
    // Verify store exists
    const store = await prisma.store.findUnique({
      where: { id: storeId }
    })
    
    if (!store) {
      return NextResponse.json(
        { error: 'Store not found' },
        { status: 404 }
      )
    }
    
    // Create support message record
    const supportMessage = await prisma.supportMessage.create({
      data: {
        name: validated.name,
        email: validated.email,
        subject: validated.subject,
        message: validated.message,
        storeId,
        status: 'UNREAD',
      },
    })
    
    // Return confirmation
    return NextResponse.json(
      {
        id: supportMessage.id,
        status: supportMessage.status,
        createdAt: supportMessage.createdAt,
      },
      { status: 201 }
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }
    
    console.error('Support message creation error:', error)
    return NextResponse.json(
      { error: 'Failed to submit support message' },
      { status: 500 }
    )
  }
}
