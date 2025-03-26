import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";

interface PropertyCardProps {
  property: {
    id: string;
    address: string;
    price: number;
    bedrooms: number;
    bathrooms: number;
    square_feet: number;
    property_type: string;
    status: string;
    image_url?: string;
  };
}

export function PropertyCard({ property }: PropertyCardProps) {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      {property.image_url && (
        <div className="relative h-48 w-full">
          <img
            src={property.image_url}
            alt={property.address}
            className="object-cover w-full h-full"
          />
        </div>
      )}
      <CardHeader className="p-4">
        <div className="flex justify-between items-start">
          <h3 className="font-semibold text-lg line-clamp-2">{property.address}</h3>
          <Badge variant={property.status === 'available' ? 'default' : 'secondary'}>
            {property.status}
          </Badge>
        </div>
        <p className="text-2xl font-bold text-primary">
          {formatCurrency(property.price)}
        </p>
      </CardHeader>
      <CardContent className="p-4 pt-0">
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
        <div className="mt-2">
          <Badge variant="outline">{property.property_type}</Badge>
        </div>
      </CardContent>
    </Card>
  );
} 