'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import type { DiceStep } from '../regras/tipos';

const FORMAS: Record<DiceStep, { corpo: string; facetas?: string }> = {
  d4: {
    corpo: 'M12 2.5 22 20.5H2Z',
    facetas: 'M12 2.5V20.5',
  },
  d6: {
    corpo: 'M4 4.5h16v16H4Z',
    facetas: 'M4 12.5h16M12 4.5v16',
  },
  d8: {
    corpo: 'M12 1.5 22 12l-10 10.5L2 12Z',
    facetas: 'M2 12h20M12 1.5v21',
  },
  d10: {
    corpo: 'M12 1.5 22 9.5l-3.5 13h-13L2 9.5Z',
    facetas: 'M12 1.5v13M2 9.5l10 5 10-5M5.5 22.5 12 14.5l6.5 8',
  },
  d12: {
    corpo: 'M12 1.5 22.5 9.2 18.5 21.5h-13L1.5 9.2Z',
    facetas: 'M12 6.5 16.8 10 15 15.6H9L7.2 10Z',
  },
  d20: {
    corpo: 'M12 1.5 21.5 7v10L12 22.5 2.5 17V7Z',
    facetas: 'M12 1.5 6 12h12ZM6 12l6 10.5L18 12ZM2.5 7 6 12l-3.5 5M21.5 7 18 12l3.5 5',
  },
};

export interface IconeDeDadoProps {
  dado: DiceStep;
  className?: string;
  tamanho?: number;
}

export const IconeDeDado: React.FC<IconeDeDadoProps> = ({ dado, className, tamanho = 20 }) => {
  const forma = FORMAS[dado];
  return (
    <svg
      viewBox="0 0 24 24"
      width={tamanho}
      height={tamanho}
      aria-hidden="true"
      focusable="false"
      className={cn('shrink-0', className)}
    >
      <path
        d={forma.corpo}
        fill="currentColor"
        fillOpacity={0.16}
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinejoin="round"
      />
      {forma.facetas ? (
        <path
          d={forma.facetas}
          fill="none"
          stroke="currentColor"
          strokeOpacity={0.5}
          strokeWidth={1}
          strokeLinejoin="round"
        />
      ) : null}
    </svg>
  );
};

export const NIVEIS_DO_DADO: Record<DiceStep, string> = {
  d4: 'text-white/30',
  d6: 'text-white/80',
  d8: 'text-ordem-cyan',
  d10: 'text-ordem-gold',
  d12: 'text-ordem-gold',
  d20: 'text-ordem-red-light',
};

export interface SeloDeDadoProps {
  dado: DiceStep;
  className?: string;
}

export const SeloDeDado: React.FC<SeloDeDadoProps> = ({ dado, className }) => (
  <span
    className={cn(
      'inline-flex shrink-0 items-center gap-1.5',
      NIVEIS_DO_DADO[dado],
      className,
    )}
  >
    <IconeDeDado dado={dado} tamanho={22} />
    <span className="font-mono text-xs font-bold tabular-nums">{dado}</span>
  </span>
);
