'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import type { ClasseName } from '@/core/types';

export const TOM_DE_RECURSO = {
  pv: { rotulo: 'Pontos de Vida', curto: 'PV', cheio: 'bg-ordem-red', vazio: 'bg-ordem-red/12', texto: 'text-ordem-red' },
  pe: { rotulo: 'Pontos de Esforço', curto: 'PE', cheio: 'bg-ordem-gold', vazio: 'bg-ordem-gold/12', texto: 'text-ordem-gold' },
  san: { rotulo: 'Sanidade', curto: 'SAN', cheio: 'bg-ordem-blue', vazio: 'bg-ordem-blue/12', texto: 'text-ordem-blue' },
  pd: { rotulo: 'Determinação', curto: 'PD', cheio: 'bg-ordem-purple', vazio: 'bg-ordem-purple/12', texto: 'text-ordem-purple' },
} as const;

export type TomDeRecurso = keyof typeof TOM_DE_RECURSO;

export function Cantos() {
  return (
    <>
      <span aria-hidden className="mestre-canto mestre-canto-se" />
      <span aria-hidden className="mestre-canto mestre-canto-sd" />
      <span aria-hidden className="mestre-canto mestre-canto-ie" />
      <span aria-hidden className="mestre-canto mestre-canto-id" />
    </>
  );
}

export function Painel({
  children,
  cantos = false,
  aura = false,
  className,
  ...resto
}: React.HTMLAttributes<HTMLDivElement> & { cantos?: boolean; aura?: boolean }) {
  return (
    <div
      className={cn(
        'relative border border-white/10 bg-[var(--mestre-superficie,#16161a)]',
        'shadow-[0_1px_0_0_rgba(255,255,255,0.04)_inset,0_24px_50px_-32px_rgba(0,0,0,1)]',
        className,
      )}
      {...resto}
    >
      {aura && <span aria-hidden className="mestre-aura pointer-events-none absolute inset-0" />}
      {cantos && <Cantos />}
      <div className="relative">{children}</div>
    </div>
  );
}

export function Fita({
  children,
  variante = 'neutra',
  className,
}: {
  children: React.ReactNode;
  variante?: 'classe' | 'neutra' | 'alerta' | 'contorno';
  className?: string;
}) {
  return (
    <span
      className={cn(
        'inline-flex -rotate-1 items-center px-2 py-0.5 font-carimbo text-[10px] uppercase tracking-[0.16em] shadow-[0_2px_8px_rgba(0,0,0,0.6)]',
        variante === 'classe' && 'bg-[var(--mestre-primary,#DC2626)] text-black',
        variante === 'neutra' && 'bg-white/[0.07] text-ordem-text-secondary',
        variante === 'alerta' && 'bg-ordem-red text-white',
        variante === 'contorno' &&
          'border border-[var(--mestre-primary,#DC2626)] text-[var(--mestre-primary,#DC2626)]',
        className,
      )}
    >
      {children}
    </span>
  );
}

export function RotuloSecao({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={cn('font-carimbo text-[10px] uppercase tracking-[0.22em] text-ordem-text-muted', className)}>
      {children}
    </span>
  );
}

export function BarraSegmentada({
  tom,
  atual,
  max,
  segmentos = 12,
  className,
}: {
  tom: TomDeRecurso;
  atual: number;
  max: number;
  segmentos?: number;
  className?: string;
}) {
  const { cheio, vazio } = TOM_DE_RECURSO[tom];
  const proporcao = max > 0 ? Math.max(0, Math.min(1, atual / max)) : 0;
  const acesos = Math.round(proporcao * segmentos);

  return (
    <div className={cn('flex h-1.5 gap-[3px]', className)} aria-hidden>
      {Array.from({ length: segmentos }, (_, i) => (
        <span key={i} className={cn('flex-1', i < acesos ? cheio : vazio)} />
      ))}
    </div>
  );
}

export function Recurso({
  tom,
  atual,
  max,
  compacto = false,
  segmentos,
}: {
  tom: TomDeRecurso;
  atual: number;
  max: number;
  compacto?: boolean;
  segmentos?: number;
}) {
  const { rotulo, curto, texto } = TOM_DE_RECURSO[tom];

  return (
    <div className="min-w-0">
      <div className={cn('flex items-baseline gap-1.5', !compacto && 'justify-between')}>
        <RotuloSecao className={compacto ? texto : undefined}>{compacto ? curto : rotulo}</RotuloSecao>
        <span className="font-mono tabular-nums leading-none">
          <span className={cn(compacto ? 'text-sm' : 'text-2xl font-bold', texto)}>{atual}</span>
          <span className="text-[11px] text-ordem-text-muted">/{max}</span>
        </span>
      </div>
      <BarraSegmentada tom={tom} atual={atual} max={max} segmentos={segmentos ?? (compacto ? 10 : 16)} className="mt-1.5" />
    </div>
  );
}

export function classeDoTema(classe: ClasseName | string | undefined): string {
  return classe ?? 'Combatente';
}

export function iniciaisDoNome(nome: string): string {
  return (
    nome
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((parte) => parte.charAt(0).toUpperCase())
      .join('') || '?'
  );
}
