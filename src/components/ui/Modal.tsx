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
    size?: 'sm' | 'md' | 'lg' | 'xl' | 'full' | 'wide';
}

const sizeStyles = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    full: 'max-w-[95vw] sm:max-w-4xl',
    wide: 'max-w-[96vw]',
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

                <div className="pointer-events-none fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4">
                <DialogPrimitive.Content asChild>
                    <motion.div
                        ref={ref}
                        variants={modalVariants}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                        className={cn(
                            'pointer-events-auto relative w-full',
                            'border border-ordem-border bg-ordem-ooze shadow-2xl shadow-black/50',
                            'rounded-t-xl sm:rounded-xl',
                            'flex max-h-[92dvh] flex-col overflow-hidden pb-[env(safe-area-inset-bottom)] sm:max-h-full sm:pb-0',
                            'focus:outline-none',
                            sizeStyles[size],
                            className
                        )}
                    >
                        {children}
                        {showCloseButton && (
                            <DialogPrimitive.Close asChild>
                                <button
                                    className="absolute right-3 top-3 grid h-10 w-10 place-items-center rounded-lg text-ordem-text-muted transition-colors hover:bg-ordem-ooze-light hover:text-white"
                                    aria-label="Fechar"
                                >
                                    <X size={18} />
                                </button>
                            </DialogPrimitive.Close>
                        )}
                    </motion.div>
                </DialogPrimitive.Content>
                </div>
            </DialogPrimitive.Portal>
        );
    }
);

ModalContent.displayName = 'ModalContent';
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
