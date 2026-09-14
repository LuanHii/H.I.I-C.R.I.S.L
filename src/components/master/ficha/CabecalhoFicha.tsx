'use client';

import { ArrowDown, ArrowUp, Shield } from 'lucide-react';
import type { Personagem } from '../../../core/types';
import type { FichaPersistida } from '../../../core/ficha/tipos';
import type { BuildResultado } from '../../../core/ficha/buildFicha';
import { Fita, RotuloSecao } from '../ui/Pecas';

export type ModoDaFicha = 'mesa' | 'construcao';

export interface CabecalhoFichaProps {
  ficha: FichaPersistida;
  build: BuildResultado;
  personagem: Personagem;
  modo: ModoDaFicha;
  readOnly: boolean;
  onModo: (modo: ModoDaFicha) => void;
  onNivel: (direcao: 'subir' | 'descer') => void;
  onResponderPendencias: () => void;
  onPatente: () => void;
}

export function CabecalhoFicha({
  ficha,
  build,
  personagem,
  modo,
  readOnly,
  onModo,
  onNivel,
  onResponderPendencias,
  onPatente,
}: CabecalhoFichaProps) {
  const sobrevivente = ficha.identidade.classe === 'Sobrevivente';
  const rotuloNivel = sobrevivente ? `Estágio ${build.nivel}` : `NEX ${build.nivel}%`;
  const pendentes = build.pendencias.length;
  const construindo = modo === 'construcao';

  return (
    <header className="relative px-4 pb-4 pt-5 sm:px-6">
      <div className="flex flex-wrap items-start justify-between gap-x-6 gap-y-3">
        <div className="min-w-0">
          <h2 className="font-display text-3xl uppercase leading-none tracking-[0.06em] text-white sm:text-4xl">
            {ficha.identidade.nome}
          </h2>
          <div className="mt-1.5 h-px w-24 bg-[var(--mestre-primary,#DC2626)]" />
          {ficha.identidade.conceito && (
            <p className="mt-2 max-w-xl text-sm italic text-ordem-text-secondary">{ficha.identidade.conceito}</p>
          )}

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <Fita variante="classe">{ficha.identidade.classe}</Fita>

            <span className="inline-flex items-stretch border border-white/10">
              {construindo && !readOnly && (
                <button
                  type="button"
                  aria-label="Rebaixar nível"
                  onClick={() => onNivel('descer')}
                  className="grid w-7 place-items-center text-ordem-text-muted transition hover:bg-white/5 hover:text-white"
                >
                  <ArrowDown size={12} />
                </button>
              )}
              <span className="px-2.5 py-1 font-carimbo text-[10px] uppercase tracking-[0.16em] text-white">{rotuloNivel}</span>
              {construindo && !readOnly && (
                <button
                  type="button"
                  aria-label="Subir de nível"
                  onClick={() => onNivel('subir')}
                  className="grid w-7 place-items-center text-[var(--mestre-primary,#DC2626)] transition hover:bg-white/5"
                >
                  <ArrowUp size={12} />
                </button>
              )}
            </span>

            {ficha.identidade.classe !== 'Sobrevivente' && (
              <button
                type="button"
                onClick={onPatente}
                disabled={readOnly || !construindo}
                title={construindo ? 'Alterar patente (grava os pontos de prestígio)' : `${personagem.pp ?? 0} PP`}
                className="border border-white/10 px-2.5 py-1 font-carimbo text-[10px] uppercase tracking-[0.16em] text-ordem-gold transition enabled:hover:border-ordem-gold/60 disabled:cursor-default"
              >
                {build.patente}
              </button>
            )}

            <Fita variante="neutra">{ficha.identidade.origem}</Fita>
            {build.trilha && <Fita variante="contorno">{build.trilha}</Fita>}
          </div>
        </div>

        <div className="flex shrink-0 flex-col items-end gap-3">
          {!readOnly && (
            <div role="tablist" aria-label="Modo da ficha" className="inline-flex border border-white/10 p-0.5">
              {(['mesa', 'construcao'] as const).map((m) => (
                <button
                  key={m}
                  role="tab"
                  aria-selected={modo === m}
                  onClick={() => onModo(m)}
                  className={`px-3 py-1 font-carimbo text-[10px] uppercase tracking-[0.18em] transition ${modo === m
                    ? 'bg-[var(--mestre-primary,#DC2626)] text-black'
                    : 'text-ordem-text-muted hover:text-white'
                    }`}
                >
                  {m === 'mesa' ? 'Mesa' : 'Construção'}
                </button>
              ))}
            </div>
          )}

          <div className="text-right">
            <RotuloSecao>Defesa</RotuloSecao>
            <div className="flex items-center justify-end gap-1.5">
              <Shield size={18} className="text-ordem-text-muted" />
              <span className="font-display text-3xl font-bold leading-none text-white">{build.derivados.defesa}</span>
            </div>
          </div>

          {pendentes > 0 && !readOnly && (
            <button
              type="button"
              onClick={onResponderPendencias}
              className="border border-ordem-gold/60 bg-ordem-gold/10 px-3 py-1.5 font-carimbo text-[10px] uppercase tracking-[0.16em] text-ordem-gold transition hover:bg-ordem-gold/20"
            >
              {pendentes} escolha{pendentes === 1 ? '' : 's'} pendente{pendentes === 1 ? '' : 's'} → responder
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
