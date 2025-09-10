/**
 * Bill of Quantities (BOQ) and cost estimation for RTRWH structures
 * Based on Delhi PWD rates and market prices
 */

// Standard BOQ templates by roof area bands
export const BOQ_TEMPLATES = {
  SMALL: {
    // ≤100 sqm
    minArea: 0,
    maxArea: 100,
    items: [
      { code: "EXC001", qty: 12, unit: "cum" },
      { code: "BRK001", qty: 8, unit: "cum" },
      { code: "BLD001", qty: 2, unit: "cum" },
      { code: "GRV001", qty: 3, unit: "cum" },
      { code: "SND001", qty: 2, unit: "cum" },
      { code: "PGV001", qty: 1, unit: "cum" },
      { code: "PVC001", qty: 15, unit: "m" },
      { code: "RCC001", qty: 1.5, unit: "cum" },
      { code: "LAB001", qty: 8, unit: "day" },
      { code: "LAB002", qty: 12, unit: "day" },
    ],
  },
  MEDIUM: {
    // 100-200 sqm
    minArea: 100,
    maxArea: 200,
    items: [
      { code: "EXC001", qty: 18, unit: "cum" },
      { code: "BRK001", qty: 12, unit: "cum" },
      { code: "BLD001", qty: 3, unit: "cum" },
      { code: "GRV001", qty: 4, unit: "cum" },
      { code: "SND001", qty: 3, unit: "cum" },
      { code: "PGV001", qty: 2, unit: "cum" },
      { code: "PVC001", qty: 25, unit: "m" },
      { code: "RCC001", qty: 2.5, unit: "cum" },
      { code: "LAB001", qty: 12, unit: "day" },
      { code: "LAB002", qty: 18, unit: "day" },
    ],
  },
  LARGE: {
    // 200-400 sqm
    minArea: 200,
    maxArea: 400,
    items: [
      { code: "EXC001", qty: 25, unit: "cum" },
      { code: "BRK001", qty: 18, unit: "cum" },
      { code: "BLD001", qty: 4, unit: "cum" },
      { code: "GRV001", qty: 6, unit: "cum" },
      { code: "SND001", qty: 4, unit: "cum" },
      { code: "PGV001", qty: 3, unit: "cum" },
      { code: "PVC001", qty: 35, unit: "m" },
      { code: "RCC001", qty: 4, unit: "cum" },
      { code: "LAB001", qty: 18, unit: "day" },
      { code: "LAB002", qty: 25, unit: "day" },
    ],
  },
  XLARGE: {
    // >400 sqm
    minArea: 400,
    maxArea: 10000,
    items: [
      { code: "EXC001", qty: 35, unit: "cum" },
      { code: "BRK001", qty: 25, unit: "cum" },
      { code: "BLD001", qty: 6, unit: "cum" },
      { code: "GRV001", qty: 8, unit: "cum" },
      { code: "SND001", qty: 6, unit: "cum" },
      { code: "PGV001", qty: 4, unit: "cum" },
      { code: "PVC001", qty: 50, unit: "m" },
      { code: "RCC001", qty: 6, unit: "cum" },
      { code: "LAB001", qty: 25, unit: "day" },
      { code: "LAB002", qty: 35, unit: "day" },
    ],
  },
}

// Cost calculation parameters
export const COST_PARAMETERS = {
  contractorMargin: 0.15, // 15% contractor overhead
  contingency: 0.1, // 10% contingency
  gstRate: 0.18, // 18% GST
  rateCardVersion: "2024-Q4",
}

/**
 * Generate BOQ for given roof area and recommendation
 */
export function generateBOQ(rooftopAreaSqm, recommendation) {
  const template = getBOQTemplate(rooftopAreaSqm)

  if (!template) {
    throw new Error("Unable to determine BOQ template for given area")
  }

  // Adjust quantities based on recommendation type
  let adjustmentFactor = 1.0
  if (recommendation === "TRENCH_WITH_WELL") {
    adjustmentFactor = 1.3 // 30% more for recharge well
  }

  const adjustedItems = template.items.map((item) => ({
    ...item,
    qty: Math.round(item.qty * adjustmentFactor * 100) / 100,
  }))

  return {
    template: template,
    items: adjustedItems,
    adjustmentFactor,
    recommendation,
  }
}

/**
 * Calculate total cost estimate
 */
export async function calculateCostEstimate(rooftopAreaSqm, recommendation, refRates) {
  const boq = generateBOQ(rooftopAreaSqm, recommendation)

  let materialSubtotal = 0
  let laborSubtotal = 0
  const costItems = []

  // Calculate costs for each BOQ item
  for (const boqItem of boq.items) {
    const rate = refRates.find((r) => r.itemCode === boqItem.code)

    if (!rate) {
      console.warn(`Rate not found for item: ${boqItem.code}`)
      continue
    }

    const amount = boqItem.qty * rate.unitRate

    const costItem = {
      lineNo: costItems.length + 1,
      category: rate.kind,
      code: boqItem.code,
      description: rate.itemName,
      unit: rate.unit,
      qty: boqItem.qty,
      unitRate: rate.unitRate,
      amount: Math.round(amount),
      notes: null,
    }

    costItems.push(costItem)

    if (rate.kind === "Material") {
      materialSubtotal += amount
    } else if (rate.kind === "Labor") {
      laborSubtotal += amount
    }
  }

  // Calculate overheads and taxes
  const subtotal = materialSubtotal + laborSubtotal
  const overhead = subtotal * COST_PARAMETERS.contractorMargin
  const contingency = subtotal * COST_PARAMETERS.contingency
  const preGst = subtotal + overhead + contingency
  const gst = preGst * COST_PARAMETERS.gstRate
  const grandTotal = preGst + gst

  return {
    materialSubtotal: Math.round(materialSubtotal),
    laborSubtotal: Math.round(laborSubtotal),
    overhead: Math.round(overhead),
    contingency: Math.round(contingency),
    preGst: Math.round(preGst),
    gst: Math.round(gst),
    grandTotal: Math.round(grandTotal),
    currency: "INR",
    rateCardVersion: COST_PARAMETERS.rateCardVersion,
    costItems,
  }
}

/**
 * Get appropriate BOQ template based on roof area
 */
function getBOQTemplate(rooftopAreaSqm) {
  for (const template of Object.values(BOQ_TEMPLATES)) {
    if (rooftopAreaSqm >= template.minArea && rooftopAreaSqm <= template.maxArea) {
      return template
    }
  }
  return null
}

/**
 * Calculate payback period
 */
export function calculatePaybackPeriod(totalCost, annualSavings) {
  if (annualSavings <= 0) {
    return null // No payback if no savings
  }

  return Math.round((totalCost / annualSavings) * 10) / 10 // Round to 1 decimal
}

/**
 * Get cost breakdown by category
 */
export function getCostBreakdown(costEstimate) {
  const breakdown = {
    materials: {
      amount: costEstimate.materialSubtotal,
      percentage: Math.round((costEstimate.materialSubtotal / costEstimate.grandTotal) * 100),
    },
    labor: {
      amount: costEstimate.laborSubtotal,
      percentage: Math.round((costEstimate.laborSubtotal / costEstimate.grandTotal) * 100),
    },
    overhead: {
      amount: costEstimate.overhead,
      percentage: Math.round((costEstimate.overhead / costEstimate.grandTotal) * 100),
    },
    contingency: {
      amount: costEstimate.contingency,
      percentage: Math.round((costEstimate.contingency / costEstimate.grandTotal) * 100),
    },
    gst: {
      amount: costEstimate.gst,
      percentage: Math.round((costEstimate.gst / costEstimate.grandTotal) * 100),
    },
  }

  return breakdown
}

/**
 * Validate cost calculation inputs
 */
export function validateCostInputs(rooftopAreaSqm, recommendation) {
  const errors = []

  if (!rooftopAreaSqm || rooftopAreaSqm <= 0) {
    errors.push("Rooftop area must be greater than 0")
  }

  if (!recommendation) {
    errors.push("Recommendation type is required")
  }

  const template = getBOQTemplate(rooftopAreaSqm)
  if (!template) {
    errors.push("No BOQ template available for this roof area")
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}
