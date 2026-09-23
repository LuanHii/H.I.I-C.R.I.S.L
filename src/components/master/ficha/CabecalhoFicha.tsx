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

function SeletorDeModo({ modo, onModo, className = '' }: { modo: ModoDaFicha; onModo: (m: ModoDaFicha) => void; className?: string }) {
  return (
    <div role="tablist" aria-label="Modo da ficha" className={`inline-flex border border-white/10 p-0.5 ${className}`}>
      {(['mesa', 'construcao'] as const).map((m) => (
        <button
          key={m}
          role="tab"
          aria-selected={modo === m}
          onClick={() => onModo(m)}
          className={`h-9 flex-1 px-3 font-carimbo text-[10px] uppercase tracking-[0.18em] transition ${modo === m
            ? 'bg-[var(--mestre-primary,#DC2626)] text-black'
            : 'text-ordem-text-muted hover:text-white'
            }`}
        >
          {m === 'mesa' ? 'Mesa' : 'Construção'}
        </button>
      ))}
    </div>
  );
}

function BotaoPendencias({ pendentes, onClick, className = '' }: { pendentes: number; onClick: () => void; className?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`h-10 border border-ordem-gold/60 bg-ordem-gold/10 px-3 font-carimbo text-[10px] uppercase tracking-[0.16em] text-ordem-gold transition hover:bg-ordem-gold/20 ${className}`}
    >
      {pendentes} escolha{pendentes === 1 ? '' : 's'} pendente{pendentes === 1 ? '' : 's'} → responder
    </button>
  );
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
    <header className="relative px-3 pb-3 pt-3 sm:px-6 sm:pb-4 sm:pt-5">
      <div className="flex flex-col gap-3 lg:flex-row lg:flex-wrap lg:items-start lg:justify-between lg:gap-x-6">
        <div className="min-w-0">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h2 className="truncate font-display text-2xl uppercase leading-none tracking-[0.06em] text-white sm:text-3xl lg:text-4xl">
                {ficha.identidade.nome}
              </h2>
              <div className="mt-1.5 h-px w-20 bg-[var(--mestre-primary,#DC2626)] sm:w-24" />
            </div>

            <div className="shrink-0 text-right lg:hidden">
              <RotuloSecao>Defesa</RotuloSecao>
              <div className="flex items-center justify-end gap-1">
                <Shield size={14} className="text-ordem-text-muted" />
                <span className="font-display text-2xl font-bold leading-none text-white">{build.derivados.defesa}</span>
              </div>
            </div>
          </div>

          {ficha.identidade.conceito && (
            <p className="mt-2 line-clamp-2 max-w-xl text-xs italic text-ordem-text-secondary sm:text-sm">{ficha.identidade.conceito}</p>
          )}

          <div className="-mx-3 mt-3 flex items-center gap-2 overflow-x-auto px-3 touch-scroll no-scrollbar sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0">
            <Fita variante="classe" className="shrink-0">{ficha.identidade.classe}</Fita>

            <span className="inline-flex shrink-0 items-stretch border border-white/10">
              {construindo && !readOnly && (
                <button
                  type="button"
                  aria-label="Rebaixar nível"
                  onClick={() => onNivel('descer')}
                  className="grid w-9 place-items-center text-ordem-text-muted transition hover:bg-white/5 hover:text-white sm:w-7"
                >
                  <ArrowDown size={12} />
                </button>
              )}
              <span className="whitespace-nowrap px-2.5 py-1.5 font-carimbo text-[10px] uppercase tracking-[0.16em] text-white">{rotuloNivel}</span>
              {construindo && !readOnly && (
                <button
                  type="button"
                  aria-label="Subir de nível"
                  onClick={() => onNivel('subir')}
                  className="grid w-9 place-items-center text-[var(--mestre-primary,#DC2626)] transition hover:bg-white/5 sm:w-7"
                >
                  <ArrowUp size={12} />
                </button>
              )}
            </span>

            {!sobrevivente && (
              <button
                type="button"
                onClick={onPatente}
                disabled={readOnly || !construindo}
                title={construindo ? 'Alterar patente (grava os pontos de prestígio)' : `${personagem.pp ?? 0} PP`}
                className="shrink-0 whitespace-nowrap border border-white/10 px-2.5 py-1.5 font-carimbo text-[10px] uppercase tracking-[0.16em] text-ordem-gold transition enabled:hover:border-ordem-gold/60 disabled:cursor-default"
              >
                {build.patente}
              </button>
            )}

            <Fita variante="neutra" className="shrink-0">{ficha.identidade.origem}</Fita>
            {build.trilha && <Fita variante="contorno" className="shrink-0">{build.trilha}</Fita>}
          </div>

          {!readOnly && (
            <div className="mt-3 flex flex-col gap-2 lg:hidden">
              <SeletorDeModo modo={modo} onModo={onModo} className="w-full" />
              {pendentes > 0 && <BotaoPendencias pendentes={pendentes} onClick={onResponderPendencias} className="w-full" />}
            </div>
          )}
        </div>

        <div className="hidden shrink-0 flex-col items-end gap-3 lg:flex">
          {!readOnly && <SeletorDeModo modo={modo} onModo={onModo} />}

          <div className="text-right">
            <RotuloSecao>Defesa</RotuloSecao>
            <div className="flex items-center justify-end gap-1.5">
              <Shield size={18} className="text-ordem-text-muted" />
              <span className="font-display text-3xl font-bold leading-none text-white">{build.derivados.defesa}</span>
            </div>
          </div>

          {pendentes > 0 && !readOnly && <BotaoPendencias pendentes={pendentes} onClick={onResponderPendencias} />}
        </div>
      </div>
    </header>
  );
}
