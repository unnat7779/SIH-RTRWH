"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "../../../../components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../../components/ui/card"
import { Input } from "../../../../components/ui/input"
import { Label } from "../../../../components/ui/label"
import { MapPin, Home, CheckCircle, Calculator } from "lucide-react"

export default function AssessmentStartPage() {
  const router = useRouter()
  const [propertyLabel, setPropertyLabel] = useState("")

  const handleStart = () => {
    // Store property label in session storage for the flow
    if (propertyLabel.trim()) {
      sessionStorage.setItem("assessment_property_label", propertyLabel.trim())
    }
    router.push("/assess/location")
  }

  const assessmentSteps = [
    {
      icon: MapPin,
      title: "Location",
      description: "Select your property location on the map",
    },
    {
      icon: Home,
      title: "Roof Details",
      description: "Enter roof area and type information",
    },
    {
      icon: CheckCircle,
      title: "Safety Check",
      description: "Complete 4-question safety assessment",
    },
    {
      icon: Calculator,
      title: "Results",
      description: "Get feasibility score and cost estimates",
    },
  ]

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="mx-auto max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold text-foreground">RTRWH Assessment</h1>
          <p className="text-muted-foreground text-balance">
            Assess the feasibility of rooftop rainwater harvesting for your Delhi property
          </p>
        </div>

        {/* Property Label Input */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Property Information</CardTitle>
            <CardDescription>Give your property a name for easy reference</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="property-label">Property Label (Optional)</Label>
              <Input
                id="property-label"
                placeholder="e.g., My Home, Office Building"
                value={propertyLabel}
                onChange={(e) => setPropertyLabel(e.target.value)}
                className="text-base"
              />
            </div>
          </CardContent>
        </Card>

        {/* Assessment Steps */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Assessment Process</CardTitle>
            <CardDescription>Complete these 4 simple steps</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {assessmentSteps.map((step, index) => {
                const Icon = step.icon
                return (
                  <div key={index} className="flex items-start gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                      <Icon className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="font-medium text-sm">{step.title}</p>
                      <p className="text-xs text-muted-foreground">{step.description}</p>
                    </div>
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-xs font-medium">
                      {index + 1}
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Key Benefits */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">What You'll Get</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm">Feasibility score based on site conditions</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm">Detailed cost breakdown and BOQ</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm">DJB bill savings comparison</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm">Structure recommendations</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Start Button */}
        <Button onClick={handleStart} className="w-full h-12 text-base font-medium">
          Start Assessment
        </Button>

        {/* Disclaimer */}
        <p className="text-xs text-muted-foreground text-center text-balance">
          This assessment provides estimates based on general Delhi conditions. Actual results may vary based on
          site-specific factors.
        </p>
      </div>
    </div>
  )
}
