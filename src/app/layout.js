import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const metadata = {
  title: "Delhi RTRWH Assessment | Rooftop Rainwater Harvesting",
  description:
    "Assess the feasibility of rooftop rainwater harvesting for your Delhi property. Get cost estimates, safety checks, and DJB bill comparisons.",
  keywords: "rainwater harvesting, Delhi, water conservation, DJB, rooftop, assessment",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1",
  themeColor: "#2563eb",
  manifest: "/manifest.json",
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased font-sans bg-background text-foreground`}
      >
        {children}
      </body>
    </html>
  )
}
