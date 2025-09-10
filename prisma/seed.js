const { PrismaClient } = require("@prisma/client")

const prisma = new PrismaClient()

async function main() {
  console.log("Seeding reference data...")

  // Seed DJB tariff structure
  await prisma.refTariff.upsert({
    where: { id: "domestic-slab-1" },
    update: {},
    create: {
      id: "domestic-slab-1",
      category: "Domestic",
      slabMinKl: 0,
      slabMaxKl: 20,
      volumetricInrPerKl: 0,
      sewerPct: 0,
      serviceCharge: 0,
      freeUptoKl: 20,
    },
  })

  await prisma.refTariff.upsert({
    where: { id: "domestic-slab-2" },
    update: {},
    create: {
      id: "domestic-slab-2",
      category: "Domestic",
      slabMinKl: 20,
      slabMaxKl: 30,
      volumetricInrPerKl: 28,
      sewerPct: 60,
      serviceCharge: 280,
      freeUptoKl: 20,
    },
  })

  // Seed material rates
  const materialRates = [
    { kind: "Material", itemCode: "EXC001", itemName: "Excavation", unit: "cum", unitRate: 135 },
    { kind: "Material", itemCode: "BRK001", itemName: "Brickwork", unit: "cum", unitRate: 1700 },
    { kind: "Material", itemCode: "BLD001", itemName: "Boulders", unit: "cum", unitRate: 1200 },
    { kind: "Material", itemCode: "GRV001", itemName: "Gravel", unit: "cum", unitRate: 1300 },
    { kind: "Material", itemCode: "SND001", itemName: "Coarse Sand", unit: "cum", unitRate: 1100 },
    { kind: "Material", itemCode: "PGV001", itemName: "Pea Gravel", unit: "cum", unitRate: 1400 },
    { kind: "Material", itemCode: "PVC001", itemName: "PVC Pipe", unit: "m", unitRate: 202 },
    { kind: "Material", itemCode: "RCC001", itemName: "RCC Slab", unit: "cum", unitRate: 5200 },
  ]

  for (const rate of materialRates) {
    await prisma.refRates.upsert({
      where: { id: rate.itemCode },
      update: {},
      create: {
        id: rate.itemCode,
        ...rate,
      },
    })
  }

  // Seed labor rates
  const laborRates = [
    { kind: "Labor", itemCode: "LAB001", itemName: "Skilled Mason", unit: "day", unitRate: 900 },
    { kind: "Labor", itemCode: "LAB002", itemName: "Unskilled Labor", unit: "day", unitRate: 710 },
  ]

  for (const rate of laborRates) {
    await prisma.refRates.upsert({
      where: { id: rate.itemCode },
      update: {},
      create: {
        id: rate.itemCode,
        ...rate,
      },
    })
  }

  // Seed achievement badges
  const badges = [
    {
      code: "FIRST_ASSESSMENT",
      title: "First Assessment",
      description: "Completed your first RTRWH assessment",
      points: 10,
    },
    { code: "WATER_SAVER", title: "Water Saver", description: "Assessed a highly feasible property", points: 25 },
    { code: "ECO_WARRIOR", title: "Eco Warrior", description: "Completed 5 assessments", points: 50 },
  ]

  for (const badge of badges) {
    await prisma.badge.upsert({
      where: { code: badge.code },
      update: {},
      create: badge,
    })
  }

  console.log("Seeding completed!")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
