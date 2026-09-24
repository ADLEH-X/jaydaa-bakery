import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-bakery-espresso disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default:
          'bg-bakery-espresso text-[#f7e8d0] shadow hover:bg-[#2b1c15]',
        gold:
          'bg-bakery-gold text-white shadow hover:bg-[#a6723b]',
        outline:
          'border border-bakery-border bg-white shadow-sm hover:bg-bakery-cream hover:text-bakery-espresso',
        secondary:
          'bg-bakery-goldLight text-bakery-espresso shadow-sm hover:bg-[#dfc5aa]',
        ghost:
          'hover:bg-bakery-cream hover:text-bakery-espresso',
        link:
          'text-bakery-espresso underline-offset-4 hover:underline',
        destructive:
          'bg-red-600 text-white shadow-sm hover:bg-red-700',
      },
      size: {
        default: 'h-9 px-4 py-2',
        sm: 'h-8 rounded-md px-3 text-xs',
        lg: 'h-10 rounded-md px-8 text-base',
        icon: 'h-9 w-9',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
