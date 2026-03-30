// Email notification service
// This is a placeholder - integrate with your email provider (SendGrid, Resend, etc.)

interface EmailOptions {
  to: string
  subject: string
  html: string
}

export async function sendEmail({ to, subject, html }: EmailOptions) {
  // TODO: Integrate with email service provider
  // For now, just log to console
  console.log('📧 Email would be sent:', { to, subject })
  
  // Example with Resend:
  // const resend = new Resend(process.env.RESEND_API_KEY)
  // await resend.emails.send({
  //   from: 'orders@yourdomain.com',
  //   to,
  //   subject,
  //   html,
  // })
  
  return { success: true }
}

export function generateOrderConfirmationEmail(order: any, store: any) {
  return {
    subject: `Order Confirmation - ${order.orderNumber}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #4F46E5; color: white; padding: 20px; text-align: center; }
            .content { background: #f9fafb; padding: 20px; }
            .order-details { background: white; padding: 15px; margin: 15px 0; border-radius: 8px; }
            .item { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e5e7eb; }
            .total { font-size: 18px; font-weight: bold; margin-top: 15px; }
            .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Order Confirmed!</h1>
            </div>
            <div class="content">
              <p>Hi ${order.customerName},</p>
              <p>Thank you for your order! We've received your order and will process it shortly.</p>
              
              <div class="order-details">
                <h2>Order #${order.orderNumber}</h2>
                <p><strong>Order Date:</strong> ${new Date(order.createdAt).toLocaleDateString()}</p>
                
                <h3>Items:</h3>
                ${order.items.map((item: any) => `
                  <div class="item">
                    <span>${item.name} x ${item.quantity}</span>
                    <span>$${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                `).join('')}
                
                <div class="total">
                  <div class="item">
                    <span>Total:</span>
                    <span>$${order.total.toFixed(2)}</span>
                  </div>
                </div>
                
                <h3>Shipping Address:</h3>
                <p>${JSON.parse(order.shippingAddress).street}<br>
                ${JSON.parse(order.shippingAddress).city}, ${JSON.parse(order.shippingAddress).state} ${JSON.parse(order.shippingAddress).zip}<br>
                ${JSON.parse(order.shippingAddress).country}</p>
              </div>
              
              <p>We'll send you another email when your order ships.</p>
            </div>
            <div class="footer">
              <p>Questions? Contact us at support@${store.slug}.com</p>
            </div>
          </div>
        </body>
      </html>
    `,
  }
}

export function generateShippingNotificationEmail(order: any, trackingNumber: string) {
  return {
    subject: `Your Order Has Shipped - ${order.orderNumber}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #10B981; color: white; padding: 20px; text-align: center; }
            .content { background: #f9fafb; padding: 20px; }
            .tracking { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; text-align: center; }
            .tracking-number { font-size: 24px; font-weight: bold; color: #4F46E5; margin: 15px 0; font-family: monospace; }
            .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>📦 Your Order Has Shipped!</h1>
            </div>
            <div class="content">
              <p>Hi ${order.customerName},</p>
              <p>Great news! Your order #${order.orderNumber} has been shipped and is on its way to you.</p>
              
              <div class="tracking">
                <h2>Tracking Number</h2>
                <div class="tracking-number">${trackingNumber}</div>
                <p>Use this tracking number to monitor your shipment's progress.</p>
              </div>
              
              <p>Your order should arrive within 5-10 business days.</p>
            </div>
            <div class="footer">
              <p>Questions? Contact us anytime.</p>
            </div>
          </div>
        </body>
      </html>
    `,
  }
}

export function generateProductAddedEmail(product: any, store: any) {
  return {
    subject: `New Product Added - ${product.name}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #4F46E5; color: white; padding: 20px; text-align: center; }
            .content { background: #f9fafb; padding: 20px; }
            .product { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; }
            .product-image { max-width: 200px; margin: 0 auto; display: block; }
            .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>✨ New Product Added!</h1>
            </div>
            <div class="content">
              <p>A new product has been added to your store:</p>
              
              <div class="product">
                ${product.image ? `<img src="${product.image}" alt="${product.name}" class="product-image" />` : ''}
                <h2>${product.name}</h2>
                <p><strong>SKU:</strong> ${product.sku}</p>
                <p><strong>Price:</strong> $${product.price.toFixed(2)}</p>
                <p><strong>Cost:</strong> $${product.cost.toFixed(2)}</p>
                <p><strong>Profit Margin:</strong> ${(((product.price - product.cost) / product.price) * 100).toFixed(1)}%</p>
                <p><strong>Status:</strong> ${product.status}</p>
              </div>
            </div>
            <div class="footer">
              <p>Manage your products in the dashboard</p>
            </div>
          </div>
        </body>
      </html>
    `,
  }
}

export function generateLowStockEmail(products: any[], store: any) {
  return {
    subject: `⚠️ Low Stock Alert - ${products.length} Products`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #F59E0B; color: white; padding: 20px; text-align: center; }
            .content { background: #f9fafb; padding: 20px; }
            .product-list { background: white; padding: 15px; margin: 15px 0; border-radius: 8px; }
            .product-item { padding: 10px; border-bottom: 1px solid #e5e7eb; }
            .product-item:last-child { border-bottom: none; }
            .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>⚠️ Low Stock Alert</h1>
            </div>
            <div class="content">
              <p>The following products are running low on inventory:</p>
              
              <div class="product-list">
                ${products.map(p => `
                  <div class="product-item">
                    <strong>${p.name}</strong> (${p.sku})<br>
                    <span style="color: #F59E0B;">Only ${p.inventory} left in stock</span>
                  </div>
                `).join('')}
              </div>
              
              <p>Consider restocking these items to avoid running out.</p>
            </div>
            <div class="footer">
              <p>Manage inventory in your dashboard</p>
            </div>
          </div>
        </body>
      </html>
    `,
  }
}

export function generateDailySummaryEmail(summary: any, store: any) {
  return {
    subject: `📊 Daily Summary - ${new Date().toLocaleDateString()}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #4F46E5; color: white; padding: 20px; text-align: center; }
            .content { background: #f9fafb; padding: 20px; }
            .stats { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 20px 0; }
            .stat-card { background: white; padding: 15px; border-radius: 8px; text-align: center; }
            .stat-value { font-size: 32px; font-weight: bold; color: #4F46E5; }
            .stat-label { font-size: 14px; color: #6b7280; }
            .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>📊 Daily Summary</h1>
              <p>${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>
            <div class="content">
              <p>Here's how your store performed today:</p>
              
              <div class="stats">
                <div class="stat-card">
                  <div class="stat-value">${summary.orders}</div>
                  <div class="stat-label">Orders</div>
                </div>
                <div class="stat-card">
                  <div class="stat-value">$${summary.revenue.toFixed(2)}</div>
                  <div class="stat-label">Revenue</div>
                </div>
                <div class="stat-card">
                  <div class="stat-value">$${summary.profit.toFixed(2)}</div>
                  <div class="stat-label">Profit</div>
                </div>
                <div class="stat-card">
                  <div class="stat-value">${summary.products}</div>
                  <div class="stat-label">Products Added</div>
                </div>
              </div>
              
              <p>Keep up the great work!</p>
            </div>
            <div class="footer">
              <p>View detailed analytics in your dashboard</p>
            </div>
          </div>
        </body>
      </html>
    `,
  }
}

export function generateWeeklySummaryEmail(summary: any, store: any) {
  return {
    subject: `📈 Weekly Summary - Week of ${new Date().toLocaleDateString()}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #10B981; color: white; padding: 20px; text-align: center; }
            .content { background: #f9fafb; padding: 20px; }
            .stats { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 20px 0; }
            .stat-card { background: white; padding: 15px; border-radius: 8px; text-align: center; }
            .stat-value { font-size: 32px; font-weight: bold; color: #10B981; }
            .stat-label { font-size: 14px; color: #6b7280; }
            .highlight { background: white; padding: 15px; margin: 15px 0; border-radius: 8px; border-left: 4px solid #10B981; }
            .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>📈 Weekly Performance</h1>
              <p>Week of ${new Date().toLocaleDateString()}</p>
            </div>
            <div class="content">
              <p>Here's your weekly performance summary:</p>
              
              <div class="stats">
                <div class="stat-card">
                  <div class="stat-value">${summary.orders}</div>
                  <div class="stat-label">Total Orders</div>
                </div>
                <div class="stat-card">
                  <div class="stat-value">$${summary.revenue.toFixed(2)}</div>
                  <div class="stat-label">Total Revenue</div>
                </div>
                <div class="stat-card">
                  <div class="stat-value">$${summary.profit.toFixed(2)}</div>
                  <div class="stat-label">Total Profit</div>
                </div>
                <div class="stat-card">
                  <div class="stat-value">${summary.avgOrderValue.toFixed(2)}</div>
                  <div class="stat-label">Avg Order Value</div>
                </div>
              </div>
              
              <div class="highlight">
                <h3>📊 Key Insights</h3>
                <ul>
                  <li>Best selling product: ${summary.topProduct || 'N/A'}</li>
                  <li>Busiest day: ${summary.busiestDay || 'N/A'}</li>
                  <li>Profit margin: ${summary.profitMargin?.toFixed(1) || '0'}%</li>
                </ul>
              </div>
              
              <p>Great work this week! Keep it up! 🎉</p>
            </div>
            <div class="footer">
              <p>View detailed analytics in your dashboard</p>
            </div>
          </div>
        </body>
      </html>
    `,
  }
}
