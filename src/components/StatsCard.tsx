import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { useIsMobile } from "@/hooks/use-mobile"

interface StatsCardProps {
  title: string
  value: string | number
  change?: string
  positive?: boolean
  icon?: React.ReactNode
  className?: string
}

export function StatsCard({ title, value, change, positive, icon, className }: StatsCardProps) {
  const isMobile = useIsMobile();
  
  // Special handling for PNL % and PNL $ to determine color based on actual value
  const isFinancialMetric = title === "PNL %" || title === "PNL $";
  
  // For financial metrics, determine positivity based on the actual value
  let isPositive = positive;
  let isNegative = false;
  
  if (isFinancialMetric) {
    const valueStr = typeof value === 'string' ? value : value.toString();
    // Extract numeric value, handling cases like "+$100.00" or "-$50.00"
    const numericValue = parseFloat(valueStr.replace(/[^\d.-]/g, "")) || 0;
    isPositive = numericValue >= 0;
    isNegative = numericValue < 0;
  } else {
    // For other cards, use the passed positive prop or determine from value
    isPositive = typeof value === 'string' ? (value.startsWith('+') || (parseFloat(value) || 0) > 0) : value > 0;
    isNegative = typeof value === 'string' ? (value.startsWith('-') || (parseFloat(value) || 0) < 0) : value < 0;
  }

  return (
    <Card className={cn(
      "bg-card border-border hover:bg-card/80 transition-all duration-200 w-full touch-target",
      className
    )}>
      <CardContent className={cn("p-3", isMobile && "p-4")}>
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <p className={cn(
              "text-muted-foreground mb-0.5 uppercase tracking-wide truncate",
              isMobile ? "text-xs" : "text-[10px]"
            )}>
              {title}
            </p>
            <p className={cn(
              "font-bold truncate",
              isMobile ? "text-lg" : "text-base",
              isFinancialMetric ? 
                (isPositive ? "text-success" : "text-destructive") : 
                (isPositive ? "text-success" : isNegative ? "text-destructive" : "text-foreground")
            )}>
              {value}
            </p>
            {change && (
              <p className={cn(
                "font-medium truncate",
                isMobile ? "text-xs" : "text-[10px]",
                positive ? "text-success" : "text-destructive"
              )}>
                {change}
              </p>
            )}
          </div>
          {icon && (
            <div className={cn(
              "ml-2 transition-colors duration-200 flex-shrink-0",
              isMobile && "[&>svg]:w-5 [&>svg]:h-5",
              isFinancialMetric ? 
                (isPositive ? "text-success" : "text-destructive") : 
                (isPositive ? "text-success" : isNegative ? "text-destructive" : "text-muted-foreground")
            )}>
              {icon}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
