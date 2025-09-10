/**
 * Multi-Criteria Decision Analysis (MCDA) scoring for RTRWH feasibility
 * Based on Delhi-specific hydrogeological and urban planning factors
 * Updated with new veto factor scoring algorithm
 */

export const SCORING_WEIGHTS = {
  waterTable: 0.2, // Water table depth - 20% (increased from 15%)
  soil: 0.25, // Soil permeability - 25% (unchanged)
  geology: 0.2, // Geological formation - 20% (unchanged)
  landUse: 0.1, // Land use category - 10% (unchanged)
  slope: 0.05, // Ground slope - 5% (unchanged)
  runoffVolume: 0.2, // Annual runoff volume potential - 20% (unchanged)
}

// Veto criteria that automatically fail assessment
export const VETO_CRITERIA = {
  minSafetyDistance: 15, // meters from contamination sources
  minWaterDepth: 3, // meters below ground level
}

export const SCORE_BANDS = {
  HIGHLY_FEASIBLE: { min: 80, max: 100, label: "Highly Feasible", color: "green" },
  MODERATELY_FEASIBLE: { min: 60, max: 79, label: "Moderately Feasible", color: "yellow" },
  MARGINALLY_FEASIBLE: { min: 40, max: 59, label: "Marginally Feasible", color: "orange" },
  NOT_RECOMMENDED: { min: 0, max: 39, label: "Not Recommended", color: "red" },
}

/**
 * Calculate feasibility score using updated MCDA methodology
 */
export function calculateFeasibilityScore(assessmentData) {
  const {
    waterDepthPostM,
    soilClass,
    lithoClass,
    landUse,
    surroundingLandUse,
    slopePct,
    safetyDistance,
    annualRunoffLiters,
  } = assessmentData

  // Check veto criteria first
  const vetoResult = checkVetoCriteria(waterDepthPostM, safetyDistance)
  if (vetoResult.isVeto) {
    return {
      isVeto: true,
      vetoReason: vetoResult.reason,
      score: 0,
      scoreLevel: "VETO_FAIL",
      factorScores: [],
    }
  }

  const factorScores = [
    calculateWaterTableScore(waterDepthPostM),
    calculateSoilScore(soilClass),
    calculateGeologyScore(lithoClass),
    calculateLandUseScore(surroundingLandUse || landUse),
    calculateSlopeScore(slopePct),
    calculateRunoffVolumeScore(annualRunoffLiters),
  ]

  // Calculate weighted total score (out of 25, then scale to 100)
  const totalScore = factorScores.reduce((sum, factor) => {
    return sum + factor.points * factor.weight
  }, 0)

  // Scale to 100-point system
  const scaledScore = Math.round(totalScore * 4)

  const scoreLevel = getScoreLevel(scaledScore)

  return {
    isVeto: false,
    score: scaledScore,
    scoreLevel,
    factorScores,
    recommendation: getRecommendation(scaledScore, waterDepthPostM),
  }
}

function checkVetoCriteria(waterDepth, safetyDistance) {
  if (safetyDistance < VETO_CRITERIA.minSafetyDistance) {
    return {
      isVeto: true,
      reason: `This site is UNSUITABLE for artificial recharge due to critical safety risks (proximity to contamination source: ${safetyDistance}m < 15m required)`,
    }
  }

  if (waterDepth < VETO_CRITERIA.minWaterDepth) {
    return {
      isVeto: true,
      reason: `This site is UNSUITABLE for artificial recharge due to critical safety risks (shallow water table: ${waterDepth}m < 3m required)`,
    }
  }

  return { isVeto: false }
}

function calculateWaterTableScore(depth) {
  let points = 0
  let band = ""

  if (depth > 5) {
    points = 25
    band = "Excellent (>5m)"
  } else if (depth >= 3 && depth <= 5) {
    points = 15
    band = "Acceptable (3-5m)"
  } else {
    points = 0 // This should trigger veto
    band = "Fail (<3m - High risk)"
  }

  return {
    key: "waterTable",
    rawValue: `${depth}m`,
    band,
    points,
    weight: SCORING_WEIGHTS.waterTable,
    weighted: points * SCORING_WEIGHTS.waterTable,
  }
}

function calculateSoilScore(soilClass) {
  const soilScores = {
    Sandy: { points: 25, band: "Excellent (High Infiltration)" },
    "Sandy Loam": { points: 20, band: "Good (Good Infiltration)" },
    Loam: { points: 20, band: "Good (Good Infiltration)" },
    "Silty Loam": { points: 10, band: "Poor (Moderate Infiltration)" },
    Silt: { points: 10, band: "Poor (Moderate Infiltration)" },
    "Clay Loam": { points: 0, band: "Unsuitable (Very Low Infiltration)" },
    Clay: { points: 0, band: "Unsuitable (Very Low Infiltration)" },
  }

  const score = soilScores[soilClass] || { points: 10, band: "Unknown" }

  return {
    key: "soil",
    rawValue: soilClass,
    band: score.band,
    points: score.points,
    weight: SCORING_WEIGHTS.soil,
    weighted: score.points * SCORING_WEIGHTS.soil,
  }
}

function calculateGeologyScore(lithoClass) {
  const geologyScores = {
    Alluvium: { points: 25, band: "Excellent (Common in Delhi)" },
    "Sandy Formations": { points: 25, band: "Excellent for Recharge" },
    "Fractured Rock": { points: 15, band: "Good" },
    Quartzite: { points: 15, band: "Good" },
    "Weathered Rock": { points: 10, band: "Acceptable" },
    Sandstone: { points: 15, band: "Good" },
    "Hard Rock": { points: 0, band: "Unsuitable (Non-porous)" },
    Granite: { points: 0, band: "Unsuitable (Non-porous)" },
  }

  const score = geologyScores[lithoClass] || { points: 10, band: "Moderate" }

  return {
    key: "geology",
    rawValue: lithoClass,
    band: score.band,
    points: score.points,
    weight: SCORING_WEIGHTS.geology,
    weighted: score.points * SCORING_WEIGHTS.geology,
  }
}

function calculateLandUseScore(landUse) {
  const landUseScores = {
    "Open Park": { points: 25, band: "Excellent (Low contamination risk)" },
    Garden: { points: 25, band: "Excellent (Low contamination risk)" },
    Vegetation: { points: 25, band: "Excellent (Low contamination risk)" },
    "Residential Paving": { points: 15, band: "Acceptable (Moderate risk)" },
    Residential: { points: 15, band: "Acceptable (Moderate risk)" },
    "Heavy Traffic Road": { points: 5, band: "Poor (High risk)" },
    Commercial: { points: 5, band: "Poor (High risk)" },
    Industrial: { points: 5, band: "Poor (High risk)" },
    Mixed: { points: 10, band: "Moderate" },
  }

  const score = landUseScores[landUse] || { points: 10, band: "Average" }

  return {
    key: "landUse",
    rawValue: landUse,
    band: score.band,
    points: score.points,
    weight: SCORING_WEIGHTS.landUse,
    weighted: score.points * SCORING_WEIGHTS.landUse,
  }
}

function calculateSlopeScore(slopePct) {
  let points = 0
  let band = ""

  if (slopePct >= 0 && slopePct <= 1) {
    points = 25
    band = "Excellent (Nearly Flat 0-1%)"
  } else if (slopePct > 1 && slopePct <= 3) {
    points = 20
    band = "Good (Gentle Slope 1-3%)"
  } else if (slopePct > 3 && slopePct <= 5) {
    points = 10
    band = "Acceptable (Moderate Slope 3-5%)"
  } else {
    points = 0
    band = "Poor (Steep Slope >5% - High runoff)"
  }

  return {
    key: "slope",
    rawValue: `${slopePct}%`,
    band,
    points,
    weight: SCORING_WEIGHTS.slope,
    weighted: points * SCORING_WEIGHTS.slope,
  }
}

function calculateRunoffVolumeScore(annualRunoffLiters) {
  let points = 0
  let band = ""

  if (annualRunoffLiters > 100000) {
    points = 25
    band = "Excellent (>100,000 L/year)"
  } else if (annualRunoffLiters >= 50000) {
    points = 20
    band = "Good (50,000-100,000 L/year)"
  } else if (annualRunoffLiters >= 20000) {
    points = 15
    band = "Acceptable (20,000-50,000 L/year)"
  } else {
    points = 5
    band = "Low Potential (<20,000 L/year)"
  }

  return {
    key: "runoffVolume",
    rawValue: `${Math.round(annualRunoffLiters).toLocaleString()} L/year`,
    band,
    points,
    weight: SCORING_WEIGHTS.runoffVolume,
    weighted: points * SCORING_WEIGHTS.runoffVolume,
  }
}

function getScoreLevel(score) {
  if (score >= 80) return "HIGHLY_FEASIBLE"
  if (score >= 60) return "MODERATELY_FEASIBLE"
  if (score >= 40) return "MARGINALLY_FEASIBLE"
  return "NOT_RECOMMENDED"
}

function getRecommendation(score, waterDepth) {
  if (score < 40) {
    return "NOT_RECOMMENDED"
  } else if (waterDepth < 5) {
    return "NOT_RECOMMENDED"
  } else if (waterDepth <= 15) {
    return "TRENCH_ONLY"
  } else {
    return "TRENCH_WITH_WELL"
  }
}

export function getRecommendationDetails(recommendation, score) {
  const recommendations = {
    NOT_RECOMMENDED: {
      title: "Not Recommended",
      description:
        score < 40
          ? "This site is not recommended for artificial recharge due to poor ground conditions (e.g., clay soil, low runoff). Consider using the harvested water for surface storage or gardening instead."
          : "Site conditions are not suitable for rainwater harvesting",
      structure: null,
      dimensions: null,
    },
    TRENCH_ONLY: {
      title: "Infiltration Trench",
      description: "Shallow infiltration system suitable for moderate water table depth",
      structure: "Infiltration Trench",
      dimensions: "3m × 2m × 2m",
    },
    TRENCH_WITH_WELL: {
      title: "Trench with Recharge Well",
      description: "Combined system with deep recharge bore for maximum efficiency",
      structure: "Trench + Recharge Well",
      dimensions: "3m × 2m × 2m + 150mm bore",
    },
    VETO_FAIL: {
      title: "Not Feasible",
      description: "This site is UNSUITABLE for artificial recharge due to critical safety risks",
      structure: null,
      dimensions: null,
    },
  }

  return recommendations[recommendation] || recommendations["NOT_RECOMMENDED"]
}

export function getFeasibilityMessage(scoreLevel, score) {
  const messages = {
    HIGHLY_FEASIBLE:
      "Excellent location! This site has a very high potential for successful rainwater harvesting and recharge. Proceed with detailed planning.",
    MODERATELY_FEASIBLE:
      "Good location. This site is suitable for rainwater harvesting. Pay attention to soil conditions and ensure proper filtration during construction.",
    MARGINALLY_FEASIBLE:
      "This site has some limitations. Recharge may be slow. Consider a smaller system or consult an expert. A detailed site survey is recommended.",
    NOT_RECOMMENDED:
      "This site is not recommended for artificial recharge due to poor ground conditions (e.g., clay soil, low runoff). Consider using the harvested water for surface storage or gardening instead.",
    VETO_FAIL:
      "This site is UNSUITABLE for artificial recharge due to critical safety risks (e.g., proximity to contamination / shallow water table).",
  }

  return messages[scoreLevel] || messages["NOT_RECOMMENDED"]
}
