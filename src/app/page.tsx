'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { CardTitle, CardHeader, CardContent, Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Loader2, Search } from 'lucide-react';
import { ThemeToggle } from '@/components/theme-toggle';
import { formatCurrency } from '@/lib/utils';

// Update API URL to point to local server
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface Property {
  id: string;
  address: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  square_feet: number;
  property_type: string;
  status: string;
  image_url?: string;
  sell_probability_score: number;
}

export default function PropertyListPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchProperties = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/properties`);

      if (!response.ok) {
        throw new Error('Failed to fetch properties');
      }

      const data = await response.json();
      setProperties(data.data || []);
      setError(null);
    } catch (error) {
      console.error('Error fetching properties:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch properties');
      setProperties([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, []);

  const filteredProperties = properties.filter(property =>
    property.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
    property.property_type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col min-h-screen">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
          <div className="mr-4 hidden md:flex">
            <h1 className="text-lg font-semibold">Off Market AI Properties</h1>
          </div>
          <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
            <div className="w-full flex-1 md:w-auto md:flex-none">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search properties..."
                  className="pl-8 md:w-[300px]"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </header>
      <main className="flex-1 container py-6">
        <div className="flex items-center justify-between mb-6">
          <p className="text-muted-foreground">
            {filteredProperties.length} properties found
          </p>
          <Button onClick={fetchProperties} disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading...
              </>
            ) : (
              'Refresh'
            )}
          </Button>
        </div>
        {error && (
          <div className="mb-6 p-4 rounded-lg bg-destructive/10 text-destructive">
            {error}
          </div>
        )}
        {loading ? (
          <div className="flex justify-center items-center min-h-[400px]">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : filteredProperties.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredProperties.map((property) => (
              <Card key={property.id} className="overflow-hidden">
                {property.image_url && (
                  <div className="aspect-[4/3] relative">
                    <img
                      alt={property.address}
                      className="object-cover w-full h-full"
                      src={property.image_url}
                    />
                  </div>
                )}
                <CardHeader>
                  <div className="flex justify-between items-start gap-4">
                    <CardTitle className="line-clamp-2 text-base">
                      {property.address}
                    </CardTitle>
                    <Badge variant={property.status === 'available' ? 'default' : 'secondary'}>
                      {property.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-2">
                    <div className="text-2xl font-bold">
                      {formatCurrency(property.price)}
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-sm text-muted-foreground">
                      <div>
                        <span className="font-medium">{property.bedrooms}</span> beds
                      </div>
                      <div>
                        <span className="font-medium">{property.bathrooms}</span> baths
                      </div>
                      <div>
                        <span className="font-medium">{property.square_feet.toLocaleString()}</span> sqft
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Badge variant="outline">{property.property_type}</Badge>
                      <div className="ml-auto text-muted-foreground">
                        Score: {(property.sell_probability_score * 100).toFixed(0)}%
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center text-muted-foreground py-12">
            No properties found.
          </div>
        )}
      </main>
    </div>
  );
} 