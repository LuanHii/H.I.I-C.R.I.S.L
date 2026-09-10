'use client';

import React from 'react';
import type { AtributoKey, Personagem } from '@/core/types';

interface AttributesGridProps {
  agent: Personagem;
  readOnly?: boolean;
  isEditingMode?: boolean;
  onAttributeChange: (attr: AtributoKey, increase: boolean) => void;
}

export function AttributesGrid({
  agent,
  readOnly,
  isEditingMode,
  onAttributeChange,
}: AttributesGridProps) {
  const pontosPendentes = agent.pontosAtributoPendentes;

  return (
    <>
      {pontosPendentes && pontosPendentes !== 0 ? (
        <div className={`mb-3 border px-3 py-2 text-center font-carimbo text-[10px] uppercase tracking-[0.16em] ${pontosPendentes > 0 ? 'border-ordem-green/50 bg-ordem-green/10 text-ordem-green' : 'border-ordem-red/50 bg-ordem-red/10 text-ordem-red'}`}>
          {pontosPendentes > 0 ? `+${pontosPendentes} PONTO(S) DE ATRIBUTO` : `REMOVER ${Math.abs(pontosPendentes)} PONTO(S)`}
        </div>
      ) : null}
      <div className="flex gap-2 sm:gap-3">
        {(Object.entries(agent.atributos) as [AtributoKey, number][]).map(([key, val]) => {
          const canIncrease = Boolean(isEditingMode || (!readOnly && pontosPendentes && pontosPendentes > 0 && (agent.classe !== 'Sobrevivente' || val < 3)));
          const canDecrease = Boolean(isEditingMode || (!readOnly && pontosPendentes && pontosPendentes < 0 && val > 0));
          return (
            <div key={key} className="group relative flex flex-1 flex-col items-center border border-white/10 bg-white/[0.02] px-2 py-2.5 shadow-[0_1px_0_0_rgba(255,255,255,0.04)_inset]">
              <span className="font-carimbo text-[9px] uppercase tracking-[0.2em] text-ordem-text-muted">{key}</span>
              <span className="mt-0.5 font-display text-2xl font-bold leading-none text-white">{val}</span>
              {canIncrease && (
                <button type="button" onClick={() => onAttributeChange(key, true)} className={`absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center shadow-lg transition-colors z-10 text-xs ${isEditingMode ? 'bg-ordem-red hover:bg-red-700 text-white' : 'bg-green-600 hover:bg-green-500 text-white'}`}>+</button>
              )}
              {canDecrease && (
                <button type="button" onClick={() => onAttributeChange(key, false)} className={`absolute -top-2 ${isEditingMode ? '-left-2' : '-right-2'} w-6 h-6 rounded-full flex items-center justify-center shadow-lg transition-colors z-10 text-xs ${isEditingMode ? 'bg-ordem-border-light hover:bg-ordem-text-muted text-white' : 'bg-red-600 hover:bg-red-500 text-white'}`}>-</button>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
}
