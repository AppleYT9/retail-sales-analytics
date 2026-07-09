'use client'

import { ArrowUp, ArrowDown } from 'lucide-react'

interface KPICardProps {
  title: string
  value: string | number
  unit?: string
  change?: number
  isPositive?: boolean
  icon?: React.ReactNode
  loading?: boolean
}

export function KPICard({
  title,
  value,
  unit,
  change,
  isPositive = true,
  icon,
  loading = false,
}: KPICardProps) {
  return (
    <div className="bg-card border border-border rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
        {icon && <div className="text-primary">{icon}</div>}
      </div>

      <div className="space-y-2">
        <div className="flex items-baseline gap-2">
          {loading ? (
            <div className="h-8 w-24 bg-muted rounded animate-pulse" />
          ) : (
            <>
              <span className="text-3xl font-bold text-foreground">
                {typeof value === 'number' ? value.toLocaleString() : value}
              </span>
              {unit && <span className="text-sm text-muted-foreground">{unit}</span>}
            </>
          )}
        </div>

        {change !== undefined && !loading && (
          <div className={`flex items-center gap-1 text-sm font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
            {isPositive ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
            <span>{Math.abs(change)}%</span>
            <span className="text-muted-foreground font-normal">vs last month</span>
          </div>
        )}
      </div>
    </div>
  )
}
