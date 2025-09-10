"use client"

import { Progress } from "@/components/ui/progress"

const steps = [
  { id: "start", name: "Start", path: "/assess/start" },
  { id: "location", name: "Location", path: "/assess/location" },
  { id: "roof", name: "Roof Details", path: "/assess/roof" },
  { id: "safety", name: "Safety Check", path: "/assess/safety" },
  { id: "results", name: "Results", path: "/assess/results" },
]

export function AssessmentProgress({ currentStep }) {
  const currentIndex = steps.findIndex((step) => step.id === currentStep)
  const progress = currentIndex >= 0 ? ((currentIndex + 1) / steps.length) * 100 : 0

  return (
    <div className="w-full space-y-4">
      <div className="flex justify-between text-sm text-muted-foreground">
        <span>
          Step {currentIndex + 1} of {steps.length}
        </span>
        <span>{Math.round(progress)}% Complete</span>
      </div>

      <Progress value={progress} className="h-2" />

      <div className="flex justify-between">
        {steps.map((step, index) => (
          <div
            key={step.id}
            className={`flex flex-col items-center space-y-1 ${
              index <= currentIndex ? "text-primary" : "text-muted-foreground"
            }`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
                index <= currentIndex ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
              }`}
            >
              {index + 1}
            </div>
            <span className="text-xs text-center hidden sm:block">{step.name}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
