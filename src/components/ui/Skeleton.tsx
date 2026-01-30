'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: 'default' | 'circular' | 'text';
}

export function Skeleton({ className, variant = 'default', ...props }: SkeletonProps) {
    const variantStyles = {
        default: 'rounded-lg',
        circular: 'rounded-full',
        text: 'rounded h-4 w-3/4',
    };

    return (
        <div
            className={cn(
                'animate-pulse bg-ordem-ooze-light',
                variantStyles[variant],
                className
            )}
            {...props}
        />
    );
}
export function SkeletonText({ lines = 3, className }: { lines?: number; className?: string }) {
    return (
        <div className={cn('space-y-2', className)}>
            {Array.from({ length: lines }).map((_, i) => (
                <Skeleton
                    key={i}
                    variant="text"
                    className={cn(
                        'h-4',
                        i === lines - 1 && 'w-1/2'
                    )}
                />
            ))}
        </div>
    );
}

export function SkeletonCard({ className }: { className?: string }) {
    return (
        <div className={cn('rounded-xl border border-ordem-border-light p-4', className)}>
            <div className="flex items-center gap-3 mb-4">
                <Skeleton variant="circular" className="w-10 h-10" />
                <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-1/3" />
                    <Skeleton className="h-3 w-1/4" />
                </div>
            </div>
            <SkeletonText lines={2} />
        </div>
    );
}

export function SkeletonStatusBar({ className }: { className?: string }) {
    return (
        <div className={cn('space-y-2', className)}>
            <div className="flex justify-between">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-16" />
            </div>
            <Skeleton className="h-8 w-full rounded-md" />
        </div>
    );
}

export function SkeletonAvatar({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
    const sizes = {
        sm: 'w-8 h-8',
        md: 'w-10 h-10',
        lg: 'w-14 h-14',
    };

    return <Skeleton variant="circular" className={sizes[size]} />;
}
