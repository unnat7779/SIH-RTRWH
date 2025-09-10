"use client"

import React, { useState, useRef, useEffect } from "react"
import { cn } from "@/lib/utils"

const Select = ({ value, onValueChange, children, ...props }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedValue, setSelectedValue] = useState(value || "")
  const selectRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (selectRef.current && !selectRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleSelect = (itemValue) => {
    setSelectedValue(itemValue)
    setIsOpen(false)
    if (onValueChange) {
      onValueChange(itemValue)
    }
  }

  return (
    <div ref={selectRef} className="relative" {...props}>
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child, {
            isOpen,
            setIsOpen,
            selectedValue,
            handleSelect,
          })
        }
        return child
      })}
    </div>
  )
}

const SelectTrigger = ({ className, children, isOpen, setIsOpen, ...props }) => (
  <button
    type="button"
    onClick={() => setIsOpen(!isOpen)}
    className={cn(
      "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
      className,
    )}
    {...props}
  >
    {children}
    <svg
      className={cn("h-4 w-4 opacity-50 transition-transform", isOpen && "rotate-180")}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path d="m6 9 6 6 6-6" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
    </svg>
  </button>
)

const SelectValue = ({ className, placeholder, selectedValue, ...props }) => (
  <span className={cn("block truncate", className)} {...props}>
    {selectedValue || placeholder}
  </span>
)

const SelectContent = ({ className, children, isOpen, selectedValue, handleSelect, ...props }) => {
  if (!isOpen) return null

  return (
    <div
      className={cn(
        "absolute top-full left-0 right-0 z-50 mt-1 max-h-60 overflow-auto rounded-md border bg-popover text-popover-foreground shadow-md animate-in fade-in-80",
        className,
      )}
      {...props}
    >
      <div className="p-1">
        {React.Children.map(children, (child) => {
          if (React.isValidElement(child)) {
            return React.cloneElement(child, {
              selectedValue,
              handleSelect,
            })
          }
          return child
        })}
      </div>
    </div>
  )
}

const SelectItem = ({ className, children, value, selectedValue, handleSelect, ...props }) => (
  <div
    onClick={() => handleSelect(value)}
    className={cn(
      "relative flex w-full cursor-pointer select-none items-center rounded-sm py-1.5 pl-2 pr-8 text-sm outline-none hover:bg-accent hover:text-accent-foreground",
      selectedValue === value && "bg-accent text-accent-foreground",
      className,
    )}
    {...props}
  >
    {children}
    {selectedValue === value && (
      <span className="absolute right-2 flex h-3.5 w-3.5 items-center justify-center">
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path d="m5 12 5 5L20 7" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
        </svg>
      </span>
    )}
  </div>
)

export { Select, SelectTrigger, SelectValue, SelectContent, SelectItem }
