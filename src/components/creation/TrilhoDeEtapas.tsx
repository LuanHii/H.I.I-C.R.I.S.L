'use client';

import React from 'react';
import { Check } from 'lucide-react';
import type { EtapaId } from '@/logic/rascunhoDeCriacao';
import { cn } from '@/lib/utils';

export const NOME_DA_ETAPA: Record<EtapaId, string> = {
  identidade: 'Identidade',
  atributos: 'Atributos',
  origem: 'Origem',
  classe: 'Classe',
  pericias: 'Perícias',
  rituais: 'Rituais',
  equipamento: 'Equipamento',
  revisao: 'Revisão',
};

export function TrilhoDeEtapas({ etapas, atual, alcancada, irPara }: { etapas: EtapaId[]; atual: number; alcancada: number; irPara: (indice: number) => void }) {
  return (
    <>
      <ol className="hidden items-stretch gap-1 lg:flex" aria-label="Etapas">
        {etapas.map((etapa, i) => {
          const feita = i < atual;
          const corrente = i === atual;
          const acessivel = i <= alcancada;
          return (
            <li key={etapa} className="flex-1">
              <button
                type="button"
                onClick={() => acessivel && irPara(i)}
                disabled={!acessivel}
                aria-current={corrente ? 'step' : undefined}
                className={cn(
                  'flex w-full flex-col gap-1.5 text-left transition disabled:cursor-default',
                  acessivel ? 'hover:text-white' : 'opacity-50',
                )}
              >
                <span className={cn('h-1 w-full', feita || corrente ? 'bg-[var(--mestre-primary,#DC2626)]' : 'bg-white/10')} />
                <span className={cn('flex items-center gap-1 font-carimbo text-[10px] uppercase tracking-[0.16em]', corrente ? 'text-white' : feita ? 'text-ordem-text-secondary' : 'text-ordem-text-muted')}>
                  {feita ? <Check size={10} className="text-[var(--mestre-primary,#DC2626)]" /> : <span className="tabular-nums">{i + 1}</span>}
                  {NOME_DA_ETAPA[etapa]}
                </span>
              </button>
            </li>
          );
        })}
      </ol>

      <div className="lg:hidden">
        <div className="flex items-baseline justify-between font-carimbo text-[10px] uppercase tracking-[0.16em] text-ordem-text-muted">
          <span>Etapa {atual + 1} de {etapas.length}</span>
          <span className="text-white">{NOME_DA_ETAPA[etapas[atual]]}</span>
        </div>
        <div className="mt-1.5 flex gap-1" aria-hidden>
          {etapas.map((etapa, i) => (
            <span key={etapa} className={cn('h-1 flex-1', i <= atual ? 'bg-[var(--mestre-primary,#DC2626)]' : 'bg-white/10')} />
          ))}
        </div>
      </div>
    </>
  );
}
