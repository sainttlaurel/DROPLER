import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.storeId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { url } = await req.json()

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 })
    }

    console.log('Scraping URL:', url)

    // Fetch the product page
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
      },
    })

    console.log('Fetch status:', response.status)

    if (!response.ok) {
      return NextResponse.json({ 
        error: `Failed to fetch product page (Status: ${response.status})` 
      }, { status: 400 })
    }

    const html = await response.text()
    console.log('HTML length:', html.length)

    // Extract product details based on platform
    let productData: any = {}

    if (url.includes('shopee')) {
      productData = extractShopeeData(html, url)
    } else if (url.includes('aliexpress')) {
      productData = extractAliExpressData(html)
    } else if (url.includes('amazon')) {
      productData = extractAmazonData(html)
    } else {
      // Generic extraction
      productData = extractGenericData(html)
    }

    console.log('Extracted data:', productData)

    return NextResponse.json(productData)
  } catch (error: any) {
    console.error('Scrape error:', error)
    return NextResponse.json(
      { error: `Failed to scrape: ${error.message}` },
      { status: 500 }
    )
  }
}

function extractShopeeData(html: string, url: string): any {
  const data: any = { images: [] }

  try {
    // Extract title from meta tags
    const titleMatch = html.match(/<meta property="og:title" content="([^"]+)"/)
    if (titleMatch) {
      data.name = titleMatch[1].replace(/\s*\|\s*Shopee.*$/, '').trim()
    }

    // Extract description
    const descMatch = html.match(/<meta property="og:description" content="([^"]+)"/)
    if (descMatch) {
      data.description = descMatch[1].trim()
    }

    // Extract images from meta tags
    const imageMatch = html.match(/<meta property="og:image" content="([^"]+)"/)
    if (imageMatch) {
      data.images.push(imageMatch[1])
    }

    // Try to extract more images from JSON-LD
    const jsonLdMatch = html.match(/<script type="application\/ld\+json">([^<]+)<\/script>/)
    if (jsonLdMatch) {
      try {
        const jsonData = JSON.parse(jsonLdMatch[1])
        if (jsonData.image) {
          if (Array.isArray(jsonData.image)) {
            data.images = [...data.images, ...jsonData.image]
          } else {
            data.images.push(jsonData.image)
          }
        }
        if (jsonData.offers?.price) {
          data.price = parseFloat(jsonData.offers.price)
        }
      } catch (e) {
        console.log('JSON-LD parse error:', e)
      }
    }

    // Remove duplicates
    data.images = [...new Set(data.images)]

    console.log('Shopee extraction result:', data)
  } catch (error) {
    console.error('Shopee extraction error:', error)
  }

  return data
}

function extractAliExpressData(html: string): any {
  const data: any = { images: [] }

  const titleMatch = html.match(/<meta property="og:title" content="([^"]+)"/)
  if (titleMatch) {
    data.name = titleMatch[1].replace(/\s*-\s*AliExpress.*$/, '').trim()
  }

  const descMatch = html.match(/<meta name="description" content="([^"]+)"/)
  if (descMatch) {
    data.description = descMatch[1].trim()
  }

  const imageMatch = html.match(/<meta property="og:image" content="([^"]+)"/)
  if (imageMatch) {
    data.images.push(imageMatch[1])
  }

  return data
}

function extractAmazonData(html: string): any {
  const data: any = { images: [] }

  const titleMatch = html.match(/<span id="productTitle"[^>]*>([^<]+)<\/span>/)
  if (titleMatch) {
    data.name = titleMatch[1].trim()
  }

  const imageMatch = html.match(/<img[^>]+id="landingImage"[^>]+src="([^"]+)"/)
  if (imageMatch) {
    data.images.push(imageMatch[1])
  }

  return data
}

function extractGenericData(html: string): any {
  const data: any = { images: [] }

  // Try Open Graph tags
  const titleMatch = html.match(/<meta property="og:title" content="([^"]+)"/)
  if (titleMatch) {
    data.name = titleMatch[1].trim()
  }

  const descMatch = html.match(/<meta property="og:description" content="([^"]+)"/)
  if (descMatch) {
    data.description = descMatch[1].trim()
  }

  const imageMatch = html.match(/<meta property="og:image" content="([^"]+)"/)
  if (imageMatch) {
    data.images.push(imageMatch[1])
  }

  return data
}
