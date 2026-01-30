'use client';

import React, { forwardRef } from 'react';
import * as TabsPrimitive from '@radix-ui/react-tabs';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
export const Tabs = TabsPrimitive.Root;
interface TabsListProps extends React.ComponentPropsWithoutRef<typeof TabsPrimitive.List> {
    variant?: 'default' | 'pills' | 'underline';
}

export const TabsList = forwardRef<
    React.ElementRef<typeof TabsPrimitive.List>,
    TabsListProps
>(({ className, variant = 'default', ...props }, ref) => {
    const variantStyles = {
        default: 'bg-ordem-ooze p-1 rounded-lg',
        pills: 'gap-2',
        underline: 'border-b border-ordem-border gap-0',
    };

    return (
        <TabsPrimitive.List
            ref={ref}
            className={cn(
                'inline-flex items-center',
                variantStyles[variant],
                className
            )}
            {...props}
        />
    );
});
TabsList.displayName = 'TabsList';
interface TabsTriggerProps extends React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger> {
    variant?: 'default' | 'pills' | 'underline';
}

export const TabsTrigger = forwardRef<
    React.ElementRef<typeof TabsPrimitive.Trigger>,
    TabsTriggerProps
>(({ className, variant = 'default', ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center whitespace-nowrap text-sm font-mono transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ordem-red/50 disabled:pointer-events-none disabled:opacity-50';

    const variantStyles = {
        default: 'px-3 py-1.5 rounded-md data-[state=active]:bg-ordem-border-light data-[state=active]:text-white text-ordem-text-muted hover:text-ordem-white-muted',
        pills: 'px-4 py-2 rounded-lg border border-transparent data-[state=active]:bg-ordem-red data-[state=active]:border-red-800 data-[state=active]:text-white text-ordem-text-muted hover:text-white hover:bg-ordem-ooze',
        underline: 'px-4 py-2.5 border-b-2 border-transparent data-[state=active]:border-ordem-red data-[state=active]:text-white text-ordem-text-secondary hover:text-ordem-white-muted',
    };

    return (
        <TabsPrimitive.Trigger
            ref={ref}
            className={cn(baseStyles, variantStyles[variant], className)}
            {...props}
        />
    );
});
TabsTrigger.displayName = 'TabsTrigger';
interface TabsContentProps extends React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content> {
    animate?: boolean;
}

export const TabsContent = forwardRef<
    React.ElementRef<typeof TabsPrimitive.Content>,
    TabsContentProps
>(({ className, animate = true, children, ...props }, ref) => {
    if (!animate) {
        return (
            <TabsPrimitive.Content
                ref={ref}
                className={cn('mt-4 focus-visible:outline-none', className)}
                {...props}
            >
                {children}
            </TabsPrimitive.Content>
        );
    }

    return (
        <TabsPrimitive.Content
            ref={ref}
            className={cn('mt-4 focus-visible:outline-none', className)}
            {...props}
        >
            <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
            >
                {children}
            </motion.div>
        </TabsPrimitive.Content>
    );
});
TabsContent.displayName = 'TabsContent';
