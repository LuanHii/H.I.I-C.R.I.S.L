import { type Variants } from 'framer-motion';

/**
 * Variantes de animação reutilizáveis para Framer Motion.
 * Use com <motion.div variants={fadeIn} initial="initial" animate="animate" exit="exit">
 */

// Fade simples
export const fadeIn: Variants = {
    initial: { opacity: 0 },
    animate: { opacity: 1, transition: { duration: 0.2 } },
    exit: { opacity: 0, transition: { duration: 0.15 } },
};

// Slide de baixo para cima
export const slideUp: Variants = {
    initial: { y: 20, opacity: 0 },
    animate: { y: 0, opacity: 1, transition: { duration: 0.3, ease: 'easeOut' } },
    exit: { y: -10, opacity: 0, transition: { duration: 0.2 } },
};

// Slide da direita
export const slideRight: Variants = {
    initial: { x: 20, opacity: 0 },
    animate: { x: 0, opacity: 1, transition: { duration: 0.3, ease: 'easeOut' } },
    exit: { x: -10, opacity: 0, transition: { duration: 0.2 } },
};

// Scale com fade
export const scaleIn: Variants = {
    initial: { scale: 0.95, opacity: 0 },
    animate: { scale: 1, opacity: 1, transition: { duration: 0.2, ease: 'easeOut' } },
    exit: { scale: 0.95, opacity: 0, transition: { duration: 0.15 } },
};

// Para modais - backdrop
export const backdropVariants: Variants = {
    initial: { opacity: 0 },
    animate: { opacity: 1, transition: { duration: 0.2 } },
    exit: { opacity: 0, transition: { duration: 0.15 } },
};

// Para modais - conteúdo
export const modalVariants: Variants = {
    initial: { scale: 0.95, opacity: 0, y: 10 },
    animate: {
        scale: 1,
        opacity: 1,
        y: 0,
        transition: { duration: 0.25, ease: [0.16, 1, 0.3, 1] }
    },
    exit: {
        scale: 0.98,
        opacity: 0,
        y: 5,
        transition: { duration: 0.15 }
    },
};

// Para listas com stagger
export const listContainer: Variants = {
    initial: {},
    animate: {
        transition: {
            staggerChildren: 0.05,
            delayChildren: 0.1,
        },
    },
    exit: {
        transition: {
            staggerChildren: 0.03,
            staggerDirection: -1,
        },
    },
};

export const listItem: Variants = {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.2 } },
    exit: { opacity: 0, y: -5, transition: { duration: 0.1 } },
};

// Para seções colapsáveis
export const collapseVariants: Variants = {
    initial: { height: 0, opacity: 0 },
    animate: {
        height: 'auto',
        opacity: 1,
        transition: {
            height: { duration: 0.3, ease: 'easeOut' },
            opacity: { duration: 0.25, delay: 0.05 }
        }
    },
    exit: {
        height: 0,
        opacity: 0,
        transition: {
            height: { duration: 0.25 },
            opacity: { duration: 0.15 }
        }
    },
};

// Para toast/notificações
export const toastVariants: Variants = {
    initial: { x: 100, opacity: 0 },
    animate: { x: 0, opacity: 1, transition: { duration: 0.3, ease: 'easeOut' } },
    exit: { x: 100, opacity: 0, transition: { duration: 0.2 } },
};

// Pulse suave para elementos de atenção
export const pulseVariants: Variants = {
    animate: {
        scale: [1, 1.02, 1],
        opacity: [1, 0.8, 1],
        transition: { duration: 2, repeat: Infinity, ease: 'easeInOut' },
    },
};

// Transição de página
export const pageTransition: Variants = {
    initial: { opacity: 0, y: 8 },
    animate: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.3, ease: 'easeOut' }
    },
    exit: {
        opacity: 0,
        y: -8,
        transition: { duration: 0.2 }
    },
};

// Configurações de transition reutilizáveis
export const springConfig = {
    type: 'spring',
    stiffness: 500,
    damping: 30,
} as const;

export const smoothConfig = {
    duration: 0.3,
    ease: [0.16, 1, 0.3, 1],
} as const;
