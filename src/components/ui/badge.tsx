import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-xs font-medium border transition-colors',
  {
    variants: {
      variant: {
        default: 'border-[#DCE2E8] bg-[#F1F5F9] text-[#334155]',
        success: 'border-[#BBF7D0] bg-[#F0FDF4] text-[#166534]',
        warning: 'border-[#FDE68A] bg-[#FFFBEB] text-[#92400E]',
        danger: 'border-[#FECACA] bg-[#FEF2F2] text-[#991B1B]',
        info: 'border-[#BFDBFE] bg-[#EFF6FF] text-[#1E40AF]',
        neutral: 'border-[#E2E8F0] bg-[#F8FAFC] text-[#64748B]',
        accent: 'border-[#CBD5E1] bg-[#EBF0F5] text-[#334155]',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { Badge, badgeVariants }
