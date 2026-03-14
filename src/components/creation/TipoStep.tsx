'use client';

import React from 'react';

type TipoPersonagem = 'Agente' | 'Sobrevivente';

interface TipoStepProps {
  value: TipoPersonagem | '';
  onChange: (tipo: TipoPersonagem) => void;
}

export function TipoStep({ value, onChange }: TipoStepProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-8 h-full items-stretch animate-in fade-in slide-in-from-bottom-4 duration-500">
      <button
        type="button"
        onClick={() => onChange('Agente')}
        className={`min-h-[160px] sm:h-64 border-2 p-6 sm:p-8 flex flex-col items-center justify-center gap-3 sm:gap-4 transition-all active:scale-[0.98] rounded-xl ${value === 'Agente' ? 'border-ordem-green bg-ordem-green/10 shadow-[0_0_30px_rgba(0,255,0,0.2)]' : 'border-ordem-border-light hover:border-ordem-border-light'}`}
      >
        <span className="text-3xl sm:text-4xl">🛡️</span>
        <h3 className="text-xl sm:text-2xl font-serif text-white text-center">AGENTE DA ORDEM</h3>
        <p className="text-ordem-white-muted text-center text-xs sm:text-sm">Recruta (NEX 5%). Treinado para enfrentar o paranormal.</p>
      </button>
      <button
        type="button"
        onClick={() => onChange('Sobrevivente')}
        className={`min-h-[160px] sm:h-64 border-2 p-6 sm:p-8 flex flex-col items-center justify-center gap-3 sm:gap-4 transition-all active:scale-[0.98] rounded-xl ${value === 'Sobrevivente' ? 'border-ordem-red bg-ordem-red/10 shadow-[0_0_30px_rgba(220,38,38,0.2)]' : 'border-ordem-border-light hover:border-ordem-border-light'}`}
      >
        <span className="text-3xl sm:text-4xl">🩸</span>
        <h3 className="text-xl sm:text-2xl font-serif text-white text-center">SOBREVIVENTE</h3>
        <p className="text-ordem-white-muted text-center text-xs sm:text-sm">Civil (NEX 0%). Uma pessoa comum arrastada para o horror.</p>
      </button>
    </div>
  );
}
