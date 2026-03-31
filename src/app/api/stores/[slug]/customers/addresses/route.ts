import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyCustomerToken } from '@/lib/customer-auth'

export async function GET(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const token = req.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = await verifyCustomerToken(token)
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const addresses = await prisma.address.findMany({
      where: { customerId: payload.id as string },
      orderBy: [
        { isDefault: 'desc' },
        { createdAt: 'desc' },
      ],
    })

    return NextResponse.json(addresses)
  } catch (error) {
    console.error('Fetch addresses error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch addresses' },
      { status: 500 }
    )
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const token = req.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = await verifyCustomerToken(token)
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const { name, address, city, state, zip, country, phone, isDefault } = await req.json()

    if (isDefault) {
      await prisma.address.updateMany({
        where: { customerId: payload.id as string },
        data: { isDefault: false },
      })
    }

    const newAddress = await prisma.address.create({
      data: {
        customerId: payload.id as string,
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

    return NextResponse.json(newAddress)
  } catch (error) {
    console.error('Create address error:', error)
    return NextResponse.json(
      { error: 'Failed to create address' },
      { status: 500 }
    )
  }
}