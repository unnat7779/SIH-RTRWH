"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"

export function Tabs({ defaultValue, className, children, ...props }) {
  const [activeTab, setActiveTab] = useState(defaultValue)

  return (
    <div className={cn("w-full", className)} data-active-tab={activeTab} {...props}>
      {children}
    </div>
  )
}

export function TabsList({ className, children, ...props }) {
  return (
    <div
      className={cn(
        "inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export function TabsTrigger({ value, className, children, ...props }) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm",
        className,
      )}
      onClick={() => {
        const tabsElement = document.querySelector(`[data-active-tab]`)
        if (tabsElement) {
          tabsElement.setAttribute("data-active-tab", value)
          // Hide all tab contents
          const allContents = document.querySelectorAll("[data-tab-content]")
          allContents.forEach((content) => (content.style.display = "none"))
          // Show active tab content
          const activeContent = document.querySelector(`[data-tab-content="${value}"]`)
          if (activeContent) activeContent.style.display = "block"
          // Update trigger states
          const allTriggers = document.querySelectorAll("[data-tab-trigger]")
          allTriggers.forEach((trigger) => trigger.removeAttribute("data-state"))
          document.querySelector(`[data-tab-trigger="${value}"]`).setAttribute("data-state", "active")
        }
      }}
      data-tab-trigger={value}
      data-state={value === props.defaultValue ? "active" : undefined}
      {...props}
    >
      {children}
    </button>
  )
}

export function TabsContent({ value, className, children, ...props }) {
  return (
    <div
      className={cn(
        "mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        className,
      )}
      data-tab-content={value}
      style={{ display: value === props.defaultValue ? "block" : "none" }}
      {...props}
    >
      {children}
    </div>
  )
}
