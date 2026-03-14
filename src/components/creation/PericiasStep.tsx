'use client';

import React from 'react';
import { TODAS_PERICIAS } from '@/logic/characterUtils';
import type { PericiaName } from '@/core/types';
import { PericiaGrid } from './PericiaGrid';

interface PericiaMeta {
  qtdEscolhaLivre: number;
  qtdEscolhaOrigem?: number;
  obrigatorias: PericiaName[];
}

interface PericiasStepProps {
  value: PericiaName[];
  onChange: (pericias: PericiaName[]) => void;
  periciaMeta: PericiaMeta | null;
}

export function PericiasStep({ value, onChange, periciaMeta }: PericiasStepProps) {
  const totalEscolhas = periciaMeta
    ? periciaMeta.qtdEscolhaLivre + (periciaMeta.qtdEscolhaOrigem ?? 0)
    : 0;
  const excedeuLimite = periciaMeta ? value.length > totalEscolhas : false;
  const faltandoPericias = periciaMeta ? Math.max(0, totalEscolhas - value.length) : 0;

  const obrigatorias = periciaMeta?.obrigatorias ?? [];
  const escolhaveis = periciaMeta
    ? TODAS_PERICIAS.filter(p => !periciaMeta.obrigatorias.includes(p))
    : TODAS_PERICIAS;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="text-center">
        <h3 className="text-xl font-serif text-white mb-2">Especialização</h3>
        <p className="text-ordem-text-secondary text-sm">
          Selecione suas perícias treinadas.
        </p>
        {periciaMeta && (
          <div className={`mt-4 inline-block px-4 py-1 rounded-full text-xs font-mono border ${(excedeuLimite || faltandoPericias > 0)
            ? 'border-ordem-red text-ordem-red bg-ordem-red/10'
            : 'border-ordem-green text-ordem-green bg-ordem-green/10'
            }`}>
            ESCOLHAS: {value.length} / {totalEscolhas}
          </div>
        )}
        {periciaMeta?.qtdEscolhaOrigem ? (
          <div className="mt-2 text-[11px] text-ordem-text-muted font-mono">
            Inclui {periciaMeta.qtdEscolhaOrigem} perícia(s) da origem.
          </div>
        ) : null}
        {periciaMeta && faltandoPericias > 0 && (
          <p className="mt-2 text-[11px] text-ordem-gold font-mono tracking-widest">
            FALTAM {faltandoPericias} PERÍCIA(S) — VOCÊ PODE AVANÇAR, MAS FICARÁ PENDENTE
          </p>
        )}
      </div>
      <PericiaGrid
        value={value}
        onChange={onChange}
        obrigatorias={obrigatorias}
        escolhaveis={escolhaveis}
      />
    </div>
  );
}
