'use client';

import React, { useMemo } from 'react';
import { listarPatentes } from '@/logic/rulesEngine';
import type { Patente } from '@/core/types';

const LIMITE_ITENS_POR_PATENTE: Record<Patente, string> = {
  'Recruta': 'Cat I: 3',
  'Operador': 'Cat I: 5 | II: 1',
  'Agente Especial': 'Cat I: ∞ | II: 2 | III: 1',
  'Oficial de Operações': 'Cat I-II: ∞ | III: 2',
  'Agente de Elite': 'Cat I-II: ∞ | III: 3 | IV: 1',
};

const UI_PROPS: Record<string, { cor: string; icone: string }> = {
  'Recruta': { cor: 'text-ordem-text-secondary', icone: '○' },
  'Operador': { cor: 'text-ordem-green', icone: '●' },
  'Agente Especial': { cor: 'text-blue-400', icone: '◇' },
  'Oficial de Operações': { cor: 'text-purple-400', icone: '◆' },
  'Agente de Elite': { cor: 'text-ordem-gold', icone: '★' },
};

interface NexPatenteSelectorProps {
  nex: number;
  onNexChange: (v: number) => void;
  patente: Patente;
  onPatenteChange: (v: Patente) => void;
  nexOptions?: number[];
}

export function NexPatenteSelector({
  nex,
  onNexChange,
  patente,
  onPatenteChange,
  nexOptions = [5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95, 99],
}: NexPatenteSelectorProps) {
  const patentes = useMemo(() => {
    const configs = listarPatentes();
    return configs.map(cfg => ({
      nome: cfg.nome,
      nexMinimo: cfg.nexMin,
      cor: UI_PROPS[cfg.nome]?.cor || 'text-white',
      icone: UI_PROPS[cfg.nome]?.icone || '•'
    }));
  }, []);

  const limiteItensText = LIMITE_ITENS_POR_PATENTE[patente];
  const borderPatente = patentes.find(p => p.nome === patente)?.cor.replace('text-', 'border-') || 'border-ordem-border';

  return (
    <div className="w-full lg:w-48 space-y-2">
      <div className="grid grid-cols-1 gap-3">
        <div>
          <label className="text-xs font-bold text-ordem-text-secondary uppercase tracking-widest block mb-2">NEX</label>
          <select
            value={nex}
            onChange={(e) => onNexChange(Number(e.target.value))}
            className="w-full bg-ordem-black/50 border border-ordem-border-light p-3 text-white focus:border-ordem-red focus:outline-none transition-all font-mono rounded-lg"
          >
            {nexOptions.map(n => (
              <option key={n} value={n}>{n}%</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs font-bold text-ordem-text-secondary uppercase tracking-widest block mb-2">Patente</label>
          <select
            value={patente}
            onChange={(e) => onPatenteChange(e.target.value as Patente)}
            className="w-full bg-ordem-black/50 border border-ordem-border-light p-3 text-white focus:border-ordem-red focus:outline-none transition-all font-mono rounded-lg text-sm"
          >
            {patentes.map(p => (
              <option key={p.nome} value={p.nome}>{p.icone} {p.nome}</option>
            ))}
          </select>
        </div>
      </div>
      <div className={`text-center p-2 border rounded-lg bg-ordem-black/30 ${borderPatente}`}>
        <div className="text-[9px] sm:text-[10px] text-ordem-text-muted">
          {limiteItensText}
        </div>
      </div>
    </div>
  );
}
