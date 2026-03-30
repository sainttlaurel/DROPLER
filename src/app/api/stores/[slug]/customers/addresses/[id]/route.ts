import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyCustomerToken } from '@/lib/customer-auth'

export async function PUT(
  req: NextRequest,
  { params }: { params: { slug: string; id: string } }
) {
  try {
    const token = req.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = verifyCustomerToken(token)
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const { name, address, city, state, zip, country, phone, isDefault } = await req.json()

    // Verify address belongs to customer
    const existingAddress = await prisma.address.findFirst({
      where: {
        id: params.id,
        customerId: payload.customerId,
      },
    })

    if (!existingAddress) {
      return NextResponse.json({ error: 'Address not found' }, { status: 404 })
    }

    // If setting as default, unset other defaults
    if (isDefault) {
      await prisma.address.updateMany({
        where: {
          customerId: payload.customerId,
          id: { not: params.id },
        },
        data: { isDefault: false },
      })
    }

    // Update address
    const updatedAddress = await prisma.address.update({
      where: { id: params.id },
      data: {
        name,
        address,
        city,
        state,
        zip,
        country,
        phone: phone || null,
        isDefault,
      },
    })

    return NextResponse.json(updatedAddress)
  } catch (error) {
    console.error('Update address error:', error)
    return NextResponse.json(
      { error: 'Failed to update address' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { slug: string; id: string } }
) {
  try {
    const token = req.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = verifyCustomerToken(token)
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    // Verify address belongs to customer
    const existingAddress = await prisma.address.findFirst({
      where: {
        id: params.id,
        customerId: payload.customerId,
      },
    })

    if (!existingAddress) {
      return NextResponse.json({ error: 'Address not found' }, { status: 404 })
    }

    // Delete address
    await prisma.address.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete address error:', error)
    return NextResponse.json(
      { error: 'Failed to delete address' },
      { status: 500 }
    )
  }
}
