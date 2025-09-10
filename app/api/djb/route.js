import { NextResponse } from "next/server"
import { prisma } from "../../../lib/prisma"
import {
  calculateBillComparison,
  calculateAnnualSavings,
  calculateBillScenarios,
  getTariffSlabInfo,
  validateDJBInputs,
} from "../../../lib/djb"
import { calculateMonthlyRunoff } from "../../../lib/runoff"

// GET /api/djb - Calculate DJB bill comparison
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const monthlyNeedKl = Number.parseFloat(searchParams.get("monthlyNeed"))
    const rtrwhSupplyKl = Number.parseFloat(searchParams.get("rtrwhSupply") || "0")
    const assessmentId = searchParams.get("assessmentId")

    // Validate inputs
    const validation = validateDJBInputs(monthlyNeedKl, rtrwhSupplyKl)
    if (!validation.isValid) {
      return NextResponse.json({ success: false, errors: validation.errors }, { status: 400 })
    }

    // Calculate bill comparison
    const comparison = calculateBillComparison(monthlyNeedKl, rtrwhSupplyKl)

    // Get tariff slab information
    const currentSlabInfo = getTariffSlabInfo(monthlyNeedKl)
    const withRtrwhSlabInfo = getTariffSlabInfo(comparison.djbDrawWith)

    // Calculate scenarios
    const scenarios = calculateBillScenarios(monthlyNeedKl, rtrwhSupplyKl)

    const result = {
      comparison,
      currentSlabInfo,
      withRtrwhSlabInfo,
      scenarios,
    }

    // If assessment ID provided, save billing scenarios
    if (assessmentId) {
      try {
        await prisma.billingScenario.create({
          data: {
            assessmentId,
            month: "Average",
            needKl: monthlyNeedKl,
            rtrwhSupplyKl,
            djbDrawKl: comparison.djbDrawWith,
            djbBillWithout: comparison.billWithout.totalBill,
            djbBillWith: comparison.billWith.totalBill,
            savings: comparison.monthlySavings,
            sewerPct: 60,
            serviceCharge: comparison.billWith.serviceCharge,
          },
        })
      } catch (dbError) {
        console.warn("Failed to save billing scenario:", dbError)
        // Continue without failing the request
      }
    }

    return NextResponse.json({
      success: true,
      data: result,
    })
  } catch (error) {
    console.error("Error calculating DJB bill:", error)
    return NextResponse.json({ success: false, error: "Failed to calculate DJB bill" }, { status: 500 })
  }
}

// POST /api/djb - Calculate annual savings with monthly breakdown
export async function POST(request) {
  try {
    const body = await request.json()
    const { annualRunoffLiters, monthlyNeedKl, householdSize = 4, assessmentId } = body

    if (!annualRunoffLiters || !monthlyNeedKl) {
      return NextResponse.json({ success: false, error: "Missing required parameters" }, { status: 400 })
    }

    // Calculate monthly runoff distribution
    const monthlyRunoff = calculateMonthlyRunoff(annualRunoffLiters)

    // Calculate monthly comparisons
    const monthlyComparisons = []
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

    monthNames.forEach((month, index) => {
      const runoffLiters = monthlyRunoff[Object.keys(monthlyRunoff)[index]]
      const rtrwhSupplyKl = runoffLiters / 1000 // Convert to kL

      const comparison = calculateBillComparison(monthlyNeedKl, rtrwhSupplyKl)
      monthlyComparisons.push({
        month,
        ...comparison,
      })
    })

    // Calculate annual savings
    const annualSavings = calculateAnnualSavings(monthlyComparisons)

    // Calculate water independence metrics
    const totalRtrwhSupply = Object.values(monthlyRunoff).reduce((sum, val) => sum + val, 0) / 1000
    const totalAnnualNeed = monthlyNeedKl * 12
    const independencePercentage = Math.min(100, (totalRtrwhSupply / totalAnnualNeed) * 100)

    const result = {
      monthlyComparisons,
      annualSavings,
      waterIndependence: {
        totalRtrwhSupplyKl: Math.round(totalRtrwhSupply),
        totalAnnualNeedKl: totalAnnualNeed,
        independencePercentage: Math.round(independencePercentage),
      },
      monthlyRunoff,
    }

    // Save billing scenarios if assessment ID provided
    if (assessmentId) {
      try {
        const billingData = monthlyComparisons.map((comp, index) => ({
          assessmentId,
          month: comp.month,
          needKl: comp.monthlyNeed,
          rtrwhSupplyKl: comp.rtrwhSupply,
          djbDrawKl: comp.djbDrawWith,
          djbBillWithout: comp.billWithout.totalBill,
          djbBillWith: comp.billWith.totalBill,
          savings: comp.monthlySavings,
          sewerPct: 60,
          serviceCharge: comp.billWith.serviceCharge,
        }))

        await prisma.billingScenario.createMany({
          data: billingData,
          skipDuplicates: true,
        })
      } catch (dbError) {
        console.warn("Failed to save billing scenarios:", dbError)
        // Continue without failing the request
      }
    }

    return NextResponse.json({
      success: true,
      data: result,
    })
  } catch (error) {
    console.error("Error calculating annual DJB savings:", error)
    return NextResponse.json({ success: false, error: "Failed to calculate annual savings" }, { status: 500 })
  }
}

// PUT /api/djb - Update tariff rates (admin function)
export async function PUT(request) {
  try {
    const body = await request.json()
    const { tariffs } = body

    if (!tariffs || !Array.isArray(tariffs)) {
      return NextResponse.json({ success: false, error: "Invalid tariff data" }, { status: 400 })
    }

    // Update tariff rates in database
    const updatePromises = tariffs.map((tariff) =>
      prisma.refTariff.upsert({
        where: {
          category_slabMinKl_slabMaxKl: {
            category: tariff.category,
            slabMinKl: tariff.slabMinKl,
            slabMaxKl: tariff.slabMaxKl,
          },
        },
        update: {
          volumetricInrPerKl: tariff.volumetricInrPerKl,
          sewerPct: tariff.sewerPct,
          serviceCharge: tariff.serviceCharge,
          effectiveFrom: new Date(),
        },
        create: {
          ...tariff,
          effectiveFrom: new Date(),
        },
      }),
    )

    await Promise.all(updatePromises)

    return NextResponse.json({
      success: true,
      message: "Tariff rates updated successfully",
    })
  } catch (error) {
    console.error("Error updating tariff rates:", error)
    return NextResponse.json({ success: false, error: "Failed to update tariff rates" }, { status: 500 })
  }
}
