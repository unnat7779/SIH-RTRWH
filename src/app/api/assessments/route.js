import { NextResponse } from "next/server"
import { prisma } from "../../../../lib/prisma"
import { calculateFeasibilityScore } from "../../../../lib/scoring"
import { calculateAnnualRunoff } from "../../../../lib/runoff"
import { calculateCostEstimate } from "../../../../lib/cost"
import { getDistrictInfo, getGeologicalInfo } from "../../../../lib/geo"

// GET /api/assessments - List user's assessments
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")
    const limit = Number.parseInt(searchParams.get("limit") || "10")

    const where = userId ? { property: { userId } } : {}

    const assessments = await prisma.assessment.findMany({
      where,
      include: {
        property: {
          select: {
            id: true,
            label: true,
            addressText: true,
            rooftopAreaSqm: true,
            roofType: true,
          },
        },
        factorScores: true,
        costEstimates: {
          include: {
            costItems: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: limit,
    })

    return NextResponse.json({
      success: true,
      data: assessments,
      count: assessments.length,
    })
  } catch (error) {
    console.error("Error fetching assessments:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch assessments" }, { status: 500 })
  }
}

// POST /api/assessments - Create new assessment
export async function POST(request) {
  try {
    const body = await request.json()
    const { property, safetySurvey, houseProfile } = body

    // Validate required fields
    if (!property?.rooftopAreaSqm || !property?.roofType || !property?.lat || !property?.lon) {
      return NextResponse.json({ success: false, error: "Missing required property information" }, { status: 400 })
    }

    if (!safetySurvey) {
      return NextResponse.json({ success: false, error: "Safety survey is required" }, { status: 400 })
    }

    // Get district and geological information
    const districtInfo = getDistrictInfo(property.lat, property.lon, property.pincode)
    const geologicalInfo = getGeologicalInfo(districtInfo?.district)

    if (!districtInfo || !geologicalInfo) {
      return NextResponse.json(
        { success: false, error: "Unable to determine location characteristics" },
        { status: 400 },
      )
    }

    // Calculate minimum safety distance
    const safetyDistances = [
      safetySurvey.septicWithin15m ? 10 : 20,
      safetySurvey.sewerWithin15m ? 8 : 20,
      safetySurvey.openDrainWithin15m ? 12 : 20,
      safetySurvey.dumpWithin15m ? 15 : 20,
    ]
    const minDistanceM = Math.min(...safetyDistances)

    // Calculate runoff
    const runoffData = calculateAnnualRunoff(property.rooftopAreaSqm, property.roofType)

    const assessmentData = {
      waterDepthPostM: geologicalInfo.waterDepth,
      soilClass: geologicalInfo.soilClass,
      lithoClass: geologicalInfo.lithoClass,
      landUse: property.landUse || "Residential",
      surroundingLandUse: property.surroundingLandUse, // New field for surrounding area assessment
      slopePct: 2, // Default slope for Delhi
      safetyDistance: minDistanceM,
      annualRunoffLiters: runoffData.annualRunoffLiters, // Added for new algorithm
    }

    // Calculate feasibility score
    const scoringResult = calculateFeasibilityScore(assessmentData)

    console.log("[v0] Fetching reference rates...")
    const refRates = await prisma.refRates.findMany({
      select: {
        itemCode: true,
        itemName: true,
        kind: true,
        unit: true,
        unitRate: true,
      },
    })
    console.log("[v0] Found", refRates.length, "reference rates")

    // Calculate cost estimate if feasible
    let costEstimate = null
    if (!scoringResult.isVeto && scoringResult.score >= 40) {
      console.log("[v0] Calculating cost estimate...")
      costEstimate = await calculateCostEstimate(property.rooftopAreaSqm, scoringResult.recommendation, refRates)
      console.log("[v0] Cost estimate calculated:", costEstimate?.grandTotal)
    }

    const result = await prisma.$transaction(
      async (tx) => {
        // Create or update property
        const savedProperty = await tx.property.upsert({
          where: { id: property.id || "new" },
          update: {
            ...property,
            tehsil: districtInfo.district,
            runoffCoeff: runoffData.runoffCoeff,
          },
          create: {
            ...property,
            tehsil: districtInfo.district,
            runoffCoeff: runoffData.runoffCoeff,
          },
        })

        // Create safety survey
        const savedSafetySurvey = await tx.safetySurvey.create({
          data: {
            propertyId: savedProperty.id,
            ...safetySurvey,
            minDistanceM,
            result: scoringResult.isVeto ? "FAIL" : "PASS",
          },
        })

        // Create house profile if provided
        let savedHouseProfile = null
        if (houseProfile) {
          savedHouseProfile = await tx.houseProfile.create({
            data: {
              propertyId: savedProperty.id,
              ...houseProfile,
            },
          })
        }

        // Create assessment
        const savedAssessment = await tx.assessment.create({
          data: {
            propertyId: savedProperty.id,
            vetoResult: scoringResult.isVeto ? scoringResult.vetoReason : null,
            depthBand: geologicalInfo.waterDepth > 15 ? "Deep" : geologicalInfo.waterDepth > 5 ? "Moderate" : "Shallow",
            waterDepthPostM: geologicalInfo.waterDepth,
            soilClass: geologicalInfo.soilClass,
            lithoClass: geologicalInfo.lithoClass,
            slopePct: assessmentData.slopePct,
            rainfallMm: 650, // Delhi average
            runoffCoeff: runoffData.runoffCoeff,
            annualRunoffLiters: runoffData.annualRunoffLiters,
            recommendation: scoringResult.recommendation,
            scorePoints: scoringResult.score,
            score100: scoringResult.score,
            scoreLevel: scoringResult.scoreLevel,
          },
        })

        // Create factor scores
        if (scoringResult.factorScores) {
          await tx.factorScore.createMany({
            data: scoringResult.factorScores.map((factor) => ({
              assessmentId: savedAssessment.id,
              key: factor.key,
              rawValue: factor.rawValue,
              band: factor.band,
              points: factor.points,
              weight: factor.weight,
              weighted: factor.weighted,
            })),
          })
        }

        // Create cost estimate if available
        let savedCostEstimate = null
        if (costEstimate) {
          console.log("[v0] Saving cost estimate to database...")
          savedCostEstimate = await tx.costEstimate.create({
            data: {
              assessmentId: savedAssessment.id,
              materialSubtotal: costEstimate.materialSubtotal,
              laborSubtotal: costEstimate.laborSubtotal,
              overhead: costEstimate.overhead,
              contingency: costEstimate.contingency,
              preGst: costEstimate.preGst,
              gst: costEstimate.gst,
              grandTotal: costEstimate.grandTotal,
              currency: costEstimate.currency,
              rateCardVersion: costEstimate.rateCardVersion,
            },
          })

          if (costEstimate.costItems && costEstimate.costItems.length > 0) {
            await tx.costItem.createMany({
              data: costEstimate.costItems.map((item) => ({
                assessmentId: savedAssessment.id,
                lineNo: item.lineNo,
                category: item.category,
                code: item.code,
                description: item.description,
                unit: item.unit,
                qty: item.qty,
                unitRate: item.unitRate,
                amount: item.amount,
                notes: item.notes,
              })),
            })
          }
          console.log("[v0] Cost estimate saved successfully")
        }

        return {
          assessment: savedAssessment,
          property: savedProperty,
          safetySurvey: savedSafetySurvey,
          houseProfile: savedHouseProfile,
          costEstimate: savedCostEstimate,
          scoringResult,
          runoffData,
        }
      },
      {
        timeout: 15000, // Increased timeout to 15 seconds
      },
    )

    return NextResponse.json({
      success: true,
      data: result,
    })
  } catch (error) {
    console.error("Error creating assessment:", error)
    return NextResponse.json({ success: false, error: "Failed to create assessment" }, { status: 500 })
  }
}
