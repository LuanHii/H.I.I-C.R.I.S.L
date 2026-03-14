'use client';

import React from 'react';
import type { PericiaName } from '@/core/types';

interface PericiaGridProps {
  value: PericiaName[];
  onChange: (pericias: PericiaName[]) => void;
  obrigatorias: PericiaName[];
  escolhaveis: PericiaName[];
}

export function PericiaGrid({ value, onChange, obrigatorias, escolhaveis }: PericiaGridProps) {
  const togglePericia = (pericia: PericiaName) => {
    onChange(
      value.includes(pericia)
        ? value.filter(p => p !== pericia)
        : [...value, pericia]
    );
  };

  return (
    <>
      {obrigatorias.length > 0 && (
        <div className="bg-ordem-ooze/50 p-4 rounded border border-ordem-border">
          <h4 className="text-xs font-bold text-ordem-text-muted uppercase tracking-widest mb-3">Perícias Obrigatórias (Classe/Origem)</h4>
          <div className="flex flex-wrap gap-2">
            {obrigatorias.map((obrigatoria) => (
              <span key={obrigatoria} className="px-3 py-1 bg-ordem-ooze text-ordem-white-muted text-xs rounded border border-ordem-border-light flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-ordem-text-muted rounded-full" />
                {obrigatoria}
              </span>
            ))}
          </div>
        </div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {escolhaveis.map((pericia) => {
          const isSelected = value.includes(pericia);
          return (
            <button
              key={pericia}
              type="button"
              onClick={() => togglePericia(pericia)}
              className={`p-4 sm:p-3 text-sm sm:text-xs font-mono border rounded transition-all touch-target ${isSelected
                ? 'border-ordem-green bg-ordem-green/20 text-white'
                : 'border-ordem-border text-ordem-text-muted hover:border-ordem-border-light'
                }`}
            >
              {pericia}
            </button>
          );
        })}
      </div>
    </>
  );
}
