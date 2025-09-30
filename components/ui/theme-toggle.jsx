"use client"

import { useTheme } from "next-themes"
import { useEffect, useState } from "react"

export function ThemeToggle() {
  const { theme, setTheme, systemTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  const current = theme === "system" ? systemTheme : theme

  if (!mounted) return null

  return (
    <button
      onClick={() => setTheme(current === "dark" ? "light" : "dark")}
      className="inline-flex h-9 items-center gap-2 rounded-md border border-input bg-background px-3 text-sm text-foreground shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground"
      aria-label="Toggle theme"
      title="Toggle theme"
    >
      <span className="hidden sm:inline">{current === "dark" ? "Dark" : "Light"}</span>
      <span aria-hidden>{current === "dark" ? "🌙" : "☀️"}</span>
    </button>
  )
}

