/**
 * Delhi Jal Board (DJB) billing and tariff calculations
 * Based on current DJB tariff structure for domestic connections
 */

// DJB domestic tariff slabs (as of 2024)
export const DJB_TARIFF_SLABS = [
  {
    slabNo: 1,
    minKl: 0,
    maxKl: 20,
    rate: 0, // Free water up to 20 kL
    sewerRate: 0, // No sewer charge for free water
    serviceCharge: 0, // No service charge for free water
  },
  {
    slabNo: 2,
    minKl: 20,
    maxKl: 30,
    rate: 28, // ₹28 per kL
    sewerRate: 0.6, // 60% of water bill
    serviceCharge: 280, // Fixed service charge
  },
  {
    slabNo: 3,
    minKl: 30,
    maxKl: 50,
    rate: 32,
    sewerRate: 0.6,
    serviceCharge: 280,
  },
  {
    slabNo: 4,
    minKl: 50,
    maxKl: 100,
    rate: 38,
    sewerRate: 0.6,
    serviceCharge: 280,
  },
  {
    slabNo: 5,
    minKl: 100,
    maxKl: 999999,
    rate: 45,
    sewerRate: 0.6,
    serviceCharge: 280,
  },
]

/**
 * Calculate DJB bill for given consumption
 */
export function calculateDJBBill(consumptionKl) {
  if (consumptionKl <= 0) {
    return {
      consumption: 0,
      waterBill: 0,
      sewerBill: 0,
      serviceCharge: 0,
      totalBill: 0,
      slabDetails: [],
    }
  }

  // If consumption is ≤20 kL, it's completely free
  if (consumptionKl <= 20) {
    return {
      consumption: consumptionKl,
      waterBill: 0,
      sewerBill: 0,
      serviceCharge: 0,
      totalBill: 0,
      slabDetails: [
        {
          slab: 1,
          consumption: consumptionKl,
          rate: 0,
          amount: 0,
        },
      ],
      isFreeWater: true,
    }
  }

  // For consumption >20 kL, entire consumption is charged (no free portion)
  let waterBill = 0
  let remainingConsumption = consumptionKl
  const slabDetails = []

  // Find applicable slab and calculate bill
  for (const slab of DJB_TARIFF_SLABS) {
    if (remainingConsumption <= 0) break

    if (consumptionKl > slab.minKl) {
      const slabConsumption = Math.min(remainingConsumption, slab.maxKl - slab.minKl)
      const slabAmount = slabConsumption * slab.rate

      waterBill += slabAmount
      remainingConsumption -= slabConsumption

      slabDetails.push({
        slab: slab.slabNo,
        consumption: slabConsumption,
        rate: slab.rate,
        amount: slabAmount,
      })

      // Use the service charge and sewer rate from the applicable slab
      var serviceCharge = slab.serviceCharge
      var sewerRate = slab.sewerRate

      if (remainingConsumption <= 0) break
    }
  }

  const sewerBill = waterBill * sewerRate
  const totalBill = waterBill + sewerBill + serviceCharge

  return {
    consumption: consumptionKl,
    waterBill: Math.round(waterBill),
    sewerBill: Math.round(sewerBill),
    serviceCharge,
    totalBill: Math.round(totalBill),
    slabDetails,
    isFreeWater: false,
  }
}

/**
 * Calculate monthly bills with and without RTRWH
 */
export function calculateBillComparison(monthlyNeedKl, rtrwhSupplyKl) {
  const djbDrawWithoutRTRWH = monthlyNeedKl
  const djbDrawWithRTRWH = Math.max(0, monthlyNeedKl - rtrwhSupplyKl)

  const billWithout = calculateDJBBill(djbDrawWithoutRTRWH)
  const billWith = calculateDJBBill(djbDrawWithRTRWH)

  const monthlySavings = billWithout.totalBill - billWith.totalBill

  return {
    monthlyNeed: monthlyNeedKl,
    rtrwhSupply: rtrwhSupplyKl,
    djbDrawWithout: djbDrawWithoutRTRWH,
    djbDrawWith: djbDrawWithRTRWH,
    billWithout,
    billWith,
    monthlySavings: Math.round(monthlySavings),
  }
}

/**
 * Calculate annual savings from RTRWH
 */
export function calculateAnnualSavings(monthlyComparisons) {
  let annualSavings = 0
  const monthlyBreakdown = []

  monthlyComparisons.forEach((comparison, index) => {
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

    annualSavings += comparison.monthlySavings
    monthlyBreakdown.push({
      month: monthNames[index],
      savings: comparison.monthlySavings,
      rtrwhSupply: comparison.rtrwhSupply,
      djbBill: comparison.billWith.totalBill,
    })
  })

  return {
    annualSavings: Math.round(annualSavings),
    monthlyBreakdown,
    averageMonthlySavings: Math.round(annualSavings / 12),
  }
}

/**
 * Calculate bill scenarios for different consumption patterns
 */
export function calculateBillScenarios(baseConsumptionKl, rtrwhSupplyKl) {
  const scenarios = []

  // Current scenario
  scenarios.push({
    scenario: "Current Usage",
    consumption: baseConsumptionKl,
    rtrwhSupply: 0,
    bill: calculateDJBBill(baseConsumptionKl),
  })

  // With RTRWH
  const withRTRWH = Math.max(0, baseConsumptionKl - rtrwhSupplyKl)
  scenarios.push({
    scenario: "With RTRWH",
    consumption: baseConsumptionKl,
    rtrwhSupply: rtrwhSupplyKl,
    djbDraw: withRTRWH,
    bill: calculateDJBBill(withRTRWH),
  })

  // Conservative usage (20% reduction)
  const conservativeConsumption = baseConsumptionKl * 0.8
  const conservativeWithRTRWH = Math.max(0, conservativeConsumption - rtrwhSupplyKl)
  scenarios.push({
    scenario: "Conservative + RTRWH",
    consumption: conservativeConsumption,
    rtrwhSupply: rtrwhSupplyKl,
    djbDraw: conservativeWithRTRWH,
    bill: calculateDJBBill(conservativeWithRTRWH),
  })

  return scenarios
}

/**
 * Get tariff slab information for given consumption
 */
export function getTariffSlabInfo(consumptionKl) {
  if (consumptionKl <= 20) {
    return {
      slabNo: 1,
      slabRange: "0-20 kL",
      rate: 0,
      description: "Free water (no charges)",
      nextSlabAt: 20,
    }
  }

  for (const slab of DJB_TARIFF_SLABS) {
    if (consumptionKl > slab.minKl && consumptionKl <= slab.maxKl) {
      return {
        slabNo: slab.slabNo,
        slabRange: `${slab.minKl}-${slab.maxKl === 999999 ? "∞" : slab.maxKl} kL`,
        rate: slab.rate,
        description: `₹${slab.rate} per kL + ${slab.sewerRate * 100}% sewer charge`,
        serviceCharge: slab.serviceCharge,
        nextSlabAt: slab.maxKl === 999999 ? null : slab.maxKl,
      }
    }
  }

  return null
}

/**
 * Validate DJB calculation inputs
 */
export function validateDJBInputs(consumptionKl, rtrwhSupplyKl = 0) {
  const errors = []

  if (consumptionKl < 0) {
    errors.push("Consumption cannot be negative")
  }

  if (rtrwhSupplyKl < 0) {
    errors.push("RTRWH supply cannot be negative")
  }

  if (rtrwhSupplyKl > consumptionKl) {
    errors.push("RTRWH supply cannot exceed total consumption")
  }

  if (consumptionKl > 1000) {
    errors.push("Consumption seems unusually high (>1000 kL/month)")
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

/**
 * Format currency for display
 */
export function formatCurrency(amount) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}
