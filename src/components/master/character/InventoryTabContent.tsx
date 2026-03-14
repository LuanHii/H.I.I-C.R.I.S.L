'use client';

import React from 'react';
import type { Personagem } from '@/core/types';

interface InventoryTabContentProps {
  agent: Personagem;
  readOnly?: boolean;
  onAddItem: () => void;
  onRemoveItem: (index: number) => void;
}

export function InventoryTabContent({ agent, readOnly, onAddItem, onRemoveItem }: InventoryTabContentProps) {
  return (
    <div className="animate-in fade-in-0 slide-in-from-bottom-2 duration-200 space-y-2">
      {agent.equipamentos.map((item, idx) => (
        <div key={idx} className="flex items-center justify-between p-3 bg-ordem-black-deep/50 rounded-lg border border-ordem-border-light hover:border-ordem-text-muted group">
          <div>
            <div className="font-bold text-ordem-white text-sm">{item.nome}</div>
            <div className="text-xs text-ordem-text-secondary">{item.categoria} • {item.espaco} espaço</div>
          </div>
          {!readOnly && (
            <button type="button" onClick={() => onRemoveItem(idx)} className="opacity-0 group-hover:opacity-100 p-2 hover:bg-red-900/30 rounded text-ordem-text-secondary hover:text-red-400 transition-all" title="Remover">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /></svg>
            </button>
          )}
        </div>
      ))}
      {agent.equipamentos.length === 0 && <div className="text-sm text-ordem-text-muted italic text-center py-6">Inventário vazio.</div>}
      {!readOnly && (
        <button type="button" onClick={onAddItem} className="w-full py-3 border border-dashed border-ordem-border-light rounded-lg text-ordem-text-secondary hover:text-ordem-white hover:border-ordem-text-muted hover:bg-ordem-ooze/50 transition-all flex items-center justify-center gap-2 text-sm">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="M12 5v14" /></svg> Adicionar Item
        </button>
      )}
    </div>
  );
}
