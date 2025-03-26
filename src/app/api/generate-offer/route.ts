import { NextResponse } from 'next/server'
import { OfferRange } from '@/types/offer'

// Mock function to simulate API calls to Centris/Zillow
async function fetchComparableSales(location: string, propertyType: string) {
  // TODO: Replace with actual API calls
  return {
    sales: [
      { price: 450000, sqft: 2000, daysOnMarket: 15 },
      { price: 480000, sqft: 2200, daysOnMarket: 20 },
      { price: 460000, sqft: 2100, daysOnMarket: 18 },
    ],
    marketTrend: 'upward' as const,
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { propertyId, location, propertyType, currentPrice, sqft } = body

    // Fetch comparable sales data
    const { sales, marketTrend } = await fetchComparableSales(location, propertyType)

    // Calculate average price per square foot
    const avgPricePerSqft = sales.reduce((acc, sale) => acc + (sale.price / sale.sqft), 0) / sales.length

    // Calculate average days on market
    const avgDaysOnMarket = sales.reduce((acc, sale) => acc + sale.daysOnMarket, 0) / sales.length

    // Calculate offer range based on market data
    const basePrice = currentPrice
    const minOffer = Math.floor(basePrice * 0.85) // 15% below current price
    const maxOffer = Math.floor(basePrice * 0.95) // 5% below current price

    // Calculate confidence score based on data quality
    const confidenceScore = Math.min(
      100,
      70 + // Base score for high-probability properties
      (sales.length * 5) + // Bonus for more comparable sales
      (marketTrend === 'upward' ? 10 : 0) // Bonus for upward market trend
    )

    const offerRange: Omit<OfferRange, 'id' | 'created_at' | 'updated_at'> = {
      property_id: propertyId,
      min_offer: minOffer,
      max_offer: maxOffer,
      confidence_score: confidenceScore,
      comparable_sales_count: sales.length,
      average_sale_price: Math.floor(sales.reduce((acc, sale) => acc + sale.price, 0) / sales.length),
      market_trend: marketTrend,
      days_on_market: Math.floor(avgDaysOnMarket),
      price_per_sqft: Math.floor(avgPricePerSqft),
    }

    // Save to Supabase
    const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/offer_ranges`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
      },
      body: JSON.stringify(offerRange),
    })

    if (!response.ok) {
      throw new Error(`Failed to save offer range: ${response.statusText}`)
    }

    const savedOfferRange = await response.json()

    return NextResponse.json(savedOfferRange)
  } catch (error) {
    console.error('Error generating offer range:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate offer range' },
      { status: 500 }
    )
  }
} 