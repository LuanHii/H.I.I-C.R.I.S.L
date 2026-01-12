'use client';

import React, { useState, forwardRef, type ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { ChevronDown } from 'lucide-react';
import { collapseVariants } from '@/lib/motion';

interface CollapsibleProps {
    title: ReactNode;
    defaultOpen?: boolean;
    icon?: ReactNode;
    badge?: ReactNode;
    className?: string;
    headerClassName?: string;
    contentClassName?: string;
    children: ReactNode;
    onOpenChange?: (open: boolean) => void;
}

export function Collapsible({
    title,
    defaultOpen = false,
    icon,
    badge,
    className,
    headerClassName,
    contentClassName,
    children,
    onOpenChange,
}: CollapsibleProps) {
    const [isOpen, setIsOpen] = useState(defaultOpen);

    const toggle = () => {
        const newState = !isOpen;
        setIsOpen(newState);
        onOpenChange?.(newState);
    };

    return (
        <div className={cn('rounded-xl border border-ordem-border-light overflow-hidden', className)}>
            <button
                type="button"
                onClick={toggle}
                className={cn(
                    'w-full flex items-center justify-between p-4 bg-ordem-ooze/50 hover:bg-ordem-ooze transition-colors text-left',
                    isOpen && 'border-b border-ordem-border-light',
                    headerClassName
                )}
            >
                <div className="flex items-center gap-3">
                    {icon && (
                        <div className="p-2 bg-ordem-border-light rounded text-ordem-white-muted">
                            {icon}
                        </div>
                    )}
                    <span className="font-bold text-zinc-100">{title}</span>
                    {badge}
                </div>

                <motion.div
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                >
                    <ChevronDown className="w-5 h-5 text-ordem-text-secondary" />
                </motion.div>
            </button>

            <AnimatePresence initial={false}>
                {isOpen && (
                    <motion.div
                        variants={collapseVariants}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                        style={{ overflow: 'hidden' }}
                    >
                        <div className={cn('p-4 sm:p-6', contentClassName)}>
                            {children}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

// Versão controlada
interface ControlledCollapsibleProps extends Omit<CollapsibleProps, 'defaultOpen' | 'onOpenChange'> {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function ControlledCollapsible({
    open,
    onOpenChange,
    title,
    icon,
    badge,
    className,
    headerClassName,
    contentClassName,
    children,
}: ControlledCollapsibleProps) {
    return (
        <div className={cn('rounded-xl border border-ordem-border-light overflow-hidden', className)}>
            <button
                type="button"
                onClick={() => onOpenChange(!open)}
                className={cn(
                    'w-full flex items-center justify-between p-4 bg-ordem-ooze/50 hover:bg-ordem-ooze transition-colors text-left',
                    open && 'border-b border-ordem-border-light',
                    headerClassName
                )}
            >
                <div className="flex items-center gap-3">
                    {icon && (
                        <div className="p-2 bg-ordem-border-light rounded text-ordem-white-muted">
                            {icon}
                        </div>
                    )}
                    <span className="font-bold text-zinc-100">{title}</span>
                    {badge}
                </div>

                <motion.div
                    animate={{ rotate: open ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                >
                    <ChevronDown className="w-5 h-5 text-ordem-text-secondary" />
                </motion.div>
            </button>

            <AnimatePresence initial={false}>
                {open && (
                    <motion.div
                        variants={collapseVariants}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                        style={{ overflow: 'hidden' }}
                    >
                        <div className={cn('p-4 sm:p-6', contentClassName)}>
                            {children}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
