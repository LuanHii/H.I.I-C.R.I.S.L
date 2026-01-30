'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { pageTransition } from '@/lib/motion';

interface PageTransitionProps {
    children: React.ReactNode;
}

export function PageTransition({ children }: PageTransitionProps) {
    const pathname = usePathname();

    return (
        <AnimatePresence mode="wait">
            <motion.div
                key={pathname}
                variants={pageTransition}
                initial="initial"
                animate="animate"
                exit="exit"
                className="flex-1"
            >
                {children}
            </motion.div>
        </AnimatePresence>
    );
}
interface FadeInProps {
    children: React.ReactNode;
    delay?: number;
    className?: string;
}

export function FadeIn({ children, delay = 0, className }: FadeInProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay }}
            className={className}
        >
            {children}
        </motion.div>
    );
}
interface StaggerListProps {
    children: React.ReactNode;
    className?: string;
}

export function StaggerList({ children, className }: StaggerListProps) {
    return (
        <motion.div
            initial="initial"
            animate="animate"
            className={className}
            variants={{
                animate: {
                    transition: {
                        staggerChildren: 0.05,
                    },
                },
            }}
        >
            {children}
        </motion.div>
    );
}

export function StaggerItem({ children, className }: { children: React.ReactNode; className?: string }) {
    return (
        <motion.div
            className={className}
            variants={{
                initial: { opacity: 0, y: 10 },
                animate: { opacity: 1, y: 0 },
            }}
        >
            {children}
        </motion.div>
    );
}
