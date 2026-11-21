'use client';

import { useRef } from 'react';
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
  const adicionar = useRef<HTMLButtonElement>(null);

  return (
    <div className="space-y-3 font-dados">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <RotuloSecao className="text-ordem-white">Equipamento</RotuloSecao>
          <p role="status" className={`mt-1 font-dados text-sm tabular-nums ${sobrecarga ? 'text-ordem-red-light' : 'text-ordem-text-secondary'}`}>
            Carga {agent.carga.atual}/{agent.carga.maxima}{sobrecarga ? ' · Sobrecarregado' : ''}
          </p>
        </div>
        {!readOnly && (
          <button
            ref={adicionar}
            type="button"
            onClick={onAddItem}
            className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-ordem-green-muted px-3 font-dados text-sm font-semibold text-ordem-black hover:bg-white focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-ordem-green-muted"
          >
            <Plus size={16} aria-hidden /> Adicionar item
          </button>
        )}
      </div>

      {agent.equipamentos.length === 0 ? (
        <p className="rounded-lg border border-dashed border-ordem-border py-5 text-center text-sm text-ordem-text-secondary">Inventário vazio.</p>
      ) : (
        <ul className="divide-y divide-ordem-border rounded-lg border border-ordem-border bg-white/[0.02]">
          {agent.equipamentos.map((item, idx) => (
            <li key={`${item.nome}-${idx}`} className="flex min-w-0 items-center justify-between gap-2 px-2.5 py-2 sm:px-3">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-white [overflow-wrap:anywhere]">{item.nome}</p>
                <p className="mt-1 flex flex-wrap items-center gap-1.5 font-dados text-xs text-ordem-text-secondary">
                  <Fita variante="neutra">Cat. {item.categoria}</Fita>
                  <span>{item.espaco} espaço{item.espaco === 1 ? '' : 's'}</span>
                </p>
              </div>
              {!readOnly && (
                <button
                  type="button"
                  onClick={evento => {
                    const linha = evento.currentTarget.closest('li');
                    const vizinha = linha?.nextElementSibling ?? linha?.previousElementSibling;
                    (vizinha?.querySelector('button') ?? adicionar.current)?.focus();
                    onRemoveItem(idx);
                  }}
                  aria-label={'Remover ' + item.nome}
                  title="Remover"
                  className="grid size-11 shrink-0 place-items-center rounded-lg border border-ordem-border text-ordem-text-secondary hover:border-ordem-red-light hover:text-ordem-red-light focus-visible:outline focus-visible:outline-ordem-green-muted"
                >
                  <Trash2 size={16} aria-hidden />
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
