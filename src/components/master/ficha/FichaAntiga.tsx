'use client';

import { RefreshCw } from 'lucide-react';
import type { Personagem } from '../../../core/types';
import { Cantos, Fita, RotuloSecao } from '../ui/Pecas';

export interface FichaAntigaProps {
  personagem: Personagem;
  motivo?: string;
  onConverter: () => void;
}

export function FichaAntiga({ personagem, motivo, onConverter }: FichaAntigaProps) {
  const sobrevivente = personagem.classe === 'Sobrevivente';
  const rotuloNivel = sobrevivente ? `Estágio ${personagem.estagio ?? 1}` : `NEX ${personagem.nex}%`;

  return (
    <div data-classe={personagem.classe} className="relative flex h-full flex-col items-center justify-center p-6">
      <span aria-hidden className="mestre-aura pointer-events-none absolute inset-x-0 top-0 h-64" />
      <div className="relative w-full max-w-lg border border-white/10 bg-[var(--mestre-superficie,#16161a)] px-6 py-6">
        <Cantos />
        <RotuloSecao>Formato antigo</RotuloSecao>
        <h2 className="mt-1 font-display text-3xl uppercase leading-none tracking-[0.06em] text-white">{personagem.nome}</h2>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <Fita variante="classe">{personagem.classe}</Fita>
          <Fita variante="neutra">{rotuloNivel}</Fita>
          {personagem.patente && <Fita variante="neutra">{personagem.patente}</Fita>}
        </div>

        <p className="mt-5 text-sm text-ordem-text-secondary">
          Esta ficha ainda não foi convertida para o motor novo. Converta para abrir — a conversão compara os números
          e mostra tudo o que inferiu antes de gravar; a ficha atual é guardada e nada é apagado.
        </p>
        {motivo && (
          <p className="mt-2 border border-ordem-gold/40 bg-ordem-gold/[0.06] px-3 py-2 text-xs text-ordem-gold">{motivo}</p>
        )}

        <button
          type="button"
          onClick={onConverter}
          className="mt-5 flex items-center gap-2 border border-[var(--mestre-primary,#DC2626)] bg-[var(--mestre-primary,#DC2626)]/15 px-5 py-2.5 font-carimbo text-[11px] uppercase tracking-[0.16em] text-white transition hover:bg-[var(--mestre-primary,#DC2626)]/30"
        >
          <RefreshCw size={13} /> Converter agora
        </button>
      </div>
    </div>
  );
}
