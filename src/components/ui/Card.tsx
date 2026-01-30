'use client';

import React, { forwardRef, type HTMLAttributes } from 'react';
import { motion, type HTMLMotionProps } from 'framer-motion';
import { cn } from '@/lib/utils';

interface CardProps extends Omit<HTMLMotionProps<'div'>, 'ref'> {
    variant?: 'default' | 'elevated' | 'bordered' | 'ghost';
    interactive?: boolean;
    glowOnHover?: boolean;
}

const variantStyles = {
    default: 'bg-ordem-ooze border-ordem-border-light',
    elevated: 'bg-ordem-ooze border-ordem-border-light shadow-lg shadow-black/30',
    bordered: 'bg-transparent border-ordem-border-light',
    ghost: 'bg-transparent border-transparent',
};

export const Card = forwardRef<HTMLDivElement, CardProps>(
    (
        {
            variant = 'default',
            interactive = false,
            glowOnHover = false,
            className,
            children,
            ...props
        },
        ref
    ) => {
        return (
            <motion.div
                ref={ref}
                whileHover={
                    interactive
                        ? { y: -2, scale: 1.005 }
                        : undefined
                }
                transition={{ duration: 0.2, ease: 'easeOut' }}
                className={cn(
                    'rounded-xl border overflow-hidden',
                    variantStyles[variant],
                    interactive && 'cursor-pointer',
                    glowOnHover && 'hover:border-ordem-red/50 hover:shadow-[0_0_20px_rgba(220,38,38,0.15)]',
                    className
                )}
                {...props}
            >
                {children}
            </motion.div>
        );
    }
);

Card.displayName = 'Card';
interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> { }

export const CardHeader = forwardRef<HTMLDivElement, CardHeaderProps>(
    ({ className, ...props }, ref) => (
        <div
            ref={ref}
            className={cn('p-4 sm:p-6 border-b border-ordem-border/50', className)}
            {...props}
        />
    )
);
CardHeader.displayName = 'CardHeader';

interface CardContentProps extends HTMLAttributes<HTMLDivElement> { }

export const CardContent = forwardRef<HTMLDivElement, CardContentProps>(
    ({ className, ...props }, ref) => (
        <div
            ref={ref}
            className={cn('p-4 sm:p-6', className)}
            {...props}
        />
    )
);
CardContent.displayName = 'CardContent';

interface CardFooterProps extends HTMLAttributes<HTMLDivElement> { }

export const CardFooter = forwardRef<HTMLDivElement, CardFooterProps>(
    ({ className, ...props }, ref) => (
        <div
            ref={ref}
            className={cn('p-4 sm:p-6 border-t border-ordem-border/50 bg-ordem-black-deep/30', className)}
            {...props}
        />
    )
);
CardFooter.displayName = 'CardFooter';

interface CardTitleProps extends HTMLAttributes<HTMLHeadingElement> { }

export const CardTitle = forwardRef<HTMLHeadingElement, CardTitleProps>(
    ({ className, ...props }, ref) => (
        <h3
            ref={ref}
            className={cn('text-lg font-bold text-white', className)}
            {...props}
        />
    )
);
CardTitle.displayName = 'CardTitle';

interface CardDescriptionProps extends HTMLAttributes<HTMLParagraphElement> { }

export const CardDescription = forwardRef<HTMLParagraphElement, CardDescriptionProps>(
    ({ className, ...props }, ref) => (
        <p
            ref={ref}
            className={cn('text-sm text-ordem-text-secondary mt-1', className)}
            {...props}
        />
    )
);
CardDescription.displayName = 'CardDescription';
