import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyCustomerToken } from '@/lib/customer-auth'

export async function PATCH(
  req: NextRequest,
  { params }: { params: { slug: string; id: string } }
) {
  try {
    const token = req.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

<<<<<<< HEAD
    const payload = await verifyCustomerToken(token)  // ← added await
=======
    const payload = await verifyCustomerToken(token)
>>>>>>> 6a6c34fd8f5f3ed2686fd8015e88714e83e678b0
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    // Verify address belongs to customer
    const existingAddress = await prisma.address.findFirst({
      where: {
        id: params.id,
        customerId: payload.id as string,
      },
    })

    if (!existingAddress) {
      return NextResponse.json({ error: 'Address not found' }, { status: 404 })
    }

    // Unset all other defaults
    await prisma.address.updateMany({
      where: { customerId: payload.id as string },
      data: { isDefault: false },
    })

    // Set this as default
    const updatedAddress = await prisma.address.update({
      where: { id: params.id },
      data: { isDefault: true },
    })

    return NextResponse.json(updatedAddress)
  } catch (error) {
    console.error('Set default address error:', error)
    return NextResponse.json(
      { error: 'Failed to set default address' },
      { status: 500 }
    )
  }
}