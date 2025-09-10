const { PrismaClient } = require("@prisma/client")
const prisma = new PrismaClient()

async function main() {
  console.log("Seeding ref_rates table...")

  // Delete existing data
  await prisma.refRates.deleteMany({})

  // Insert reference rates data
  const refRatesData = [
    // Materials
    {
      category: "material",
      subcategory: "cement",
      item: "OPC 53 Grade",
      unit: "bag",
      rate: 450.0,
      location: "Delhi",
      effectiveDate: new Date("2024-01-01"),
    },
    {
      category: "material",
      subcategory: "cement",
      item: "PPC",
      unit: "bag",
      rate: 420.0,
      location: "Delhi",
      effectiveDate: new Date("2024-01-01"),
    },
    {
      category: "material",
      subcategory: "aggregate",
      item: "Coarse Aggregate 20mm",
      unit: "cum",
      rate: 1800.0,
      location: "Delhi",
      effectiveDate: new Date("2024-01-01"),
    },
    {
      category: "material",
      subcategory: "aggregate",
      item: "Fine Aggregate",
      unit: "cum",
      rate: 1200.0,
      location: "Delhi",
      effectiveDate: new Date("2024-01-01"),
    },
    {
      category: "material",
      subcategory: "steel",
      item: "TMT Bars Fe500",
      unit: "kg",
      rate: 65.0,
      location: "Delhi",
      effectiveDate: new Date("2024-01-01"),
    },
    {
      category: "material",
      subcategory: "brick",
      item: "Common Brick",
      unit: "thousand",
      rate: 4500.0,
      location: "Delhi",
      effectiveDate: new Date("2024-01-01"),
    },

    // Labor
    {
      category: "labor",
      subcategory: "skilled",
      item: "Mason",
      unit: "day",
      rate: 800.0,
      location: "Delhi",
      effectiveDate: new Date("2024-01-01"),
    },
    {
      category: "labor",
      subcategory: "skilled",
      item: "Carpenter",
      unit: "day",
      rate: 750.0,
      location: "Delhi",
      effectiveDate: new Date("2024-01-01"),
    },
    {
      category: "labor",
      subcategory: "skilled",
      item: "Plumber",
      unit: "day",
      rate: 700.0,
      location: "Delhi",
      effectiveDate: new Date("2024-01-01"),
    },
    {
      category: "labor",
      subcategory: "unskilled",
      item: "Helper",
      unit: "day",
      rate: 500.0,
      location: "Delhi",
      effectiveDate: new Date("2024-01-01"),
    },

    // Equipment
    {
      category: "equipment",
      subcategory: "excavation",
      item: "JCB",
      unit: "hour",
      rate: 1200.0,
      location: "Delhi",
      effectiveDate: new Date("2024-01-01"),
    },
    {
      category: "equipment",
      subcategory: "concrete",
      item: "Concrete Mixer",
      unit: "hour",
      rate: 300.0,
      location: "Delhi",
      effectiveDate: new Date("2024-01-01"),
    },

    // Overhead
    {
      category: "overhead",
      subcategory: "contractor",
      item: "Contractor Profit",
      unit: "percentage",
      rate: 15.0,
      location: "Delhi",
      effectiveDate: new Date("2024-01-01"),
    },
    {
      category: "overhead",
      subcategory: "supervision",
      item: "Site Supervision",
      unit: "percentage",
      rate: 8.0,
      location: "Delhi",
      effectiveDate: new Date("2024-01-01"),
    },
  ]

  await prisma.refRates.createMany({
    data: refRatesData,
  })

  console.log("Ref rates seeded successfully!")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
