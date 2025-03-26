import { Property, PropertyGenerationRequest, PropertyGenerationResponse } from '@/types/property';
import { generateProperty } from './ai';

export async function generatePropertyListing(
  request: PropertyGenerationRequest
): Promise<PropertyGenerationResponse> {
  try {
    // Validate the request
    if (!request.location || !request.propertyType) {
      return {
        success: false,
        error: 'Location and property type are required'
      };
    }

    // Generate the property using AI
    const property = await generateProperty(request);

    return {
      success: true,
      property
    };
  } catch (error) {
    console.error('Error generating property:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to generate property'
    };
  }
} 