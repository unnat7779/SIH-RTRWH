import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function CostBreakdown({ costData }) {
  if (!costData) return null

  const { components, totals } = costData

  return (
    <Card>
      <CardHeader>
        <CardTitle>Cost Breakdown</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {components.map((component, index) => (
          <div key={index} className="flex justify-between items-center py-2 border-b last:border-b-0">
            <div>
              <p className="font-medium">{component.name}</p>
              <p className="text-sm text-muted-foreground">{component.description}</p>
            </div>
            <p className="font-medium">₹{component.cost.toLocaleString()}</p>
          </div>
        ))}

        <div className="pt-4 space-y-2 border-t">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>₹{totals.subtotal.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span>Installation (15%)</span>
            <span>₹{totals.installation.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span>Contingency (10%)</span>
            <span>₹{totals.contingency.toLocaleString()}</span>
          </div>
          <div className="flex justify-between font-bold text-lg border-t pt-2">
            <span>Total Cost</span>
            <span>₹{totals.total.toLocaleString()}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
