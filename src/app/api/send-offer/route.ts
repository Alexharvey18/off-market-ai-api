import { NextResponse } from 'next/server'
import sgMail from '@sendgrid/mail'
import twilio from 'twilio'
import { Lead } from '@/types/lead'

// Initialize SendGrid
sgMail.setApiKey(process.env.SENDGRID_API_KEY || '')

// Initialize Twilio
const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
)

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { propertyId, ownerName, ownerEmail, ownerPhone, offerRange } = body

    // Create lead record
    const leadResponse = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/leads`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
      },
      body: JSON.stringify({
        property_id: propertyId,
        owner_name: ownerName,
        owner_email: ownerEmail,
        owner_phone: ownerPhone,
        status: 'new',
        offer_range_id: offerRange.id,
        message_sent: false,
        response_received: false,
      }),
    })

    if (!leadResponse.ok) {
      throw new Error('Failed to create lead record')
    }

    const lead: Lead = await leadResponse.json()

    // Prepare message content
    const messageContent = `Hi ${ownerName},\n\nYour property at ${body.propertyAddress} qualifies for an immediate cash offer between $${offerRange.min_offer.toLocaleString()} and $${offerRange.max_offer.toLocaleString()}.\n\nWould you like to receive a formal offer?\n\nReply YES to receive your offer or NO to decline.`

    // Send email
    const emailMsg = {
      to: ownerEmail,
      from: process.env.SENDGRID_FROM_EMAIL || '',
      subject: 'Cash Offer Available for Your Property',
      text: messageContent,
      html: messageContent.replace(/\n/g, '<br>'),
    }

    await sgMail.send(emailMsg)

    // Send SMS
    await twilioClient.messages.create({
      body: messageContent,
      to: ownerPhone,
      from: process.env.TWILIO_PHONE_NUMBER,
    })

    // Update lead status
    const updateResponse = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/leads?id=eq.${lead.id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
      },
      body: JSON.stringify({
        status: 'contacted',
        message_sent: true,
        message_sent_at: new Date().toISOString(),
      }),
    })

    if (!updateResponse.ok) {
      throw new Error('Failed to update lead status')
    }

    return NextResponse.json({ success: true, lead })
  } catch (error) {
    console.error('Error sending offer:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to send offer' },
      { status: 500 }
    )
  }
} 