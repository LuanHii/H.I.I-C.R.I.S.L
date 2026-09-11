'use client';

import React from 'react';
import { Plus, Trash2 } from 'lucide-react';
import type { Personagem } from '@/core/types';
import { Fita, RotuloSecao } from '../ui/Pecas';

interface InventoryTabContentProps {
  agent: Personagem;
  readOnly?: boolean;
  onAddItem: () => void;
  onRemoveItem: (index: number) => void;
}

export function InventoryTabContent({ agent, readOnly, onAddItem, onRemoveItem }: InventoryTabContentProps) {
  const sobrecarga = agent.carga.atual > agent.carga.maxima;

  return (
    <div className="animate-in fade-in-0 slide-in-from-bottom-2 duration-200 space-y-3">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <RotuloSecao className="text-[var(--mestre-primary,#DC2626)]">Equipamento</RotuloSecao>
        <span className={`font-mono text-xs tabular-nums ${sobrecarga ? 'text-ordem-red' : 'text-ordem-text-secondary'}`}>
          carga {agent.carga.atual}/{agent.carga.maxima}{sobrecarga ? ' — sobrecarregado' : ''}
        </span>
      </div>

      {agent.equipamentos.length === 0 ? (
        <p className="py-6 text-center text-sm italic text-ordem-text-muted">Inventário vazio.</p>
      ) : (
        <ul className="divide-y divide-white/[0.06] border border-white/10 bg-white/[0.02]">
          {agent.equipamentos.map((item, idx) => (
            <li key={`${item.nome}-${idx}`} className="group flex items-center justify-between gap-3 px-3 py-2.5">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-white">{item.nome}</p>
                <p className="mt-0.5 flex flex-wrap items-center gap-1.5 text-[11px] text-ordem-text-muted">
                  <Fita variante="neutra">Cat. {item.categoria}</Fita>
                  <span>{item.espaco} espaço{item.espaco === 1 ? '' : 's'}</span>
                </p>
              </div>
              {!readOnly && (
                <button
                  type="button"
                  onClick={() => onRemoveItem(idx)}
                  title="Remover"
                  className="shrink-0 p-1.5 text-ordem-text-muted opacity-0 transition hover:text-ordem-red group-hover:opacity-100 focus:opacity-100"
                >
                  <Trash2 size={14} />
                </button>
              )}
            </li>
          ))}
        </ul>
      )}

      {!readOnly && (
        <button
          type="button"
          onClick={onAddItem}
          className="flex w-full items-center justify-center gap-2 border border-dashed border-white/15 py-2.5 font-carimbo text-[10px] uppercase tracking-[0.16em] text-ordem-text-secondary transition hover:border-white/40 hover:text-white"
        >
          <Plus size={13} /> Adicionar item
        </button>
      )}
    </div>
  );
}
