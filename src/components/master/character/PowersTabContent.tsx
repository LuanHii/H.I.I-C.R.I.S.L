'use client';

import React from 'react';
import type { Personagem } from '@/core/types';

interface PowersTabContentProps {
  agent: Personagem;
  isEditingMode: boolean;
  onAddAbility: () => void;
  onRemoveAbility: (index: number) => void;
}

export function PowersTabContent({ agent, isEditingMode, onAddAbility, onRemoveAbility }: PowersTabContentProps) {
  return (
    <div className="animate-in fade-in-0 slide-in-from-bottom-2 duration-200 space-y-3">
      {agent.poderes.map((poder, idx) => (
        <details key={idx} className="bg-ordem-black-deep/50 rounded-lg border border-ordem-border-light group relative [&_summary::-webkit-details-marker]:hidden overflow-hidden">
          <summary className="font-bold text-zinc-100 p-3 cursor-pointer flex justify-between items-center hover:bg-white/5 transition-colors text-sm">
            {poder.nome}
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-ordem-text-muted transition-transform group-open:rotate-180"><polyline points="6 9 12 15 18 9"></polyline></svg>
          </summary>
          <div className="px-3 pb-3"><p className="text-sm text-ordem-white-muted pt-2 border-t border-ordem-border/50">{poder.descricao}</p></div>
          {isEditingMode && (
            <button type="button" onClick={(e) => { e.preventDefault(); onRemoveAbility(idx); }} className="absolute top-2 right-8 p-1 opacity-0 group-hover:opacity-100 hover:bg-red-900/30 rounded text-ordem-text-secondary hover:text-red-400 transition-all z-10" title="Remover">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /></svg>
            </button>
          )}
        </details>
      ))}
      {agent.poderes.length === 0 && <div className="text-sm text-ordem-text-muted italic text-center py-6">Nenhuma habilidade.</div>}
      {isEditingMode && (
        <button type="button" onClick={onAddAbility} className="w-full py-3 border border-dashed border-ordem-border-light rounded-lg text-ordem-text-secondary hover:text-ordem-white hover:border-ordem-text-muted hover:bg-ordem-ooze/50 transition-all flex items-center justify-center gap-2 text-sm">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="M12 5v14" /></svg> Adicionar Habilidade
        </button>
      )}
    </div>
  );
}
