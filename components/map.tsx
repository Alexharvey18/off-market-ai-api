'use client'

import { useEffect, useRef } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import { Property } from '@/types/property'

// Replace with your Mapbox access token
mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || ''

interface MapProps {
  properties: Property[]
  center?: [number, number]
  zoom?: number
}

export function Map({ properties, center = [-97.7431, 30.2672], zoom = 12 }: MapProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<mapboxgl.Map | null>(null)
  const markers = useRef<mapboxgl.Marker[]>([])

  useEffect(() => {
    if (!mapContainer.current) return

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center,
      zoom,
    })

    map.current.on('load', () => {
      // Add markers for each property
      properties.forEach((property) => {
        const marker = new mapboxgl.Marker()
          .setLngLat([property.coordinates.lng, property.coordinates.lat])
          .setPopup(
            new mapboxgl.Popup({ offset: 25 }).setHTML(`
              <div class="p-2">
                <h3 class="font-bold">${property.title}</h3>
                <p class="text-sm">${property.location}</p>
                <p class="text-sm">$${property.price.toLocaleString()}</p>
              </div>
            `)
          )
          .addTo(map.current!)

        markers.current.push(marker)
      })
    })

    return () => {
      markers.current.forEach((marker) => marker.remove())
      map.current?.remove()
    }
  }, [properties, center, zoom])

  return (
    <div
      ref={mapContainer}
      className="w-full h-[400px] rounded-lg overflow-hidden"
    />
  )
} 