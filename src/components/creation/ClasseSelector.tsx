'use client';

import React, { useMemo } from 'react';
import { CLASSES } from '@/data/classes';
import type { ClasseName, ClasseStats } from '@/core/types';
import type { ClassePreferencias } from '@/logic/rulesEngine';

const CLASSE_DESCRICOES: Record<string, string> = {
  Combatente: 'Treinado para lutar com todo tipo de armas, com força e coragem para encarar perigos de frente. Prefere abordagens diretas e costuma atirar primeiro e perguntar depois.',
  Especialista: 'Confia mais em esperteza do que em força bruta. Se vale de conhecimento técnico, raciocínio rápido ou lábia para resolver mistérios e enfrentar o paranormal.',
  Ocultista: 'Não é apenas um conhecedor do oculto, como também possui talento para se conectar com elementos paranormais. Visa compreender e dominar os mistérios para combater o Outro Lado.',
};

interface ClasseSelectorProps {
  value: ClasseName | '';
  onChange: (v: ClasseName) => void;
  preferenciasCombatente?: ClassePreferencias;
  onPreferenciasCombatenteChange?: (v: ClassePreferencias) => void;
}

export function ClasseSelector({
  value,
  onChange,
  preferenciasCombatente = { ofensiva: 'Luta', defensiva: 'Fortitude' },
  onPreferenciasCombatenteChange,
}: ClasseSelectorProps) {
  const classeEntries = useMemo(() => Object.entries(CLASSES).filter(([n]) => n !== 'Sobrevivente') as [ClasseName, ClasseStats][], []);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {classeEntries.map(([nomeClasse, stats]) => (
          <button
            key={nomeClasse}
            type="button"
            onClick={() => onChange(nomeClasse)}
            className={`p-4 sm:p-6 border text-left transition-all duration-300 relative overflow-hidden group rounded-lg active:scale-[0.98] ${value === nomeClasse
              ? 'border-ordem-red bg-ordem-red/10 shadow-[0_0_20px_rgba(220,38,38,0.2)]'
              : 'border-ordem-border bg-ordem-black/20 hover:border-ordem-border-light'
              }`}
          >
            <div className="relative z-10 flex flex-col h-full justify-between">
              <div>
                <h3 className={`text-base sm:text-lg font-serif mb-1 ${value === nomeClasse ? 'text-white' : 'text-ordem-text-secondary group-hover:text-white'}`}>
                  {nomeClasse}
                </h3>
                <ul className="text-[10px] sm:text-xs text-ordem-text-secondary space-y-0.5 font-mono mb-1 sm:mb-2">
                  <li>PV: {stats.pvInicial} (+{stats.pvPorNivel})</li>
                  <li>PE: {stats.peInicial} (+{stats.pePorNivel})</li>
                  <li>SAN: {stats.sanInicial} (+{stats.sanPorNivel})</li>
                </ul>
              </div>
              <p className="hidden md:block text-[10px] text-ordem-text-muted leading-relaxed mt-2">
                {CLASSE_DESCRICOES[nomeClasse]}
              </p>
            </div>
          </button>
        ))}
      </div>

      {value === 'Combatente' && onPreferenciasCombatenteChange && (
        <div className="mt-4 p-4 border border-ordem-border bg-ordem-black/20 rounded-lg">
          <div className="text-xs font-bold text-ordem-text-secondary uppercase tracking-widest mb-3">
            Preferências do Combatente
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-[10px] font-mono text-ordem-text-muted uppercase tracking-widest mb-2">Ofensiva</div>
              <div className="flex gap-2">
                {(['Luta', 'Pontaria'] as const).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => onPreferenciasCombatenteChange({ ...preferenciasCombatente, ofensiva: p })}
                    className={`flex-1 px-2 sm:px-3 py-2.5 text-xs font-mono border rounded-lg transition-colors touch-target-sm ${preferenciasCombatente.ofensiva === p
                      ? 'border-ordem-green text-ordem-green bg-ordem-green/10'
                      : 'border-ordem-border text-ordem-text-secondary active:bg-ordem-ooze/50'
                      }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <div className="text-[10px] font-mono text-ordem-text-muted uppercase tracking-widest mb-2">Defensiva</div>
              <div className="flex gap-2">
                {(['Fortitude', 'Reflexos'] as const).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => onPreferenciasCombatenteChange({ ...preferenciasCombatente, defensiva: p })}
                    className={`flex-1 px-2 sm:px-3 py-2.5 text-xs font-mono border rounded-lg transition-colors touch-target-sm ${preferenciasCombatente.defensiva === p
                      ? 'border-ordem-green text-ordem-green bg-ordem-green/10'
                      : 'border-ordem-border text-ordem-text-secondary active:bg-ordem-ooze/50'
                      }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="mt-3 text-xs text-ordem-text-muted">
            Define quais perícias o Combatente recebe como treinadas.
          </div>
        </div>
      )}
    </div>
  );
}
