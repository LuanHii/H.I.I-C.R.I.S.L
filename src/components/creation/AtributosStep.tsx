'use client';

import React from 'react';
import type { Atributos } from '@/core/types';

interface AtributosStepProps {
  tipo: 'Agente' | 'Sobrevivente' | '';
  atributos: Atributos;
  pontosRestantes: number;
  onAtributoChange: (atributo: keyof Atributos, delta: number) => void;
}

export function AtributosStep({
  tipo,
  atributos,
  pontosRestantes,
  onAtributoChange,
}: AtributosStepProps) {
  const pontosText = tipo === 'Sobrevivente' ? 'Sobreviventes começam com 3 pontos.' : 'Agentes começam com 4 pontos.';

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="text-center space-y-2">
        <h3 className="text-lg sm:text-xl font-serif text-white">Distribuição de Atributos</h3>
        <p className="text-ordem-text-secondary text-sm">
          Pontos Restantes: <span className={`font-mono font-bold text-lg ${pontosRestantes > 0 ? 'text-ordem-green' : 'text-ordem-text-muted'}`}>{pontosRestantes}</span>
        </p>
        <p className="text-xs text-ordem-text-muted px-4">
          {pontosText} Máximo de 3 por atributo.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-5 gap-4 sm:gap-4 md:gap-6 justify-items-center">
        {(Object.entries(atributos) as [keyof Atributos, number][]).map(([chave, valor]) => (
          <div key={chave} className="flex sm:flex-col items-center gap-4 sm:gap-2 w-full max-w-sm sm:max-w-[100px] p-2 sm:p-0 bg-ordem-black/20 sm:bg-transparent rounded-lg border border-ordem-border/50 sm:border-0">
            <div className="shrink-0 w-20 h-20 sm:w-full sm:h-28 aspect-square sm:aspect-auto bg-ordem-ooze/80 border border-ordem-border-light rounded-lg flex flex-col items-center justify-center relative">
              <span className="text-[10px] sm:text-xs font-bold text-ordem-text-muted uppercase tracking-widest mb-1">{chave}</span>
              <span className="text-3xl sm:text-4xl font-mono text-white">{valor}</span>
            </div>

            <div className="flex sm:flex-row flex-1 sm:flex-initial gap-2 w-full justify-between items-center sm:justify-center">
              <button
                type="button"
                onClick={() => onAtributoChange(chave, -1)}
                className="flex-1 h-12 sm:h-9 bg-ordem-black border border-ordem-border-light text-ordem-text-secondary hover:text-white hover:border-white active:bg-ordem-ooze rounded-lg flex items-center justify-center text-xl sm:text-lg font-bold touch-target"
                aria-label={`Diminuir ${chave}`}
              >
                −
              </button>
              <button
                type="button"
                onClick={() => onAtributoChange(chave, 1)}
                className="flex-1 h-12 sm:h-9 bg-ordem-black border border-ordem-border-light text-ordem-text-secondary hover:text-white hover:border-white active:bg-ordem-ooze rounded-lg flex items-center justify-center text-xl sm:text-lg font-bold touch-target"
                aria-label={`Aumentar ${chave}`}
              >
                +
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
