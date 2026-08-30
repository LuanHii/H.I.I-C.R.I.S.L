'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { estadoDeRisco, pdAtual, pvAtual } from '../regras/ficha';
import { MAXIMO_AVALIACAO, MAXIMO_IMPETO, type FichaOp2 } from '../regras/tipos';

interface BarraProps {
  rotulo: string;
  atual: number;
  maximo: number;
  cor: string;
  onAlterar?: (delta: number) => void;
}

const Barra: React.FC<BarraProps> = ({ rotulo, atual, maximo, cor, onAlterar }) => {
  const proporcao = maximo > 0 ? Math.max(0, Math.min(1, atual / maximo)) : 0;
  return (
    <div>
      <div className="flex items-baseline justify-between">
        <span className="text-xs font-bold uppercase tracking-wide text-ordem-text-secondary">
          {rotulo}
        </span>
        <span className="font-mono text-sm text-ordem-white">
          {atual}
          <span className="text-ordem-text-muted"> / {maximo}</span>
        </span>
      </div>
      <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-ordem-bg">
        <div
          className={cn('h-full rounded-full transition-all', cor)}
          style={{ width: `${proporcao * 100}%` }}
        />
      </div>
      {onAlterar ? (
        <div className="mt-1 flex gap-1">
          {[-5, -1, 1, 5].map((delta) => (
            <button
              key={delta}
              type="button"
              onClick={() => onAlterar(delta)}
              aria-label={`${delta > 0 ? 'Aumentar' : 'Reduzir'} ${rotulo} em ${Math.abs(delta)}`}
              className="flex-1 rounded border border-ordem-border bg-ordem-bg py-0.5 text-xs text-ordem-text-secondary hover:border-ordem-border-light hover:text-ordem-white"
            >
              {delta > 0 ? `+${delta}` : delta}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
};

interface EspacosProps {
  rotulo: string;
  preenchidos: number;
  total: number;
  ajuda: string;
  cor: string;
}

const Espacos: React.FC<EspacosProps> = ({ rotulo, preenchidos, total, ajuda, cor }) => (
  <div>
    <div className="flex items-baseline justify-between">
      <span className="text-xs font-bold uppercase tracking-wide text-ordem-text-secondary">
        {rotulo}
      </span>
      <span className="font-mono text-sm text-ordem-white">
        {preenchidos} / {total}
      </span>
    </div>
    <div className="mt-1 flex gap-1" title={ajuda}>
      {Array.from({ length: total }, (_, indice) => (
        <span
          key={indice}
          className={cn(
            'h-4 flex-1 rounded-sm border',
            indice < preenchidos ? cor : 'border-ordem-border bg-ordem-bg',
          )}
        />
      ))}
    </div>
  </div>
);

export interface PainelRecursosProps {
  ficha: FichaOp2;
  onAlterarPv?: (delta: number) => void;
  onAlterarPd?: (delta: number) => void;
  className?: string;
}

export const PainelRecursos: React.FC<PainelRecursosProps> = ({
  ficha,
  onAlterarPv,
  onAlterarPd,
  className,
}) => {
  const risco = estadoDeRisco(ficha);

  return (
    <div className={cn('space-y-4 rounded-lg border border-ordem-border bg-ordem-black p-4', className)}>
      <Barra
        rotulo="Pontos de Vida"
        atual={pvAtual(ficha)}
        maximo={ficha.pvMax}
        cor="bg-ordem-red"
        onAlterar={onAlterarPv}
      />
      <Barra
        rotulo="Pontos de Determinação"
        atual={pdAtual(ficha)}
        maximo={ficha.pdMax}
        cor="bg-ordem-blue"
        onAlterar={onAlterarPd}
      />

      {ficha.perfil.tipo === 'EXECUTOR' ? (
        <Espacos
          rotulo="Ímpeto"
          preenchidos={ficha.perfil.impetoPreenchido}
          total={MAXIMO_IMPETO}
          ajuda="Enche a cada teste falhado. 1 espaço dá +1 passo; 3 espaços aumentam um atributo até o fim da cena."
          cor="border-ordem-gold bg-ordem-gold"
        />
      ) : null}

      {ficha.perfil.tipo === 'ANALISTA' ? (
        <Espacos
          rotulo="Dados de Avaliação"
          preenchidos={ficha.perfil.avaliacaoDisponivel}
          total={MAXIMO_AVALIACAO}
          ajuda="Ganhos com a ação Avaliação (2 PD). Valem apenas em testes relativos ao ser ou ambiente observado."
          cor="border-ordem-cyan bg-ordem-cyan"
        />
      ) : null}

      {risco.precisaFerimento ? (
        <p className="rounded border border-ordem-red bg-ordem-red-dark/30 px-3 py-2 text-xs text-ordem-red-light">
          0 PV — teste de Ferimento (Físico + Vigor) contra DT {risco.dtFerimento}. Falhar é morrer.
        </p>
      ) : null}

      {risco.precisaTrauma ? (
        <p className="rounded border border-ordem-purple bg-ordem-purple/20 px-3 py-2 text-xs text-ordem-purple">
          0 PD — teste de Trauma (Emoção + Disciplina) contra DT {risco.dtTrauma}. Falhar é colapso mental.
        </p>
      ) : null}

      {ficha.sessao.passosDeCena.length > 0 ? (
        <div className="rounded border border-ordem-gold/50 bg-ordem-ooze px-3 py-2">
          <span className="text-xs uppercase tracking-wide text-ordem-text-muted">
            Ativos até o fim da cena
          </span>
          <ul className="mt-1 space-y-0.5">
            {ficha.sessao.passosDeCena.map((passo, indice) => (
              <li key={indice} className="text-xs text-ordem-text-secondary">
                {passo.delta > 0 ? '+' : ''}
                {passo.delta} passo em {passo.alvo} — {passo.motivo}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
};
