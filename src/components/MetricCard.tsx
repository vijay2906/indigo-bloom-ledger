import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  title: string;
  value: string;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  icon?: ReactNode;
  className?: string;
}

export function MetricCard({ 
  title, 
  value, 
  change, 
  changeType = "neutral", 
  icon,
  className 
}: MetricCardProps) {
  return (
    <div className={cn("finance-card p-6", className)}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold text-foreground mt-2">{value}</p>
          {change && (
            <p className={cn(
              "text-sm font-medium mt-1",
              changeType === "positive" && "metric-positive",
              changeType === "negative" && "metric-negative",
              changeType === "neutral" && "metric-neutral"
            )}>
              {change}
            </p>
          )}
        </div>
        {icon && (
          <div className="ml-4 flex-shrink-0">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
              {icon}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}