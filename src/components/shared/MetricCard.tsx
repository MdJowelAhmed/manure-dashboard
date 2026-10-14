import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface MetricCardProps {
  title: string
  value: string
  subvalue?: string
  trend?: {
    value: string
    isPositive?: boolean
    label?: string
  }
  icon?: React.ElementType
  className?: string
  badge?: string
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subvalue,
  trend,
  icon: Icon,
  className,
  badge,
}) => {
  return (
    <Card className={cn('overflow-hidden relative transition-all hover:border-[#CBD5E1]', className)}>
      <CardContent className="p-4 sm:p-5">
        <div className="flex items-center justify-between pb-2">
          <span className="text-xs font-medium text-[#334155] tracking-tight">{title}</span>
          <div className="flex items-center gap-1.5">
            {badge && (
              <span className="px-2 py-0.5 text-[10px] font-medium bg-[#F1F5F9] text-[#475569] rounded-md border border-[#E2E8F0]">
                {badge}
              </span>
            )}
            {Icon && (
              <div className="h-7 w-7 rounded-md bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-center text-[#526B83]">
                <Icon className="h-3.5 w-3.5" />
              </div>
            )}
          </div>
        </div>

        <div className="flex items-baseline gap-2">
          <span className="text-xl sm:text-2xl font-bold tracking-tight text-[#0F172A] font-mono">
            {value}
          </span>
        </div>

        {(subvalue || trend) && (
          <div className="flex items-center gap-2 mt-1.5 text-[11px] text-[#334155]">
            {trend && (
              <span
                className={cn(
                  'font-medium inline-flex items-center',
                  trend.isPositive ? 'text-[#166534]' : 'text-[#991B1B]'
                )}
              >
                {trend.value}
              </span>
            )}
            {trend?.label && <span>{trend.label}</span>}
            {subvalue && <span>{subvalue}</span>}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
