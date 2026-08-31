'use client';

import React, { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import {
  avaliacaoDe,
  dadoDaPericia,
  estadoDeRisco,
  impetoDe,
  pdAtual,
  pvAtual,
} from '../regras/ficha';
import { PERICIAS_SIMPLES, pericia } from '../regras/pericias';
import { facesDe } from '../regras/dados';
import {
  MAXIMO_AVALIACAO,
  MAXIMO_IMPETO,
  ROTULO_ATRIBUTO,
  type FichaOp2,
} from '../regras/tipos';
import {
  BarraDeRecurso,
  Medidor,
  SOMBRA_DE_ELEMENTO,
  SOMBRA_DE_LEITURA,
} from './Pecas';
import { temaDe } from './tema';

export type FundoDoOverlay = 'transparente' | 'verde';

const DURACAO_DO_PULSO_MS = 900;

function usePulsoAoMudar(valor: number): 'subiu' | 'desceu' | null {
  const anterior = useRef(valor);
  const [pulso, setPulso] = useState<'subiu' | 'desceu' | null>(null);

  useEffect(() => {
    if (anterior.current === valor) return;
    setPulso(valor > anterior.current ? 'subiu' : 'desceu');
    anterior.current = valor;
    const relogio = setTimeout(() => setPulso(null), DURACAO_DO_PULSO_MS);
    return () => clearTimeout(relogio);
  }, [valor]);

  return pulso;
}

export interface OverlayOp2Props {
  ficha: FichaOp2;
  modo?: 'mini' | 'full';
  fundo?: FundoDoOverlay;
}

export const OverlayOp2: React.FC<OverlayOp2Props> = ({
  ficha,
  modo = 'mini',
  fundo = 'transparente',
}) => {
  const risco = estadoDeRisco(ficha);

  const treinadas = PERICIAS_SIMPLES.map((nome) => ({
    nome,
    dado: dadoDaPericia(ficha, pericia(nome)),
  }))
    .filter((entrada) => entrada.dado !== 'd4')
    .sort((a, b) => facesDe(b.dado) - facesDe(a.dado) || a.nome.localeCompare(b.nome, 'pt-BR'));

  return (
    <div
      className={cn(
        'min-h-screen w-full p-4',
        fundo === 'verde' ? 'bg-ordem-green' : 'bg-transparent',
      )}
    >
      <div className="flex w-full max-w-[440px] flex-col gap-3">
        <div className="flex items-end justify-between gap-3">
          <h1
            className={cn(
              'truncate font-serif text-3xl leading-none text-white',
              SOMBRA_DE_LEITURA,
            )}
          >
            {ficha.nome}
          </h1>
          <span
            className={cn(
              'shrink-0 rounded border px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-widest backdrop-blur-sm',
              temaDe(ficha).distintivo,
              SOMBRA_DE_ELEMENTO,
            )}
          >
            {ficha.perfil.tipo}
          </span>
        </div>

        <div className="space-y-2.5">
          <BarraDeRecurso
            rotulo="Vida"
            atual={pvAtual(ficha)}
            maximo={ficha.pvMax}
            tom="vida"
            alerta={risco.precisaFerimento}
            className={SOMBRA_DE_ELEMENTO}
          />
          <BarraDeRecurso
            rotulo="Determinação"
            atual={pdAtual(ficha)}
            maximo={ficha.pdMax}
            tom="determinacao"
            alerta={risco.precisaTrauma}
            className={SOMBRA_DE_ELEMENTO}
          />

          {ficha.perfil.tipo === 'EXECUTOR' ? (
            <Medidor
              rotulo="Ímpeto"
              preenchidos={impetoDe(ficha)}
              total={MAXIMO_IMPETO}
              tom="impeto"
              className={SOMBRA_DE_ELEMENTO}
            />
          ) : null}

          {ficha.perfil.tipo === 'ANALISTA' ? (
            <Medidor
              rotulo="Avaliação"
              preenchidos={avaliacaoDe(ficha)}
              total={MAXIMO_AVALIACAO}
              tom="avaliacao"
              className={SOMBRA_DE_ELEMENTO}
            />
          ) : null}
        </div>

        {ficha.sessao.condicoes.length > 0 ? (
          <div className={cn('flex flex-wrap gap-1.5', SOMBRA_DE_ELEMENTO)}>
            {ficha.sessao.condicoes.map((condicao) => (
              <span
                key={condicao}
                className="rounded border border-ordem-red/50 bg-ordem-red-dark/70 px-2 py-0.5 font-mono text-[11px] font-bold uppercase tracking-wide text-white backdrop-blur-sm"
              >
                {condicao}
              </span>
            ))}
          </div>
        ) : null}

        {risco.precisaFerimento || risco.precisaTrauma ? (
          <div className={cn('flex flex-wrap gap-1.5', SOMBRA_DE_ELEMENTO)}>
            {risco.precisaFerimento ? (
              <span className="animate-pulse rounded border border-ordem-red bg-ordem-red-dark/80 px-2 py-0.5 font-mono text-[11px] font-bold uppercase tracking-wide text-white backdrop-blur-sm">
                Ferimento · DT {risco.dtFerimento}
              </span>
            ) : null}
            {risco.precisaTrauma ? (
              <span className="animate-pulse rounded border border-ordem-purple bg-ordem-purple/50 px-2 py-0.5 font-mono text-[11px] font-bold uppercase tracking-wide text-white backdrop-blur-sm">
                Trauma · DT {risco.dtTrauma}
              </span>
            ) : null}
          </div>
        ) : null}

        {modo === 'full' ? (
          <div className={cn('space-y-2 pt-1', SOMBRA_DE_ELEMENTO)}>
            <div className="flex items-center gap-2">
              {(['FISICO', 'MENTE', 'EMOCAO'] as const).map((atributo) => (
                <span
                  key={atributo}
                  className={cn(
                    'flex flex-1 items-baseline justify-center gap-1.5 rounded border border-white/15 bg-black/60 px-2 py-1 backdrop-blur-sm',
                  )}
                >
                  <span className="font-mono text-[10px] uppercase tracking-wide text-white/60">
                    {ROTULO_ATRIBUTO[atributo]}
                  </span>
                  <span className="font-mono text-base font-bold text-white">
                    {ficha.atributos[atributo]}
                  </span>
                </span>
              ))}
            </div>

            {treinadas.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {treinadas.map((entrada) => (
                  <span
                    key={entrada.nome}
                    className="rounded border border-white/15 bg-black/60 px-2 py-0.5 backdrop-blur-sm"
                  >
                    <span className="font-mono text-[11px] text-white/75">{entrada.nome}</span>
                    <span className="ml-1.5 font-mono text-[11px] font-bold text-ordem-cyan">
                      {entrada.dado}
                    </span>
                  </span>
                ))}
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
};
