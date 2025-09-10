import { Inter, JetBrains_Mono } from "next/font/google"
import "./globals.css"

const inter = Inter({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const metadata = {
  title: "Delhi RTRWH Assessment | Rooftop Rainwater Harvesting",
  description:
    "Assess the feasibility of rooftop rainwater harvesting for your Delhi property. Get cost estimates, safety checks, and DJB bill comparisons.",
  keywords: "rainwater harvesting, Delhi, water conservation, DJB, rooftop, assessment",
  manifest: "/manifest.json",
}

export const viewport = "width=device-width, initial-scale=1, maximum-scale=1"

export const themeColor = "#2563eb"

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head></head>
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} antialiased font-sans bg-background text-foreground`}
      >
        {children}
      </body>
    </html>
  )
}
