import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merge de classes CSS com suporte a condicionais e resolução de conflitos Tailwind.
 * Combina clsx (condicionais) com tailwind-merge (conflitos).
 * 
 * @example
 * cn('px-4 py-2', isPrimary && 'bg-red-500', 'px-6') // → 'py-2 px-6 bg-red-500'
 */
export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

/**
 * Formata número para exibição com sinal (+/-).
 */
export function formatModifier(value: number): string {
    return value >= 0 ? `+${value}` : `${value}`;
}

/**
 * Gera ID único simples para uso em keys temporárias.
 */
export function generateId(): string {
    return Math.random().toString(36).substring(2, 9);
}

/**
 * Debounce de função.
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
    fn: T,
    ms: number
): (...args: Parameters<T>) => void {
    let timeoutId: ReturnType<typeof setTimeout>;
    return (...args: Parameters<T>) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => fn(...args), ms);
    };
}
