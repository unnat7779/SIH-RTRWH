const refRatesData = [
    // Materials
    {
      category: "material",
      item: "PVC Pipe (4 inch)",
      unit: "meter",
      rate: 180,
      description: "Standard PVC pipe for drainage",
    },
    {
      category: "material",
      item: "PVC Pipe (6 inch)",
      unit: "meter",
      rate: 280,
      description: "Large PVC pipe for main drainage",
    },
    {
      category: "material",
      item: "Gravel (20mm)",
      unit: "cubic_meter",
      rate: 1200,
      description: "Coarse gravel for filtration",
    },
    {
      category: "material",
      item: "Sand (Fine)",
      unit: "cubic_meter",
      rate: 800,
      description: "Fine sand for filtration layers",
    },
    { category: "material", item: "Cement (OPC 43)", unit: "bag", rate: 350, description: "Ordinary Portland Cement" },
    {
      category: "material",
      item: "Steel Reinforcement",
      unit: "kg",
      rate: 65,
      description: "TMT bars for structural work",
    },
    { category: "material", item: "Brick (Common)", unit: "piece", rate: 8, description: "Standard clay bricks" },
    { category: "material", item: "Concrete Block", unit: "piece", rate: 45, description: "Precast concrete blocks" },
    {
      category: "material",
      item: "Geotextile Fabric",
      unit: "sqm",
      rate: 120,
      description: "Non-woven geotextile for filtration",
    },
    {
      category: "material",
      item: "Manhole Cover (CI)",
      unit: "piece",
      rate: 2500,
      description: "Cast iron manhole cover",
    },
  
    // Labor
    { category: "labor", item: "Skilled Mason", unit: "day", rate: 800, description: "Experienced construction worker" },
    { category: "labor", item: "Unskilled Labor", unit: "day", rate: 500, description: "General construction helper" },
    { category: "labor", item: "Plumber", unit: "day", rate: 1000, description: "Certified plumbing specialist" },
    { category: "labor", item: "Electrician", unit: "day", rate: 1200, description: "Licensed electrical worker" },
    {
      category: "labor",
      item: "Excavation Labor",
      unit: "cubic_meter",
      rate: 150,
      description: "Manual excavation work",
    },
    {
      category: "labor",
      item: "Concrete Work",
      unit: "cubic_meter",
      rate: 800,
      description: "Concrete mixing and pouring",
    },
  
    // Equipment
    {
      category: "equipment",
      item: "JCB/Excavator",
      unit: "hour",
      rate: 1500,
      description: "Mechanical excavation equipment",
    },
    {
      category: "equipment",
      item: "Concrete Mixer",
      unit: "day",
      rate: 800,
      description: "Portable concrete mixing machine",
    },
    {
      category: "equipment",
      item: "Water Tanker",
      unit: "trip",
      rate: 1200,
      description: "Water supply for construction",
    },
    { category: "equipment", item: "Compactor", unit: "day", rate: 1000, description: "Soil compaction equipment" },
    { category: "equipment", item: "Generator (5 KVA)", unit: "day", rate: 600, description: "Portable power generator" },
  
    // Overhead
    {
      category: "overhead",
      item: "Site Supervision",
      unit: "percentage",
      rate: 8,
      description: "Project management and supervision",
    },
    {
      category: "overhead",
      item: "Transportation",
      unit: "percentage",
      rate: 5,
      description: "Material and equipment transport",
    },
    {
      category: "overhead",
      item: "Contractor Profit",
      unit: "percentage",
      rate: 12,
      description: "Contractor profit margin",
    },
    {
      category: "overhead",
      item: "Contingency",
      unit: "percentage",
      rate: 10,
      description: "Unforeseen expenses buffer",
    },
  ]
  
  module.exports = { refRatesData }
  