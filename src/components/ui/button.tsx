import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#526B83] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 cursor-pointer select-none',
  {
    variants: {
      variant: {
        default: 'bg-[#526B83] text-white hover:bg-[#3E5367] shadow-sm',
        secondary: 'bg-[#F1F5F9] text-[#202833] hover:bg-[#E2E8F0] border border-[#DCE2E8]',
        outline: 'border border-[#DCE2E8] bg-white text-[#202833] hover:bg-[#F8FAFC]',
        ghost: 'text-[#697586] hover:text-[#202833] hover:bg-[#F1F5F9]',
        danger: 'bg-[#DC2626] text-white hover:bg-[#B91C1C] shadow-sm',
        success: 'bg-[#0F766E] text-white hover:bg-[#0D655E] shadow-sm',
        link: 'text-[#526B83] underline-offset-4 hover:underline p-0 h-auto',
      },
      size: {
        default: 'h-9 px-3.5 py-2',
        sm: 'h-8 rounded-md px-2.5 text-xs',
        lg: 'h-10 rounded-lg px-5 text-base',
        icon: 'h-9 w-9 p-0',
        iconSm: 'h-7 w-7 p-0 rounded-md',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = 'Button'

export { Button, buttonVariants }
