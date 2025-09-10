/**
 * Geographic utility functions for Delhi RTRWH assessment
 * Includes coordinate validation, distance calculations, and Delhi-specific data
 */

// Delhi boundary coordinates (approximate)
export const DELHI_BOUNDS = {
  north: 28.88,
  south: 28.4,
  east: 77.35,
  west: 76.84,
}

// Delhi districts and their characteristics
export const DELHI_DISTRICTS = {
  "Central Delhi": { tehsil: "Central Delhi", waterTable: "Moderate", soilType: "Alluvial" },
  "East Delhi": { tehsil: "East Delhi", waterTable: "Shallow", soilType: "Alluvial" },
  "New Delhi": { tehsil: "New Delhi", waterTable: "Deep", soilType: "Alluvial" },
  "North Delhi": { tehsil: "North Delhi", waterTable: "Moderate", soilType: "Alluvial" },
  "North East Delhi": { tehsil: "North East Delhi", waterTable: "Shallow", soilType: "Alluvial" },
  "North West Delhi": { tehsil: "North West Delhi", waterTable: "Moderate", soilType: "Alluvial" },
  Shahdara: { tehsil: "Shahdara", waterTable: "Shallow", soilType: "Alluvial" },
  "South Delhi": { tehsil: "South Delhi", waterTable: "Deep", soilType: "Quartzite" },
  "South East Delhi": { tehsil: "South East Delhi", waterTable: "Moderate", soilType: "Alluvial" },
  "South West Delhi": { tehsil: "South West Delhi", waterTable: "Deep", soilType: "Quartzite" },
  "West Delhi": { tehsil: "West Delhi", waterTable: "Moderate", soilType: "Alluvial" },
}

// Common pincode to district mapping (sample)
export const PINCODE_TO_DISTRICT = {
  110001: "Central Delhi",
  110002: "Central Delhi",
  110003: "New Delhi",
  110004: "New Delhi",
  110005: "Central Delhi",
  110006: "New Delhi",
  110007: "Central Delhi",
  110008: "New Delhi",
  110009: "Central Delhi",
  110010: "South West Delhi",
  110011: "Central Delhi",
  110012: "Central Delhi",
  110013: "Central Delhi",
  110014: "South West Delhi",
  110015: "South West Delhi",
  110016: "South West Delhi",
  110017: "South West Delhi",
  110018: "South West Delhi",
  110019: "South West Delhi",
  110020: "South West Delhi",
  110021: "New Delhi",
  110022: "South West Delhi",
  110023: "South West Delhi",
  110024: "South West Delhi",
  110025: "South Delhi",
  110026: "South Delhi",
  110027: "South Delhi",
  110028: "South Delhi",
  110029: "South Delhi",
  110030: "South Delhi",
}

/**
 * Check if coordinates are within Delhi boundaries
 */
export function isWithinDelhi(lat, lon) {
  return lat >= DELHI_BOUNDS.south && lat <= DELHI_BOUNDS.north && lon >= DELHI_BOUNDS.west && lon <= DELHI_BOUNDS.east
}

/**
 * Calculate distance between two coordinates (Haversine formula)
 */
export function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371 // Earth's radius in kilometers
  const dLat = toRadians(lat2 - lat1)
  const dLon = toRadians(lon2 - lon1)

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2)

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  const distance = R * c

  return distance * 1000 // Convert to meters
}

function toRadians(degrees) {
  return degrees * (Math.PI / 180)
}

/**
 * Get district information from coordinates or pincode
 */
export function getDistrictInfo(lat, lon, pincode) {
  // First try pincode lookup
  if (pincode && PINCODE_TO_DISTRICT[pincode]) {
    const district = PINCODE_TO_DISTRICT[pincode]
    return {
      district,
      ...DELHI_DISTRICTS[district],
      source: "pincode",
    }
  }

  // Fallback to coordinate-based estimation (simplified)
  if (lat && lon && isWithinDelhi(lat, lon)) {
    let estimatedDistrict = "Central Delhi" // Default

    // Simple coordinate-based district estimation
    if (lat > 28.7 && lon < 77.1) {
      estimatedDistrict = "North West Delhi"
    } else if (lat > 28.7 && lon > 77.2) {
      estimatedDistrict = "North East Delhi"
    } else if (lat < 28.55 && lon < 77.15) {
      estimatedDistrict = "South West Delhi"
    } else if (lat < 28.55 && lon > 77.15) {
      estimatedDistrict = "South Delhi"
    }

    return {
      district: estimatedDistrict,
      ...DELHI_DISTRICTS[estimatedDistrict],
      source: "coordinates",
    }
  }

  return null
}

/**
 * Get geological characteristics for location
 */
export function getGeologicalInfo(district) {
  const districtInfo = DELHI_DISTRICTS[district]
  if (!districtInfo) return null

  // Enhanced geological information based on district
  const geologicalData = {
    "Central Delhi": { lithoClass: "Alluvium", soilClass: "Sandy Loam", waterDepth: 12 },
    "East Delhi": { lithoClass: "Alluvium", soilClass: "Clay Loam", waterDepth: 8 },
    "New Delhi": { lithoClass: "Alluvium", soilClass: "Sandy", waterDepth: 18 },
    "North Delhi": { lithoClass: "Alluvium", soilClass: "Loam", waterDepth: 15 },
    "North East Delhi": { lithoClass: "Alluvium", soilClass: "Clay Loam", waterDepth: 6 },
    "North West Delhi": { lithoClass: "Alluvium", soilClass: "Sandy Loam", waterDepth: 10 },
    Shahdara: { lithoClass: "Alluvium", soilClass: "Clay", waterDepth: 5 },
    "South Delhi": { lithoClass: "Quartzite", soilClass: "Sandy", waterDepth: 25 },
    "South East Delhi": { lithoClass: "Alluvium", soilClass: "Sandy Loam", waterDepth: 14 },
    "South West Delhi": { lithoClass: "Quartzite", soilClass: "Sandy Loam", waterDepth: 20 },
    "West Delhi": { lithoClass: "Alluvium", soilClass: "Loam", waterDepth: 12 },
  }

  return geologicalData[district] || null
}

/**
 * Validate coordinates
 */
export function validateCoordinates(lat, lon) {
  const errors = []

  if (!lat || !lon) {
    errors.push("Latitude and longitude are required")
    return { isValid: false, errors }
  }

  if (lat < -90 || lat > 90) {
    errors.push("Latitude must be between -90 and 90")
  }

  if (lon < -180 || lon > 180) {
    errors.push("Longitude must be between -180 and 180")
  }

  if (!isWithinDelhi(lat, lon)) {
    errors.push("Location must be within Delhi boundaries")
  }

  return {
    isValid: errors.length === 0,
    errors,
    isWithinDelhi: isWithinDelhi(lat, lon),
  }
}

/**
 * Format coordinates for display
 */
export function formatCoordinates(lat, lon, precision = 6) {
  return {
    lat: Number.parseFloat(lat).toFixed(precision),
    lon: Number.parseFloat(lon).toFixed(precision),
    display: `${Number.parseFloat(lat).toFixed(precision)}, ${Number.parseFloat(lon).toFixed(precision)}`,
  }
}

/**
 * Get center coordinates of Delhi
 */
export function getDelhiCenter() {
  return {
    lat: 28.6139,
    lon: 77.209,
  }
}

/**
 * Generate address string from components
 */
export function formatAddress(addressComponents) {
  const { addressText, district, pincode } = addressComponents

  let formattedAddress = addressText || ""

  if (district && !formattedAddress.includes(district)) {
    formattedAddress += formattedAddress ? `, ${district}` : district
  }

  if (pincode && !formattedAddress.includes(pincode)) {
    formattedAddress += formattedAddress ? `, ${pincode}` : pincode
  }

  formattedAddress += formattedAddress ? ", Delhi" : "Delhi"

  return formattedAddress
}

/**
 * Calculate slope percentage from elevation data
 */
export function calculateSlope(elevationPoints) {
  if (!elevationPoints || elevationPoints.length < 2) {
    return 0 // Assume flat if no elevation data
  }

  const maxElevation = Math.max(...elevationPoints)
  const minElevation = Math.min(...elevationPoints)
  const elevationDiff = maxElevation - minElevation

  // Assume 100m distance for slope calculation (simplified)
  const distance = 100
  const slopePercent = (elevationDiff / distance) * 100

  return Math.abs(slopePercent)
}
