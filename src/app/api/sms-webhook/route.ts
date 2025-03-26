import { NextResponse } from 'next/server'
import twilio from 'twilio'

const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
)

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const body = formData.get('Body') as string
    const from = formData.get('From') as string

    // Find lead by phone number
    const leadResponse = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/leads?owner_phone=eq.${from}`,
      {
        headers: {
          'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
        },
      }
    )

    if (!leadResponse.ok) {
      throw new Error('Failed to fetch lead')
    }

    const leads = await leadResponse.json()
    if (leads.length === 0) {
      throw new Error('Lead not found')
    }

    const lead = leads[0]
    const responseType = body.toLowerCase().includes('yes') ? 'positive' : 'negative'

    // Update lead status
    const updateResponse = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/leads?id=eq.${lead.id}`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
        },
        body: JSON.stringify({
          status: responseType === 'positive' ? 'qualified' : 'closed',
          response_received: true,
          response_received_at: new Date().toISOString(),
          response_type: responseType,
        }),
      }
    )

    if (!updateResponse.ok) {
      throw new Error('Failed to update lead status')
    }

    // If response is positive, notify investors
    if (responseType === 'positive') {
      const notifyResponse = await fetch('/api/notify-investors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          propertyId: lead.property_id,
          propertyAddress: lead.property_address,
          propertyType: lead.property_type,
          offerRange: lead.offer_range,
          ownerName: lead.owner_name,
        }),
      })

      if (!notifyResponse.ok) {
        throw new Error('Failed to notify investors')
      }
    }

    // Send confirmation message
    const message = responseType === 'positive'
      ? 'Thank you for your interest! We will contact you shortly with your formal offer.'
      : 'Thank you for your response. We understand you are not interested at this time.'

    await twilioClient.messages.create({
      body: message,
      to: from,
      from: process.env.TWILIO_PHONE_NUMBER,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error handling SMS webhook:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to handle SMS webhook' },
      { status: 500 }
    )
  }
} 