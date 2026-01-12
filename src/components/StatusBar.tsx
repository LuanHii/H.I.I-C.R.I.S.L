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
      bar: 'bg-gradient-to-r from-red-700 to-red-500',
      glow: 'shadow-[0_0_15px_rgba(220,38,38,0.5)]',
      accent: 'text-red-400',
      border: 'border-red-900/50',
    },
    gold: {
      bar: 'bg-gradient-to-r from-yellow-600 to-yellow-400',
      glow: 'shadow-[0_0_15px_rgba(234,179,8,0.5)]',
      accent: 'text-yellow-400',
      border: 'border-yellow-900/50',
    },
    blue: {
      bar: 'bg-gradient-to-r from-blue-700 to-blue-400',
      glow: 'shadow-[0_0_15px_rgba(59,130,246,0.5)]',
      accent: 'text-blue-400',
      border: 'border-blue-900/50',
    },
    purple: {
      bar: 'bg-gradient-to-r from-purple-700 to-purple-400',
      glow: 'shadow-[0_0_15px_rgba(168,85,247,0.5)]',
      accent: 'text-purple-400',
      border: 'border-purple-900/50',
    },
    green: {
      bar: 'bg-gradient-to-r from-green-700 to-green-400',
      glow: 'shadow-[0_0_15px_rgba(34,197,94,0.5)]',
      accent: 'text-green-400',
      border: 'border-green-900/50',
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
      className="w-full mb-4 select-none"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header com label e valores */}
      <div className="flex justify-between items-end mb-2">
        <span className="text-ordem-white font-bold text-sm sm:text-base tracking-wider uppercase">
          {label}
        </span>
        <div className="flex items-center gap-1 font-mono text-lg sm:text-xl relative">
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

          {/* Delta indicator */}
          <AnimatePresence>
            {showDelta !== null && (
              <motion.span
                initial={{ opacity: 0, y: 0, x: 10 }}
                animate={{ opacity: 1, y: -20, x: 10 }}
                exit={{ opacity: 0 }}
                className={cn(
                  'absolute right-0 text-sm font-bold',
                  showDelta > 0 ? 'text-green-400' : 'text-red-400'
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
                className="w-14 bg-ordem-ooze border border-ordem-text-muted rounded px-1 text-sm text-center text-white focus:outline-none focus:border-ordem-red"
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

      {/* Barra de progresso */}
      <div className={cn(
        'relative h-9 sm:h-8 bg-ordem-black-deep border rounded-lg overflow-hidden',
        config.border
      )}>
        {/* Fundo com textura */}
        <div className="absolute inset-0 opacity-10 bg-[url('/noise.png')]" />

        {/* Barra de progresso animada */}
        <motion.div
          className={cn(
            'h-full relative overflow-hidden',
            config.bar,
            isPulsing && config.glow
          )}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        >
          {/* Efeito de highlight no topo */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-white/30" />

          {/* Efeito de listras diagonais */}
          <div className="absolute inset-0 opacity-20 bg-[linear-gradient(45deg,rgba(255,255,255,0.1)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.1)_50%,rgba(255,255,255,0.1)_75%,transparent_75%,transparent)] bg-[length:20px_20px]" />

          {/* Efeito de shimmer quando pulsing */}
          <AnimatePresence>
            {isPulsing && (
              <motion.div
                initial={{ x: '-100%' }}
                animate={{ x: '100%' }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.6 }}
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
              />
            )}
          </AnimatePresence>
        </motion.div>

        {/* Porcentagem no centro */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <span className={cn(
            'text-[10px] font-mono font-bold text-white/60 drop-shadow-md',
            isCritical && 'text-white animate-pulse'
          )}>
            {Math.round(percentage)}%
          </span>
        </div>
      </div>

      {/* Botões de ajuste */}
      {!readOnly && (
        <div className="flex justify-between mt-2 gap-2">
          <div className="flex gap-1.5">
            {[-5, -1].map((amount) => (
              <motion.button
                key={amount}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleAdjust(amount)}
                className="min-w-[44px] px-3 py-2 bg-ordem-ooze hover:bg-red-900/30 active:bg-red-900/50 border border-ordem-border-light text-sm text-ordem-white-muted rounded-lg transition-colors"
              >
                {amount}
              </motion.button>
            ))}
          </div>

          <div className="flex gap-1.5">
            {[1, 5].map((amount) => (
              <motion.button
                key={amount}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleAdjust(amount)}
                className="min-w-[44px] px-3 py-2 bg-ordem-ooze hover:bg-green-900/30 active:bg-green-900/50 border border-ordem-border-light text-sm text-ordem-white-muted rounded-lg transition-colors"
              >
                +{amount}
              </motion.button>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
};
