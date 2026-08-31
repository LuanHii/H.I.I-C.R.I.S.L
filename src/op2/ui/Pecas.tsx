'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { DiceStep, FichaOp2 } from '../regras/tipos';

export const ATMOSFERA = [
  'relative min-h-screen w-full overflow-x-clip bg-ordem-black text-white',
  'before:pointer-events-none before:fixed before:inset-0 before:z-0',
  'before:bg-[radial-gradient(ellipse_90%_45%_at_50%_-10%,rgba(220,38,38,0.16),transparent_70%),radial-gradient(ellipse_60%_40%_at_50%_115%,rgba(168,85,247,0.07),transparent_70%)]',
  'after:pointer-events-none after:fixed after:inset-0 after:z-0',
  'after:bg-[repeating-linear-gradient(0deg,rgba(255,255,255,0.014)_0px,rgba(255,255,255,0.014)_1px,transparent_1px,transparent_3px)]',
].join(' ');

export const CONTEUDO =
  'relative z-10 mx-auto w-full max-w-4xl px-4 py-6 sm:px-6 sm:py-8 safe-x safe-top safe-bottom';

export const PAINEL = [
  'relative overflow-hidden rounded-2xl',
  'border border-white/[0.07] bg-gradient-to-b from-white/[0.045] to-transparent',
  'shadow-[0_1px_0_0_rgba(255,255,255,0.06)_inset,0_18px_40px_-24px_rgba(0,0,0,0.9)]',
].join(' ');

export const SOMBRA_DE_LEITURA =
  '[text-shadow:0_1px_2px_rgba(0,0,0,0.95),0_2px_12px_rgba(0,0,0,0.7)]';

export const SOMBRA_DE_ELEMENTO = 'drop-shadow-[0_2px_6px_rgba(0,0,0,0.8)]';

export const CORES_DO_PERFIL: Record<FichaOp2['perfil']['tipo'], string> = {
  EXECUTOR: 'text-ordem-red-light border-ordem-red/40 bg-ordem-red/[0.14]',
  ANALISTA: 'text-ordem-cyan border-ordem-cyan/40 bg-ordem-cyan/[0.12]',
  VIGILANTE: 'text-ordem-green-muted border-ordem-green/40 bg-ordem-green/[0.12]',
};

export const CORES_DO_DADO: Record<DiceStep, string> = {
  d4: 'border-white/[0.07] bg-white/[0.02] text-white/35',
  d6: 'border-white/20 bg-white/[0.06] text-white/90',
  d8: 'border-white/25 bg-white/[0.09] text-white',
  d10: 'border-ordem-gold/45 bg-ordem-gold/[0.14] text-ordem-gold',
  d12: 'border-ordem-gold/60 bg-ordem-gold/20 text-ordem-gold',
  d20: 'border-ordem-red/60 bg-ordem-red/20 text-ordem-red-light',
};

export type TomDeRecurso = 'vida' | 'determinacao' | 'impeto' | 'avaliacao';

const TONS: Record<TomDeRecurso, { barra: string; brilho: string; texto: string; pip: string }> = {
  vida: {
    barra: 'bg-gradient-to-r from-ordem-red-dark via-ordem-red to-ordem-red-light',
    brilho: 'shadow-[0_0_12px_-1px_rgba(220,38,38,0.75)]',
    texto: 'text-ordem-red-light',
    pip: 'bg-ordem-red',
  },
  determinacao: {
    barra: 'bg-gradient-to-r from-ordem-blue via-ordem-purple to-ordem-purple',
    brilho: 'shadow-[0_0_12px_-1px_rgba(168,85,247,0.7)]',
    texto: 'text-ordem-purple',
    pip: 'bg-ordem-purple',
  },
  impeto: {
    barra: 'bg-gradient-to-r from-ordem-red-dark to-ordem-gold',
    brilho: 'shadow-[0_0_12px_-1px_rgba(255,215,0,0.6)]',
    texto: 'text-ordem-gold',
    pip: 'bg-ordem-gold',
  },
  avaliacao: {
    barra: 'bg-gradient-to-r from-ordem-blue to-ordem-cyan',
    brilho: 'shadow-[0_0_12px_-1px_rgba(34,211,238,0.6)]',
    texto: 'text-ordem-cyan',
    pip: 'bg-ordem-cyan',
  },
};

export const RotuloDeSecao: React.FC<{
  children: React.ReactNode;
  acessorio?: React.ReactNode;
  className?: string;
}> = ({ children, acessorio, className }) => (
  <div className={cn('flex items-center gap-3', className)}>
    <span className="shrink-0 font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-white/45">
      {children}
    </span>
    <span className="h-px flex-1 bg-gradient-to-r from-white/[0.12] to-transparent" />
    {acessorio ? <span className="shrink-0">{acessorio}</span> : null}
  </div>
);

export interface BarraDeRecursoProps {
  rotulo: string;
  atual: number;
  maximo: number;
  tom: TomDeRecurso;
  alerta?: boolean;
  compacta?: boolean;
  className?: string;
}

export const BarraDeRecurso: React.FC<BarraDeRecursoProps> = ({
  rotulo,
  atual,
  maximo,
  tom,
  alerta,
  compacta,
  className,
}) => {
  const paleta = TONS[tom];
  const percentual = maximo > 0 ? Math.max(0, Math.min(1, atual / maximo)) : 0;

  return (
    <div className={cn('min-w-0', className)}>
      <div className="flex items-baseline justify-between gap-2">
        <span className="truncate font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-white/50">
          {rotulo}
        </span>
        <span className="shrink-0 font-mono tabular-nums">
          <motion.span
            key={atual}
            initial={{ opacity: 0.3, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className={cn(
              'inline-block font-bold',
              compacta ? 'text-lg' : 'text-2xl',
              alerta ? paleta.texto : 'text-white',
            )}
          >
            {atual}
          </motion.span>
          <span className={cn('text-white/35', compacta ? 'text-xs' : 'text-sm')}>/{maximo}</span>
        </span>
      </div>

      <div
        className={cn(
          'mt-1.5 overflow-hidden rounded-full bg-black/70 ring-1 ring-inset ring-white/[0.09]',
          compacta ? 'h-2' : 'h-2.5',
        )}
      >
        <motion.div
          className={cn('h-full rounded-full', paleta.barra, percentual > 0 && paleta.brilho)}
          initial={false}
          animate={{ width: `${percentual * 100}%` }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        />
      </div>
    </div>
  );
};

export interface MedidorProps {
  rotulo: string;
  preenchidos: number;
  total: number;
  tom: TomDeRecurso;
  ajuda?: string;
  compacto?: boolean;
  className?: string;
}

export const Medidor: React.FC<MedidorProps> = ({
  rotulo,
  preenchidos,
  total,
  tom,
  ajuda,
  compacto,
  className,
}) => {
  const paleta = TONS[tom];

  return (
    <div className={cn('min-w-0', className)} title={ajuda}>
      <div className="flex items-baseline justify-between gap-2">
        <span className="truncate font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-white/50">
          {rotulo}
        </span>
        <span className="shrink-0 font-mono tabular-nums">
          <span className={cn('font-bold', compacto ? 'text-lg' : 'text-2xl', paleta.texto)}>
            {preenchidos}
          </span>
          <span className={cn('text-white/35', compacto ? 'text-xs' : 'text-sm')}>/{total}</span>
        </span>
      </div>

      <div className={cn('mt-1.5 flex gap-1.5', compacto ? 'h-2' : 'h-2.5')}>
        {Array.from({ length: total }, (_, indice) => (
          <span
            key={indice}
            className={cn(
              'flex-1 rounded-full ring-1 ring-inset transition-all duration-300',
              indice < preenchidos
                ? cn(paleta.pip, paleta.brilho, 'ring-white/25')
                : 'bg-black/70 ring-white/[0.09]',
            )}
          />
        ))}
      </div>
    </div>
  );
};

export const DistintivoDeDado: React.FC<{ dado: DiceStep; className?: string }> = ({
  dado,
  className,
}) => (
  <span
    className={cn(
      'inline-flex h-7 w-11 shrink-0 items-center justify-center rounded-md border font-mono text-xs font-bold tabular-nums',
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
      'inline-flex items-center rounded-md border px-2 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.12em]',
      className ?? 'border-white/[0.12] bg-white/[0.04] text-white/60',
    )}
  >
    {children}
  </span>
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
      'relative min-h-[2.75rem] whitespace-nowrap rounded-full px-5 font-mono text-[11px] font-bold uppercase tracking-[0.18em] transition-colors duration-200',
      ativo ? 'text-ordem-black' : 'text-white/45 hover:text-white/80',
    )}
  >
    {ativo ? (
      <motion.span
        layoutId="aba-ativa-op2"
        className="absolute inset-0 rounded-full bg-ordem-gold shadow-[0_0_20px_-4px_rgba(255,215,0,0.6)]"
        transition={{ type: 'spring', stiffness: 380, damping: 32 }}
      />
    ) : null}
    <span className="relative z-10">{children}</span>
  </button>
);

export const Aparecer: React.FC<{
  children: React.ReactNode;
  className?: string;
  atraso?: number;
}> = ({ children, className, atraso = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1], delay: atraso }}
    className={className}
  >
    {children}
  </motion.div>
);
