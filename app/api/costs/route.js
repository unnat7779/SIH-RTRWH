import { NextResponse } from "next/server"
import { prisma } from "../../../lib/prisma"
import { calculateCostEstimate, calculatePaybackPeriod, getCostBreakdown } from "../../../lib/cost"

// GET /api/costs - Get cost estimates
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const assessmentId = searchParams.get("assessmentId")
    const rooftopArea = Number.parseFloat(searchParams.get("rooftopArea"))
    const recommendation = searchParams.get("recommendation")

    if (assessmentId) {
      // Get existing cost estimate
      const costEstimate = await prisma.costEstimate.findFirst({
        where: { assessmentId },
        include: {
          costItems: {
            orderBy: { lineNo: "asc" },
          },
        },
      })

      if (!costEstimate) {
        return NextResponse.json({ success: false, error: "Cost estimate not found" }, { status: 404 })
      }

      const breakdown = getCostBreakdown(costEstimate)

      return NextResponse.json({
        success: true,
        data: {
          costEstimate,
          breakdown,
        },
      })
    }

    if (rooftopArea && recommendation) {
      // Calculate new cost estimate
      const refRates = await prisma.refRates.findMany()
      const costEstimate = await calculateCostEstimate(rooftopArea, recommendation, refRates)
      const breakdown = getCostBreakdown(costEstimate)

      return NextResponse.json({
        success: true,
        data: {
          costEstimate,
          breakdown,
        },
      })
    }

    return NextResponse.json({ success: false, error: "Missing required parameters" }, { status: 400 })
  } catch (error) {
    console.error("Error calculating costs:", error)
    return NextResponse.json({ success: false, error: "Failed to calculate costs" }, { status: 500 })
  }
}

// POST /api/costs - Calculate cost with custom parameters
export async function POST(request) {
  try {
    const body = await request.json()
    const { rooftopAreaSqm, recommendation, customRates, annualSavings } = body

    if (!rooftopAreaSqm || !recommendation) {
      return NextResponse.json({ success: false, error: "Missing required parameters" }, { status: 400 })
    }

    // Get reference rates (use custom rates if provided)
    let refRates = customRates
    if (!refRates) {
      refRates = await prisma.refRates.findMany()
    }

    // Calculate cost estimate
    const costEstimate = await calculateCostEstimate(rooftopAreaSqm, recommendation, refRates)
    const breakdown = getCostBreakdown(costEstimate)

    // Calculate payback period if annual savings provided
    let paybackPeriod = null
    if (annualSavings && annualSavings > 0) {
      paybackPeriod = calculatePaybackPeriod(costEstimate.grandTotal, annualSavings)
    }

    return NextResponse.json({
      success: true,
      data: {
        costEstimate,
        breakdown,
        paybackPeriod,
      },
    })
  } catch (error) {
    console.error("Error calculating custom costs:", error)
    return NextResponse.json({ success: false, error: "Failed to calculate costs" }, { status: 500 })
  }
}

// PATCH /api/costs - Update reference rates
export async function PATCH(request) {
  try {
    const body = await request.json()
    const { rates } = body

    if (!rates || !Array.isArray(rates)) {
      return NextResponse.json({ success: false, error: "Invalid rates data" }, { status: 400 })
    }

    // Update rates in database
    const updatePromises = rates.map((rate) =>
      prisma.refRates.upsert({
        where: { itemCode: rate.itemCode },
        update: {
          unitRate: rate.unitRate,
          effectiveFrom: new Date(),
        },
        create: rate,
      }),
    )

    await Promise.all(updatePromises)

    return NextResponse.json({
      success: true,
      message: "Rates updated successfully",
    })
  } catch (error) {
    console.error("Error updating rates:", error)
    return NextResponse.json({ success: false, error: "Failed to update rates" }, { status: 500 })
  }
}
