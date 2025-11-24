"use client";

import React, { useState, useEffect } from 'react';

interface StatusBarProps {
  label: string;
  current: number;
  max: number;
  color: 'red' | 'gold' | 'blue' | 'purple' | 'green';
  onChange: (newValue: number) => void;
  readOnly?: boolean;
}

export const StatusBar: React.FC<StatusBarProps> = ({ label, current, max, color, onChange, readOnly }) => {
  const [displayCurrent, setDisplayCurrent] = useState(current);
  const [isPulsing, setIsPulsing] = useState(false);

  useEffect(() => {
    if (current !== displayCurrent) {
      setIsPulsing(true);
      const timer = setTimeout(() => setIsPulsing(false), 500);
      setDisplayCurrent(current);
      return () => clearTimeout(timer);
    }
  }, [current, displayCurrent]);

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

  return (
    <div className="w-full mb-4 select-none">
      <div className="flex justify-between items-end mb-1">
        <span className="text-ordem-white font-bold text-lg tracking-wider uppercase">{label}</span>
        <span className="text-ordem-white font-mono text-xl">
          <span className={current < max / 4 ? "text-ordem-red animate-pulse" : ""}>{current}</span>
          <span className="text-gray-400 text-sm mx-1">/</span>
          <span className="text-gray-400 text-sm">{max}</span>
        </span>
      </div>

      <div className="relative h-8 bg-gray-900 border border-gray-700 rounded-md overflow-hidden shadow-inner">
        <div className="absolute inset-0 opacity-20 bg-[url('/noise.png')]"></div>
        
        <div
          className={`h-full transition-all duration-500 ease-out ${colorClasses[color]} ${isPulsing ? 'brightness-150' : ''}`}
          style={{ width: `${percentage}%` }}
        >
            <div className="absolute inset-0 opacity-30 bg-[linear-gradient(45deg,rgba(255,255,255,0.15)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.15)_50%,rgba(255,255,255,0.15)_75%,transparent_75%,transparent)] bg-[length:20px_20px]"></div>
        </div>
        
        <div className="absolute top-0 left-0 w-full h-[1px] bg-white opacity-30"></div>
        
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <span className="text-[10px] font-mono font-bold text-white/50 drop-shadow-md">{Math.round(percentage)}%</span>
        </div>
      </div>

      {!readOnly && (
      <div className="flex justify-between mt-2 gap-2">
        <div className="flex gap-1">
          <button 
            onClick={() => handleAdjust(-5)}
            className="px-2 py-1 bg-gray-800 hover:bg-ordem-red/20 border border-gray-700 text-xs text-gray-300 rounded transition-colors"
          >
            -5
          </button>
          <button 
            onClick={() => handleAdjust(-1)}
            className="px-2 py-1 bg-gray-800 hover:bg-ordem-red/20 border border-gray-700 text-xs text-gray-300 rounded transition-colors"
          >
            -1
          </button>
        </div>
        
        <div className="flex gap-1">
          <button 
            onClick={() => handleAdjust(1)}
            className="px-2 py-1 bg-gray-800 hover:bg-ordem-green/20 border border-gray-700 text-xs text-gray-300 rounded transition-colors"
          >
            +1
          </button>
          <button 
            onClick={() => handleAdjust(5)}
            className="px-2 py-1 bg-gray-800 hover:bg-ordem-green/20 border border-gray-700 text-xs text-gray-300 rounded transition-colors"
          >
            +5
          </button>
        </div>
      </div>
      )}
    </div>
  );
};
