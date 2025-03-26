import { NextResponse } from 'next/server'
import sgMail from '@sendgrid/mail'
import { Investor } from '@/types/investor'

// Initialize SendGrid
sgMail.setApiKey(process.env.SENDGRID_API_KEY || '')

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { propertyId, propertyAddress, propertyType, offerRange, ownerName } = body

    // Fetch top 3 subscribed investors based on preferences
    const investorsResponse = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/investors?subscription_status=eq.active&order=subscription_tier.desc&limit=3`,
      {
        headers: {
          'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
        },
      }
    )

    if (!investorsResponse.ok) {
      throw new Error('Failed to fetch investors')
    }

    const investors: Investor[] = await investorsResponse.json()

    // Send notifications to each investor
    for (const investor of investors) {
      const messageContent = `
        New Deal Alert!
        
        Property Details:
        - Address: ${propertyAddress}
        - Type: ${propertyType}
        - Owner: ${ownerName}
        - Offer Range: $${offerRange.min_offer.toLocaleString()} - $${offerRange.max_offer.toLocaleString()}
        
        View and claim this deal at: ${process.env.NEXT_PUBLIC_APP_URL}/deals/${propertyId}
        
        This deal expires in 24 hours.
      `

      const emailMsg = {
        to: investor.email,
        from: process.env.SENDGRID_FROM_EMAIL || '',
        subject: 'New Deal Alert - High Probability Property Available',
        text: messageContent,
        html: messageContent.replace(/\n/g, '<br>'),
      }

      await sgMail.send(emailMsg)
    }

    return NextResponse.json({ success: true, notifiedInvestors: investors.length })
  } catch (error) {
    console.error('Error notifying investors:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to notify investors' },
      { status: 500 }
    )
  }
} 