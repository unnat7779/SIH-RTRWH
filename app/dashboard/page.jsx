"use client"

import { useState, useEffect } from "react"
import { Button } from "../../components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card"
// import { Badge } from "../../../components/ui/badge"
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs"
import { Progress } from "../../components/ui/progress"
import Link from "next/link"
import {
  Plus,
  MapPin,
  Calendar,
  TrendingUp,
  Droplets,
  IndianRupee,
  Award,
  BarChart3,
  FileText,
  Home,
  CheckCircle,
  Clock,
} from "lucide-react"

export default function DashboardPage() {
  const [assessments, setAssessments] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState({
    totalAssessments: 0,
    feasibleProperties: 0,
    potentialSavings: 0,
    waterHarvested: 0,
  })

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch user assessments
        const response = await fetch("/api/assessments?limit=10")
        if (response.ok) {
          const data = await response.json()
          setAssessments(data.data || [])

          // Calculate stats
          const feasible = data.data?.filter((a) => a.scoreLevel !== "NOT_RECOMMENDED").length || 0
          const totalWater = data.data?.reduce((sum, a) => sum + (a.annualRunoffLiters || 0), 0) || 0

          setStats({
            totalAssessments: data.data?.length || 0,
            feasibleProperties: feasible,
            potentialSavings: feasible * 2400, // Estimated annual savings per property
            waterHarvested: Math.round(totalWater / 1000), // Convert to kL
          })
        }
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  const getScoreColor = (score) => {
    if (score >= 80) return "text-green-600"
    if (score >= 60) return "text-yellow-600"
    if (score >= 40) return "text-orange-600"
    return "text-red-600"
  }

  const getScoreBadge = (scoreLevel) => {
    switch (scoreLevel) {
      case "HIGHLY_FEASIBLE":
        return <Badge className="bg-green-100 text-green-800">Highly Feasible</Badge>
      case "MODERATE":
        return <Badge className="bg-yellow-100 text-yellow-800">Moderate</Badge>
      case "MARGINAL":
        return <Badge className="bg-orange-100 text-orange-800">Marginal</Badge>
      default:
        return <Badge variant="destructive">Not Recommended</Badge>
    }
  }

  const achievements = [
    {
      icon: Award,
      title: "First Assessment",
      description: "Completed your first RTRWH assessment",
      earned: assessments.length > 0,
      points: 10,
    },
    {
      icon: Droplets,
      title: "Water Saver",
      description: "Assessed a highly feasible property",
      earned: assessments.some((a) => a.scoreLevel === "HIGHLY_FEASIBLE"),
      points: 25,
    },
    {
      icon: TrendingUp,
      title: "Eco Warrior",
      description: "Completed 5 assessments",
      earned: assessments.length >= 5,
      points: 50,
    },
  ]

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Droplets className="h-6 w-6 text-primary" />
            <span className="font-bold text-lg">Delhi RTRWH</span>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">
              Home
            </Link>
            <Link href="/dashboard" className="text-sm font-medium">
              Dashboard
            </Link>
          </nav>
          <Link href="/assess/start">
            <Button className="bg-primary hover:bg-primary/90">
              <Plus className="h-4 w-4 mr-2" />
              New Assessment
            </Button>
          </Link>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
          <p className="text-muted-foreground">
            Track your rainwater harvesting assessments and monitor your water conservation impact
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Assessments</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalAssessments}</div>
              <p className="text-xs text-muted-foreground">Properties evaluated</p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Feasible Properties</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.feasibleProperties}</div>
              <p className="text-xs text-muted-foreground">Suitable for RTRWH</p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Potential Savings</CardTitle>
              <IndianRupee className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">₹{stats.potentialSavings.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Annual water bill savings</p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Water Potential</CardTitle>
              <Droplets className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-cyan-600">{stats.waterHarvested}K</div>
              <p className="text-xs text-muted-foreground">Liters annually</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="assessments" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="assessments">My Assessments</TabsTrigger>
            <TabsTrigger value="achievements">Achievements</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="assessments" className="space-y-6">
            {assessments.length === 0 ? (
              <Card className="bg-card border-border">
                <CardContent className="pt-6">
                  <div className="text-center space-y-4">
                    <div className="mx-auto w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                      <Home className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="font-semibold">No assessments yet</h3>
                      <p className="text-sm text-muted-foreground">
                        Start your first rainwater harvesting assessment to see results here
                      </p>
                    </div>
                    <Link href="/assess/start">
                      <Button className="bg-primary hover:bg-primary/90">
                        <Plus className="h-4 w-4 mr-2" />
                        Start Assessment
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {assessments.map((assessment) => (
                  <Card key={assessment.id} className="bg-card border-border">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <CardTitle className="text-lg">{assessment.property?.label || "Unnamed Property"}</CardTitle>
                          <CardDescription className="flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            {assessment.property?.addressText || "Address not available"}
                          </CardDescription>
                        </div>
                        {getScoreBadge(assessment.scoreLevel)}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Feasibility Score</span>
                            <span className={`text-sm font-medium ${getScoreColor(assessment.score100 || 0)}`}>
                              {assessment.score100 || 0}/100
                            </span>
                          </div>
                          <Progress value={assessment.score100 || 0} className="h-2" />
                        </div>

                        <div className="text-center">
                          <div className="text-lg font-semibold text-blue-600">
                            {Math.round((assessment.annualRunoffLiters || 0) / 1000)}K L
                          </div>
                          <div className="text-xs text-muted-foreground">Annual Runoff</div>
                        </div>

                        <div className="text-center">
                          <div className="text-lg font-semibold text-green-600">
                            {assessment.property?.rooftopAreaSqm || 0} m²
                          </div>
                          <div className="text-xs text-muted-foreground">Roof Area</div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t border-border">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          {new Date(assessment.createdAt).toLocaleDateString()}
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" className="bg-transparent">
                            View Details
                          </Button>
                          <Button variant="outline" size="sm" className="bg-transparent">
                            Download Report
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="achievements" className="space-y-6">
            <div className="grid gap-4">
              {achievements.map((achievement, index) => {
                const Icon = achievement.icon
                return (
                  <Card
                    key={index}
                    className={`bg-card border-border ${achievement.earned ? "ring-2 ring-primary/20" : "opacity-60"}`}
                  >
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-4">
                        <div
                          className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                            achievement.earned ? "bg-primary/10" : "bg-muted"
                          }`}
                        >
                          <Icon
                            className={`h-6 w-6 ${achievement.earned ? "text-primary" : "text-muted-foreground"}`}
                          />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold">{achievement.title}</h3>
                            {achievement.earned ? (
                              <CheckCircle className="h-4 w-4 text-green-600" />
                            ) : (
                              <Clock className="h-4 w-4 text-muted-foreground" />
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">{achievement.description}</p>
                          <Badge variant={achievement.earned ? "default" : "secondary"} className="text-xs">
                            {achievement.points} points
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid gap-6">
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Assessment Overview
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Highly Feasible</span>
                      <div className="flex items-center gap-2">
                        <div className="w-32 bg-muted rounded-full h-2">
                          <div
                            className="bg-green-600 h-2 rounded-full"
                            style={{
                              width: `${stats.totalAssessments > 0 ? (assessments.filter((a) => a.scoreLevel === "HIGHLY_FEASIBLE").length / stats.totalAssessments) * 100 : 0}%`,
                            }}
                          />
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {assessments.filter((a) => a.scoreLevel === "HIGHLY_FEASIBLE").length}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm">Moderate</span>
                      <div className="flex items-center gap-2">
                        <div className="w-32 bg-muted rounded-full h-2">
                          <div
                            className="bg-yellow-600 h-2 rounded-full"
                            style={{
                              width: `${stats.totalAssessments > 0 ? (assessments.filter((a) => a.scoreLevel === "MODERATE").length / stats.totalAssessments) * 100 : 0}%`,
                            }}
                          />
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {assessments.filter((a) => a.scoreLevel === "MODERATE").length}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm">Not Recommended</span>
                      <div className="flex items-center gap-2">
                        <div className="w-32 bg-muted rounded-full h-2">
                          <div
                            className="bg-red-600 h-2 rounded-full"
                            style={{
                              width: `${stats.totalAssessments > 0 ? (assessments.filter((a) => a.scoreLevel === "NOT_RECOMMENDED").length / stats.totalAssessments) * 100 : 0}%`,
                            }}
                          />
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {assessments.filter((a) => a.scoreLevel === "NOT_RECOMMENDED").length}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle>Environmental Impact</CardTitle>
                  <CardDescription>Your contribution to Delhi's water conservation</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-muted/50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">{stats.waterHarvested}K</div>
                      <div className="text-sm text-muted-foreground">Liters/Year Potential</div>
                    </div>
                    <div className="text-center p-4 bg-muted/50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">
                        {Math.round(stats.waterHarvested * 0.001)}
                      </div>
                      <div className="text-sm text-muted-foreground">Tons CO₂ Saved</div>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Based on your feasible assessments, you could potentially harvest {stats.waterHarvested}K liters of
                    rainwater annually, contributing significantly to Delhi's groundwater recharge.
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
