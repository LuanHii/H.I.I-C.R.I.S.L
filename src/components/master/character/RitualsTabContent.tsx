'use client';

import React from 'react';
import { ChevronDown, Plus, Trash2 } from 'lucide-react';
import type { Personagem } from '@/core/types';
import { Fita } from '../ui/Pecas';

interface RitualsTabContentProps {
  agent: Personagem;
  isEditingMode: boolean;
  onAddRitual: () => void;
  onRemoveRitual: (index: number) => void;
  podeRemover?: (index: number) => boolean;
}

export function RitualsTabContent({ agent, isEditingMode, onAddRitual, onRemoveRitual, podeRemover }: RitualsTabContentProps) {
  return (
    <div className="animate-in fade-in-0 slide-in-from-bottom-2 duration-200 space-y-2">
      {agent.rituais.length === 0 && (
        <p className="py-6 text-center text-sm italic text-ordem-text-muted">Nenhum ritual conhecido.</p>
      )}

      {agent.rituais.map((ritual, idx) => (
        <details key={`${ritual.nome}-${idx}`} className="group relative border border-white/10 bg-white/[0.02] [&_summary::-webkit-details-marker]:hidden">
          <summary className="flex cursor-pointer items-center justify-between gap-3 px-3 py-2.5 transition hover:bg-white/5">
            <span className="flex min-w-0 flex-wrap items-center gap-2">
              <span className="text-sm font-semibold text-white">{ritual.nome}</span>
              <Fita variante="neutra">{ritual.circulo}º · {ritual.elemento}</Fita>
            </span>
            <ChevronDown size={14} className="shrink-0 text-ordem-text-muted transition-transform group-open:rotate-180" />
          </summary>
          <p className="border-t border-white/[0.06] px-3 py-2.5 text-sm text-ordem-white-muted">{ritual.descricao}</p>
          {isEditingMode && (podeRemover ? podeRemover(idx) : true) && (
            <button
              type="button"
              onClick={(e) => { e.preventDefault(); onRemoveRitual(idx); }}
              title="Remover"
              className="absolute right-9 top-2 p-1 text-ordem-text-muted opacity-0 transition hover:text-ordem-red group-hover:opacity-100 focus:opacity-100"
            >
              <Trash2 size={13} />
            </button>
          )}
        </details>
      ))}

      {isEditingMode && (
        <button
          type="button"
          onClick={onAddRitual}
          className="flex w-full items-center justify-center gap-2 border border-dashed border-white/15 py-2.5 font-carimbo text-[10px] uppercase tracking-[0.16em] text-ordem-text-secondary transition hover:border-white/40 hover:text-white"
        >
          <Plus size={13} /> Adicionar ritual
        </button>
      )}
    </div>
  );
}
