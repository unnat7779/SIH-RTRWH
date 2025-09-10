"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Progress } from "@/components/ui/progress"
import {
  Home,
  Info,
  Calculator,
  Building,
  TreePine,
  Factory,
  Store,
  Users,
  ArrowLeft,
  ArrowRight,
  Zap,
  Droplets,
  Shield,
  TrendingUp,
  Camera,
  Smartphone,
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import ARRoofMeasurement from "@/components/ar-roof-measurement"

export default function RoofPage() {
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
    const locationData = sessionStorage.getItem("assessment_location")
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

    sessionStorage.setItem("assessment_roof", JSON.stringify(roofData))
    router.push("/assess/safety")
  }

  const handleBack = () => {
    router.push("/assess/location")
  }

  const selectedRoofType = roofTypes.find((type) => type.value === roofData.roofType)

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <AnimatePresence>
          {showARMeasurement && (
            <ARRoofMeasurement onAreaCalculated={handleARAreaCalculated} onClose={() => setShowARMeasurement(false)} />
          )}
        </AnimatePresence>

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
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Home className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">Roof Area</CardTitle>
                      <CardDescription>Total rooftop area for rainwater collection</CardDescription>
                    </div>
                  </div>
                  <Tooltip>
                    <TooltipTrigger>
                      <div className="p-2 bg-blue-50 rounded-full hover:bg-blue-100 transition-colors">
                        <Info className="w-4 h-4 text-blue-600" />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <div className="max-w-xs">
                        <p className="font-medium">Runoff Volume Factor</p>
                        <p className="text-sm">Weight: 20% of total score</p>
                        <p className="text-xs mt-1">Larger roof areas with better materials collect more rainwater</p>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setMeasurementMethod("manual")}
                    className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                      measurementMethod === "manual"
                        ? "border-blue-500 bg-blue-50 shadow-lg"
                        : "border-gray-200 hover:border-gray-300 hover:shadow-md"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`p-2 rounded-lg ${measurementMethod === "manual" ? "bg-blue-100" : "bg-gray-100"}`}
                      >
                        <Calculator
                          className={`w-4 h-4 ${measurementMethod === "manual" ? "text-blue-600" : "text-gray-600"}`}
                        />
                      </div>
                      <div className="text-left">
                        <h3 className="font-medium text-sm">Manual Entry</h3>
                        <p className="text-xs text-muted-foreground">Enter area manually</p>
                      </div>
                      {measurementMethod === "manual" && (
                        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="ml-auto">
                          <Zap className="w-4 h-4 text-blue-500" />
                        </motion.div>
                      )}
                    </div>
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      setMeasurementMethod("ar")
                      setShowARMeasurement(true)
                    }}
                    className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                      measurementMethod === "ar"
                        ? "border-emerald-500 bg-emerald-50 shadow-lg"
                        : "border-gray-200 hover:border-gray-300 hover:shadow-md"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`p-2 rounded-lg ${measurementMethod === "ar" ? "bg-emerald-100" : "bg-gray-100"}`}
                      >
                        <Camera
                          className={`w-4 h-4 ${measurementMethod === "ar" ? "text-emerald-600" : "text-gray-600"}`}
                        />
                      </div>
                      <div className="text-left">
                        <h3 className="font-medium text-sm">AR Measurement</h3>
                        <p className="text-xs text-muted-foreground">Use phone camera</p>
                      </div>
                      {measurementMethod === "ar" && (
                        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="ml-auto">
                          <Zap className="w-4 h-4 text-emerald-500" />
                        </motion.div>
                      )}
                    </div>
                  </motion.button>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="roof-area" className="text-sm font-medium">
                      Rooftop Area (sq.m)
                    </Label>
                    {measurementMethod === "ar" && roofData.rooftopAreaSqm && (
                      <Badge variant="secondary" className="bg-emerald-100 text-emerald-800">
                        <Smartphone className="w-3 h-3 mr-1" />
                        AR Measured
                      </Badge>
                    )}
                  </div>

                  <div className="relative">
                    <Input
                      id="roof-area"
                      type="number"
                      placeholder="e.g., 150"
                      value={roofData.rooftopAreaSqm}
                      onChange={(e) => {
                        setRoofData((prev) => ({ ...prev, rooftopAreaSqm: e.target.value }))
                        if (e.target.value) setMeasurementMethod("manual")
                      }}
                      className={`text-base h-12 border-2 transition-colors ${
                        measurementMethod === "ar" && roofData.rooftopAreaSqm
                          ? "border-emerald-300 bg-emerald-50"
                          : "border-gray-300 focus:border-blue-500"
                      }`}
                    />

                    {measurementMethod === "manual" && (
                      <motion.button
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setShowARMeasurement(true)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300"
                        title="Use AR to measure roof area"
                      >
                        <Camera className="w-4 h-4" />
                      </motion.button>
                    )}
                  </div>

                  {measurementMethod === "ar" && roofData.rooftopAreaSqm && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-lg p-3"
                    >
                      <div className="flex items-center gap-2 text-emerald-800">
                        <Smartphone className="w-4 h-4" />
                        <span className="text-sm font-medium">
                          Area measured using AR: {roofData.rooftopAreaSqm} sq.m
                        </span>
                      </div>
                      <p className="text-xs text-emerald-600 mt-1">
                        You can edit this value manually or remeasure using AR
                      </p>
                    </motion.div>
                  )}
                </div>

                <AnimatePresence>
                  {roofData.rooftopAreaSqm && selectedRoofType && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <Droplets className="w-4 h-4 text-blue-600" />
                        <span className="font-medium text-blue-900">Annual Collection Potential</span>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-blue-700">Area: {roofData.rooftopAreaSqm} sq.m</p>
                          <p className="text-blue-700">
                            ≈ {Math.round(Number.parseFloat(roofData.rooftopAreaSqm) * 10.764)} sq.ft
                          </p>
                        </div>
                        <div>
                          <p className="text-blue-700">
                            Annual Runoff: ~
                            {Math.round(
                              Number.parseFloat(roofData.rooftopAreaSqm) * 0.65 * selectedRoofType.coefficient,
                            ).toLocaleString()}{" "}
                            liters
                          </p>
                          <p className="text-blue-700">Coefficient: {selectedRoofType.coefficient}</p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <Building className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">Roof Type</CardTitle>
                      <CardDescription>Select your primary roofing material</CardDescription>
                    </div>
                  </div>
                  <Tooltip>
                    <TooltipTrigger>
                      <div className="p-2 bg-green-50 rounded-full hover:bg-green-100 transition-colors">
                        <Info className="w-4 h-4 text-green-600" />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <div className="max-w-xs">
                        <p className="font-medium">Runoff Coefficient Impact</p>
                        <p className="text-sm">Different materials have varying collection efficiency</p>
                        <p className="text-xs mt-1">Metal sheets: 90% • RCC: 80-85% • Tiles: 75%</p>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {roofTypes.map((type) => (
                    <motion.div
                      key={type.value}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`relative cursor-pointer rounded-lg border-2 p-4 transition-all duration-300 ${
                        roofData.roofType === type.value
                          ? "border-blue-500 bg-blue-50 shadow-lg scale-105"
                          : "border-gray-200 hover:border-gray-300 hover:shadow-md"
                      }`}
                      onClick={() => setRoofData((prev) => ({ ...prev, roofType: type.value }))}
                    >
                      <div className="space-y-3">
                        <div className="relative overflow-hidden rounded-lg">
                          <img
                            src={type.image || "/placeholder.svg"}
                            alt={type.label}
                            className="w-full h-24 object-cover"
                          />
                          {roofData.roofType === type.value && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="absolute top-2 right-2 bg-blue-500 text-white rounded-full p-1"
                            >
                              <Zap className="w-3 h-3" />
                            </motion.div>
                          )}
                        </div>
                        <div>
                          <h3 className="font-medium text-sm">{type.label}</h3>
                          <p className="text-xs text-muted-foreground mt-1">{type.description}</p>
                          <div className="flex items-center justify-between mt-2">
                            <Badge className={type.color} variant="secondary">
                              {type.coefficient * 100}% efficiency
                            </Badge>
                            <span className="text-xs font-medium text-blue-600">+{type.score} pts</span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <TreePine className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">Surrounding Area</CardTitle>
                      <CardDescription>Land use of immediate surrounding area</CardDescription>
                    </div>
                  </div>
                  <Tooltip>
                    <TooltipTrigger>
                      <div className="p-2 bg-purple-50 rounded-full hover:bg-purple-100 transition-colors">
                        <Info className="w-4 h-4 text-purple-600" />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <div className="max-w-xs">
                        <p className="font-medium">Land Use Factor</p>
                        <p className="text-sm">Weight: 10% of total score</p>
                        <p className="text-xs mt-1">Affects contamination risk for groundwater recharge safety</p>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {surroundingLandUseTypes.map((type) => {
                    const IconComponent = type.icon
                    return (
                      <motion.div
                        key={type.value}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className={`cursor-pointer rounded-lg border-2 p-4 transition-all duration-300 ${
                          roofData.surroundingLandUse === type.value
                            ? "border-blue-500 bg-blue-50 shadow-lg"
                            : "border-gray-200 hover:border-gray-300 hover:shadow-md"
                        }`}
                        onClick={() => setRoofData((prev) => ({ ...prev, surroundingLandUse: type.value }))}
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className={`p-2 rounded-lg ${type.color.replace("text-", "text-").replace("bg-", "bg-").replace("border-", "bg-")}`}
                          >
                            <IconComponent className="w-4 h-4" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-medium text-sm">{type.label}</h3>
                            <p className="text-xs text-muted-foreground mt-1">{type.description}</p>
                            <div className="flex items-center justify-between mt-2">
                              <Badge className={type.color} variant="secondary">
                                Score: {type.score}/25
                              </Badge>
                              {roofData.surroundingLandUse === type.value && (
                                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-blue-500">
                                  <Zap className="w-4 h-4" />
                                </motion.div>
                              )}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-orange-100 rounded-lg">
                      <Shield className="w-5 h-5 text-orange-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">Basement Information</CardTitle>
                      <CardDescription>Does your property have a basement?</CardDescription>
                    </div>
                  </div>
                  <Tooltip>
                    <TooltipTrigger>
                      <div className="p-2 bg-orange-50 rounded-full hover:bg-orange-100 transition-colors">
                        <Info className="w-4 h-4 text-orange-600" />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <div className="max-w-xs">
                        <p className="font-medium">Basement Consideration</p>
                        <p className="text-sm">Minor impact on feasibility</p>
                        <p className="text-xs mt-1">Basements can provide additional storage options</p>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`cursor-pointer rounded-lg border-2 p-6 text-center transition-all duration-300 ${
                      roofData.hasBasement === false
                        ? "border-blue-500 bg-blue-50 shadow-lg"
                        : "border-gray-200 hover:border-gray-300 hover:shadow-md"
                    }`}
                    onClick={() => setRoofData((prev) => ({ ...prev, hasBasement: false }))}
                  >
                    <div className="space-y-3">
                      <div className="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                        <Home className="w-6 h-6 text-gray-600" />
                      </div>
                      <div>
                        <h3 className="font-medium">No Basement</h3>
                        <p className="text-xs text-muted-foreground mt-1">Standard ground-level property</p>
                      </div>
                      {roofData.hasBasement === false && (
                        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-blue-500">
                          <Zap className="w-4 h-4 mx-auto" />
                        </motion.div>
                      )}
                    </div>
                  </motion.div>

                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`cursor-pointer rounded-lg border-2 p-6 text-center transition-all duration-300 ${
                      roofData.hasBasement === true
                        ? "border-blue-500 bg-blue-50 shadow-lg"
                        : "border-gray-200 hover:border-gray-300 hover:shadow-md"
                    }`}
                    onClick={() => setRoofData((prev) => ({ ...prev, hasBasement: true }))}
                  >
                    <div className="space-y-3">
                      <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <Building className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-medium">Has Basement</h3>
                        <p className="text-xs text-muted-foreground mt-1">Additional storage potential</p>
                        <Badge variant="secondary" className="bg-green-100 text-green-800 mt-1">
                          +2 pts
                        </Badge>
                      </div>
                      {roofData.hasBasement === true && (
                        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-blue-500">
                          <Zap className="w-4 h-4 mx-auto" />
                        </motion.div>
                      )}
                    </div>
                  </motion.div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <AnimatePresence>
            {liveScore > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
              >
                <Card className="shadow-lg border-0 bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
                  <CardHeader className="pb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-white/20 rounded-lg">
                        <TrendingUp className="w-5 h-5" />
                      </div>
                      <div>
                        <CardTitle className="text-lg text-white">Current Feasibility Score</CardTitle>
                        <CardDescription className="text-blue-100">Based on your selections so far</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-2xl font-bold">{liveScore}/100</span>
                        <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                          {liveScore >= 60 ? "Good Progress" : "Keep Going"}
                        </Badge>
                      </div>
                      <Progress value={liveScore} className="bg-white/20" />
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-blue-100">Runoff Volume</p>
                          <p className="font-medium">{scoreBreakdown.runoffVolume.toFixed(1)} pts</p>
                        </div>
                        <div>
                          <p className="text-blue-100">Land Use</p>
                          <p className="font-medium">{scoreBreakdown.landUse.toFixed(1)} pts</p>
                        </div>
                        <div>
                          <p className="text-blue-100">Basement</p>
                          <p className="font-medium">{scoreBreakdown.basement.toFixed(1)} pts</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Progress and Navigation */}
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>Step 2 of 4</span>
            <div className="flex gap-1">
              <div className="h-2 w-8 bg-primary rounded" />
              <div className="h-2 w-8 bg-primary rounded" />
              <div className="h-2 w-8 bg-muted rounded" />
              <div className="h-2 w-8 bg-muted rounded" />
            </div>
          </div>

          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button
              onClick={handleNext}
              className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg"
              disabled={
                !roofData.rooftopAreaSqm ||
                !roofData.roofType ||
                !roofData.surroundingLandUse ||
                roofData.hasBasement === null
              }
            >
              Continue to Safety Check
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </motion.div>
        </div>
      </div>
    </TooltipProvider>
  )
}
