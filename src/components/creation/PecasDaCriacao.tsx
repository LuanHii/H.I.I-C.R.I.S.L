'use client';

import React from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { RotuloSecao } from '../master/ui/Pecas';

export function TituloDaEtapa({ numero, titulo, descricao, children }: { numero: number; titulo: string; descricao?: React.ReactNode; children?: React.ReactNode }) {
  return (
    <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        <RotuloSecao>Etapa {numero}</RotuloSecao>
        <h2 className="mt-1 font-display text-2xl font-bold leading-none tracking-wide text-white sm:text-3xl">{titulo}</h2>
        {descricao && <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ordem-text-secondary">{descricao}</p>}
      </div>
      {children && <div className="shrink-0">{children}</div>}
    </div>
  );
}

export function Contador({ atual, total, rotulo, className }: { atual: number; total: number; rotulo: string; className?: string }) {
  const completo = atual === total;
  const excedeu = atual > total;
  return (
    <div
      className={cn(
        'inline-flex items-baseline gap-2 border px-3 py-1.5',
        excedeu ? 'border-ordem-red/60 text-ordem-red' : completo ? 'border-ordem-green/60 text-ordem-green' : 'border-white/15 text-ordem-text-secondary',
        className,
      )}
    >
      <span className="font-carimbo text-[10px] uppercase tracking-[0.18em]">{rotulo}</span>
      <span className="font-mono text-sm tabular-nums">
        <span className="text-white">{atual}</span>
        <span className="opacity-60">/{total}</span>
      </span>
    </div>
  );
}

export function Cartao({
  selecionado,
  onClick,
  children,
  className,
  compacto = false,
  desabilitado = false,
  titulo,
}: {
  selecionado: boolean;
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
  compacto?: boolean;
  desabilitado?: boolean;
  titulo?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={desabilitado}
      aria-pressed={selecionado}
      title={titulo}
      className={cn(
        'group relative w-full border text-left transition',
        compacto ? 'px-3 py-2.5' : 'p-4',
        selecionado
          ? 'border-[var(--mestre-primary,#DC2626)] bg-white/[0.04] shadow-[0_0_0_1px_var(--mestre-primary,#DC2626)_inset,0_18px_40px_-28px_var(--mestre-glow,transparent)]'
          : 'border-white/10 bg-white/[0.015] hover:border-white/30',
        desabilitado && 'cursor-not-allowed opacity-40',
        className,
      )}
    >
      {selecionado && (
        <span className="absolute right-2 top-2 grid h-5 w-5 place-items-center bg-[var(--mestre-primary,#DC2626)] text-black">
          <Check size={12} strokeWidth={3} />
        </span>
      )}
      {children}
    </button>
  );
}

export function Chip({ ativo, onClick, children, desabilitado = false, tom = 'primario', titulo }: {
  ativo: boolean;
  onClick: () => void;
  children: React.ReactNode;
  desabilitado?: boolean;
  tom?: 'primario' | 'neutro';
  titulo?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={desabilitado}
      aria-pressed={ativo}
      title={titulo}
      className={cn(
        'border px-3 py-2 font-mono text-xs transition touch-target-sm',
        ativo
          ? tom === 'primario'
            ? 'border-[var(--mestre-primary,#DC2626)] bg-[var(--mestre-primary,#DC2626)]/15 text-white'
            : 'border-white/40 bg-white/10 text-white'
          : 'border-white/10 text-ordem-text-secondary hover:border-white/30 hover:text-white',
        desabilitado && 'cursor-not-allowed opacity-35 hover:border-white/10 hover:text-ordem-text-secondary',
      )}
    >
      {children}
    </button>
  );
}

export function Campo({ rotulo, dica, children }: { rotulo: string; dica?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="flex items-baseline justify-between gap-2">
        <RotuloSecao>{rotulo}</RotuloSecao>
        {dica && <span className="font-mono text-[10px] text-ordem-text-muted">{dica}</span>}
      </span>
      <span className="mt-1.5 block">{children}</span>
    </label>
  );
}

export const ENTRADA =
  'w-full border border-white/15 bg-black/40 px-3 py-3 font-mono text-sm text-white outline-none transition placeholder:text-ordem-text-muted focus:border-[var(--mestre-primary,#DC2626)]';

export function Selecao<T extends string | number>({ valor, opcoes, onChange, rotuloDe, className }: {
  valor: T;
  opcoes: readonly T[];
  onChange: (v: T) => void;
  rotuloDe?: (v: T) => string;
  className?: string;
}) {
  return (
    <div className={cn('flex flex-wrap gap-1.5', className)}>
      {opcoes.map((o) => (
        <Chip key={String(o)} ativo={o === valor} onClick={() => onChange(o)}>
          {rotuloDe ? rotuloDe(o) : String(o)}
        </Chip>
      ))}
    </div>
  );
}

export function Aviso({ children, tom = 'alerta' }: { children: React.ReactNode; tom?: 'alerta' | 'info' | 'ok' }) {
  return (
    <div
      className={cn(
        'border-l-2 px-3 py-2 text-sm',
        tom === 'alerta' && 'border-ordem-red bg-ordem-red/10 text-red-200',
        tom === 'info' && 'border-ordem-gold bg-ordem-gold/10 text-ordem-gold',
        tom === 'ok' && 'border-ordem-green bg-ordem-green/10 text-ordem-green',
      )}
    >
      {children}
    </div>
  );
}
