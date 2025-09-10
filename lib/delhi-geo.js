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
    // Central Delhi
    110001: "Central Delhi",
    110002: "Central Delhi",
    110005: "Central Delhi",
    110007: "Central Delhi",
    110009: "Central Delhi",
    110011: "Central Delhi",
    110012: "Central Delhi",
    110013: "Central Delhi",
    110055: "Central Delhi",
    110060: "Central Delhi",
    110006: "Central Delhi",
  
    // New Delhi
    110003: "New Delhi",
    110004: "New Delhi",
    110008: "New Delhi",
    110021: "New Delhi",
    110001: "New Delhi",
    110011: "New Delhi",
    110001: "New Delhi",
    110002: "New Delhi",
    110003: "New Delhi",
  
    // East Delhi
    110031: "East Delhi",
    110032: "East Delhi",
    110051: "East Delhi",
    110053: "East Delhi",
    110091: "East Delhi",
    110092: "East Delhi",
    110093: "East Delhi",
    110094: "East Delhi",
    110095: "East Delhi",
    110096: "East Delhi",
    110097: "East Delhi",
    110098: "East Delhi",
  
    // North Delhi
    110033: "North Delhi",
    110035: "North Delhi",
    110054: "North Delhi",
    110006: "North Delhi",
    110007: "North Delhi",
    110009: "North Delhi",
    110084: "North Delhi",
    110085: "North Delhi",
    110006: "North Delhi",
  
    // North East Delhi
    110031: "North East Delhi",
    110032: "North East Delhi",
    110053: "North East Delhi",
    110093: "North East Delhi",
    110094: "North East Delhi",
    110095: "North East Delhi",
    110096: "North East Delhi",
    110097: "North East Delhi",
    110098: "North East Delhi",
    110053: "North East Delhi",
    110031: "North East Delhi",
    110032: "North East Delhi",
  
    // North West Delhi
    110033: "North West Delhi",
    110034: "North West Delhi",
    110035: "North West Delhi",
    110036: "North West Delhi",
    110039: "North West Delhi",
    110040: "North West Delhi",
    110041: "North West Delhi",
    110042: "North West Delhi",
    110043: "North West Delhi",
    110044: "North West Delhi",
    110045: "North West Delhi",
    110046: "North West Delhi",
    110047: "North West Delhi",
    110052: "North West Delhi",
    110081: "North West Delhi",
    110082: "North West Delhi",
    110083: "North West Delhi",
    110084: "North West Delhi",
    110085: "North West Delhi",
    110086: "North West Delhi",
    110087: "North West Delhi",
    110088: "North West Delhi",
    110089: "North West Delhi",
  
    // Shahdara
    110031: "Shahdara",
    110032: "Shahdara",
    110053: "Shahdara",
    110093: "Shahdara",
    110094: "Shahdara",
    110095: "Shahdara",
    110096: "Shahdara",
    110097: "Shahdara",
    110098: "Shahdara",
    110031: "Shahdara",
    110032: "Shahdara",
    110053: "Shahdara",
  
    // South Delhi
    110016: "South Delhi",
    110024: "South Delhi",
    110025: "South Delhi",
    110026: "South Delhi",
    110027: "South Delhi",
    110028: "South Delhi",
    110029: "South Delhi",
    110030: "South Delhi",
    110048: "South Delhi",
    110049: "South Delhi",
    110062: "South Delhi",
    110070: "South Delhi",
    110003: "South Delhi",
    110021: "South Delhi",
    110023: "South Delhi",
  
    // South East Delhi
    110013: "South East Delhi",
    110014: "South East Delhi",
    110019: "South East Delhi",
    110020: "South East Delhi",
    110025: "South East Delhi",
    110044: "South East Delhi",
    110062: "South East Delhi",
    110065: "South East Delhi",
    110076: "South East Delhi",
    110025: "South East Delhi",
    110019: "South East Delhi",
    110020: "South East Delhi",
  
    // South West Delhi
    110010: "South West Delhi",
    110015: "South West Delhi",
    110016: "South West Delhi",
    110017: "South West Delhi",
    110018: "South West Delhi",
    110022: "South West Delhi",
    110023: "South West Delhi",
    110024: "South West Delhi",
    110030: "South West Delhi",
    110037: "South West Delhi",
    110038: "South West Delhi",
    110045: "South West Delhi",
    110046: "South West Delhi",
    110056: "South West Delhi",
    110057: "South West Delhi",
    110058: "South West Delhi",
    110059: "South West Delhi",
    110061: "South West Delhi",
    110062: "South West Delhi",
    110063: "South West Delhi",
    110064: "South West Delhi",
    110066: "South West Delhi",
    110067: "South West Delhi",
    110068: "South West Delhi",
    110069: "South West Delhi",
    110070: "South West Delhi",
    110071: "South West Delhi",
    110072: "South West Delhi",
    110073: "South West Delhi",
    110074: "South West Delhi",
    110075: "South West Delhi",
    110077: "South West Delhi",
    110078: "South West Delhi",
  
    // West Delhi
    110015: "West Delhi",
    110018: "West Delhi",
    110022: "West Delhi",
    110026: "West Delhi",
    110027: "West Delhi",
    110041: "West Delhi",
    110045: "West Delhi",
    110056: "West Delhi",
    110058: "West Delhi",
    110059: "West Delhi",
    110063: "West Delhi",
    110064: "West Delhi",
    110071: "West Delhi",
    110077: "West Delhi",
    110087: "West Delhi",
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
  
    // Enhanced geological information based on district with updated water table depths
    const geologicalData = {
      "Central Delhi": { lithoClass: "Alluvium", soilClass: "Sandy Loam", waterDepth: 12 },
      "East Delhi": { lithoClass: "Alluvium", soilClass: "Clay Loam", waterDepth: 5.25 }, // Updated from survey data
      "New Delhi": { lithoClass: "Alluvium", soilClass: "Sandy", waterDepth: 27.9 }, // Updated from survey data
      "North Delhi": { lithoClass: "Alluvium", soilClass: "Loam", waterDepth: 15 },
      "North East Delhi": { lithoClass: "Alluvium", soilClass: "Clay Loam", waterDepth: 4.65 }, // Updated from survey data
      "North West Delhi": { lithoClass: "Alluvium", soilClass: "Sandy Loam", waterDepth: 39.85 }, // Updated from survey data
      Shahdara: { lithoClass: "Alluvium", soilClass: "Clay", waterDepth: 5 },
      "South Delhi": { lithoClass: "Quartzite", soilClass: "Sandy", waterDepth: 60.8 }, // Updated from survey data
      "South East Delhi": { lithoClass: "Alluvium", soilClass: "Sandy Loam", waterDepth: 14 },
      "South West Delhi": { lithoClass: "Quartzite", soilClass: "Sandy Loam", waterDepth: 41.8 }, // Updated from survey data
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
  