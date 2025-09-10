"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "../../../components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui/card"
import { Badge } from "../../../components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../components/ui/tabs"
import { Progress } from "../../../components/ui/progress"
import {
  ArrowLeft,
  Download,
  Share2,
  CheckCircle,
  XCircle,
  Calculator,
  Droplets,
  IndianRupee,
  Home,
} from "lucide-react"
import { toast } from "sonner"

export default function ResultsPage() {
  const router = useRouter()
  const [assessmentData, setAssessmentData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const runAssessment = async () => {
      try {
        // Get stored data from session storage
        const locationData = JSON.parse(sessionStorage.getItem("assessment_location") || "{}")
        const roofData = JSON.parse(sessionStorage.getItem("assessment_roof") || "{}")
        const safetyData = JSON.parse(sessionStorage.getItem("assessment_safety") || "{}")
        const propertyLabel = sessionStorage.getItem("assessment_property_label") || "My Property"

        if (!locationData.lat || !roofData.rooftopAreaSqm || !safetyData.confirmation) {
          throw new Error("Incomplete assessment data")
        }

        // Prepare assessment payload
        const payload = {
          property: {
            label: propertyLabel,
            addressText: locationData.address,
            pincode: locationData.pincode,
            lat: locationData.lat,
            lon: locationData.lon,
            rooftopAreaSqm: Number.parseFloat(roofData.rooftopAreaSqm),
            roofType: roofData.roofType,
            landUse: roofData.landUse,
            hasBasement: roofData.hasBasement,
          },
          safetySurvey: {
            septicWithin15m: safetyData.septicWithin15m,
            sewerWithin15m: safetyData.sewerWithin15m,
            openDrainWithin15m: safetyData.openDrainWithin15m,
            dumpWithin15m: safetyData.dumpWithin15m,
            confirmation: safetyData.confirmation,
          },
          houseProfile: {
            occupants: 4, // Default
            monthlyNeedKl: 12, // Default 150L per person per day
            djbMeter: true,
          },
        }

        // Call assessment API
        const response = await fetch("/api/assessments", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        })

        if (!response.ok) {
          throw new Error("Assessment failed")
        }

        const result = await response.json()
        setAssessmentData(result.data)
      } catch (err) {
        console.error("Assessment error:", err)
        setError(err.message)
        toast.error("Failed to complete assessment")
      } finally {
        setIsLoading(false)
      }
    }

    runAssessment()
  }, [])

  const handleBack = () => {
    router.push("/assess/safety")
  }

  const handleNewAssessment = () => {
    // Clear session storage
    sessionStorage.removeItem("assessment_location")
    sessionStorage.removeItem("assessment_roof")
    sessionStorage.removeItem("assessment_safety")
    sessionStorage.removeItem("assessment_property_label")
    router.push("/assess/start")
  }

  const handleShare = async () => {
    if (navigator.share && assessmentData) {
      try {
        await navigator.share({
          title: "RTRWH Assessment Results",
          text: `My property scored ${assessmentData.scoringResult.score}/100 for rainwater harvesting feasibility`,
          url: window.location.href,
        })
      } catch (err) {
        // Fallback to clipboard
        navigator.clipboard.writeText(window.location.href)
        toast.success("Link copied to clipboard")
      }
    } else {
      navigator.clipboard.writeText(window.location.href)
      toast.success("Link copied to clipboard")
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
          <p className="text-muted-foreground">Analyzing your property...</p>
        </div>
      </div>
    )
  }

  if (error || !assessmentData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center space-y-4">
            <XCircle className="h-12 w-12 text-red-500 mx-auto" />
            <h2 className="text-lg font-semibold">Assessment Failed</h2>
            <p className="text-muted-foreground">{error || "Unable to complete assessment"}</p>
            <Button onClick={handleBack} variant="outline" className="w-full bg-transparent">
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const { scoringResult, assessment, costEstimate, runoffData } = assessmentData
  const isVeto = scoringResult.isVeto
  const score = scoringResult.score || 0

  const getScoreColor = (score) => {
    if (score >= 80) return "text-green-600"
    if (score >= 60) return "text-yellow-600"
    if (score >= 40) return "text-orange-600"
    return "text-red-600"
  }

  const getScoreBgColor = (score) => {
    if (score >= 80) return "bg-green-50 border-green-200"
    if (score >= 60) return "bg-yellow-50 border-yellow-200"
    if (score >= 40) return "bg-orange-50 border-orange-200"
    return "bg-red-50 border-red-200"
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background border-b p-4">
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={handleBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="font-semibold">Assessment Results</h1>
          <Button variant="ghost" size="sm" onClick={handleShare}>
            <Share2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Score Card */}
        <Card className={getScoreBgColor(score)}>
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="space-y-2">
                <div className={`text-4xl font-bold ${getScoreColor(score)}`}>{score}/100</div>
                <Badge variant={isVeto ? "destructive" : score >= 60 ? "default" : "secondary"} className="text-sm">
                  {isVeto ? "Not Recommended" : scoringResult.scoreLevel?.replace("_", " ")}
                </Badge>
              </div>

              {isVeto ? (
                <div className="flex items-start gap-2 text-left">
                  <XCircle className="h-5 w-5 text-red-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-red-900">Assessment Failed</p>
                    <p className="text-sm text-red-700">{scoringResult.vetoReason}</p>
                  </div>
                </div>
              ) : (
                <div className="flex items-start gap-2 text-left">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                  <div>
                    <p className="font-medium">Rainwater Harvesting is Feasible</p>
                    <p className="text-sm text-muted-foreground">
                      Your property shows {score >= 80 ? "excellent" : score >= 60 ? "good" : "moderate"} potential for
                      RTRWH implementation
                    </p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Progress */}
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>Assessment Complete</span>
          <div className="flex gap-1">
            <div className="h-2 w-8 bg-primary rounded" />
            <div className="h-2 w-8 bg-primary rounded" />
            <div className="h-2 w-8 bg-primary rounded" />
            <div className="h-2 w-8 bg-primary rounded" />
          </div>
        </div>

        {!isVeto && (
          <Tabs defaultValue="overview" className="space-y-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="costs">Costs</TabsTrigger>
              <TabsTrigger value="savings">Savings</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              {/* Recommendation */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Home className="h-5 w-5" />
                    Recommended Structure
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <h3 className="font-medium">
                      {scoringResult.recommendation === "TRENCH_ONLY"
                        ? "Infiltration Trench"
                        : "Trench with Recharge Well"}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {scoringResult.recommendation === "TRENCH_ONLY"
                        ? "A shallow infiltration system suitable for your water table depth"
                        : "Combined system with deep recharge bore for maximum efficiency"}
                    </p>
                  </div>
                  <div className="bg-muted p-3 rounded-lg">
                    <p className="text-sm">
                      <strong>Dimensions:</strong>{" "}
                      {scoringResult.recommendation === "TRENCH_ONLY" ? "3m × 2m × 2m" : "3m × 2m × 2m + 150mm bore"}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Runoff Potential */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Droplets className="h-5 w-5" />
                    Water Collection Potential
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {Math.round(runoffData.annualRunoffLiters / 1000)}K
                      </div>
                      <div className="text-xs text-muted-foreground">Liters/Year</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">{runoffData.runoffCoeff}</div>
                      <div className="text-xs text-muted-foreground">Runoff Coefficient</div>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Based on {assessmentData.property.rooftopAreaSqm} sq.m roof area and Delhi's average rainfall
                  </p>
                </CardContent>
              </Card>

              {/* Factor Breakdown */}
              {scoringResult.factorScores && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Scoring Factors</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {scoringResult.factorScores.map((factor) => (
                      <div key={factor.key} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium capitalize">
                            {factor.key.replace(/([A-Z])/g, " $1").trim()}
                          </span>
                          <span className="text-sm text-muted-foreground">{factor.points}/100</span>
                        </div>
                        <Progress value={factor.points} className="h-2" />
                        <p className="text-xs text-muted-foreground">
                          {factor.band} ({factor.rawValue})
                        </p>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="costs" className="space-y-4">
              {costEstimate && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Calculator className="h-5 w-5" />
                      Cost Estimate
                    </CardTitle>
                    <CardDescription>Detailed breakdown of implementation costs</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-green-600">
                        ₹{costEstimate.grandTotal.toLocaleString()}
                      </div>
                      <div className="text-sm text-muted-foreground">Total Project Cost</div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm">Materials</span>
                        <span className="text-sm">₹{costEstimate.materialSubtotal.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Labor</span>
                        <span className="text-sm">₹{costEstimate.laborSubtotal.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Overhead (15%)</span>
                        <span className="text-sm">₹{costEstimate.overhead.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Contingency (10%)</span>
                        <span className="text-sm">₹{costEstimate.contingency.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">GST (18%)</span>
                        <span className="text-sm">₹{costEstimate.gst.toLocaleString()}</span>
                      </div>
                      <hr />
                      <div className="flex justify-between font-medium">
                        <span>Total</span>
                        <span>₹{costEstimate.grandTotal.toLocaleString()}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="savings" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <IndianRupee className="h-5 w-5" />
                    DJB Bill Savings
                  </CardTitle>
                  <CardDescription>Potential savings on water bills</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">₹2,400</div>
                    <div className="text-sm text-muted-foreground">Estimated Annual Savings</div>
                  </div>
                  <p className="text-sm text-muted-foreground text-center">
                    Based on average household consumption and current DJB tariff rates
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button onClick={handleNewAssessment} className="w-full h-12">
            Start New Assessment
          </Button>
          <Button variant="outline" className="w-full h-12 bg-transparent">
            <Download className="h-4 w-4 mr-2" />
            Download Report
          </Button>
        </div>
      </div>
    </div>
  )
}
