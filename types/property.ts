export interface Property {
  id: string
  title: string
  location: string
  price: number
  type: string
  sqft: number
  beds: number
  baths: number
  image: string
  intelligenceScore: number
  roi: number
  features?: string[]
  coordinates: {
    lat: number
    lng: number
  }
} 