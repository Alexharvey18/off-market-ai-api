export interface Property {
  id: string;
  title: string;
  location: string;
  price: number;
  type: string;
  sqft: number;
  beds: number;
  baths: number;
  image: string;
  intelligenceScore: number;
  roi: number;
  features?: string[];
  coordinates: {
    lat: number;
    lng: number;
  };
  propertyType?: 'house' | 'apartment' | 'condo' | 'townhouse';
  squareFootage?: number;
  bedrooms?: number;
  bathrooms?: number;
  estimatedROI?: number;
}

export interface PropertyGenerationRequest {
  location: string;
  propertyType: 'house' | 'apartment' | 'condo' | 'townhouse';
  priceRange?: {
    min: number;
    max: number;
  };
  features?: string[];
}

export interface PropertyGenerationResponse {
  success: boolean;
  property?: Property;
  error?: string;
} 