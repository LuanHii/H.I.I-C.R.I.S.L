'use client';

import React from 'react';
import { Search, X } from 'lucide-react';
import { Modal, ModalContent, ModalDescription, ModalTitle } from '../../ui/Modal';
import { Cantos, RotuloSecao } from './Pecas';

export interface SeletorModalProps {
  aberto: boolean;
  onFechar: () => void;
  rotulo: string;
  titulo: string;
  busca?: { valor: string; aoMudar: (v: string) => void; placeholder: string };
  filtros?: React.ReactNode;
  rodape?: React.ReactNode;
  largura?: 'md' | 'lg';
  classe?: string;
  children: React.ReactNode;
}

export const SELECT_DO_SELETOR =
  'border border-white/10 bg-black/30 px-2.5 py-1.5 font-carimbo text-[10px] uppercase tracking-[0.12em] text-ordem-text-secondary focus:border-[var(--mestre-primary,#DC2626)]/60 focus:outline-none';

export const CHIP_DO_SELETOR = (ativo: boolean) =>
  `border px-2 py-1 font-carimbo text-[10px] uppercase tracking-[0.14em] transition ${ativo
    ? 'border-[var(--mestre-primary,#DC2626)] bg-[var(--mestre-primary,#DC2626)]/15 text-white'
    : 'border-white/10 text-ordem-text-muted hover:border-white/30 hover:text-white'
  }`;

export function OpcaoDoSeletor({
  titulo,
  meta,
  descricao,
  rodape,
  selecionada,
  onClick,
}: {
  titulo: React.ReactNode;
  meta?: React.ReactNode;
  descricao?: React.ReactNode;
  rodape?: React.ReactNode;
  selecionada?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selecionada}
      className={`group w-full border px-3 py-2.5 text-left transition ${selecionada
        ? 'border-[var(--mestre-primary,#DC2626)] bg-[var(--mestre-primary,#DC2626)]/10'
        : 'border-white/10 bg-white/[0.02] hover:border-[var(--mestre-primary,#DC2626)]/70 hover:bg-white/[0.04]'
        }`}
    >
      <span className="flex items-start justify-between gap-3">
        <span className="text-sm font-semibold text-white">{titulo}</span>
        {meta && <span className="shrink-0">{meta}</span>}
      </span>
      {descricao && (
        <span className="mt-1 line-clamp-2 text-[12px] leading-snug text-ordem-text-secondary group-hover:line-clamp-none">
          {descricao}
        </span>
      )}
      {rodape && <span className="mt-1.5 block">{rodape}</span>}
    </button>
  );
}

export function SeletorModal({ aberto, onFechar, rotulo, titulo, busca, filtros, rodape, largura = 'lg', classe, children }: SeletorModalProps) {
  return (
    <Modal open={aberto} onOpenChange={(v) => { if (!v) onFechar(); }}>
      <ModalContent
        size="lg"
        showCloseButton={false}
        className={`w-full border-0 bg-transparent p-0 shadow-none ${largura === 'md' ? 'sm:max-w-md' : 'sm:max-w-2xl'}`}
      >
        <div data-classe={classe} className="relative flex max-h-[92dvh] flex-col overflow-hidden border border-white/10 bg-[var(--mestre-superficie,#16161a)] pb-[env(safe-area-inset-bottom)] shadow-[0_1px_0_0_rgba(255,255,255,0.05)_inset,0_40px_80px_-30px_rgba(0,0,0,1)] sm:max-h-[85vh] sm:pb-0">
          <Cantos />

          <div aria-hidden className="mx-auto mt-2 h-1 w-10 rounded-full bg-white/20 sm:hidden" />

          <header className="relative flex items-start justify-between gap-4 px-4 pt-4 sm:px-6 sm:pt-5">
            <div className="min-w-0">
              <ModalDescription asChild>
                <RotuloSecao>{rotulo}</RotuloSecao>
              </ModalDescription>
              <ModalTitle className="mt-1 font-display text-xl uppercase leading-none tracking-[0.06em] text-white sm:text-2xl">
                {titulo}
              </ModalTitle>
            </div>
            <button
              type="button"
              onClick={onFechar}
              aria-label="Fechar"
              className="grid h-10 w-10 shrink-0 place-items-center border border-white/10 text-ordem-text-muted transition hover:border-white/30 hover:text-white"
            >
              <X size={18} />
            </button>
          </header>

          {(busca || filtros) && (
            <div className="relative space-y-2 px-4 pt-3 sm:px-6 sm:pt-4">
              {busca && (
                <label className="flex items-center gap-2 border border-white/10 bg-black/30 px-2.5">
                  <Search size={13} className="shrink-0 text-ordem-text-muted" />
                  <input
                    type="text"
                    autoFocus
                    value={busca.valor}
                    onChange={(e) => busca.aoMudar(e.target.value)}
                    placeholder={busca.placeholder}
                    className="h-11 w-full bg-transparent text-sm text-white placeholder:text-ordem-text-muted focus:outline-none"
                  />
                </label>
              )}
              {filtros && <div className="flex flex-wrap items-center gap-1.5">{filtros}</div>}
            </div>
          )}

          <div className="relative flex-1 overflow-y-auto px-4 py-3 sm:px-6 sm:py-4">
            {children}
          </div>

          {rodape && (
            <footer className="relative flex items-center justify-between gap-3 border-t border-white/10 px-4 py-3 sm:px-6">
              {rodape}
            </footer>
          )}
        </div>
      </ModalContent>
    </Modal>
  );
}
