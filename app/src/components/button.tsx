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
                'bg-indigo-500/20 border border-indigo-400/40 dark:text-indigo-200 dark:hover:bg-indigo-400/30 dark:hover:border-indigo-300/60 text-black active:scale-95',
            run:
                'bg-emerald-500/20 border border-emerald-400/40 dark:text-emerald-200 hover:bg-emerald-400/30 hover:border-emerald-300/70 text-emerald-600 hover:text-white active:scale-95',
            stop:
                'bg-red-500/20 border border-red-400/40 dark:text-red-200 dark:hover:bg-red-400/30 hover:border-red-300/70 text-red-600 hover:text-white active:scale-95',
            alarm:
                'bg-amber-500/15 border border-amber-400/30 dark:text-amber-300 hover:bg-amber-500 dark:hover:bg-amber-400/25 text-amber-600 hover:text-white active:scale-95',
            'alarm-active':
                'bg-red-200/30 dark:bg-red-600/40 border border-red-400/80 dark:text-red-100 shadow-[0_0_12px_rgba(255,50,50,0.4)] text-red-600 animate-pulse',
            ghost:
                'border border-black dark:border-white/10 dark:text-black dark:text-white/60 dark:hover:bg-white dark:hover:text-black hover:bg-black text-black hover:text-white active:scale-95',
            login:
                'bg-indigo-600/25 border border-indigo-400/50 dark:text-indigo-100 dark:hover:bg-indigo-500/35 hover:border-indigo-300/70 text-indigo-600 hover:text-white shadow-[0_0_20px_rgba(0,200,255,0.15)] active:scale-95',
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
    loading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({className, variant, size, asChild = false, loading = false, ...props}, ref) => {
        const Component = asChild ? Slot : 'button';
        return (
            <Component
                ref={ref}
                className={clsx(
                    buttonVariants({ variant, size }),
                    className,
                    "inline-flex items-center justify-center gap-2"
                )}
                disabled={loading || props.disabled}
                {...props}
                >
                <span className="inline-flex items-center gap-2">
                    {loading && (
                    <span className="w-3 h-3 border-2 border-black dark:border-white/30 border-t-white rounded-full animate-spin" />
                    )}
                    {props.children}
                </span>
            </Component>
        );
    }
);

Button.displayName = 'Button';
