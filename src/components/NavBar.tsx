"use client";

import type { Route } from 'next';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

const LINKS: Array<{ label: string; href: Route }> = [
  { label: 'Novo Agente', href: '/agente/novo' },
  { label: 'Mestre', href: '/mestre' },
  { label: 'Fichas', href: '/mestre/fichas' },
];

export function NavBar() {
  const pathname = usePathname();
  const router = useRouter();
  const [canGoBack, setCanGoBack] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    setCanGoBack(window.history.length > 1);
  }, [pathname]);

  return (
    <nav className="fixed top-0 inset-x-0 z-[60] bg-ordem-black/85 backdrop-blur border-b border-ordem-white/10">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-4">
        <div className="font-mono text-ordem-green tracking-[0.5em] text-xs">C.R.I.S</div>
        <div className="flex flex-wrap gap-2 text-xs flex-1 justify-center">
          {LINKS.map((link) => {
            const active = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 py-2 border tracking-[0.3em] transition ${
                  active
                    ? 'border-ordem-green text-ordem-green'
                    : 'border-ordem-white/20 text-ordem-white/70 hover:border-ordem-white'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>
        <button
          type="button"
          onClick={() => canGoBack && router.back()}
          disabled={!canGoBack}
          className={`px-3 py-2 text-[10px] tracking-[0.3em] border ${
            canGoBack
              ? 'border-ordem-white/40 text-ordem-white hover:border-ordem-green'
              : 'border-ordem-white/10 text-ordem-white/40 cursor-not-allowed'
          }`}
        >
          VOLTAR
        </button>
      </div>
    </nav>
  );
}
