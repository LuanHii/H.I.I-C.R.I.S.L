'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import type { DadoRolado, ResultadoTeste } from '../regras/rolagem';

interface DadoProps {
  dado: DadoRolado;
}

const Dado: React.FC<DadoProps> = ({ dado }) => (
  <div
    className={cn(
      'flex flex-col items-center justify-center rounded-md border-2 px-3 py-2 min-w-[3.25rem] transition-opacity',
      dado.somado
        ? 'border-ordem-green bg-ordem-ooze text-ordem-white'
        : 'border-ordem-border bg-ordem-bg text-ordem-text-muted opacity-60',
      dado.substituido && 'border-ordem-gold',
    )}
    title={`${dado.motivo} · d${dado.faces}${dado.somado ? '' : ' · descartado da soma'}`}
  >
    <span className="text-xl font-bold leading-none">{dado.valor}</span>
    <span className="mt-1 text-[0.6rem] uppercase tracking-wide">d{dado.faces}</span>
  </div>
);

interface SeloProps {
  resultado: ResultadoTeste;
}

const Selo: React.FC<SeloProps> = ({ resultado }) => {
  if (resultado.critico === 'sucesso') {
    return (
      <span className="rounded bg-ordem-gold px-2 py-1 text-xs font-bold uppercase tracking-wider text-ordem-black">
        Sucesso crítico
      </span>
    );
  }
  if (resultado.critico === 'falha') {
    return (
      <span className="rounded bg-ordem-red px-2 py-1 text-xs font-bold uppercase tracking-wider text-ordem-white">
        Falha crítica
      </span>
    );
  }
  return (
    <span
      className={cn(
        'rounded px-2 py-1 text-xs font-bold uppercase tracking-wider',
        resultado.sucesso
          ? 'bg-ordem-green text-ordem-black'
          : 'bg-ordem-ooze text-ordem-text-secondary',
      )}
    >
      {resultado.sucesso ? 'Sucesso' : 'Falha'}
    </span>
  );
};

export interface ResultadoTesteProps {
  resultado: ResultadoTeste;
  rotulo?: string;
  className?: string;
}

export const ResultadoTesteView: React.FC<ResultadoTesteProps> = ({
  resultado,
  rotulo,
  className,
}) => {
  const passouPelaSoma = resultado.critico === null;

  return (
    <div className={cn('rounded-lg border border-ordem-border bg-ordem-black p-4', className)}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-baseline gap-2">
          {rotulo ? (
            <span className="text-sm uppercase tracking-wide text-ordem-text-secondary">{rotulo}</span>
          ) : null}
          <span className="text-3xl font-bold text-ordem-white">{resultado.soma}</span>
          <span className="text-sm text-ordem-text-muted">vs DT {resultado.dt}</span>
        </div>
        <Selo resultado={resultado} />
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {resultado.dados.map((dado, indice) => (
          <Dado key={`${dado.origem}-${indice}`} dado={dado} />
        ))}
      </div>

      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-ordem-text-muted">
        <span>
          RA <strong className="text-ordem-text-secondary">{resultado.ra}</strong>
        </span>
        <span>
          RB <strong className="text-ordem-text-secondary">{resultado.rb}</strong>
        </span>
        {resultado.descartados.length > 0 ? (
          <span>
            {resultado.descartados.length} dado(s) fora da soma, mas dentro da RA/RB
          </span>
        ) : null}
        {!passouPelaSoma ? <span>O crítico decide o teste, a soma não</span> : null}
        {resultado.extrasIgnorados.length > 0 ? (
          <span className="text-ordem-red-light">
            {resultado.extrasIgnorados.length} extra(s) não couberam no limite de 4 dados
          </span>
        ) : null}
      </div>
    </div>
  );
};
