export interface OfferRange {
  id: string
  property_id: string
  min_offer: number
  max_offer: number
  confidence_score: number
  comparable_sales_count: number
  average_sale_price: number
  market_trend: 'upward' | 'stable' | 'downward'
  days_on_market: number
  price_per_sqft: number
  created_at: string
  updated_at: string
} 