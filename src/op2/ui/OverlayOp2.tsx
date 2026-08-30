'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { avaliacaoDe, dadoDaPericia, estadoDeRisco, impetoDe, pdAtual, pvAtual } from '../regras/ficha';
import { PERICIAS_SIMPLES, pericia } from '../regras/pericias';
import { CORES_DO_PERFIL } from './Pecas';
import {
  MAXIMO_AVALIACAO,
  MAXIMO_IMPETO,
  ROTULO_ATRIBUTO,
  type FichaOp2,
} from '../regras/tipos';

interface BarraProps {
  rotulo: string;
  atual: number;
  maximo: number;
  cor: string;
  alerta?: boolean;
}

const Barra: React.FC<BarraProps> = ({ rotulo, atual, maximo, cor, alerta }) => (
  <div>
    <div className="flex items-baseline justify-between">
      <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-ordem-text-muted">
        {rotulo}
      </span>
      <span className={cn('font-mono text-sm font-bold', alerta ? 'text-ordem-red-light' : 'text-white')}>
        {atual}
        <span className="text-ordem-text-muted">/{maximo}</span>
      </span>
    </div>
    <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-ordem-black-deep">
      <div
        className={cn('h-full rounded-full transition-all duration-500', cor)}
        style={{ width: `${maximo > 0 ? Math.max(0, Math.min(1, atual / maximo)) * 100 : 0}%` }}
      />
    </div>
  </div>
);

export interface OverlayOp2Props {
  ficha: FichaOp2;
  modo?: 'mini' | 'full';
}

export const OverlayOp2: React.FC<OverlayOp2Props> = ({ ficha, modo = 'mini' }) => {
  const risco = estadoDeRisco(ficha);
  const pv = pvAtual(ficha);
  const pd = pdAtual(ficha);
  const impeto = impetoDe(ficha);
  const avaliacao = avaliacaoDe(ficha);

  const melhoresPericias = [...PERICIAS_SIMPLES]
    .map((nome) => ({ nome, dado: dadoDaPericia(ficha, pericia(nome)) }))
    .filter((entrada) => entrada.dado !== 'd4')
    .sort((a, b) => b.dado.localeCompare(a.dado, undefined, { numeric: true }))
    .slice(0, 8);

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-ordem-green p-4">
      <div className="flex w-full max-w-[420px] flex-col overflow-hidden rounded-xl border-2 border-ordem-border bg-ordem-black shadow-2xl">
        <div className="flex items-center justify-between gap-3 border-b border-ordem-border bg-ordem-ooze p-4 pb-3">
          <div className="mr-2 overflow-hidden">
            <h1 className="truncate text-2xl font-bold leading-tight text-white">{ficha.nome}</h1>
            <div className="mt-1 flex items-center gap-2 font-mono text-xs">
              <span
                className={cn(
                  'rounded px-1.5 py-0.5 font-bold uppercase',
                  CORES_DO_PERFIL[ficha.perfil.tipo],
                )}
              >
                {ficha.perfil.tipo}
              </span>
              <span className="text-ordem-text-muted">|</span>
              <span className="font-semibold text-ordem-text-secondary">{ficha.ocupacao}</span>
              <span className="text-ordem-text-muted">|</span>
              <span className="font-semibold text-ordem-text-secondary">Nv {ficha.nivel}</span>
            </div>
          </div>
        </div>

        <div className="space-y-3 p-4">
          <Barra
            rotulo="Vida"
            atual={pv}
            maximo={ficha.pvMax}
            cor="bg-ordem-red"
            alerta={risco.precisaFerimento}
          />
          <Barra
            rotulo="Determinação"
            atual={pd}
            maximo={ficha.pdMax}
            cor="bg-ordem-blue"
            alerta={risco.precisaTrauma}
          />

          {ficha.perfil.tipo === 'EXECUTOR' ? (
            <div>
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-ordem-text-muted">
                Ímpeto
              </span>
              <div className="mt-1 flex gap-1">
                {Array.from({ length: MAXIMO_IMPETO }, (_, indice) => (
                  <span
                    key={indice}
                    className={cn(
                      'h-3 flex-1 rounded-sm border',
                      indice < impeto
                        ? 'border-ordem-gold bg-ordem-gold'
                        : 'border-ordem-border bg-ordem-black-deep',
                    )}
                  />
                ))}
              </div>
            </div>
          ) : null}

          {ficha.perfil.tipo === 'ANALISTA' ? (
            <div>
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-ordem-text-muted">
                Avaliação
              </span>
              <div className="mt-1 flex gap-1">
                {Array.from({ length: MAXIMO_AVALIACAO }, (_, indice) => (
                  <span
                    key={indice}
                    className={cn(
                      'h-3 flex-1 rounded-sm border',
                      indice < avaliacao
                        ? 'border-ordem-cyan bg-ordem-cyan'
                        : 'border-ordem-border bg-ordem-black-deep',
                    )}
                  />
                ))}
              </div>
            </div>
          ) : null}

          <div className="grid grid-cols-3 gap-2">
            {(['FISICO', 'MENTE', 'EMOCAO'] as const).map((atributo) => (
              <div
                key={atributo}
                className="rounded border border-ordem-border bg-ordem-black-deep/60 p-2 text-center"
              >
                <div className="text-[9px] uppercase tracking-widest text-ordem-text-muted">
                  {ROTULO_ATRIBUTO[atributo]}
                </div>
                <div className="font-mono text-base font-bold text-white">
                  {ficha.atributos[atributo]}
                </div>
              </div>
            ))}
          </div>

          {ficha.sessao.condicoes.length > 0 ? (
            <div className="flex flex-wrap gap-1">
              {ficha.sessao.condicoes.map((condicao) => (
                <span
                  key={condicao}
                  className="rounded border border-ordem-red/50 bg-ordem-red-dark/30 px-1.5 py-0.5 text-[10px] text-ordem-red-light"
                >
                  {condicao}
                </span>
              ))}
            </div>
          ) : null}
        </div>

        {modo === 'full' ? (
          <div className="space-y-2 border-t border-ordem-border bg-ordem-black-deep/60 p-3">
            <div className="text-[10px] font-bold uppercase tracking-[0.3em] text-ordem-text-secondary">
              Perícias treinadas
            </div>
            {melhoresPericias.length === 0 ? (
              <p className="text-[11px] text-ordem-text-muted">Nenhuma perícia acima de d4.</p>
            ) : (
              <div className="grid grid-cols-2 gap-1.5">
                {melhoresPericias.map((entrada) => (
                  <div
                    key={entrada.nome}
                    className="flex items-center justify-between rounded border border-ordem-border bg-ordem-black/40 px-2 py-1"
                  >
                    <span className="truncate text-[11px] text-ordem-text-secondary">
                      {entrada.nome}
                    </span>
                    <span className="ml-2 font-mono text-[11px] font-bold text-ordem-cyan">
                      {entrada.dado}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {ficha.sessao.passosDeCena.length > 0 ? (
              <div className="rounded border border-ordem-gold/40 bg-ordem-ooze px-2 py-1.5">
                {ficha.sessao.passosDeCena.map((passo, indice) => (
                  <div key={indice} className="text-[10px] text-ordem-gold">
                    {passo.delta > 0 ? '+' : ''}
                    {passo.delta} passo em {ROTULO_ATRIBUTO[passo.alvo]} — {passo.motivo}
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
};
