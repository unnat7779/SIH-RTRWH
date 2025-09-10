"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { TooltipProvider } from "@/components/ui/tooltip"
import { Home, Calculator, Building, TreePine, Factory, Store, Users, ArrowLeft } from "lucide-react"
import dynamic from "next/dynamic"

const MotionDiv = dynamic(() => import("framer-motion").then((mod) => ({ default: mod.motion.div })), { ssr: false })
const AnimatePresenceComponent = dynamic(
  () => import("framer-motion").then((mod) => ({ default: mod.AnimatePresence })),
  { ssr: false },
)

const ARRoofMeasurement = dynamic(() => import("@/components/ar-roof-measurement"), { ssr: false })

export default function RoofPageClient() {
  const router = useRouter()
  const [roofData, setRoofData] = useState({
    rooftopAreaSqm: "",
    roofType: "",
    landUse: "",
    surroundingLandUse: "",
    hasBasement: null,
  })

  const [showARMeasurement, setShowARMeasurement] = useState(false)
  const [measurementMethod, setMeasurementMethod] = useState("manual") // "manual" or "ar"

  const [liveScore, setLiveScore] = useState(0)
  const [scoreBreakdown, setScoreBreakdown] = useState({
    runoffVolume: 0,
    landUse: 0,
    basement: 0,
  })

  const handleARAreaCalculated = (area) => {
    const roundedArea = Math.round(area * 100) / 100 // Round to 2 decimal places
    setRoofData((prev) => ({ ...prev, rooftopAreaSqm: roundedArea.toString() }))
    setMeasurementMethod("ar")
    setShowARMeasurement(false)
  }

  const roofTypes = [
    {
      value: "RCC Flat",
      label: "RCC Flat Roof",
      coefficient: 0.85,
      score: 20,
      image: "/concrete-flat-roof-building.jpg",
      description: "Excellent for rainwater harvesting",
      color: "bg-green-100 border-green-300 text-green-800",
    },
    {
      value: "RCC Sloped",
      label: "RCC Sloped Roof",
      coefficient: 0.8,
      score: 18,
      image: "/concrete-sloped-roof-house.jpg",
      description: "Very good collection efficiency",
      color: "bg-green-100 border-green-300 text-green-800",
    },
    {
      value: "Metal Sheet",
      label: "Metal Sheet",
      coefficient: 0.9,
      score: 22,
      image: "/metal-sheet-roof-industrial.jpg",
      description: "Highest collection efficiency",
      color: "bg-emerald-100 border-emerald-300 text-emerald-800",
    },
    {
      value: "Tile",
      label: "Tile Roof",
      coefficient: 0.75,
      score: 15,
      image: "/clay-tile-roof-traditional-house.jpg",
      description: "Good for traditional buildings",
      color: "bg-yellow-100 border-yellow-300 text-yellow-800",
    },
    {
      value: "Asbestos",
      label: "Asbestos Sheet",
      coefficient: 0.85,
      score: 12,
      image: "/asbestos-sheet-roof-old-building.jpg",
      description: "Requires water quality treatment",
      color: "bg-orange-100 border-orange-300 text-orange-800",
    },
    {
      value: "Mixed",
      label: "Mixed Materials",
      coefficient: 0.75,
      score: 10,
      image: "/mixed-roof-materials-patchwork.jpg",
      description: "Variable collection efficiency",
      color: "bg-gray-100 border-gray-300 text-gray-800",
    },
  ]

  const landUseTypes = [
    {
      value: "Residential",
      label: "Residential",
      score: 15,
      icon: Home,
      image: "/residential-houses-neighborhood.jpg",
      description: "Low contamination risk",
      color: "bg-green-100 border-green-300 text-green-800",
    },
    {
      value: "Institutional",
      label: "Institutional",
      score: 12,
      icon: Building,
      image: "/placeholder-xh14b.png",
      description: "Moderate contamination risk",
      color: "bg-blue-100 border-blue-300 text-blue-800",
    },
    {
      value: "Commercial",
      label: "Commercial",
      score: 8,
      icon: Store,
      image: "/placeholder-mex5y.png",
      description: "Higher contamination risk",
      color: "bg-yellow-100 border-yellow-300 text-yellow-800",
    },
    {
      value: "Mixed",
      label: "Mixed Use",
      score: 10,
      icon: Users,
      image: "/mixed-use-buildings-residential-commercial.jpg",
      description: "Variable contamination risk",
      color: "bg-purple-100 border-purple-300 text-purple-800",
    },
    {
      value: "Industrial",
      label: "Industrial",
      score: 5,
      icon: Factory,
      image: "/industrial-area-factories-pollution.jpg",
      description: "High contamination risk",
      color: "bg-red-100 border-red-300 text-red-800",
    },
  ]

  const surroundingLandUseTypes = [
    {
      value: "Open Park",
      label: "Open Park / Garden",
      score: 25,
      description: "Excellent - Low contamination risk",
      color: "bg-emerald-100 border-emerald-300 text-emerald-800",
      icon: TreePine,
    },
    {
      value: "Garden",
      label: "Green Space",
      score: 23,
      description: "Very Good - Minimal runoff contamination",
      color: "bg-green-100 border-green-300 text-green-800",
      icon: TreePine,
    },
    {
      value: "Vegetation",
      label: "Natural Vegetation",
      score: 25,
      description: "Excellent - Natural filtration",
      color: "bg-emerald-100 border-emerald-300 text-emerald-800",
      icon: TreePine,
    },
    {
      value: "Residential Paving",
      label: "Residential Area",
      score: 15,
      description: "Good - Moderate contamination risk",
      color: "bg-yellow-100 border-yellow-300 text-yellow-800",
      icon: Home,
    },
    {
      value: "Heavy Traffic Road",
      label: "Heavy Traffic Road",
      score: 5,
      description: "Poor - High pollution from vehicles",
      color: "bg-red-100 border-red-300 text-red-800",
      icon: Factory,
    },
    {
      value: "Commercial",
      label: "Commercial Area",
      score: 8,
      description: "Fair - Moderate to high contamination",
      color: "bg-orange-100 border-orange-300 text-orange-800",
      icon: Store,
    },
    {
      value: "Industrial",
      label: "Industrial Area",
      score: 3,
      description: "Very Poor - High industrial contamination",
      color: "bg-red-100 border-red-300 text-red-800",
      icon: Factory,
    },
  ]

  const calculateLiveScore = (data) => {
    let totalScore = 0
    const breakdown = { runoffVolume: 0, landUse: 0, basement: 0 }

    // Runoff Volume Score (20% weight)
    if (data.rooftopAreaSqm && data.roofType) {
      const area = Number.parseFloat(data.rooftopAreaSqm)
      const roofType = roofTypes.find((r) => r.value === data.roofType)
      if (roofType && area > 0) {
        // Calculate annual runoff potential (simplified)
        const annualRainfall = 650 // mm for Delhi
        const runoffVolume = area * (annualRainfall / 1000) * roofType.coefficient

        let runoffScore = 0
        if (runoffVolume > 100000)
          runoffScore = 25 // >100k liters
        else if (runoffVolume > 50000)
          runoffScore = 20 // 50-100k liters
        else if (runoffVolume > 20000)
          runoffScore = 15 // 20-50k liters
        else if (runoffVolume > 10000)
          runoffScore = 10 // 10-20k liters
        else runoffScore = 5 // <10k liters

        breakdown.runoffVolume = runoffScore * 0.2
        totalScore += breakdown.runoffVolume
      }
    }

    // Land Use Score (10% weight)
    if (data.surroundingLandUse) {
      const landUseType = surroundingLandUseTypes.find((l) => l.value === data.surroundingLandUse)
      if (landUseType) {
        breakdown.landUse = landUseType.score * 0.1
        totalScore += breakdown.landUse
      }
    }

    // Basement consideration (minor impact)
    if (data.hasBasement !== null) {
      breakdown.basement = data.hasBasement ? 2 : 0
      totalScore += breakdown.basement
    }

    return { total: Math.round(totalScore), breakdown }
  }

  useEffect(() => {
    const { total, breakdown } = calculateLiveScore(roofData)
    setLiveScore(total)
    setScoreBreakdown(breakdown)
  }, [roofData])

  useEffect(() => {
    const locationData = typeof window !== "undefined" ? sessionStorage.getItem("assessment_location") : null
    if (!locationData) {
      alert("Please select location first")
      router.push("/assess/location")
    }
  }, [router])

  const handleNext = () => {
    // Validation
    if (!roofData.rooftopAreaSqm || Number.parseFloat(roofData.rooftopAreaSqm) <= 0) {
      alert("Please enter a valid roof area")
      return
    }

    if (!roofData.roofType) {
      alert("Please select a roof type")
      return
    }

    if (!roofData.surroundingLandUse) {
      alert("Please select the land use of the immediate surrounding area")
      return
    }

    if (roofData.hasBasement === null) {
      alert("Please specify if the property has a basement")
      return
    }

    if (Number.parseFloat(roofData.rooftopAreaSqm) > 10000) {
      alert("Roof area seems unusually large. Please verify.")
      return
    }

    if (typeof window !== "undefined") {
      sessionStorage.setItem("assessment_roof", JSON.stringify(roofData))
    }
    router.push("/assess/safety")
  }

  const handleBack = () => {
    router.push("/assess/location")
  }

  const selectedRoofType = roofTypes.find((type) => type.value === roofData.roofType)

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        {showARMeasurement && (
          <ARRoofMeasurement onAreaCalculated={handleARAreaCalculated} onClose={() => setShowARMeasurement(false)} />
        )}

        <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm border-b shadow-sm">
          <div className="flex items-center justify-between p-4">
            <Button variant="ghost" size="sm" onClick={handleBack} className="hover:bg-blue-50">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div className="text-center">
              <h1 className="font-semibold text-lg">Roof & Property Details</h1>
              <div className="flex items-center gap-2 mt-1">
                <Calculator className="w-4 h-4 text-blue-600" />
                <span className="text-sm text-muted-foreground">Live Score: </span>
                <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                  {liveScore}/100
                </Badge>
              </div>
            </div>
            <div className="w-16" />
          </div>
        </div>

        <div className="p-4 space-y-6 max-w-4xl mx-auto">
          {/* ... rest of existing code with MotionDiv components ... */}
        </div>
      </div>
    </TooltipProvider>
  )
}
