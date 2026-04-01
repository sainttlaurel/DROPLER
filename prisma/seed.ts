import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting seed...')

  // Create demo user
  const hashedPassword = await bcrypt.hash('demo123', 10)
  
  const user = await prisma.user.upsert({
    where: { email: 'demo@dropler.com' },
    update: {},
    create: {
      email: 'demo@dropler.com',
      name: 'Demo User',
      password: hashedPassword,
    },
  })

  console.log('✅ Created user:', user.email)

  // Create store
  const store = await prisma.store.upsert({
    where: { userId: user.id },
    update: {},
    create: {
      name: 'Demo Store',
      slug: 'demo-store',
      currency: 'USD',
      timezone: 'America/New_York',
      userId: user.id,
    },
  })

  console.log('✅ Created store:', store.name)

  // Create subscription
  const subscription = await prisma.subscription.upsert({
    where: { storeId: store.id },
    update: {},
    create: {
      storeId: store.id,
      plan: 'GROWTH',
      status: 'ACTIVE',
    },
  })

  console.log('✅ Created subscription:', subscription.plan)

  // Create suppliers
  const suppliers = await Promise.all([
    prisma.supplier.create({
      data: {
        name: 'AliExpress Global',
        platform: 'ALIEXPRESS',
        website: 'https://aliexpress.com',
        email: 'support@aliexpress.com',
        country: 'China',
        isActive: true,
        storeId: store.id,
      },
    }),
    prisma.supplier.create({
      data: {
        name: 'CJ Dropshipping',
        platform: 'CJ_DROPSHIPPING',
        website: 'https://cjdropshipping.com',
        email: 'service@cjdropshipping.com',
        country: 'China',
        isActive: true,
        storeId: store.id,
      },
    }),
    prisma.supplier.create({
      data: {
        name: 'Spocket US',
        platform: 'SPOCKET',
        website: 'https://spocket.co',
        email: 'hello@spocket.co',
        country: 'United States',
        isActive: true,
        storeId: store.id,
      },
    }),
  ])

  console.log('✅ Created suppliers:', suppliers.length)

  // Create products
  const products = await Promise.all([
    prisma.product.create({
      data: {
        name: 'Wireless Bluetooth Headphones',
        slug: 'wireless-bluetooth-headphones',
        description: 'Premium noise-canceling wireless headphones with 30-hour battery life',
        sku: 'WBH-001',
        price: 79.99,
        cost: 32.50,
        compareAtPrice: 129.99,
        image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e',
        images: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e',
        status: 'ACTIVE',
        inventory: 150,
        supplierId: suppliers[0].id,
        storeId: store.id,
      },
    }),
    prisma.product.create({
      data: {
        name: 'Smart Watch Pro',
        slug: 'smart-watch-pro',
        description: 'Advanced fitness tracking with heart rate monitor and GPS',
        sku: 'SWP-002',
        price: 199.99,
        cost: 85.00,
        compareAtPrice: 299.99,
        image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30',
        images: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30',
        status: 'ACTIVE',
        inventory: 85,
        supplierId: suppliers[1].id,
        storeId: store.id,
      },
    }),
    prisma.product.create({
      data: {
        name: 'Portable Phone Charger 20000mAh',
        slug: 'portable-phone-charger-20000mah',
        description: 'High-capacity power bank with fast charging and dual USB ports',
        sku: 'PPC-003',
        price: 39.99,
        cost: 15.00,
        compareAtPrice: 59.99,
        image: 'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5',
        images: 'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5',
        status: 'ACTIVE',
        inventory: 200,
        supplierId: suppliers[0].id,
        storeId: store.id,
      },
    }),
    prisma.product.create({
      data: {
        name: 'LED Desk Lamp',
        slug: 'led-desk-lamp',
        description: 'Adjustable brightness desk lamp with USB charging port',
        sku: 'LDL-004',
        price: 45.99,
        cost: 18.50,
        compareAtPrice: 69.99,
        image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c',
        images: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c',
        status: 'ACTIVE',
        inventory: 120,
        supplierId: suppliers[2].id,
        storeId: store.id,
      },
    }),
    prisma.product.create({
      data: {
        name: 'Yoga Mat Premium',
        slug: 'yoga-mat-premium',
        description: 'Extra thick non-slip yoga mat with carrying strap',
        sku: 'YMP-005',
        price: 34.99,
        cost: 12.00,
        compareAtPrice: 49.99,
        image: 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f',
        images: 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f',
        status: 'ACTIVE',
        inventory: 95,
        supplierId: suppliers[2].id,
        storeId: store.id,
      },
    }),
  ])

  console.log('✅ Created products:', products.length)

  // Create orders
  const orders = await Promise.all([
    prisma.order.create({
      data: {
        orderNumber: 'ORD-1001',
        customerName: 'John Smith',
        customerEmail: 'john@example.com',
        shippingAddress: JSON.stringify({
          street: '123 Main St',
          city: 'New York',
          state: 'NY',
          zip: '10001',
          country: 'United States',
        }),
        subtotal: 79.99,
        tax: 6.40,
        shipping: 5.99,
        total: 92.38,
        profit: 47.49,
        status: 'DELIVERED',
        trackingNumber: 'TRK123456789',
        storeId: store.id,
        items: {
          create: [
            {
              productId: products[0].id,
              name: products[0].name,
              sku: products[0].sku,
              price: products[0].price,
              cost: products[0].cost,
              quantity: 1,
              image: products[0].image,
            },
          ],
        },
      },
    }),
    prisma.order.create({
      data: {
        orderNumber: 'ORD-1002',
        customerName: 'Sarah Johnson',
        customerEmail: 'sarah@example.com',
        shippingAddress: JSON.stringify({
          street: '456 Oak Ave',
          city: 'Los Angeles',
          state: 'CA',
          zip: '90001',
          country: 'United States',
        }),
        subtotal: 199.99,
        tax: 16.00,
        shipping: 7.99,
        total: 223.98,
        profit: 114.99,
        status: 'SHIPPED',
        trackingNumber: 'TRK987654321',
        storeId: store.id,
        items: {
          create: [
            {
              productId: products[1].id,
              name: products[1].name,
              sku: products[1].sku,
              price: products[1].price,
              cost: products[1].cost,
              quantity: 1,
              image: products[1].image,
            },
          ],
        },
      },
    }),
    prisma.order.create({
      data: {
        orderNumber: 'ORD-1003',
        customerName: 'Mike Davis',
        customerEmail: 'mike@example.com',
        shippingAddress: JSON.stringify({
          street: '789 Pine Rd',
          city: 'Chicago',
          state: 'IL',
          zip: '60601',
          country: 'United States',
        }),
        subtotal: 120.97,
        tax: 9.68,
        shipping: 5.99,
        total: 136.64,
        profit: 60.48,
        status: 'PROCESSING',
        storeId: store.id,
        items: {
          create: [
            {
              productId: products[2].id,
              name: products[2].name,
              sku: products[2].sku,
              price: products[2].price,
              cost: products[2].cost,
              quantity: 2,
              image: products[2].image,
            },
            {
              productId: products[3].id,
              name: products[3].name,
              sku: products[3].sku,
              price: products[3].price,
              cost: products[3].cost,
              quantity: 1,
              image: products[3].image,
            },
          ],
        },
      },
    }),
    prisma.order.create({
      data: {
        orderNumber: 'ORD-1004',
        customerName: 'Emily Wilson',
        customerEmail: 'emily@example.com',
        shippingAddress: JSON.stringify({
          street: '321 Elm St',
          city: 'Miami',
          state: 'FL',
          zip: '33101',
          country: 'United States',
        }),
        subtotal: 34.99,
        tax: 2.80,
        shipping: 4.99,
        total: 42.78,
        profit: 22.99,
        status: 'PENDING',
        storeId: store.id,
        items: {
          create: [
            {
              productId: products[4].id,
              name: products[4].name,
              sku: products[4].sku,
              price: products[4].price,
              cost: products[4].cost,
              quantity: 1,
              image: products[4].image,
            },
          ],
        },
      },
    }),
  ])

  console.log('✅ Created orders:', orders.length)

  // Create analytics data for last 7 days
  const today = new Date()
  const analyticsData = []
  
  for (let i = 6; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    date.setHours(0, 0, 0, 0)
    
    analyticsData.push({
      date,
      revenue: Math.random() * 1000 + 500,
      orders: Math.floor(Math.random() * 20) + 5,
      profit: Math.random() * 400 + 200,
      conversionRate: Math.random() * 3 + 1,
      storeId: store.id,
    })
  }

  await prisma.analytics.createMany({
    data: analyticsData,
  })

  console.log('✅ Created analytics data for 7 days')

  console.log('🎉 Seed completed successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
