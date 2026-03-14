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
        <div className={`mb-3 p-2 rounded border text-center font-mono text-xs ${pontosPendentes > 0 ? 'bg-green-900/20 border-green-800 text-green-400' : 'bg-red-900/20 border-red-800 text-red-400'}`}>
          {pontosPendentes > 0 ? `+${pontosPendentes} PONTO(S) DE ATRIBUTO` : `REMOVER ${Math.abs(pontosPendentes)} PONTO(S)`}
        </div>
      ) : null}
      <div className="flex gap-2 sm:gap-3">
        {(Object.entries(agent.atributos) as [AtributoKey, number][]).map(([key, val]) => {
          const canIncrease = isEditingMode || (!readOnly && pontosPendentes && pontosPendentes > 0 && (agent.classe !== 'Sobrevivente' || val < 3));
          const canDecrease = isEditingMode || (!readOnly && pontosPendentes && pontosPendentes < 0 && val > 0);
          return (
            <div key={key} className="flex flex-col items-center flex-1 bg-ordem-black-deep/50 p-2 rounded-lg border border-ordem-border-light relative group">
              <span className="text-[10px] font-mono text-ordem-text-secondary uppercase">{key}</span>
              <span className="text-lg sm:text-xl font-bold text-zinc-100">{val}</span>
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
