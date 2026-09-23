"use client";

import type { Route } from 'next';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ArrowLeft, Plus, ScrollText } from 'lucide-react';

const LINKS: Array<{ label: string; href: Route; discreto?: boolean }> = [
  { label: 'Novo Agente', href: '/agente/novo' },
  { label: 'Fichas', href: '/mestre/fichas' },
  { label: 'OP2', href: '/op2', discreto: true },
];

export function NavBar() {
  const pathname = usePathname();
  const router = useRouter();
  const [canGoBack, setCanGoBack] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    setCanGoBack(window.history.length > 1);
  }, [pathname]);

  const ativo = (href: string) => pathname === href || (href !== '/' && pathname.startsWith(href));
  const naInicial = pathname === '/';

  return (
    <>
      <a
        href="#conteudo-principal"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[70] focus:bg-ordem-black focus:text-ordem-white focus:px-3 focus:py-2 focus:rounded-md focus:border focus:border-ordem-border"
      >
        Pular para o conteúdo
      </a>
      <nav className="fixed inset-x-0 top-0 z-[60] border-b border-ordem-white/10 bg-ordem-black/85 pt-[env(safe-area-inset-top)] backdrop-blur">
        <div className="flex h-[52px] items-center gap-2 px-3 pr-[62px] sm:hidden">
          {!naInicial && canGoBack ? (
            <button
              type="button"
              onClick={() => router.back()}
              aria-label="Voltar"
              className="grid h-10 w-10 shrink-0 place-items-center border border-white/10 text-ordem-white/80 active:border-white/30"
            >
              <ArrowLeft size={17} />
            </button>
          ) : null}
          <Link href="/" className="flex-1 truncate font-mono text-xs tracking-[0.5em] text-ordem-green">
            C.R.I.S
          </Link>
          <Link
            href="/agente/novo"
            aria-label="Nova ficha"
            aria-current={ativo('/agente/novo') ? 'page' : undefined}
            className={`grid h-10 w-10 shrink-0 place-items-center border ${ativo('/agente/novo') ? 'border-ordem-green text-ordem-green' : 'border-white/10 text-ordem-white/80'}`}
          >
            <Plus size={18} />
          </Link>
          <Link
            href="/mestre/fichas"
            aria-label="Fichas"
            className="grid h-10 w-10 shrink-0 place-items-center border border-white/10 text-ordem-white/80"
          >
            <ScrollText size={17} />
          </Link>
        </div>

        <div className="mx-auto hidden max-w-6xl items-center gap-4 px-4 py-3 pr-36 sm:flex">
          <div className="font-mono text-xs tracking-[0.5em] text-ordem-green">C.R.I.S</div>
          <div className="flex flex-1 justify-center gap-2 text-xs">
            {LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                title={link.discreto ? 'Ordem Paranormal 2 — Playtest Alpha' : undefined}
                className={`whitespace-nowrap border px-3 py-2 tracking-[0.3em] transition ${ativo(link.href)
                  ? 'border-ordem-green text-ordem-green'
                  : link.discreto
                    ? 'border-ordem-white/10 text-ordem-white/40 hover:border-ordem-white/40 hover:text-ordem-white/70'
                    : 'border-ordem-white/20 text-ordem-white/70 hover:border-ordem-white'
                  }`}
              >
                {link.label}
              </Link>
            ))}
          </div>
          <button
            type="button"
            onClick={() => canGoBack && router.back()}
            disabled={!canGoBack}
            className={`shrink-0 border px-3 py-2 text-[10px] tracking-[0.3em] ${canGoBack
              ? 'border-ordem-white/40 text-ordem-white hover:border-ordem-green'
              : 'cursor-not-allowed border-ordem-white/10 text-ordem-white/40'
              }`}
          >
            VOLTAR
          </button>
        </div>
      </nav>
    </>
  );
}
