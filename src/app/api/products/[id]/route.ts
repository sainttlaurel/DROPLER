export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.storeId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const product = await prisma.product.findFirst({
      where: {
        id: params.id,
        storeId: session.user.storeId,
      },
      include: {
        supplier: true,
      },
    })

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    return NextResponse.json(product)
  } catch (error) {
    console.error('Product fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch product' }, { status: 500 })
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.storeId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      name, description, sku, price, cost, compareAtPrice,
      inventory, status, supplierId, supplierUrl, categoryId, image, images,
    } = body

    const product = await prisma.product.updateMany({
      where: {
        id: params.id,
        storeId: session.user.storeId,
      },
      data: {
        name,
        description,
        sku,
        price: price !== undefined ? Number(price) : undefined,
        cost: cost !== undefined ? Number(cost) : undefined,
        compareAtPrice: compareAtPrice !== undefined ? (compareAtPrice ? Number(compareAtPrice) : null) : undefined,
        inventory: inventory !== undefined ? Number(inventory) : undefined,
        status,
        supplierId: supplierId || null,
        supplierUrl: supplierUrl || null,
        categoryId: categoryId || null,
        image: image ?? undefined,
        images: images !== undefined ? JSON.stringify(images) : undefined,
      },
    })

    if (product.count === 0) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Product update error:', error)
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.storeId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await prisma.product.deleteMany({
      where: {
        id: params.id,
        storeId: session.user.storeId,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Product delete error:', error)
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 })
  }
}

// PATCH is an alias for PUT — supports partial updates from the dashboard
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  return PUT(request, { params })
}
