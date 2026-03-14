'use client';

import React, { useMemo } from 'react';
import { RITUAIS } from '@/data/rituals';
import type { Elemento, Ritual } from '@/core/types';

const ELEMENTO_COLORS: Record<Elemento, string> = {
  Sangue: 'border-red-600 text-red-500',
  Morte: 'border-ordem-border-light text-ordem-text-secondary',
  Conhecimento: 'border-yellow-600 text-yellow-500',
  Energia: 'border-purple-500 text-purple-400',
  Medo: 'border-white text-white',
};

interface RituaisStepProps {
  value: Ritual[];
  onChange: (rituais: Ritual[]) => void;
  limite?: number;
}

export function RituaisStep({ value, onChange, limite = 3 }: RituaisStepProps) {
  const rituaisDisponiveis = useMemo(() => RITUAIS.filter(r => r.circulo === 1), []);

  const toggleRitual = (ritual: Ritual) => {
    const isSelected = value.some(r => r.nome === ritual.nome);
    onChange(
      isSelected
        ? value.filter(r => r.nome !== ritual.nome)
        : [...value, ritual]
    );
  };

  const excedeu = value.length > limite;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500 h-full flex flex-col">
      <div className="text-center">
        <h3 className="text-xl font-serif text-white mb-2">Rituais Iniciais</h3>
        <p className="text-ordem-text-secondary text-sm">Ocultistas começam com 3 rituais de 1º Círculo.</p>
        <div className={`mt-4 inline-block px-4 py-1 rounded-full text-xs font-mono border ${excedeu
          ? 'border-ordem-red text-ordem-red bg-ordem-red/10'
          : 'border-purple-500 text-purple-400 bg-purple-900/10'
          }`}>
          SELECIONADOS: {value.length} / {limite}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 overflow-y-auto custom-scrollbar pr-2 max-h-[60vh] sm:max-h-[400px] lg:grid-cols-3">
        {rituaisDisponiveis.map((ritual) => {
          const isSelected = value.some(r => r.nome === ritual.nome);
          return (
            <button
              key={ritual.nome}
              type="button"
              onClick={() => toggleRitual(ritual)}
              className={`p-4 border text-left transition-all duration-200 rounded group relative overflow-hidden ${isSelected
                ? `${ELEMENTO_COLORS[ritual.elemento]} bg-ordem-black/60 shadow-[0_0_15px_rgba(128,0,128,0.2)]`
                : 'border-ordem-border bg-ordem-black/40 hover:border-ordem-border-light text-ordem-text-muted'
                }`}
            >
              <div className="flex justify-between items-start mb-2">
                <span className="font-serif font-bold">{ritual.nome}</span>
                <span className="text-[10px] uppercase opacity-70 border px-1 rounded border-current">{ritual.elemento}</span>
              </div>
              <p className="text-xs opacity-80 line-clamp-3">{ritual.descricao}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
