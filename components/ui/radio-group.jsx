"use client"

import React from "react"
import { cn } from "../../lib/utils"

const RadioGroup = React.forwardRef(({ className, onValueChange, value, defaultValue, ...props }, ref) => {
  const [selectedValue, setSelectedValue] = React.useState(defaultValue || "")

  const handleChange = (newValue) => {
    setSelectedValue(newValue)
    if (onValueChange) {
      onValueChange(newValue)
    }
  }

  return (
    <div ref={ref} className={cn("grid gap-2", className)} role="radiogroup">
      {React.Children.map(props.children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child, {
            checked: (value !== undefined ? value : selectedValue) === child.props.value,
            onChange: () => handleChange(child.props.value),
          })
        }
        return child
      })}
    </div>
  )
})
RadioGroup.displayName = "RadioGroup"

const RadioGroupItem = React.forwardRef(({ className, children, value, checked, onChange, ...props }, ref) => (
  <div className="flex items-center space-x-2">
    <input
      ref={ref}
      type="radio"
      value={value}
      checked={checked}
      onChange={onChange}
      className={cn(
        "aspect-square h-4 w-4 rounded-full border border-primary text-primary ring-offset-background focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    />
    {children}
  </div>
))
RadioGroupItem.displayName = "RadioGroupItem"

export { RadioGroup, RadioGroupItem }
