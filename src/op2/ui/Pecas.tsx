'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import type { DiceStep, FichaOp2 } from '../regras/tipos';

export const FUNDO_DA_PAGINA =
  'min-h-screen overflow-x-clip bg-ordem-black text-white bg-[radial-gradient(circle_at_top,rgba(139,0,0,0.18),transparent_34%),linear-gradient(rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.018)_1px,transparent_1px)] bg-[size:auto,32px_32px,32px_32px]';

export const CONTEUDO = 'w-full max-w-5xl mx-auto px-3 sm:px-4 py-4 sm:py-6 safe-x safe-top safe-bottom';

export const CARTAO = 'bg-ordem-ooze/30 border border-ordem-border rounded-xl p-3 sm:p-5';

export const LADRILHO = 'min-w-0 border border-white/10 bg-black/35 rounded-xl p-3';

export const SOMBRA_DE_LEITURA =
  '[text-shadow:0_1px_2px_rgba(0,0,0,0.95),0_2px_10px_rgba(0,0,0,0.75)]';

export const SOMBRA_DE_ELEMENTO = 'drop-shadow-[0_2px_6px_rgba(0,0,0,0.8)]';

export const CORES_DO_PERFIL: Record<FichaOp2['perfil']['tipo'], string> = {
  EXECUTOR: 'text-ordem-red border-ordem-red/30 bg-ordem-red/10',
  ANALISTA: 'text-ordem-blue border-ordem-blue/30 bg-ordem-blue/10',
  VIGILANTE: 'text-ordem-green border-ordem-green/30 bg-ordem-green/10',
};

export const CORES_DO_DADO: Record<DiceStep, string> = {
  d4: 'border-white/10 bg-black/40 text-ordem-text-muted',
  d6: 'border-ordem-green-muted/40 bg-ordem-green/10 text-ordem-green-muted',
  d8: 'border-ordem-cyan/40 bg-ordem-cyan/10 text-ordem-cyan',
  d10: 'border-ordem-gold/40 bg-ordem-gold/10 text-ordem-gold',
  d12: 'border-ordem-purple/40 bg-ordem-purple/10 text-ordem-purple',
  d20: 'border-ordem-red/40 bg-ordem-red/10 text-ordem-red-light',
};

export const RotuloDeSecao: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className,
}) => (
  <div
    className={cn(
      'text-[10px] sm:text-xs font-mono tracking-[0.25em] sm:tracking-[0.3em] text-ordem-text-muted uppercase',
      className,
    )}
  >
    {children}
  </div>
);

export interface PilulaDeRecursoProps {
  rotulo: string;
  atual: number;
  maximo: number;
  tom: string;
  alerta?: boolean;
}

export const PilulaDeRecurso: React.FC<PilulaDeRecursoProps> = ({
  rotulo,
  atual,
  maximo,
  tom,
  alerta,
}) => {
  const percentual = maximo > 0 ? Math.max(0, Math.min(100, (atual / maximo) * 100)) : 0;
  return (
    <div
      className={cn(
        'relative min-w-0 overflow-hidden rounded-lg border bg-black/45 px-3 py-2',
        alerta ? 'border-ordem-red/60' : 'border-white/10',
      )}
    >
      <div
        className={cn('absolute inset-y-0 left-0 opacity-20 transition-all duration-500', tom)}
        style={{ width: `${percentual}%` }}
      />
      <div className="relative z-10 text-[10px] font-mono tracking-widest text-ordem-text-muted uppercase">
        {rotulo}
      </div>
      <div
        className={cn(
          'relative z-10 text-lg font-bold leading-tight',
          alerta ? 'text-ordem-red-light' : 'text-white',
        )}
      >
        {atual}
        <span className="text-xs text-ordem-text-muted">/{maximo}</span>
      </div>
    </div>
  );
};

export interface PilulaDeEspacosProps {
  rotulo: string;
  preenchidos: number;
  total: number;
  tom: string;
  ajuda?: string;
}

export const PilulaDeEspacos: React.FC<PilulaDeEspacosProps> = ({
  rotulo,
  preenchidos,
  total,
  tom,
  ajuda,
}) => (
  <div
    className="min-w-0 rounded-lg border border-white/10 bg-black/45 px-3 py-2"
    title={ajuda}
  >
    <div className="text-[10px] font-mono tracking-widest text-ordem-text-muted uppercase">
      {rotulo}
    </div>
    <div className="mt-1.5 flex gap-1">
      {Array.from({ length: total }, (_, indice) => (
        <span
          key={indice}
          className={cn(
            'h-3.5 flex-1 rounded-sm border transition-colors',
            indice < preenchidos ? tom : 'border-white/10 bg-black/40',
          )}
        />
      ))}
    </div>
  </div>
);

export interface BotaoDeAbaProps {
  ativo: boolean;
  onClick: () => void;
  children: React.ReactNode;
}

export const BotaoDeAba: React.FC<BotaoDeAbaProps> = ({ ativo, onClick, children }) => (
  <button
    type="button"
    onClick={onClick}
    aria-pressed={ativo}
    className={cn(
      'whitespace-nowrap rounded-full border px-4 py-2 text-[10px] font-mono tracking-widest shadow-sm transition-all sm:px-6 sm:py-2.5 sm:text-xs',
      ativo
        ? 'border-ordem-gold bg-ordem-gold/15 text-ordem-gold shadow-[0_0_10px_rgba(234,179,8,0.2)]'
        : 'border-white/10 bg-black/40 text-ordem-white/50 hover:border-white/20 hover:bg-black/60 hover:text-white',
    )}
  >
    {children}
  </button>
);

export const DistintivoDeDado: React.FC<{ dado: DiceStep; className?: string }> = ({
  dado,
  className,
}) => (
  <span
    className={cn(
      'inline-flex w-12 shrink-0 items-center justify-center rounded-md border py-0.5 font-mono text-xs font-bold',
      CORES_DO_DADO[dado],
      className,
    )}
  >
    {dado}
  </span>
);

export const Distintivo: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className,
}) => (
  <span
    className={cn(
      'rounded border px-2 py-1 font-mono text-[10px] sm:text-xs',
      className ?? 'border-white/10 bg-black/40 text-ordem-text-secondary',
    )}
  >
    {children}
  </span>
);
