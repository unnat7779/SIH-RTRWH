import { NextResponse } from "next/server"
import { prisma } from "../../../lib/prisma"

// POST /api/seed - Seed database with reference data
export async function POST(request) {
  try {
    const body = await request.json()
    const { force = false } = body

    // Check if data already exists
    const existingRates = await prisma.refRates.count()
    const existingTariffs = await prisma.refTariff.count()

    if ((existingRates > 0 || existingTariffs > 0) && !force) {
      return NextResponse.json({
        success: false,
        error: "Database already contains reference data. Use force=true to override.",
        existing: { rates: existingRates, tariffs: existingTariffs },
      })
    }

    console.log("Seeding reference data...")

    // Clear existing data if force is true
    if (force) {
      await prisma.refRates.deleteMany()
      await prisma.refTariff.deleteMany()
      await prisma.badge.deleteMany()
    }

    // Seed DJB tariff structure
    const tariffData = [
      {
        id: "domestic-slab-1",
        category: "Domestic",
        slabMinKl: 0,
        slabMaxKl: 20,
        volumetricInrPerKl: 0,
        sewerPct: 0,
        serviceCharge: 0,
        freeUptoKl: 20,
      },
      {
        id: "domestic-slab-2",
        category: "Domestic",
        slabMinKl: 20,
        slabMaxKl: 30,
        volumetricInrPerKl: 28,
        sewerPct: 60,
        serviceCharge: 280,
        freeUptoKl: 20,
      },
      {
        id: "domestic-slab-3",
        category: "Domestic",
        slabMinKl: 30,
        slabMaxKl: 50,
        volumetricInrPerKl: 32,
        sewerPct: 60,
        serviceCharge: 280,
        freeUptoKl: 20,
      },
      {
        id: "domestic-slab-4",
        category: "Domestic",
        slabMinKl: 50,
        slabMaxKl: 100,
        volumetricInrPerKl: 38,
        sewerPct: 60,
        serviceCharge: 280,
        freeUptoKl: 20,
      },
      {
        id: "domestic-slab-5",
        category: "Domestic",
        slabMinKl: 100,
        slabMaxKl: 999999,
        volumetricInrPerKl: 45,
        sewerPct: 60,
        serviceCharge: 280,
        freeUptoKl: 20,
      },
    ]

    await prisma.refTariff.createMany({
      data: tariffData,
      skipDuplicates: true,
    })

    // Seed material rates
    const materialRates = [
      { id: "EXC001", kind: "Material", itemCode: "EXC001", itemName: "Excavation", unit: "cum", unitRate: 135 },
      { id: "BRK001", kind: "Material", itemCode: "BRK001", itemName: "Brickwork", unit: "cum", unitRate: 1700 },
      { id: "BLD001", kind: "Material", itemCode: "BLD001", itemName: "Boulders", unit: "cum", unitRate: 1200 },
      { id: "GRV001", kind: "Material", itemCode: "GRV001", itemName: "Gravel", unit: "cum", unitRate: 1300 },
      { id: "SND001", kind: "Material", itemCode: "SND001", itemName: "Coarse Sand", unit: "cum", unitRate: 1100 },
      { id: "PGV001", kind: "Material", itemCode: "PGV001", itemName: "Pea Gravel", unit: "cum", unitRate: 1400 },
      { id: "PVC001", kind: "Material", itemCode: "PVC001", itemName: "PVC Pipe", unit: "m", unitRate: 202 },
      { id: "RCC001", kind: "Material", itemCode: "RCC001", itemName: "RCC Slab", unit: "cum", unitRate: 5200 },
    ]

    await prisma.refRates.createMany({
      data: materialRates,
      skipDuplicates: true,
    })

    // Seed labor rates
    const laborRates = [
      { id: "LAB001", kind: "Labor", itemCode: "LAB001", itemName: "Skilled Mason", unit: "day", unitRate: 900 },
      { id: "LAB002", kind: "Labor", itemCode: "LAB002", itemName: "Unskilled Labor", unit: "day", unitRate: 710 },
    ]

    await prisma.refRates.createMany({
      data: laborRates,
      skipDuplicates: true,
    })

    // Seed achievement badges
    const badges = [
      {
        code: "FIRST_ASSESSMENT",
        title: "First Assessment",
        description: "Completed your first RTRWH assessment",
        points: 10,
      },
      {
        code: "WATER_SAVER",
        title: "Water Saver",
        description: "Assessed a highly feasible property",
        points: 25,
      },
      {
        code: "ECO_WARRIOR",
        title: "Eco Warrior",
        description: "Completed 5 assessments",
        points: 50,
      },
      {
        code: "COMMUNITY_CHAMPION",
        title: "Community Champion",
        description: "Shared assessment results",
        points: 15,
      },
      {
        code: "COST_CONSCIOUS",
        title: "Cost Conscious",
        description: "Calculated detailed cost estimates",
        points: 20,
      },
    ]

    await prisma.badge.createMany({
      data: badges,
      skipDuplicates: true,
    })

    // Get counts of seeded data
    const finalCounts = {
      tariffs: await prisma.refTariff.count(),
      rates: await prisma.refRates.count(),
      badges: await prisma.badge.count(),
    }

    console.log("Seeding completed!", finalCounts)

    return NextResponse.json({
      success: true,
      message: "Database seeded successfully",
      data: finalCounts,
    })
  } catch (error) {
    console.error("Error seeding database:", error)
    return NextResponse.json({ success: false, error: "Failed to seed database" }, { status: 500 })
  }
}

// GET /api/seed - Check seeding status
export async function GET() {
  try {
    const counts = {
      tariffs: await prisma.refTariff.count(),
      rates: await prisma.refRates.count(),
      badges: await prisma.badge.count(),
      assessments: await prisma.assessment.count(),
      properties: await prisma.property.count(),
    }

    const isSeeded = counts.tariffs > 0 && counts.rates > 0 && counts.badges > 0

    return NextResponse.json({
      success: true,
      data: {
        isSeeded,
        counts,
      },
    })
  } catch (error) {
    console.error("Error checking seed status:", error)
    return NextResponse.json({ success: false, error: "Failed to check seed status" }, { status: 500 })
  }
}
