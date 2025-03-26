import { NextResponse } from 'next/server';
import { generatePropertyListing } from '@/lib/propertyGenerator';
import { PropertyGenerationRequest } from '@/types/property';

export async function POST(request: Request) {
  try {
    const body: PropertyGenerationRequest = await request.json();
    
    const result = await generatePropertyListing(body);
    
    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json(result.property);
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 