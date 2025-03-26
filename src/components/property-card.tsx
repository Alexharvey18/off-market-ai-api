"use client"

import { useState } from "react"
import Image from "next/image"
import { Bookmark, Home, MapPin, Zap, Brain, Heart, Building2, DollarSign, Square, BedDouble, Bath } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface PropertyCardProps {
  property: {
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
  }
}

export function PropertyCard({ property }: PropertyCardProps) {
  const [isSaved, setIsSaved] = useState(false)
  const isHighPotential = property.intelligenceScore > 80

  // Format price with commas
  const formattedPrice = property.price.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  })

  // Witty ROI description
  const getROIDescription = () => {
    if (property.roi >= 15) return "Genius-Level Returns!"
    if (property.roi >= 10) return "Big Brain Investment!"
    if (property.roi >= 5) return "Smarty Pants Pick!"
    return "Solid Choice!"
  }

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <CardHeader className="p-0">
        <div className="relative">
          <Image
            src={property.image}
            alt={property.title}
            width={500}
            height={300}
            className="w-full h-48 object-cover"
          />
          <Badge className="absolute top-4 right-4 bg-primary text-primary-foreground">
            {formattedPrice}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="flex items-center gap-2 mb-2">
          <MapPin className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">{property.location}</span>
        </div>
        <h3 className="text-xl font-semibold mb-4">{property.title}</h3>
        <div className="flex items-center gap-4 mb-4">
          <div className="flex items-center gap-1">
            <Square className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm">{property.sqft} sqft</span>
          </div>
          <div className="flex items-center gap-1">
            <BedDouble className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm">{property.beds} beds</span>
          </div>
          <div className="flex items-center gap-1">
            <Bath className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm">{property.baths} baths</span>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-green-500" />
            <span className="text-sm font-medium">{property.roi}% ROI</span>
          </div>
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-blue-500" />
            <span className="text-sm font-medium">{property.intelligenceScore}% Intelligence</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="p-6 pt-0 flex gap-2">
        <Button
          variant="outline"
          className={cn(
            "flex-1",
            isSaved ? "hover-wiggle-shake" : "hover-bouncy-pulse"
          )}
          onClick={() => setIsSaved(!isSaved)}
        >
          <Heart className={cn("w-4 h-4 mr-2", isSaved && "fill-current")} />
          {isSaved ? "Brilliant!" : "Bookmark"}
        </Button>
        <Button className="flex-1">
          <Home className="w-4 h-4 mr-2" />
          Acquire
        </Button>
      </CardFooter>
    </Card>
  )
}

function CircularProgressIndicator({ value }: { value: number }) {
  // Calculate the circumference of the circle
  const radius = 25
  const circumference = 2 * Math.PI * radius

  // Calculate the stroke-dashoffset based on the value
  const offset = circumference - (value / 100) * circumference

  // Determine color based on value
  let gradientId = "progressGradient"
  let gradientColors = {
    start: "#ef4444",
    end: "#f87171",
  }

  if (value >= 80) {
    gradientId = "highProgressGradient"
    gradientColors = {
      start: "#2e46ff", // Genius blue
      end: "#4f46e5", // Brainstorm purple
    }
  } else if (value >= 50) {
    gradientId = "medProgressGradient"
    gradientColors = {
      start: "#ff3898", // Eureka pink
      end: "#f43f5e", // Lighter eureka
    }
  }

  return (
    <svg className="h-full w-full -rotate-90" viewBox="0 0 60 60">
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={gradientColors.start} />
          <stop offset="100%" stopColor={gradientColors.end} />
        </linearGradient>
      </defs>
      {/* Background circle */}
      <circle cx="30" cy="30" r={radius} fill="none" strokeWidth="5" className="stroke-gray-200" />
      {/* Progress circle */}
      <circle
        cx="30"
        cy="30"
        r={radius}
        fill="none"
        strokeWidth="5"
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        stroke={`url(#${gradientId})`}
      />
    </svg>
  )
} 