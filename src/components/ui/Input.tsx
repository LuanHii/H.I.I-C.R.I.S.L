'use client';

import React, { forwardRef, type InputHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    helperText?: string;
    icon?: React.ReactNode;
    iconPosition?: 'left' | 'right';
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
    (
        {
            label,
            error,
            helperText,
            icon,
            iconPosition = 'left',
            className,
            id,
            ...props
        },
        ref
    ) => {
        const inputId = id || `input-${Math.random().toString(36).substring(7)}`;

        return (
            <div className="w-full">
                {label && (
                    <label
                        htmlFor={inputId}
                        className="block text-sm font-medium text-ordem-text-secondary mb-1.5"
                    >
                        {label}
                    </label>
                )}

                <div className="relative">
                    {icon && iconPosition === 'left' && (
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-ordem-text-muted">
                            {icon}
                        </div>
                    )}

                    <input
                        ref={ref}
                        id={inputId}
                        className={cn(
                            'w-full bg-ordem-ooze border rounded-lg px-3 py-2.5 text-sm text-white',
                            'placeholder:text-ordem-text-muted',
                            'focus:outline-none focus:ring-2 focus:ring-ordem-red/50 focus:border-ordem-red',
                            'disabled:opacity-50 disabled:cursor-not-allowed',
                            'transition-colors',
                            error
                                ? 'border-red-500 focus:ring-red-500/50'
                                : 'border-ordem-border-light hover:border-ordem-text-muted',
                            icon && iconPosition === 'left' && 'pl-10',
                            icon && iconPosition === 'right' && 'pr-10',
                            className
                        )}
                        {...props}
                    />

                    {icon && iconPosition === 'right' && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-ordem-text-muted">
                            {icon}
                        </div>
                    )}
                </div>

                {(error || helperText) && (
                    <p
                        className={cn(
                            'mt-1.5 text-xs',
                            error ? 'text-red-400' : 'text-ordem-text-muted'
                        )}
                    >
                        {error || helperText}
                    </p>
                )}
            </div>
        );
    }
);

Input.displayName = 'Input';

// Textarea
interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    label?: string;
    error?: string;
    helperText?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
    ({ label, error, helperText, className, id, ...props }, ref) => {
        const inputId = id || `textarea-${Math.random().toString(36).substring(7)}`;

        return (
            <div className="w-full">
                {label && (
                    <label
                        htmlFor={inputId}
                        className="block text-sm font-medium text-ordem-text-secondary mb-1.5"
                    >
                        {label}
                    </label>
                )}

                <textarea
                    ref={ref}
                    id={inputId}
                    className={cn(
                        'w-full bg-ordem-ooze border rounded-lg px-3 py-2.5 text-sm text-white min-h-[100px] resize-y',
                        'placeholder:text-ordem-text-muted',
                        'focus:outline-none focus:ring-2 focus:ring-ordem-red/50 focus:border-ordem-red',
                        'disabled:opacity-50 disabled:cursor-not-allowed',
                        'transition-colors',
                        error
                            ? 'border-red-500 focus:ring-red-500/50'
                            : 'border-ordem-border-light hover:border-ordem-text-muted',
                        className
                    )}
                    {...props}
                />

                {(error || helperText) && (
                    <p
                        className={cn(
                            'mt-1.5 text-xs',
                            error ? 'text-red-400' : 'text-ordem-text-muted'
                        )}
                    >
                        {error || helperText}
                    </p>
                )}
            </div>
        );
    }
);

Textarea.displayName = 'Textarea';
