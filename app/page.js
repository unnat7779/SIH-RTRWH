import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import {
  Droplets,
  Calculator,
  Shield,
  TrendingDown,
  MapPin,
  CheckCircle,
  ArrowRight,
  Building,
  Leaf,
  IndianRupee,
} from "lucide-react"

export default function MarketingPage() {
  const benefits = [
    {
      icon: TrendingDown,
      title: "Reduce Water Bills",
      description: "Save up to 40% on your DJB water bills with effective rainwater harvesting",
      color: "text-blue-600",
    },
    {
      icon: Leaf,
      title: "Environmental Impact",
      description: "Contribute to Delhi's groundwater recharge and reduce urban flooding",
      color: "text-green-600",
    },
    {
      icon: Shield,
      title: "Water Security",
      description: "Build resilience against water scarcity with your own water source",
      color: "text-purple-600",
    },
    {
      icon: Building,
      title: "Property Value",
      description: "Increase your property value with sustainable water management systems",
      color: "text-orange-600",
    },
  ]

  const features = [
    {
      icon: MapPin,
      title: "Location Assessment",
      description: "AI-powered analysis of your property's suitability for rainwater harvesting",
    },
    {
      icon: Calculator,
      title: "Cost Estimation",
      description: "Detailed BOQ with material and labor costs based on Delhi PWD rates",
    },
    {
      icon: IndianRupee,
      title: "Savings Calculator",
      description: "Compare DJB bill savings and calculate payback period",
    },
    {
      icon: CheckCircle,
      title: "Safety Compliance",
      description: "Ensure your system meets all safety and regulatory requirements",
    },
  ]

  const stats = [
    { value: "650mm", label: "Annual Rainfall", description: "Delhi's average" },
    { value: "85%", label: "Collection Efficiency", description: "From RCC roofs" },
    { value: "₹28/kL", label: "DJB Rate", description: "Above 20kL usage" },
    { value: "15m", label: "Safety Distance", description: "From contamination" },
  ]

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
            <Link href="#features" className="text-sm text-muted-foreground hover:text-foreground">
              Features
            </Link>
            <Link href="#benefits" className="text-sm text-muted-foreground hover:text-foreground">
              Benefits
            </Link>
            <Link href="/dashboard" className="text-sm text-muted-foreground hover:text-foreground">
              Dashboard
            </Link>
          </nav>
          <Link href="/assess/start">
            <Button className="bg-primary hover:bg-primary/90">Start Assessment</Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-12 md:py-20 px-4">
        <div className="container mx-auto max-w-4xl text-center space-y-8">
          <div className="space-y-4">
            <Badge variant="secondary" className="bg-secondary/10 text-secondary-foreground">
              Government of Delhi Initiative
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold text-balance leading-tight">
              Assess Your Rooftop for <span className="text-primary">Rainwater Harvesting</span>
            </h1>
            <p className="text-xl text-muted-foreground text-balance max-w-2xl mx-auto">
              Get a comprehensive feasibility assessment, cost estimates, and DJB bill savings for implementing
              rainwater harvesting at your Delhi property.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/assess/start">
              <Button size="lg" className="bg-primary hover:bg-primary/90 h-12 px-8">
                Start Free Assessment
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button variant="outline" size="lg" className="h-12 px-8 bg-transparent">
                View Dashboard
              </Button>
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-primary">{stat.value}</div>
                <div className="text-sm font-medium">{stat.label}</div>
                <div className="text-xs text-muted-foreground">{stat.description}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center space-y-4 mb-12">
            <h2 className="text-3xl md:text-4xl font-bold">Complete Assessment in 4 Simple Steps</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Our AI-powered assessment tool evaluates your property's potential for rainwater harvesting
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <Card key={index} className="bg-card border-border">
                  <CardHeader className="text-center">
                    <div className="mx-auto w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-center">{feature.description}</CardDescription>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="benefits" className="py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center space-y-4 mb-12">
            <h2 className="text-3xl md:text-4xl font-bold">Why Choose Rainwater Harvesting?</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Join thousands of Delhi residents who are saving water and money
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon
              return (
                <Card key={index} className="bg-card border-border">
                  <CardHeader>
                    <div className="flex items-start gap-4">
                      <div className={`w-12 h-12 rounded-lg bg-muted flex items-center justify-center`}>
                        <Icon className={`h-6 w-6 ${benefit.color}`} />
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-xl mb-2">{benefit.title}</CardTitle>
                        <CardDescription className="text-base">{benefit.description}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-primary/5">
        <div className="container mx-auto max-w-4xl text-center space-y-8">
          <div className="space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold">Ready to Start Saving Water?</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Get your free assessment today and discover how much you can save with rainwater harvesting
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/assess/start">
              <Button size="lg" className="bg-primary hover:bg-primary/90 h-12 px-8">
                Start Your Assessment
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>

          <div className="pt-8 border-t border-border">
            <p className="text-sm text-muted-foreground">
              Free assessment • No registration required • Instant results
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t border-border">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Droplets className="h-6 w-6 text-primary" />
                <span className="font-bold text-lg">Delhi RTRWH</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Empowering Delhi residents to implement sustainable rainwater harvesting solutions.
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold">Assessment</h3>
              <div className="space-y-2 text-sm">
                <Link href="/assess/start" className="block text-muted-foreground hover:text-foreground">
                  Start Assessment
                </Link>
                <Link href="/dashboard" className="block text-muted-foreground hover:text-foreground">
                  Dashboard
                </Link>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold">Resources</h3>
              <div className="space-y-2 text-sm">
                <a href="#" className="block text-muted-foreground hover:text-foreground">
                  Guidelines
                </a>
                <a href="#" className="block text-muted-foreground hover:text-foreground">
                  FAQs
                </a>
                <a href="#" className="block text-muted-foreground hover:text-foreground">
                  Support
                </a>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold">Contact</h3>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>Delhi Jal Board</p>
                <p>Government of Delhi</p>
                <p>support@delhirtrwh.gov.in</p>
              </div>
            </div>
          </div>

          <div className="pt-8 mt-8 border-t border-border text-center">
            <p className="text-sm text-muted-foreground">
              © 2024 Delhi Rooftop Rainwater Harvesting Assessment. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
