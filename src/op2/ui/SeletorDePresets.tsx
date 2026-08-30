'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import { COMPOSICOES_DE_MESA, PRESETS_SOBREVIVENTES, fichaDoPreset } from '../presets/sobreviventes';
import type { IdSobrevivente } from '../presets/sobreviventes';
import type { FichaOp2 } from '../regras/tipos';

const TAMANHOS: readonly (3 | 4 | 5)[] = [3, 4, 5];

export interface SeletorDePresetsProps {
  onImportar: (fichas: FichaOp2[]) => void;
  className?: string;
}

export const SeletorDePresets: React.FC<SeletorDePresetsProps> = ({ onImportar, className }) => {
  const [jogadores, setJogadores] = useState<3 | 4 | 5>(5);

  const daComposicao = COMPOSICOES_DE_MESA[jogadores];
  const foraDaComposicao = (id: IdSobrevivente) => !daComposicao.includes(id);

  return (
    <div className={cn('rounded-lg border border-ordem-border bg-ordem-black p-4', className)}>
      <h3 className="text-sm font-bold uppercase tracking-wide text-ordem-white">
        Sobreviventes de A Maldição do Ídolo de Pedra
      </h3>
      <p className="mt-1 text-xs text-ordem-text-muted">
        A missão define quem entra conforme o tamanho da mesa. Com 3 ou 4 jogadores, alguns
        personagens saem da história.
      </p>

      <div className="mt-3 flex gap-2">
        {TAMANHOS.map((tamanho) => (
          <button
            key={tamanho}
            type="button"
            onClick={() => setJogadores(tamanho)}
            aria-pressed={jogadores === tamanho}
            className={cn(
              'flex-1 rounded border px-3 py-2 text-sm transition-colors',
              jogadores === tamanho
                ? 'border-ordem-green bg-ordem-ooze text-ordem-white'
                : 'border-ordem-border bg-ordem-bg text-ordem-text-secondary hover:border-ordem-border-light',
            )}
          >
            {tamanho} jogadores
          </button>
        ))}
      </div>

      <ul className="mt-3 space-y-1.5">
        {PRESETS_SOBREVIVENTES.map((preset) => {
          const ficha = fichaDoPreset(preset.id);
          const excluido = foraDaComposicao(preset.id);
          return (
            <li
              key={preset.id}
              className={cn(
                'rounded border px-3 py-2 transition-opacity',
                excluido
                  ? 'border-ordem-border bg-ordem-bg opacity-40'
                  : 'border-ordem-border-light bg-ordem-ooze',
              )}
            >
              <div className="flex flex-wrap items-baseline gap-2">
                <span className="font-bold text-ordem-white">{ficha.nome}</span>
                <span className="text-xs uppercase tracking-wide text-ordem-text-muted">
                  {ficha.perfil.tipo} · {ficha.ocupacao}
                </span>
                <span className="ml-auto font-mono text-xs text-ordem-text-secondary">
                  PV {ficha.pvMax} · PD {ficha.pdMax}
                </span>
              </div>
              <p className="mt-0.5 text-xs text-ordem-text-secondary">
                {excluido ? 'Fora desta composição de mesa.' : preset.resumo}
              </p>
            </li>
          );
        })}
      </ul>

      <Button
        className="mt-3 w-full"
        onClick={() => onImportar(daComposicao.map(fichaDoPreset))}
      >
        Importar {daComposicao.length} fichas
      </Button>
    </div>
  );
};
