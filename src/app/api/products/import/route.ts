import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.storeId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { url, name, description, price, cost, image, images, supplierId } = await request.json()

    if (!name || !price || !cost) {
      return NextResponse.json({ error: 'Name, price, and cost are required' }, { status: 400 })
    }

    // Clean up the product name
    let cleanName = name.trim()
    if (cleanName.length > 100) {
      cleanName = cleanName.substring(0, 100)
    }

    // Generate SKU
    const sku = `IMP-${Date.now()}`
    const slug = cleanName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
    
    // Create description
    let productDescription = description || ''
    if (!productDescription && url) {
      try {
        const urlObj = new URL(url)
        productDescription = `Imported from ${urlObj.hostname}`
      } catch {
        productDescription = 'Imported product'
      }
    }
    
    // Create the product
    const product = await prisma.product.create({
      data: {
        name: cleanName,
        slug: `${slug}-${Date.now()}`,
        description: productDescription,
        sku,
        price: parseFloat(price),
        cost: parseFloat(cost),
        image: image || null,
        images: images || null,
        supplierUrl: url || null,
        status: 'DRAFT',
        inventory: 0,
        storeId: session.user.storeId,
        supplierId: supplierId || null,
      },
    })

    return NextResponse.json({ success: true, product })
  } catch (error) {
    console.error('Import error:', error)
    return NextResponse.json({ error: 'Failed to import product' }, { status: 500 })
  }
}
