"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "../../../../components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../../components/ui/card"
import { RadioGroup, RadioGroupItem } from "../../../../components/ui/radio-group"
import { Label } from "../../../../components/ui/label"
import { ArrowLeft, ArrowRight, Shield, AlertTriangle, CheckCircle } from "lucide-react"
import { toast } from "sonner"

export default function SafetyPage() {
  const router = useRouter()
  const [safetyData, setSafetyData] = useState({
    septicWithin15m: null,
    sewerWithin15m: null,
    openDrainWithin15m: null,
    dumpWithin15m: null,
    confirmation: false,
  })

  const [showVeto, setShowVeto] = useState(false)

  const safetyQuestions = [
    {
      key: "septicWithin15m",
      question: "Is there a septic tank within 15 meters of the proposed recharge location?",
      icon: "🚽",
      risk: "High",
      description: "Septic tanks can contaminate groundwater if too close to recharge structures",
    },
    {
      key: "sewerWithin15m",
      question: "Is there a sewer line within 15 meters of the proposed recharge location?",
      icon: "🚰",
      risk: "High",
      description: "Leaking sewer lines pose contamination risk to recharged groundwater",
    },
    {
      key: "openDrainWithin15m",
      question: "Is there an open drain within 15 meters of the proposed recharge location?",
      icon: "🌊",
      risk: "Medium",
      description: "Open drains may carry pollutants that could affect groundwater quality",
    },
    {
      key: "dumpWithin15m",
      question: "Is there a garbage dump or waste disposal area within 15 meters?",
      icon: "🗑️",
      risk: "High",
      description: "Waste dumps can leach harmful chemicals into groundwater",
    },
  ]

  useEffect(() => {
    // Check if previous data exists
    const locationData = sessionStorage.getItem("assessment_location")
    const roofData = sessionStorage.getItem("assessment_roof")

    if (!locationData || !roofData) {
      toast.error("Please complete previous steps first")
      router.push("/assess/start")
    }
  }, [router])

  useEffect(() => {
    // Check for veto conditions
    const hasVeto = Object.values(safetyData).some((value) => value === true)
    setShowVeto(hasVeto)
  }, [safetyData])

  const handleAnswerChange = (key, value) => {
    setSafetyData((prev) => ({
      ...prev,
      [key]: value === "true",
    }))
  }

  const handleNext = () => {
    // Check if all questions are answered
    const unanswered = safetyQuestions.find((q) => safetyData[q.key] === null)
    if (unanswered) {
      toast.error("Please answer all safety questions")
      return
    }

    if (!safetyData.confirmation) {
      toast.error("Please confirm that you have verified these conditions")
      return
    }

    // Store safety data
    sessionStorage.setItem("assessment_safety", JSON.stringify(safetyData))
    router.push("/assess/results")
  }

  const handleBack = () => {
    router.push("/assess/roof")
  }

  const answeredQuestions = safetyQuestions.filter((q) => safetyData[q.key] !== null).length
  const yesAnswers = safetyQuestions.filter((q) => safetyData[q.key] === true).length

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background border-b p-4">
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={handleBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="font-semibold">Safety Assessment</h1>
          <div className="w-16" /> {/* Spacer */}
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Introduction */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Safety Checklist
            </CardTitle>
            <CardDescription>
              Answer these questions to ensure safe groundwater recharge. Contamination sources must be at least 15
              meters away.
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Safety Questions */}
        {safetyQuestions.map((question, index) => (
          <Card key={question.key} className={safetyData[question.key] === true ? "border-red-200 bg-red-50" : ""}>
            <CardHeader>
              <CardTitle className="text-base flex items-start gap-3">
                <span className="text-2xl">{question.icon}</span>
                <div className="flex-1">
                  <p className="text-sm font-medium leading-relaxed">{question.question}</p>
                  <p className="text-xs text-muted-foreground mt-1">{question.description}</p>
                </div>
                <span
                  className={`text-xs px-2 py-1 rounded-full ${
                    question.risk === "High" ? "bg-red-100 text-red-700" : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  {question.risk} Risk
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <RadioGroup
                value={safetyData[question.key]?.toString() || ""}
                onValueChange={(value) => handleAnswerChange(question.key, value)}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="false" id={`${question.key}-no`} />
                  <Label htmlFor={`${question.key}-no`} className="text-sm">
                    No - Safe distance maintained
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="true" id={`${question.key}-yes`} />
                  <Label htmlFor={`${question.key}-yes`} className="text-sm">
                    Yes - Within 15 meters
                  </Label>
                </div>
              </RadioGroup>
            </CardContent>
          </Card>
        ))}

        {/* Veto Warning */}
        {showVeto && yesAnswers > 0 && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
                <div>
                  <h3 className="font-medium text-red-900">Safety Concern Detected</h3>
                  <p className="text-sm text-red-700 mt-1">
                    You have identified {yesAnswers} contamination source{yesAnswers > 1 ? "s" : ""} within 15 meters.
                    This may result in a "Not Recommended" assessment due to groundwater contamination risk.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Progress Summary */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm">
                  {answeredQuestions} of {safetyQuestions.length} questions answered
                </span>
              </div>
              <div className="text-sm text-muted-foreground">
                {yesAnswers > 0 ? `${yesAnswers} safety concern${yesAnswers > 1 ? "s" : ""}` : "All clear"}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Confirmation */}
        {answeredQuestions === safetyQuestions.length && (
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  id="confirmation"
                  checked={safetyData.confirmation}
                  onChange={(e) => setSafetyData((prev) => ({ ...prev, confirmation: e.target.checked }))}
                  className="mt-1"
                />
                <Label htmlFor="confirmation" className="text-sm leading-relaxed">
                  I confirm that I have physically verified these conditions at the proposed recharge location and the
                  information provided is accurate to the best of my knowledge.
                </Label>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Progress */}
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>Step 3 of 4</span>
          <div className="flex gap-1">
            <div className="h-2 w-8 bg-primary rounded" />
            <div className="h-2 w-8 bg-primary rounded" />
            <div className="h-2 w-8 bg-primary rounded" />
            <div className="h-2 w-8 bg-muted rounded" />
          </div>
        </div>

        {/* Next Button */}
        <Button
          onClick={handleNext}
          disabled={answeredQuestions < safetyQuestions.length || !safetyData.confirmation}
          className="w-full h-12"
        >
          View Assessment Results
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  )
}
