'use client';

import { Minus, Plus } from 'lucide-react';
import type { AtributoKey, Atributos } from '../../../core/types';
import type { BuildResultado } from '../../../core/ficha/buildFicha';
import type { FichaPersistida } from '../../../core/ficha/tipos';

const ORDEM: AtributoKey[] = ['AGI', 'FOR', 'INT', 'PRE', 'VIG'];

export interface AtributosFichaProps {
  ficha: FichaPersistida;
  build: BuildResultado;
  modo: 'mesa' | 'construcao';
  readOnly: boolean;
  onAjustarBase: (atributo: AtributoKey, delta: 1 | -1) => void;
  onResponderMarco: (atributo: AtributoKey) => void;
}

export function AtributosFicha({ ficha, build, modo, readOnly, onAjustarBase, onResponderMarco }: AtributosFichaProps) {
  const base: Atributos = ficha.identidade.atributosBase;
  const marcoPendente = build.pendencias.some((p) => p.slot.kind === 'atributo');
  const construindo = modo === 'construcao' && !readOnly;

  return (
    <div>
      {construindo && marcoPendente && (
        <div className="mb-2 border border-ordem-gold/50 bg-ordem-gold/10 px-3 py-1.5 text-center font-carimbo text-[10px] uppercase tracking-[0.16em] text-ordem-gold">
          Marco de atributo pendente — escolha qual sobe
        </div>
      )}
      <div className="flex gap-2 sm:gap-3">
        {ORDEM.map((chave) => {
          const atual = build.atributos[chave];
          const marcos = atual - base[chave];
          return (
            <div
              key={chave}
              className="relative flex flex-1 flex-col items-center border border-white/10 bg-white/[0.02] px-2 py-2.5 shadow-[0_1px_0_0_rgba(255,255,255,0.04)_inset]"
            >
              <span className="font-carimbo text-[9px] uppercase tracking-[0.2em] text-ordem-text-muted">{chave}</span>
              <span className="mt-0.5 font-display text-2xl font-bold leading-none text-white">{atual}</span>

              {construindo && (
                <>
                  <div className="mt-2 flex items-center gap-1">
                    <button
                      type="button"
                      aria-label={`${chave}: base −1`}
                      onClick={() => onAjustarBase(chave, -1)}
                      disabled={base[chave] <= 0}
                      className="grid h-6 w-6 place-items-center border border-white/10 text-ordem-text-muted transition hover:text-white disabled:opacity-30"
                    >
                      <Minus size={11} />
                    </button>
                    <span className="min-w-[1.5rem] text-center font-mono text-[11px] text-ordem-text-secondary" title="Base de criação">
                      {base[chave]}
                    </span>
                    <button
                      type="button"
                      aria-label={`${chave}: base +1`}
                      onClick={() => onAjustarBase(chave, 1)}
                      className="grid h-6 w-6 place-items-center border border-white/10 text-ordem-text-muted transition hover:text-white"
                    >
                      <Plus size={11} />
                    </button>
                  </div>
                  <span className="mt-1 font-carimbo text-[9px] uppercase tracking-[0.14em] text-ordem-text-muted">
                    {marcos > 0 ? `base +${marcos} de marcos` : 'base'}
                  </span>
                  {marcoPendente && (
                    <button
                      type="button"
                      onClick={() => onResponderMarco(chave)}
                      className="mt-1.5 w-full border border-ordem-gold/50 py-0.5 font-carimbo text-[9px] uppercase tracking-[0.14em] text-ordem-gold transition hover:bg-ordem-gold/10"
                    >
                      +1 aqui
                    </button>
                  )}
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
