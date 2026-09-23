'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface StatusBarProps {
  label: string;
  current: number;
  max: number;
  color: 'red' | 'gold' | 'blue' | 'purple' | 'green';
  onChange: (newValue: number) => void;
  onMaxChange?: (newMax: number) => void;
  readOnly?: boolean;
}

export const StatusBar: React.FC<StatusBarProps> = ({ label, current, max, color, onChange, onMaxChange, readOnly }) => {
  const [displayCurrent, setDisplayCurrent] = useState(current);
  const [isPulsing, setIsPulsing] = useState(false);
  const [isEditingMax, setIsEditingMax] = useState(false);
  const [tempMax, setTempMax] = useState(max.toString());
  const [showDelta, setShowDelta] = useState<number | null>(null);

  useEffect(() => {
    if (current !== displayCurrent) {
      const delta = current - displayCurrent;
      setShowDelta(delta);
      setIsPulsing(true);

      const timer = setTimeout(() => {
        setIsPulsing(false);
        setShowDelta(null);
      }, 800);

      setDisplayCurrent(current);
      return () => clearTimeout(timer);
    }
  }, [current, displayCurrent]);

  useEffect(() => {
    setTempMax(max.toString());
  }, [max]);

  const percentage = Math.min(100, Math.max(0, (current / max) * 100));
  const isLow = percentage < 25;
  const isCritical = percentage < 10;

  const colorConfig = {
    red: {
      bar: 'bg-gradient-to-r from-ordem-red-dark to-ordem-red',
      glow: 'shadow-[0_0_15px_rgba(220,38,38,0.5)]',
      accent: 'text-ordem-red',
      border: 'border-ordem-red-dark/50',
    },
    gold: {
      bar: 'bg-gradient-to-r from-yellow-900 to-ordem-gold',
      glow: 'shadow-[0_0_15px_rgba(255,215,0,0.5)]',
      accent: 'text-ordem-gold',
      border: 'border-ordem-gold/50',
    },
    blue: {
      bar: 'bg-gradient-to-r from-blue-900 to-ordem-blue',
      glow: 'shadow-[0_0_15px_rgba(59,130,246,0.5)]',
      accent: 'text-ordem-blue',
      border: 'border-ordem-blue/50',
    },
    purple: {
      bar: 'bg-gradient-to-r from-purple-900 to-ordem-purple',
      glow: 'shadow-[0_0_15px_rgba(168,85,247,0.5)]',
      accent: 'text-ordem-purple',
      border: 'border-ordem-purple/50',
    },
    green: {
      bar: 'bg-gradient-to-r from-green-900 to-ordem-green',
      glow: 'shadow-[0_0_15px_rgba(0,255,0,0.5)]',
      accent: 'text-ordem-green',
      border: 'border-ordem-green/50',
    },
  };

  const config = colorConfig[color];

  const handleAdjust = (amount: number) => {
    const newValue = Math.min(max, Math.max(0, current + amount));
    onChange(newValue);
  };

  const handleMaxSubmit = () => {
    const val = parseInt(tempMax);
    if (!isNaN(val) && val > 0) {
      onMaxChange?.(val);
    }
    setIsEditingMax(false);
  };

  return (
    <motion.div
      className="w-full select-none"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="mb-1.5 flex items-baseline gap-2">
        <span className={cn(
          'font-carimbo text-xs font-bold uppercase tracking-[0.18em] sm:text-sm',
          config.accent,
        )}>
          {label}
        </span>
        <div className="relative flex min-w-0 items-baseline gap-1 overflow-visible font-mono text-xl font-bold tabular-nums sm:text-2xl">
          <motion.span
            className={cn(
              isLow && 'text-ordem-red',
              isCritical && 'animate-pulse'
            )}
            animate={isPulsing ? { scale: [1, 1.2, 1] } : {}}
            transition={{ duration: 0.3 }}
          >
            {current}
          </motion.span>

          <AnimatePresence>
            {showDelta !== null && (
              <motion.span
                initial={{ opacity: 0, y: 0, x: 4 }}
                animate={{ opacity: 1, y: -12, x: 4 }}
                exit={{ opacity: 0 }}
                className={cn(
                  'absolute -top-1 right-0 text-xs sm:text-sm font-bold whitespace-nowrap',
                  showDelta > 0 ? 'text-ordem-green' : 'text-ordem-red'
                )}
              >
                {showDelta > 0 ? '+' : ''}{showDelta}
              </motion.span>
            )}
          </AnimatePresence>

          <span className="text-ordem-text-secondary text-sm mx-0.5">/</span>

          {onMaxChange && !readOnly ? (
            isEditingMax ? (
              <input
                type="number"
                value={tempMax}
                onChange={(e) => setTempMax(e.target.value)}
                onBlur={handleMaxSubmit}
                onKeyDown={(e) => e.key === 'Enter' && handleMaxSubmit()}
                autoFocus
                className="w-14 border border-white/20 bg-black/40 px-1 text-center text-sm text-white focus:border-[var(--mestre-primary,#DC2626)] focus:outline-none"
              />
            ) : (
              <motion.span
                whileHover={{ scale: 1.1 }}
                onClick={() => setIsEditingMax(true)}
                className="text-ordem-text-secondary text-sm cursor-pointer hover:text-white border-b border-dashed border-ordem-text-muted hover:border-white transition-colors"
                title="Clique para editar"
              >
                {max}
              </motion.span>
            )
          ) : (
            <span className="text-ordem-text-secondary text-sm">{max}</span>
          )}
        </div>
      </div>
      <div className="flex h-3 gap-[3px] sm:h-6" aria-hidden>
        {Array.from({ length: 20 }, (_, indice) => {
          const aceso = indice < Math.round((percentage / 100) * 20);
          return (
            <span
              key={indice}
              className={cn(
                'flex-1 rounded-[1px] transition-colors',
                aceso ? config.bar : 'bg-white/[0.06]',
                aceso && isPulsing && config.glow,
              )}
            />
          );
        })}
      </div>

      {!readOnly && (
        <div className="mt-2 grid grid-cols-4 gap-1.5 sm:gap-1.5">
          {[-5, -1, 1, 5].map((amount) => (
            <motion.button
              key={amount}
              whileTap={{ scale: 0.96 }}
              onClick={() => handleAdjust(amount)}
              className={cn(
                'border py-1.5 text-center font-mono text-xs transition-colors',
                'border-white/10 bg-white/[0.02] text-ordem-text-secondary',
                amount < 0
                  ? 'hover:border-ordem-red/50 hover:bg-ordem-red/10 hover:text-ordem-red'
                  : 'hover:border-ordem-green/50 hover:bg-ordem-green/10 hover:text-ordem-green',
              )}
            >
              {amount > 0 ? `+${amount}` : amount}
            </motion.button>
          ))}
        </div>
      )}
    </motion.div>
  );
};
