'use client';

import React, { forwardRef } from 'react';
import { cn } from '@/lib/utils';

type BadgeVariant =
    | 'default'
    | 'success'
    | 'warning'
    | 'danger'
    | 'info'
    | 'medo'
    | 'mental'
    | 'paralisia'
    | 'sentidos'
    | 'fadiga';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
    variant?: BadgeVariant;
    size?: 'sm' | 'md';
    pulse?: boolean;
}

const variantStyles: Record<BadgeVariant, string> = {
    default: 'bg-ordem-ooze border-ordem-border text-ordem-text-secondary',
    success: 'bg-green-900/30 border-green-800 text-green-400',
    warning: 'bg-amber-900/30 border-amber-800 text-amber-400',
    danger: 'bg-red-900/30 border-red-800 text-red-400',
    info: 'bg-blue-900/30 border-blue-800 text-blue-400',
    // Variantes específicas para condições
    medo: 'bg-purple-900/20 border-purple-700 text-purple-300',
    mental: 'bg-blue-900/20 border-blue-700 text-blue-300',
    paralisia: 'bg-amber-900/20 border-amber-700 text-amber-300',
    sentidos: 'bg-cyan-900/20 border-cyan-700 text-cyan-300',
    fadiga: 'bg-orange-900/20 border-orange-700 text-orange-300',
};

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
    ({ variant = 'default', size = 'md', pulse = false, className, ...props }, ref) => {
        const sizeStyles = {
            sm: 'px-1.5 py-0.5 text-[10px]',
            md: 'px-2 py-1 text-xs',
        };

        return (
            <span
                ref={ref}
                className={cn(
                    'inline-flex items-center font-mono rounded border transition-colors',
                    variantStyles[variant],
                    sizeStyles[size],
                    pulse && 'animate-pulse',
                    className
                )}
                {...props}
            />
        );
    }
);

Badge.displayName = 'Badge';

// Badge com dot indicator
interface DotBadgeProps extends BadgeProps {
    dot?: boolean;
    dotColor?: string;
}

export const DotBadge = forwardRef<HTMLSpanElement, DotBadgeProps>(
    ({ dot = true, dotColor, children, className, ...props }, ref) => {
        return (
            <Badge ref={ref} className={cn('gap-1.5', className)} {...props}>
                {dot && (
                    <span
                        className={cn(
                            'w-1.5 h-1.5 rounded-full',
                            dotColor || 'bg-current'
                        )}
                    />
                )}
                {children}
            </Badge>
        );
    }
);

DotBadge.displayName = 'DotBadge';
