'use client';

import React, { useMemo } from 'react';
import { getPatenteConfig, listarPatentes } from '@/logic/rulesEngine';
import type { LimiteItens } from '@/core/types';

/**
 * Texto do limite de itens derivado da Tabela 3.1, nunca escrito à mão.
 * Havia aqui um mapa fixo que divergia da tabela do motor — e ambos divergiam
 * do livro. Uma fonte só evita a terceira versão.
 */
function descreverLimite(limite: LimiteItens): string {
  const partes = (['I', 'II', 'III', 'IV'] as const)
    .filter((cat) => limite[cat] > 0)
    .map((cat) => `${cat}: ${limite[cat]}`);
  return partes.length > 0 ? `Cat ${partes.join(' | ')}` : 'Sem itens da Ordem';
}
import type { Patente } from '@/core/types';
import { NEX_ESCADA } from '@/core/rules/progressao';

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
  nexOptions = [...NEX_ESCADA],
}: NexPatenteSelectorProps) {
  const patentes = useMemo(() => {
    const configs = listarPatentes();
    return configs.map(cfg => ({
      nome: cfg.nome,
      ppMinimo: cfg.ppMin,
      cor: UI_PROPS[cfg.nome]?.cor || 'text-white',
      icone: UI_PROPS[cfg.nome]?.icone || '•'
    }));
  }, []);

  const limiteItensText = descreverLimite(getPatenteConfig(patente).limiteItens);
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
