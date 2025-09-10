/**
 * Runoff calculation utilities for Delhi RTRWH assessment
 * Based on rational method and Delhi rainfall patterns
 */

// Delhi average annual rainfall (mm)
export const DELHI_ANNUAL_RAINFALL = 650

// Runoff coefficients by roof type
export const ROOF_RUNOFF_COEFFICIENTS = {
  "RCC Flat": 0.85,
  "RCC Sloped": 0.8,
  Tile: 0.75,
  "Metal Sheet": 0.9,
  Asbestos: 0.85,
  Thatch: 0.4,
  Mixed: 0.75,
}

// Monthly rainfall distribution for Delhi (as percentage of annual)
export const MONTHLY_RAINFALL_DISTRIBUTION = {
  January: 0.02,
  February: 0.03,
  March: 0.02,
  April: 0.01,
  May: 0.02,
  June: 0.12,
  July: 0.35,
  August: 0.3,
  September: 0.1,
  October: 0.02,
  November: 0.01,
  December: 0.01,
}

/**
 * Calculate annual runoff potential for a rooftop
 */
export function calculateAnnualRunoff(rooftopAreaSqm, roofType, rainfallMm = DELHI_ANNUAL_RAINFALL) {
  const runoffCoeff = ROOF_RUNOFF_COEFFICIENTS[roofType] || 0.75

  // Runoff = Area × Rainfall × Runoff Coefficient × Collection Efficiency
  // Collection efficiency assumed at 85% to account for losses
  const collectionEfficiency = 0.85

  const annualRunoffLiters = rooftopAreaSqm * (rainfallMm / 1000) * runoffCoeff * collectionEfficiency * 1000

  return {
    annualRunoffLiters: Math.round(annualRunoffLiters),
    runoffCoeff,
    collectionEfficiency,
    rooftopAreaSqm,
    rainfallMm,
  }
}

/**
 * Calculate monthly runoff distribution
 */
export function calculateMonthlyRunoff(annualRunoffLiters) {
  const monthlyRunoff = {}

  Object.entries(MONTHLY_RAINFALL_DISTRIBUTION).forEach(([month, percentage]) => {
    monthlyRunoff[month] = Math.round(annualRunoffLiters * percentage)
  })

  return monthlyRunoff
}

/**
 * Calculate first flush volume to be discarded
 * First 1-2mm of rainfall should be discarded to remove roof contaminants
 */
export function calculateFirstFlushVolume(rooftopAreaSqm, firstFlushMm = 1.5) {
  return Math.round(rooftopAreaSqm * firstFlushMm)
}

/**
 * Calculate storage tank size recommendation
 */
export function calculateStorageTankSize(annualRunoffLiters, householdSize = 4) {
  // Recommended storage: 15-20 days of household water need
  const dailyNeedPerPerson = 150 // liters
  const storageDays = 20
  const recommendedStorage = householdSize * dailyNeedPerPerson * storageDays

  // Don't exceed 30% of annual runoff for practical reasons
  const maxStorage = annualRunoffLiters * 0.3

  const recommendedSize = Math.min(recommendedStorage, maxStorage)

  return {
    recommendedSize: Math.round(recommendedSize),
    dailyNeed: householdSize * dailyNeedPerPerson,
    storageDays,
    maxPracticalSize: Math.round(maxStorage),
  }
}

/**
 * Calculate water balance for the year
 */
export function calculateWaterBalance(annualRunoffLiters, householdSize, monthlyConsumption) {
  const monthlyRunoff = calculateMonthlyRunoff(annualRunoffLiters)
  const balance = {}

  Object.entries(monthlyRunoff).forEach(([month, runoff]) => {
    const consumption = monthlyConsumption || householdSize * 150 * 30 // 30 days average
    balance[month] = {
      runoff,
      consumption,
      surplus: Math.max(0, runoff - consumption),
      deficit: Math.max(0, consumption - runoff),
    }
  })

  return balance
}

/**
 * Get runoff coefficient for roof type
 */
export function getRunoffCoefficient(roofType) {
  return ROOF_RUNOFF_COEFFICIENTS[roofType] || 0.75
}

/**
 * Validate runoff calculations
 */
export function validateRunoffInputs(rooftopAreaSqm, roofType) {
  const errors = []

  if (!rooftopAreaSqm || rooftopAreaSqm <= 0) {
    errors.push("Rooftop area must be greater than 0")
  }

  if (rooftopAreaSqm > 10000) {
    errors.push("Rooftop area seems unusually large (>10,000 sqm)")
  }

  if (!roofType || !ROOF_RUNOFF_COEFFICIENTS[roofType]) {
    errors.push("Invalid roof type selected")
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}
