export interface Investor {
  id: string
  name: string
  email: string
  phone: string
  subscription_status: 'active' | 'inactive'
  subscription_tier: 'basic' | 'premium' | 'enterprise'
  max_deal_value: number
  preferred_property_types: string[]
  preferred_locations: string[]
  created_at: string
  updated_at: string
}

export interface DealClaim {
  id: string
  property_id: string
  investor_id: string
  status: 'pending' | 'approved' | 'rejected' | 'expired'
  bid_amount?: number
  notes?: string
  created_at: string
  updated_at: string
} 