import OpenAI from 'openai';
import { Property, PropertyGenerationRequest } from '@/types/property';

if (!process.env.OPENAI_API_KEY) {
  throw new Error('Missing OPENAI_API_KEY environment variable');
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const SYSTEM_PROMPT = `You are a real estate property generator. Your task is to create realistic property listings based on the provided parameters.
Generate detailed, engaging property descriptions that highlight key features and amenities.
Ensure all generated content is realistic and follows real estate listing conventions.`;

export async function generateProperty(request: PropertyGenerationRequest): Promise<Property> {
  const userPrompt = `Generate a detailed property listing for a ${request.propertyType} in ${request.location}.
${request.priceRange ? `Price range: $${request.priceRange.min.toLocaleString()} - $${request.priceRange.max.toLocaleString()}` : ''}
${request.features ? `Key features to include: ${request.features.join(', ')}` : ''}

Please provide a complete property listing with:
1. An engaging title
2. A detailed description
3. A realistic price
4. Key features and amenities
5. Number of bedrooms and bathrooms (if applicable)
6. Square footage (if applicable)`;

  const completion = await openai.chat.completions.create({
    model: "gpt-4-turbo-preview",
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: userPrompt }
    ],
    temperature: 0.7,
    max_tokens: 1000,
  });

  const response = completion.choices[0].message.content;
  
  // Parse the AI response into a structured Property object
  // This is a simple implementation - you might want to make it more robust
  const lines = response?.split('\n') || [];
  const title = lines[0] || '';
  const description = lines.slice(1).join('\n') || '';
  
  // Generate a realistic price if not provided
  const price = request.priceRange 
    ? Math.floor(Math.random() * (request.priceRange.max - request.priceRange.min) + request.priceRange.min)
    : Math.floor(Math.random() * 1000000) + 500000; // Default range if not specified

  return {
    title,
    description,
    price,
    location: request.location,
    propertyType: request.propertyType,
    features: request.features || [],
    bedrooms: Math.floor(Math.random() * 5) + 1,
    bathrooms: Math.floor(Math.random() * 4) + 1,
    squareFootage: Math.floor(Math.random() * 2000) + 1000,
  };
} 