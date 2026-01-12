'use client';

import React, { forwardRef } from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';
import { backdropVariants, modalVariants } from '@/lib/motion';

interface ModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    children: React.ReactNode;
}

export function Modal({ open, onOpenChange, children }: ModalProps) {
    return (
        <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
            <AnimatePresence>
                {open && children}
            </AnimatePresence>
        </DialogPrimitive.Root>
    );
}

interface ModalContentProps {
    children: React.ReactNode;
    className?: string;
    showCloseButton?: boolean;
    size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

const sizeStyles = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    full: 'max-w-[95vw] sm:max-w-4xl',
};

export const ModalContent = forwardRef<HTMLDivElement, ModalContentProps>(
    ({ children, className, showCloseButton = true, size = 'md' }, ref) => {
        return (
            <DialogPrimitive.Portal forceMount>
                <DialogPrimitive.Overlay asChild>
                    <motion.div
                        variants={backdropVariants}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                        className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
                    />
                </DialogPrimitive.Overlay>

                <DialogPrimitive.Content asChild>
                    <motion.div
                        ref={ref}
                        variants={modalVariants}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                        className={cn(
                            'fixed left-1/2 top-1/2 z-50 w-full -translate-x-1/2 -translate-y-1/2',
                            'bg-ordem-ooze border border-ordem-border rounded-xl shadow-2xl shadow-black/50',
                            'max-h-[90vh] overflow-hidden flex flex-col',
                            'focus:outline-none',
                            sizeStyles[size],
                            className
                        )}
                    >
                        {children}
                        {showCloseButton && (
                            <DialogPrimitive.Close asChild>
                                <button
                                    className="absolute right-4 top-4 p-1.5 rounded-lg text-ordem-text-muted hover:text-white hover:bg-ordem-ooze-light transition-colors"
                                    aria-label="Fechar"
                                >
                                    <X size={18} />
                                </button>
                            </DialogPrimitive.Close>
                        )}
                    </motion.div>
                </DialogPrimitive.Content>
            </DialogPrimitive.Portal>
        );
    }
);

ModalContent.displayName = 'ModalContent';

// Subcomponentes
export const ModalHeader = forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
    <div
        ref={ref}
        className={cn('p-4 sm:p-6 border-b border-ordem-border/50 pr-12', className)}
        {...props}
    />
));
ModalHeader.displayName = 'ModalHeader';

export const ModalBody = forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
    <div
        ref={ref}
        className={cn('p-4 sm:p-6 overflow-y-auto flex-1', className)}
        {...props}
    />
));
ModalBody.displayName = 'ModalBody';

export const ModalFooter = forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
    <div
        ref={ref}
        className={cn(
            'p-4 sm:p-6 border-t border-ordem-border/50 bg-ordem-black-deep/30 flex justify-end gap-3',
            className
        )}
        {...props}
    />
));
ModalFooter.displayName = 'ModalFooter';

export const ModalTitle = DialogPrimitive.Title;
export const ModalDescription = DialogPrimitive.Description;
export const ModalTrigger = DialogPrimitive.Trigger;
export const ModalClose = DialogPrimitive.Close;
