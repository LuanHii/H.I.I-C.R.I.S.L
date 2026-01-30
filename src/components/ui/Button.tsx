'use client';

import React, { forwardRef } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'success';
export type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps {
    variant?: ButtonVariant;
    size?: ButtonSize;
    loading?: boolean;
    icon?: React.ReactNode;
    iconPosition?: 'left' | 'right';
    disabled?: boolean;
    className?: string;
    children?: React.ReactNode;
    onClick?: () => void;
    type?: 'button' | 'submit' | 'reset';
    title?: string;
}

const variantStyles: Record<ButtonVariant, string> = {
    primary: 'bg-ordem-red hover:bg-red-700 text-white border-red-800 shadow-lg shadow-red-900/20',
    secondary: 'bg-ordem-ooze hover:bg-ordem-ooze-light text-ordem-white border-ordem-border-light',
    ghost: 'bg-transparent hover:bg-ordem-ooze text-ordem-white-muted hover:text-white border-transparent',
    danger: 'bg-red-900/50 hover:bg-red-800 text-red-100 border-red-800',
    success: 'bg-green-900/50 hover:bg-green-800 text-green-100 border-green-800',
};

const sizeStyles: Record<ButtonSize, string> = {
    sm: 'px-2.5 py-1.5 text-xs gap-1.5 rounded',
    md: 'px-4 py-2 text-sm gap-2 rounded-lg',
    lg: 'px-6 py-3 text-base gap-2.5 rounded-lg',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    (
        {
            variant = 'primary',
            size = 'md',
            loading = false,
            icon,
            iconPosition = 'left',
            className,
            disabled,
            children,
            onClick,
            type = 'button',
            title,
        },
        ref
    ) => {
        const isDisabled = disabled || loading;

        return (
            <motion.button
                ref={ref}
                type={type}
                whileHover={isDisabled ? undefined : { scale: 1.02 }}
                whileTap={isDisabled ? undefined : { scale: 0.98 }}
                transition={{ duration: 0.15, ease: 'easeOut' }}
                disabled={isDisabled}
                onClick={onClick}
                title={title}
                className={cn(
                    'inline-flex items-center justify-center font-mono font-medium border transition-colors focus:outline-none focus:ring-2 focus:ring-ordem-red/50 focus:ring-offset-2 focus:ring-offset-ordem-black disabled:opacity-50 disabled:cursor-not-allowed',
                    variantStyles[variant],
                    sizeStyles[size],
                    className
                )}
            >
                {loading && (
                    <Loader2 className="w-4 h-4 animate-spin" />
                )}
                {!loading && icon && iconPosition === 'left' && icon}
                {children}
                {!loading && icon && iconPosition === 'right' && icon}
            </motion.button>
        );
    }
);

Button.displayName = 'Button';
interface IconButtonProps extends Omit<ButtonProps, 'icon' | 'iconPosition' | 'children'> {
    icon: React.ReactNode;
    'aria-label': string;
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
    ({ icon, size = 'md', className, 'aria-label': ariaLabel, ...props }, ref) => {
        const iconSizeStyles: Record<ButtonSize, string> = {
            sm: 'p-1.5 rounded',
            md: 'p-2 rounded-lg',
            lg: 'p-3 rounded-lg',
        };

        return (
            <Button
                ref={ref}
                size={size}
                className={cn(iconSizeStyles[size], 'aspect-square', className)}
                title={ariaLabel}
                {...props}
            >
                {icon}
            </Button>
        );
    }
);

IconButton.displayName = 'IconButton';
