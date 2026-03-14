'use client';

import React from 'react';
import { ORIGENS } from '@/data/origins';

interface OrigemSelectorProps {
  value: string;
  onChange: (nome: string) => void;
  className?: string;
}

export function OrigemSelector({ value, onChange, className = '' }: OrigemSelectorProps) {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 overflow-y-auto custom-scrollbar pr-2 max-h-[60vh] sm:max-h-[400px] ${className}`}>
      {ORIGENS.map((origem) => {
        const textoPericias = origem.periciasTexto
          ? (origem.pericias.length > 0 ? `${origem.pericias.join(', ')} — ${origem.periciasTexto}` : origem.periciasTexto)
          : origem.pericias.join(', ');
        return (
          <button
            key={origem.nome}
            type="button"
            onClick={() => onChange(origem.nome)}
            className={`p-4 border text-left transition-all duration-200 rounded-lg group ${value === origem.nome
              ? 'border-ordem-gold bg-ordem-gold/10 shadow-[0_0_15px_rgba(255,215,0,0.1)]'
              : 'border-ordem-border bg-ordem-black/40 hover:border-ordem-border-light'
              }`}
          >
            <div className={`font-bold mb-2 font-serif text-lg ${value === origem.nome ? 'text-ordem-gold' : 'text-ordem-white-muted group-hover:text-white'}`}>
              {origem.nome}
            </div>
            <div className="text-xs text-ordem-text-muted space-y-2">
              <p className="line-clamp-3">{textoPericias}</p>
              {value === origem.nome && (
                <div className="pt-2 border-t border-ordem-gold/20 text-ordem-gold/80 italic">
                  Selecionado
                </div>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}
