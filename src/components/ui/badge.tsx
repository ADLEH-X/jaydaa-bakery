import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        default:
          'border-transparent bg-bakery-espresso text-[#f7e8d0] shadow hover:bg-[#2b1c15]',
        secondary:
          'border-transparent bg-bakery-goldLight text-bakery-espresso hover:bg-[#ebd5be]',
        destructive:
          'border-transparent bg-red-100 text-red-800 border-red-200',
        outline: 'text-foreground border-bakery-border',
        success:
          'border-emerald-200 bg-emerald-50 text-emerald-800',
        warning:
          'border-amber-200 bg-amber-50 text-amber-800',
        info:
          'border-blue-200 bg-blue-50 text-blue-800',
        gold:
          'border-amber-300 bg-amber-100 text-amber-900',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
