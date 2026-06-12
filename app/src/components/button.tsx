import * as React from 'react';
import {Slot} from '@radix-ui/react-slot';
import {cva, type VariantProps} from 'class-variance-authority';
import {clsx} from 'clsx';

const buttonVariants = cva(
    'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400/70 disabled:pointer-events-none disabled:opacity-40 select-none cursor-pointer',
    {
        variants: {
            variant: {
            default:
                'bg-indigo-500/20 border border-indigo-400/40 text-indigo-200 hover:bg-indigo-400/30 hover:border-indigo-300/60 hover:text-white active:scale-95',
            run:
                'bg-emerald-500/20 border border-emerald-400/40 text-emerald-200 hover:bg-emerald-400/30 hover:border-emerald-300/70 hover:text-white active:scale-95',
            stop:
                'bg-red-500/20 border border-red-400/40 text-red-200 hover:bg-red-400/30 hover:border-red-300/70 hover:text-white active:scale-95',
            alarm:
                'bg-amber-500/15 border border-amber-400/30 text-amber-300 hover:bg-amber-400/25 hover:text-white active:scale-95',
            'alarm-active':
                'bg-red-600/40 border border-red-400/80 text-red-100 shadow-[0_0_12px_rgba(255,50,50,0.4)] animate-pulse',
            ghost:
                'border border-white/10 text-white/60 hover:bg-white/8 hover:text-white active:scale-95',
            login:
                'bg-indigo-600/25 border border-indigo-400/50 text-indigo-100 hover:bg-indigo-500/35 hover:border-indigo-300/70 hover:text-white shadow-[0_0_20px_rgba(0,200,255,0.15)] active:scale-95',
            },
            size: {
            sm: 'h-7 px-3 text-xs tracking-wide',
            md: 'h-8 px-4 text-xs tracking-wider',
            lg: 'h-10 px-6 text-sm tracking-widest',
            icon: 'h-8 w-8 p-0',
            },
        },
        defaultVariants: {
            variant: 'default',
            size: 'md',
        },
    }
);

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
    asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({className, variant, size, asChild = false, ...props}, ref) => {
        const Component = asChild ? Slot : 'button';
        return (
            <Component
                className={clsx(buttonVariants({variant, size}), className)}
                ref={ref}
                {...props}
            />
        )
    }
);

Button.displayName = 'Button';
