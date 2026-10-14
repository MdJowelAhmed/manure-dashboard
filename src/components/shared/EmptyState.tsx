import React from 'react'
import { Inbox } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface EmptyStateProps {
  title: string
  description: string
  actionLabel?: string
  onAction?: () => void
  icon?: React.ElementType
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  actionLabel,
  onAction,
  icon: Icon = Inbox,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center rounded-xl border border-dashed border-[#DCE2E8] bg-white my-4">
      <div className="h-11 w-11 rounded-full bg-[#F1F5F9] flex items-center justify-center text-[#334155] mb-3">
        <Icon className="h-5 w-5" />
      </div>
      <h4 className="text-sm font-semibold text-[#0F172A]">{title}</h4>
      <p className="text-xs text-[#334155] max-w-sm mt-1">{description}</p>
      {actionLabel && onAction && (
        <Button size="sm" onClick={onAction} className="mt-4">
          {actionLabel}
        </Button>
      )}
    </div>
  )
}
