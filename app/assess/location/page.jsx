"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "../../../components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui/card"
import { Input } from "../../../components/ui/input"
import { Label } from "../../../components/ui/label"

export default function LocationPage() {
  const router = useRouter()
  const [location, setLocation] = useState({
    lat: 28.6139,
    lon: 77.209,
    houseAddress: "",
    district: "",
    tehsil: "",
    pincode: "",
    fullAddress: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [mapLoaded, setMapLoaded] = useState(false)
  const mapRef = useRef(null)
  const markerRef = useRef(null)

  const delhiData = {
    districts: {
      "Central Delhi": ["Darya Ganj", "Karol Bagh"],
      "East Delhi": ["Gandhi Nagar", "Preet Vihar", "Shahdara"],
      "New Delhi": ["Chanakyapuri", "Parliament Street"],
      "North Delhi": ["Civil Lines", "Kotwali"],
      "North East Delhi": ["Seelampur", "Shahdara"],
      "North West Delhi": ["Kanjhawala", "Rohini"],
      "South Delhi": ["Defence Colony", "Hauz Khas", "Kalkaji"],
      "South East Delhi": ["Badarpur", "Kalkaji"],
      "South West Delhi": ["Vasant Vihar", "Dwarka"],
      "West Delhi": ["Patel Nagar", "Rajouri Garden"],
    },
    pincodeCoordinates: {
      110031: { lat: 28.6358, lon: 77.2781, area: "Laxmi Nagar" },
      110032: { lat: 28.6167, lon: 77.2833, area: "Mayur Vihar Phase I" },
      110051: { lat: 28.65, lon: 77.29, area: "Preet Vihar" },
      110053: { lat: 28.64, lon: 77.31, area: "Anand Vihar" },
      110091: { lat: 28.62, lon: 77.3, area: "Mayur Vihar Phase II" },
      110092: { lat: 28.61, lon: 77.32, area: "Mayur Vihar Phase III" },
      110093: { lat: 28.66, lon: 77.3, area: "IP Extension" },
      110094: { lat: 28.67, lon: 77.295, area: "Patparganj" },
      110095: { lat: 28.68, lon: 77.31, area: "Pandav Nagar" },
      110001: { lat: 28.6562, lon: 77.241, area: "Kashmere Gate" },
      110002: { lat: 28.6469, lon: 77.2167, area: "Daryaganj" },
      110003: { lat: 28.6304, lon: 77.2177, area: "New Delhi" },
      110006: { lat: 28.6667, lon: 77.2167, area: "Karol Bagh" },
      110055: { lat: 28.65, lon: 77.23, area: "Paharganj" },
      110011: { lat: 28.6139, lon: 77.209, area: "Connaught Place" },
      110021: { lat: 28.5833, lon: 77.2167, area: "Lodhi Road" },
      110023: { lat: 28.5667, lon: 77.1833, area: "R.K. Puram" },
    },
    pincodeRanges: {
      "Central Delhi": ["110001", "110002", "110003", "110006", "110055"],
      "East Delhi": ["110031", "110032", "110051", "110053", "110091", "110092", "110093", "110094", "110095"],
      "New Delhi": ["110001", "110003", "110011", "110021", "110023"],
      "North Delhi": ["110006", "110007", "110009", "110033", "110035", "110054"],
      "North East Delhi": ["110031", "110032", "110053", "110093", "110094", "110095"],
      "North West Delhi": [
        "110034",
        "110036",
        "110039",
        "110040",
        "110041",
        "110042",
        "110081",
        "110085",
        "110086",
        "110087",
        "110088",
        "110089",
      ],
      "South Delhi": [
        "110003",
        "110013",
        "110014",
        "110016",
        "110017",
        "110019",
        "110024",
        "110025",
        "110029",
        "110049",
        "110062",
      ],
      "South East Delhi": ["110013", "110014", "110019", "110025", "110044", "110076"],
      "South West Delhi": [
        "110016",
        "110023",
        "110030",
        "110037",
        "110045",
        "110046",
        "110056",
        "110057",
        "110058",
        "110059",
        "110070",
        "110075",
        "110077",
        "110078",
      ],
      "West Delhi": [
        "110005",
        "110008",
        "110010",
        "110012",
        "110015",
        "110018",
        "110026",
        "110027",
        "110028",
        "110035",
        "110063",
        "110064",
        "110065",
        "110066",
        "110067",
        "110071",
        "110072",
        "110074",
      ],
    },
  }

  useEffect(() => {
    const loadMap = async () => {
      if (typeof window !== "undefined") {
        try {
          const L = (await import("leaflet")).default

          const map = L.map("map").setView([location.lat, location.lon], 13)
          mapRef.current = map

          L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution: "© OpenStreetMap contributors",
          }).addTo(map)

          const marker = L.marker([location.lat, location.lon], {
            draggable: true,
          }).addTo(map)
          markerRef.current = marker

          marker.on("dragend", (e) => {
            const position = e.target.getLatLng()
            setLocation((prev) => ({
              ...prev,
              lat: position.lat,
              lon: position.lng,
            }))
            reverseGeocode(position.lat, position.lng)
          })

          map.on("click", (e) => {
            const { lat, lng } = e.latlng
            marker.setLatLng([lat, lng])
            setLocation((prev) => ({
              ...prev,
              lat,
              lon: lng,
            }))
            reverseGeocode(lat, lng)
          })

          setMapLoaded(true)
        } catch (error) {
          console.error("Failed to load map:", error)
          setMapLoaded(false)
        }
      }
    }

    loadMap()
  }, [])

  const reverseGeocode = async (lat, lon) => {
    try {
      const services = [
        {
          name: "Nominatim",
          url: `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&addressdetails=1&zoom=18`,
          parser: parseNominatimResponse,
        },
        {
          name: "Photon",
          url: `https://photon.komoot.io/reverse?lat=${lat}&lon=${lon}`,
          parser: parsePhotonResponse,
        },
      ]

      for (const service of services) {
        try {
          console.log(`[v0] Trying ${service.name} geocoding service`)
          const response = await fetch(service.url)
          const data = await response.json()
          const parsed = service.parser(data, lat, lon)

          if (parsed.success) {
            console.log(`[v0] ${service.name} geocoding successful`)
            setLocation((prev) => ({
              ...prev,
              ...parsed.data,
            }))
            return
          }
        } catch (error) {
          console.log(`[v0] ${service.name} service failed:`, error.message)
          continue
        }
      }

      console.log("[v0] All geocoding services failed, using coordinate-based detection")
      const fallbackData = getLocationFromCoordinates(lat, lon)
      setLocation((prev) => ({
        ...prev,
        ...fallbackData,
      }))
    } catch (error) {
      console.error("[v0] All reverse geocoding services failed:", error)
    }
  }

  const parseNominatimResponse = (data, lat, lon) => {
    if (!data.display_name) return { success: false }

    const address = data.address || {}
    const district = detectDistrict(address, lat, lon)

    const extractedPincode = extractPincodeFromAddress(data.display_name)
    const pincode = extractedPincode || detectPincodeFromCoordinates(lat, lon, district)

    const tehsil = detectTehsilFromPincode(pincode, district)

    return {
      success: true,
      data: {
        houseAddress: `${address.house_number || ""} ${address.road || address.neighbourhood || ""}`.trim(),
        district: district,
        tehsil: tehsil,
        pincode: pincode,
        fullAddress: data.display_name,
      },
    }
  }

  const parsePhotonResponse = (data, lat, lon) => {
    if (!data.features || data.features.length === 0) return { success: false }

    const feature = data.features[0]
    const properties = feature.properties || {}

    const district = detectDistrict(properties, lat, lon)

    const fullAddressText = `${properties.name || ""}, ${properties.city || "Delhi"}, India`
    const extractedPincode = extractPincodeFromAddress(fullAddressText)
    const pincode = extractedPincode || detectPincodeFromCoordinates(lat, lon, district)

    const tehsil = detectTehsilFromPincode(pincode, district)

    return {
      success: true,
      data: {
        houseAddress: `${properties.housenumber || ""} ${properties.street || properties.name || ""}`.trim(),
        district: district,
        tehsil: tehsil,
        pincode: pincode,
        fullAddress: fullAddressText,
      },
    }
  }

  const extractPincodeFromAddress = (addressString) => {
    if (!addressString) return null

    // Look for 6-digit pincode pattern in the address string
    const pincodeMatch = addressString.match(/\b(1[01]\d{4})\b/)

    if (pincodeMatch) {
      const pincode = pincodeMatch[1]
      console.log(`[v0] Extracted pincode ${pincode} from address: ${addressString}`)

      // Validate that this pincode exists in Delhi
      const allDelhiPincodes = Object.values(delhiData.pincodeRanges).flat()
      if (allDelhiPincodes.includes(pincode)) {
        console.log(`[v0] Pincode ${pincode} validated as Delhi pincode`)
        return pincode
      } else {
        console.log(`[v0] Pincode ${pincode} not found in Delhi pincode list`)
      }
    }

    return null
  }

  const getLocationFromCoordinates = (lat, lon) => {
    const district = getDistrictFromCoordinates(lat, lon).district
    const pincode = detectPincodeFromCoordinates(lat, lon, district)
    const tehsil = detectTehsilFromPincode(pincode, district)

    return {
      district: district,
      tehsil: tehsil,
      pincode: pincode,
      houseAddress: "Address not available",
      fullAddress: `${district}, Delhi, India`,
    }
  }

  const detectPincodeFromCoordinates = (lat, lon, district) => {
    let closestPincode = null
    let minDistance = Number.POSITIVE_INFINITY

    for (const [pincode, coords] of Object.entries(delhiData.pincodeCoordinates)) {
      const distance = calculateDistance(lat, lon, coords.lat, coords.lon)

      if (distance < minDistance) {
        minDistance = distance
        closestPincode = pincode
      }
    }

    const validPincodes = delhiData.pincodeRanges[district] || []
    if (closestPincode && validPincodes.includes(closestPincode)) {
      console.log(`[v0] Found pincode ${closestPincode} at distance ${minDistance.toFixed(2)}km`)
      return closestPincode
    }

    console.log(`[v0] No close pincode match found, using district fallback`)
    return validPincodes[0] || "110001"
  }

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371
    const dLat = ((lat2 - lat1) * Math.PI) / 180
    const dLon = ((lon2 - lon1) * Math.PI) / 180
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
  }

  const detectTehsilFromPincode = (pincode, district) => {
    const pincodeToTehsil = {
      110031: "Gandhi Nagar",
      110032: "Gandhi Nagar",
      110051: "Preet Vihar",
      110053: "Preet Vihar",
      110091: "Preet Vihar",
      110092: "Preet Vihar",
      110093: "Shahdara",
      110094: "Shahdara",
      110095: "Shahdara",
    }

    const tehsil = pincodeToTehsil[pincode]
    if (tehsil) {
      return tehsil
    }

    const tehsils = delhiData.districts[district] || []
    return tehsils[0] || ""
  }

  const getDistrictFromCoordinates = (lat, lon) => {
    const districtBounds = {
      "Central Delhi": { minLat: 28.63, maxLat: 28.68, minLon: 77.2, maxLon: 77.25 },
      "East Delhi": { minLat: 28.61, maxLat: 28.7, minLon: 77.27, maxLon: 77.35 },
      "New Delhi": { minLat: 28.57, maxLat: 28.64, minLon: 77.18, maxLon: 77.25 },
      "North Delhi": { minLat: 28.68, maxLat: 28.75, minLon: 77.18, maxLon: 77.25 },
      "North East Delhi": { minLat: 28.66, maxLat: 28.73, minLon: 77.25, maxLon: 77.32 },
      "North West Delhi": { minLat: 28.68, maxLat: 28.78, minLon: 77.05, maxLon: 77.2 },
      "South Delhi": { minLat: 28.52, maxLat: 28.6, minLon: 77.18, maxLon: 77.28 },
      "South East Delhi": { minLat: 28.5, maxLat: 28.58, minLon: 77.25, maxLon: 77.32 },
      "South West Delhi": { minLat: 28.47, maxLat: 28.58, minLon: 77.05, maxLon: 77.2 },
      "West Delhi": { minLat: 28.58, maxLat: 28.68, minLon: 77.05, maxLon: 77.18 },
    }

    for (const [district, bounds] of Object.entries(districtBounds)) {
      if (lat >= bounds.minLat && lat <= bounds.maxLat && lon >= bounds.minLon && lon <= bounds.maxLon) {
        const tehsils = delhiData.districts[district] || []
        const pincodes = delhiData.pincodeRanges[district] || []

        return {
          district: district,
          tehsil: tehsils[0] || "",
          pincode: pincodes[0] || "",
          houseAddress: "Address not available",
          fullAddress: `${district}, Delhi, India`,
        }
      }
    }

    return {
      district: "East Delhi", // Default fallback
      tehsil: "Preet Vihar",
      pincode: "110031",
      houseAddress: "Address not available",
      fullAddress: "Delhi, India",
    }
  }

  const detectDistrict = (address, lat, lon) => {
    const addressText = JSON.stringify(address).toLowerCase()

    for (const district of Object.keys(delhiData.districts)) {
      if (
        addressText.includes(district.toLowerCase()) ||
        addressText.includes(district.replace(" delhi", "").toLowerCase())
      ) {
        return district
      }
    }

    return getDistrictFromCoordinates(lat, lon).district
  }

  const detectTehsil = (address, district) => {
    const addressText = JSON.stringify(address).toLowerCase()
    const tehsils = delhiData.districts[district] || []

    for (const tehsil of tehsils) {
      if (addressText.includes(tehsil.toLowerCase())) {
        return tehsil
      }
    }

    return tehsils[0] || ""
  }

  const detectPincode = (address, district, lat, lon) => {
    const geocodedPincode = address.postcode || address.postal_code
    if (geocodedPincode && /^\d{6}$/.test(geocodedPincode)) {
      const validPincodes = delhiData.pincodeRanges[district] || []
      if (validPincodes.includes(geocodedPincode)) {
        return geocodedPincode
      }
    }

    return detectPincodeFromCoordinates(lat, lon, district)
  }

  const getCurrentLocation = () => {
    setIsLoading(true)
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude, accuracy } = position.coords
          console.log("[v0] GPS accuracy:", accuracy, "meters")

          setLocation((prev) => ({
            ...prev,
            lat: latitude,
            lon: longitude,
          }))

          if (mapRef.current && markerRef.current) {
            mapRef.current.setView([latitude, longitude], 16)
            markerRef.current.setLatLng([latitude, longitude])
          }

          reverseGeocode(latitude, longitude)
          setIsLoading(false)

          if (accuracy <= 10) {
            alert(`Location updated with high accuracy (±${Math.round(accuracy)}m)`)
          } else if (accuracy <= 50) {
            alert(`Location updated with good accuracy (±${Math.round(accuracy)}m)`)
          } else {
            alert(
              `Location updated with moderate accuracy (±${Math.round(accuracy)}m). For better accuracy, ensure GPS is enabled and you're outdoors.`,
            )
          }
        },
        (error) => {
          console.error("Geolocation error:", error)
          setIsLoading(false)

          let errorMessage = "Unable to get your location. "
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage += "Please allow location access in your browser settings."
              break
            case error.POSITION_UNAVAILABLE:
              errorMessage += "Location information is unavailable. Try moving to an area with better GPS signal."
              break
            case error.TIMEOUT:
              errorMessage += "Location request timed out. Please try again."
              break
            default:
              errorMessage += "An unknown error occurred."
              break
          }
          alert(errorMessage)
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 60000,
        },
      )
    } else {
      alert("Geolocation is not supported by this browser")
      setIsLoading(false)
    }
  }

  const handleNext = () => {
    if (!location.lat || !location.lon) {
      alert("Please select a location on the map")
      return
    }

    const delhiBounds = {
      north: 28.88,
      south: 28.4,
      east: 77.35,
      west: 76.84,
    }

    if (
      location.lat < delhiBounds.south ||
      location.lat > delhiBounds.north ||
      location.lon < delhiBounds.west ||
      location.lon > delhiBounds.east
    ) {
      alert("Please select a location within Delhi")
      return
    }

    if (typeof window !== "undefined") {
      sessionStorage.setItem("assessment_location", JSON.stringify(location))
    }
    router.push("/assess/roof")
  }

  const handleBack = () => {
    router.push("/assess/start")
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-10 bg-background border-b p-4">
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={handleBack}>
            <span className="mr-2">←</span>
            Back
          </Button>
          <h1 className="font-semibold">Select Location</h1>
          <div className="w-16" /> {/* Spacer */}
        </div>
      </div>

      <div className="p-4 space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <span>📍</span>
              Property Location
            </CardTitle>
            <CardDescription>Drag the marker or click on the map to select your property location</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative">
              <div id="map" className="h-64 w-full rounded-lg border bg-muted" />
              {!mapLoaded && (
                <div className="absolute inset-0 flex items-center justify-center bg-muted rounded-lg">
                  <p className="text-muted-foreground">Loading map...</p>
                </div>
              )}
            </div>

            <Button
              onClick={getCurrentLocation}
              disabled={isLoading}
              variant="outline"
              className="w-full bg-transparent"
            >
              <span className="mr-2">🧭</span>
              {isLoading ? "Getting Location..." : "Use Current Location"}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Location Details</CardTitle>
            <CardDescription>Verify and edit the location information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="houseAddress">House/Building Address</Label>
              <Input
                id="houseAddress"
                value={location.houseAddress}
                onChange={(e) => setLocation((prev) => ({ ...prev, houseAddress: e.target.value }))}
                placeholder="House number, street name"
                className="text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="district">District</Label>
                <Input
                  id="district"
                  value={location.district}
                  onChange={(e) => setLocation((prev) => ({ ...prev, district: e.target.value }))}
                  placeholder="East Delhi"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tehsil">Tehsil</Label>
                <Input
                  id="tehsil"
                  value={location.tehsil}
                  onChange={(e) => setLocation((prev) => ({ ...prev, tehsil: e.target.value }))}
                  placeholder="Preet Vihar"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="pincode">Pincode</Label>
                <Input
                  id="pincode"
                  value={location.pincode}
                  onChange={(e) => setLocation((prev) => ({ ...prev, pincode: e.target.value }))}
                  placeholder="110031"
                  maxLength={6}
                />
              </div>
              <div className="space-y-2">
                <Label>Coordinates</Label>
                <p className="text-sm text-muted-foreground bg-muted p-2 rounded">
                  {location.lat.toFixed(6)}, {location.lon.toFixed(6)}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="fullAddress">Complete Address</Label>
              <Input
                id="fullAddress"
                value={location.fullAddress}
                onChange={(e) => setLocation((prev) => ({ ...prev, fullAddress: e.target.value }))}
                placeholder="Complete address with landmarks"
                className="text-sm"
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>Step 1 of 4</span>
          <div className="flex gap-1">
            <div className="h-2 w-8 bg-primary rounded" />
            <div className="h-2 w-8 bg-muted rounded" />
            <div className="h-2 w-8 bg-muted rounded" />
            <div className="h-2 w-8 bg-muted rounded" />
          </div>
        </div>

        <Button onClick={handleNext} className="w-full h-12">
          Continue to Roof Details
          <span className="ml-2">→</span>
        </Button>
      </div>
    </div>
  )
}

