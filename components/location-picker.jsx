"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export function LocationPicker({ onLocationSelect, initialLocation }) {
  const [address, setAddress] = useState(initialLocation?.address || "")
  const [coordinates, setCoordinates] = useState(initialLocation?.coordinates || null)
  const [isLoading, setIsLoading] = useState(false)

  const handleGetCurrentLocation = () => {
    setIsLoading(true)

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          }
          setCoordinates(coords)

          // Reverse geocoding would go here
          setAddress(`${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)}`)
          onLocationSelect({ coordinates: coords, address: `${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)}` })
          setIsLoading(false)
        },
        (error) => {
          console.error("Error getting location:", error)
          setIsLoading(false)
        },
      )
    } else {
      alert("Geolocation is not supported by this browser.")
      setIsLoading(false)
    }
  }

  const handleAddressSubmit = (e) => {
    e.preventDefault()
    if (address.trim()) {
      // Geocoding would go here
      const mockCoords = { lat: 28.6139, lng: 77.209 } // Delhi center
      setCoordinates(mockCoords)
      onLocationSelect({ coordinates: mockCoords, address: address.trim() })
    }
  }

  return (
    <div className="space-y-4">
      <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
        <div className="text-center space-y-2">
          <div className="text-2xl">🗺️</div>
          <p className="text-sm text-muted-foreground">Map will load here</p>
          {coordinates && (
            <p className="text-xs text-primary">
              Selected: {coordinates.lat.toFixed(4)}, {coordinates.lng.toFixed(4)}
            </p>
          )}
        </div>
      </div>

      <form onSubmit={handleAddressSubmit} className="space-y-3">
        <Input
          type="text"
          placeholder="Enter your address in Delhi"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
        />
        <div className="flex gap-2">
          <Button type="submit" className="flex-1">
            Search Address
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={handleGetCurrentLocation}
            disabled={isLoading}
            className="flex-1 bg-transparent"
          >
            {isLoading ? "Getting Location..." : "Use Current Location"}
          </Button>
        </div>
      </form>
    </div>
  )
}
