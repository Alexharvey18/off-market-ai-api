import { NextResponse } from 'next/server'
import { DealClaim } from '@/types/investor'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { propertyId, bidAmount, notes } = body

    // Create deal claim record
    const claimResponse = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/deal_claims`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
      },
      body: JSON.stringify({
        property_id: propertyId,
        investor_id: body.investorId, // This should come from the authenticated user's session
        status: 'pending',
        bid_amount: bidAmount,
        notes,
      }),
    })

    if (!claimResponse.ok) {
      throw new Error('Failed to create deal claim')
    }

    const claim: DealClaim = await claimResponse.json()

    // Update property status to claimed
    const propertyResponse = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/properties?id=eq.${propertyId}`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
        },
        body: JSON.stringify({
          status: 'claimed',
          claimed_at: new Date().toISOString(),
        }),
      }
    )

    if (!propertyResponse.ok) {
      throw new Error('Failed to update property status')
    }

    return NextResponse.json({ success: true, claim })
  } catch (error) {
    console.error('Error claiming deal:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to claim deal' },
      { status: 500 }
    )
  }
} 