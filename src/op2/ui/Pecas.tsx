'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { DiceStep } from '../regras/tipos';
import { IconeDeDado, NIVEIS_DO_DADO } from './Dados';
import { TONS, type TemaDePerfil, type TomDeRecurso } from './tema';

export const BASE_DA_PAGINA = 'relative min-h-screen w-full overflow-x-clip bg-ordem-black text-white';

export const TRAMA =
  'pointer-events-none fixed inset-0 z-0 bg-[repeating-linear-gradient(0deg,rgba(255,255,255,0.016)_0px,rgba(255,255,255,0.016)_1px,transparent_1px,transparent_3px)]';

export const VINHETA =
  'pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(ellipse_at_center,transparent_45%,rgba(0,0,0,0.75)_100%)]';

export const CONTEUDO =
  'relative z-10 mx-auto w-full max-w-3xl px-4 py-6 sm:px-6 sm:py-10 safe-x safe-top safe-bottom';

export const PAINEL = [
  'relative overflow-hidden rounded-2xl',
  'border border-white/[0.08] bg-white/[0.025]',
  'shadow-[0_1px_0_0_rgba(255,255,255,0.07)_inset,0_24px_50px_-30px_rgba(0,0,0,1)]',
].join(' ');

export const SOMBRA_DE_LEITURA =
  '[text-shadow:0_1px_2px_rgba(0,0,0,0.95),0_2px_12px_rgba(0,0,0,0.7)]';

export const SOMBRA_DE_ELEMENTO = 'drop-shadow-[0_2px_6px_rgba(0,0,0,0.85)]';

export const CORES_DO_DADO: Record<DiceStep, string> = NIVEIS_DO_DADO;

export const RotuloDeSecao: React.FC<{
  children: React.ReactNode;
  tema?: TemaDePerfil;
  acessorio?: React.ReactNode;
  className?: string;
}> = ({ children, tema, acessorio, className }) => (
  <div className={cn('flex items-center gap-3', className)}>
    <span
      className={cn(
        'shrink-0 font-mono text-[10px] font-bold uppercase tracking-[0.32em]',
        tema ? tema.texto : 'text-white/45',
      )}
    >
      {children}
    </span>
    <span
      className={cn(
        'h-px flex-1 bg-gradient-to-r to-transparent',
        tema ? tema.regua : 'from-white/[0.14]',
      )}
    />
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
  const proporcao = maximo > 0 ? Math.max(0, Math.min(1, atual / maximo)) : 0;

  return (
    <div className={cn('min-w-0', className)}>
      <div className="flex items-end justify-between gap-3">
        <span
          className={cn(
            'truncate font-mono text-[10px] font-bold uppercase tracking-[0.26em]',
            alerta ? paleta.texto : 'text-white/45',
          )}
        >
          {rotulo}
        </span>
        <span className="shrink-0 font-mono leading-none tabular-nums">
          <motion.span
            key={atual}
            initial={{ opacity: 0.25, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className={cn(
              'inline-block font-bold',
              compacta ? 'text-xl' : 'text-3xl',
              alerta ? paleta.texto : 'text-white',
            )}
          >
            {atual}
          </motion.span>
          <span className={cn('text-white/30', compacta ? 'text-xs' : 'text-base')}>
            /{maximo}
          </span>
        </span>
      </div>

      <div
        className={cn(
          'mt-2 overflow-hidden rounded-full ring-1 ring-inset ring-white/[0.08]',
          paleta.trilho,
          compacta ? 'h-2' : 'h-3',
        )}
      >
        <motion.div
          className={cn('h-full rounded-full', paleta.barra, proporcao > 0 && paleta.brilho)}
          initial={false}
          animate={{ width: `${proporcao * 100}%` }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
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
      <div className="flex items-end justify-between gap-3">
        <span className="truncate font-mono text-[10px] font-bold uppercase tracking-[0.26em] text-white/45">
          {rotulo}
        </span>
        <span className="shrink-0 font-mono leading-none tabular-nums">
          <span className={cn('font-bold', compacto ? 'text-xl' : 'text-3xl', paleta.texto)}>
            {preenchidos}
          </span>
          <span className={cn('text-white/30', compacto ? 'text-xs' : 'text-base')}>/{total}</span>
        </span>
      </div>

      <div className={cn('mt-2 flex gap-2', compacto ? 'h-2' : 'h-3')}>
        {Array.from({ length: total }, (_, indice) => (
          <span
            key={indice}
            className={cn(
              'flex-1 rounded-full ring-1 ring-inset transition-all duration-300',
              indice < preenchidos
                ? cn(paleta.barra, paleta.brilho, 'ring-white/25')
                : cn(paleta.trilho, 'ring-white/[0.08]'),
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
  <span className={cn('inline-flex shrink-0 items-center gap-2', NIVEIS_DO_DADO[dado], className)}>
    <IconeDeDado dado={dado} tamanho={24} />
    <span className="w-6 font-mono text-xs font-bold tabular-nums">{dado}</span>
  </span>
);

export const Distintivo: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className,
}) => (
  <span
    className={cn(
      'inline-flex items-center rounded-md border px-2 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.14em]',
      className ?? 'border-white/[0.12] bg-white/[0.04] text-white/60',
    )}
  >
    {children}
  </span>
);

export interface BotaoDeAbaProps {
  ativo: boolean;
  onClick: () => void;
  tema: TemaDePerfil;
  children: React.ReactNode;
}

export const BotaoDeAba: React.FC<BotaoDeAbaProps> = ({ ativo, onClick, tema, children }) => (
  <button
    type="button"
    onClick={onClick}
    aria-pressed={ativo}
    className={cn(
      'relative min-h-[2.75rem] whitespace-nowrap rounded-lg px-4 font-mono text-[11px] font-bold uppercase tracking-[0.2em] transition-colors duration-200',
      ativo ? tema.texto : 'text-white/35 hover:text-white/70',
    )}
  >
    {ativo ? (
      <motion.span
        layoutId="aba-ativa-op2"
        className={cn('absolute inset-0 rounded-lg border', tema.borda, tema.fundo)}
        transition={{ type: 'spring', stiffness: 400, damping: 34 }}
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
    initial={{ opacity: 0, y: 14 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1], delay: atraso }}
    className={className}
  >
    {children}
  </motion.div>
);

export { TONS, type TomDeRecurso, type TemaDePerfil };
