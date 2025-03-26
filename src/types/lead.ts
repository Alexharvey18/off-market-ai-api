export interface Lead {
  id: string
  property_id: string
  owner_name: string
  owner_email: string
  owner_phone: string
  status: 'new' | 'contacted' | 'responded' | 'qualified' | 'closed'
  offer_range_id: string
  message_sent: boolean
  message_sent_at?: string
  response_received: boolean
  response_received_at?: string
  response_type?: 'positive' | 'negative' | 'no_response'
  created_at: string
  updated_at: string
} 