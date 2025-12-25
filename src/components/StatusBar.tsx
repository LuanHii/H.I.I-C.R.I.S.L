"use client";

import React, { useState, useEffect } from 'react';

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

  useEffect(() => {
    if (current !== displayCurrent) {
      setIsPulsing(true);
      const timer = setTimeout(() => setIsPulsing(false), 500);
      setDisplayCurrent(current);
      return () => clearTimeout(timer);
    }
  }, [current, displayCurrent]);

  useEffect(() => {
    setTempMax(max.toString());
  }, [max]);

  const percentage = Math.min(100, Math.max(0, (current / max) * 100));

  const colorClasses = {
    red: 'bg-ordem-red shadow-[0_0_10px_#8B0000]',
    gold: 'bg-ordem-gold shadow-[0_0_10px_#FFD700]',
    blue: 'bg-ordem-blue shadow-[0_0_10px_#00BFFF]',
    purple: 'bg-ordem-purple shadow-[0_0_10px_#9D00FF]',
    green: 'bg-ordem-green shadow-[0_0_10px_#00FF00]',
  };

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
  }

  return (
    <div className="w-full mb-4 select-none">
      <div className="flex justify-between items-end mb-1.5 sm:mb-1">
        <span className="text-ordem-white font-bold text-base sm:text-lg tracking-wider uppercase">{label}</span>
        <span className="text-ordem-white font-mono text-lg sm:text-xl flex items-center">
          <span className={current < max / 4 ? "text-ordem-red animate-pulse" : ""}>{current}</span>
          <span className="text-ordem-text-secondary text-sm mx-1">/</span>

          {onMaxChange && !readOnly ? (
            isEditingMax ? (
              <input
                type="number"
                value={tempMax}
                onChange={(e) => setTempMax(e.target.value)}
                onBlur={handleMaxSubmit}
                onKeyDown={(e) => e.key === 'Enter' && handleMaxSubmit()}
                autoFocus
                className="w-16 bg-ordem-ooze border border-ordem-text-muted rounded px-1 text-sm text-center text-white focus:outline-none focus:border-ordem-red"
              />
            ) : (
              <span
                onClick={() => setIsEditingMax(true)}
                className="text-ordem-text-secondary text-sm cursor-pointer hover:text-white border-b border-dashed border-ordem-text-muted hover:border-white transition-colors pb-0.5"
                title="Clique para editar o valor máximo"
              >
                {max}
              </span>
            )
          ) : (
            <span className="text-ordem-text-secondary text-sm">{max}</span>
          )}
        </span>
      </div>

      {/* Barra de progresso - mais alta em mobile para melhor visibilidade */}
      <div className="relative h-10 sm:h-8 bg-ordem-ooze border border-ordem-border-light rounded-lg sm:rounded-md overflow-hidden shadow-inner">
        <div className="absolute inset-0 opacity-20 bg-[url('/noise.png')]"></div>

        <div
          className={`h-full transition-all duration-500 ease-out ${colorClasses[color]} ${isPulsing ? 'brightness-150' : ''}`}
          style={{ width: `${percentage}%` }}
        >
          <div className="absolute inset-0 opacity-30 bg-[linear-gradient(45deg,rgba(255,255,255,0.15)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.15)_50%,rgba(255,255,255,0.15)_75%,transparent_75%,transparent)] bg-[length:20px_20px]"></div>
        </div>

        <div className="absolute top-0 left-0 w-full h-[1px] bg-white opacity-30"></div>

        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <span className="text-xs sm:text-[10px] font-mono font-bold text-white/60 sm:text-white/50 drop-shadow-md">{Math.round(percentage)}%</span>
        </div>
      </div>

      {/* Botões de ajuste - maiores para touch */}
      {!readOnly && (
        <div className="flex justify-between mt-2 sm:mt-2 gap-2">
          <div className="flex gap-1.5 sm:gap-1">
            <button
              onClick={() => handleAdjust(-5)}
              className="min-w-[44px] sm:min-w-0 px-3 sm:px-2 py-2.5 sm:py-1 bg-ordem-ooze hover:bg-ordem-red/20 active:bg-ordem-red/30 border border-ordem-border-light text-sm sm:text-xs text-ordem-white-muted rounded-lg sm:rounded transition-colors touch-target-sm"
            >
              -5
            </button>
            <button
              onClick={() => handleAdjust(-1)}
              className="min-w-[44px] sm:min-w-0 px-3 sm:px-2 py-2.5 sm:py-1 bg-ordem-ooze hover:bg-ordem-red/20 active:bg-ordem-red/30 border border-ordem-border-light text-sm sm:text-xs text-ordem-white-muted rounded-lg sm:rounded transition-colors touch-target-sm"
            >
              -1
            </button>
          </div>

          <div className="flex gap-1.5 sm:gap-1">
            <button
              onClick={() => handleAdjust(1)}
              className="min-w-[44px] sm:min-w-0 px-3 sm:px-2 py-2.5 sm:py-1 bg-ordem-ooze hover:bg-ordem-green/20 active:bg-ordem-green/30 border border-ordem-border-light text-sm sm:text-xs text-ordem-white-muted rounded-lg sm:rounded transition-colors touch-target-sm"
            >
              +1
            </button>
            <button
              onClick={() => handleAdjust(5)}
              className="min-w-[44px] sm:min-w-0 px-3 sm:px-2 py-2.5 sm:py-1 bg-ordem-ooze hover:bg-ordem-green/20 active:bg-ordem-green/30 border border-ordem-border-light text-sm sm:text-xs text-ordem-white-muted rounded-lg sm:rounded transition-colors touch-target-sm"
            >
              +5
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
