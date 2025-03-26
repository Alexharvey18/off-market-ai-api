import { NextResponse } from 'next/server';

// Test data
const testProperties = [
  {
    id: '1',
    address: '123 Main St',
    price: 500000,
    bedrooms: 3,
    bathrooms: 2,
    square_feet: 2000,
    property_type: 'Single Family',
    status: 'available',
    image_url: 'https://images.unsplash.com/photo-1518780664697-55e3ad937233',
    sell_probability_score: 0.85
  },
  {
    id: '2',
    address: '456 Oak Ave',
    price: 750000,
    bedrooms: 4,
    bathrooms: 3,
    square_feet: 3000,
    property_type: 'Single Family',
    status: 'pending',
    image_url: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750',
    sell_probability_score: 0.92
  }
];

export async function GET() {
  return NextResponse.json({ data: testProperties });
} 