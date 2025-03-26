import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Test property generation
    const generateResponse = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/properties`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
      },
      body: JSON.stringify({
        title: "Test Property",
        location: "Austin, TX",
        price: 500000,
        type: "house",
        sqft: 2000,
        beds: 3,
        baths: 2,
        image: "/placeholder.svg",
        intelligenceScore: 85,
        roi: 12.5,
        coordinates: {
          lat: 30.2672,
          lng: -97.7431,
        },
      }),
    })

    if (!generateResponse.ok) {
      throw new Error(`Property generation failed: ${generateResponse.statusText}`)
    }

    const property = await generateResponse.json()

    // Test property analysis
    const analyzeResponse = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/property_analysis`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
      },
      body: JSON.stringify({
        property_id: property.id,
        market_trends: "Positive",
        investment_potential: "High",
        risk_assessment: "Low",
        neighborhood_growth: "Strong",
        rental_demand: "High",
        price_trends: "Upward",
        amenities_score: 85,
        school_rating: 8.5,
        crime_rate: "Low",
        future_development: "Promising",
      }),
    })

    if (!analyzeResponse.ok) {
      throw new Error(`Property analysis failed: ${analyzeResponse.statusText}`)
    }

    const analysis = await analyzeResponse.json()

    return NextResponse.json({
      success: true,
      message: "API endpoints working correctly",
      data: {
        property,
        analysis,
      },
    })
  } catch (error) {
    console.error('API test failed:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      },
      { status: 500 }
    )
  }
} 