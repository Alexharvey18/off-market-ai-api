'use client';

import { useState } from 'react';
import { Property } from '@/types/property';
import { Map } from '@/components/map';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [properties, setProperties] = useState<Property[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [location, setLocation] = useState('');
  const [propertyType, setPropertyType] = useState<'house' | 'apartment' | 'condo' | 'townhouse'>('house');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [features, setFeatures] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const request = {
      location,
      propertyType,
      priceRange: {
        min: Number(minPrice),
        max: Number(maxPrice),
      },
      features: features.split(',').map(f => f.trim()).filter(Boolean),
    };

    try {
      const response = await fetch('/api/generate-property', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to generate property');
      }

      const property = await response.json();
      setProperties(prev => [...prev, property]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="container mx-auto px-4 py-8">
      <h2 className="text-3xl font-bold mb-6">Welcome to Off Market AI</h2>
      <p className="text-lg text-muted-foreground mb-8">
        Discover high-potential investment properties before they hit the market with our AI-powered analysis.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Generate a Property</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block mb-2">Location</label>
                  <Input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    required
                    placeholder="e.g., Austin, TX"
                  />
                </div>

                <div>
                  <label className="block mb-2">Property Type</label>
                  <Select
                    value={propertyType}
                    onValueChange={(value: 'house' | 'apartment' | 'condo' | 'townhouse') => setPropertyType(value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select property type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="house">House</SelectItem>
                      <SelectItem value="apartment">Apartment</SelectItem>
                      <SelectItem value="condo">Condo</SelectItem>
                      <SelectItem value="townhouse">Townhouse</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-2">Min Price</label>
                    <Input
                      type="number"
                      value={minPrice}
                      onChange={(e) => setMinPrice(e.target.value)}
                      required
                      placeholder="e.g., 500000"
                    />
                  </div>
                  <div>
                    <label className="block mb-2">Max Price</label>
                    <Input
                      type="number"
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(e.target.value)}
                      required
                      placeholder="e.g., 1000000"
                    />
                  </div>
                </div>

                <div>
                  <label className="block mb-2">Features (comma-separated)</label>
                  <Input
                    type="text"
                    value={features}
                    onChange={(e) => setFeatures(e.target.value)}
                    placeholder="e.g., modern kitchen, garden, garage"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full"
                >
                  {loading ? 'Generating...' : 'Generate Property'}
                </Button>
              </form>
            </CardContent>
          </Card>

          {error && (
            <div className="p-4 bg-red-100 text-red-700 rounded">
              {error}
            </div>
          )}
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Property Map</CardTitle>
            </CardHeader>
            <CardContent>
              <Map properties={properties} />
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
} 