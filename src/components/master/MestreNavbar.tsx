'use client';

import Link from 'next/link';
import type { ComponentProps } from 'react';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { Home } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ABAS_MESTRE, hrefAbaMestre, type AbaMestre } from './AbasDoMestre';

function MestreLink({
  href,
  label,
  active,
}: {
  href: ComponentProps<typeof Link>['href'];
  label: string;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      prefetch={false}
      aria-current={active ? 'page' : undefined}
      className={cn(
        'relative inline-flex min-h-11 items-center px-2 xl:px-4 py-2.5 font-mono text-sm transition-colors whitespace-nowrap',
        active ? 'text-white' : 'text-ordem-text-secondary hover:text-ordem-white-muted',
      )}
    >
      {label}
      {active && (
        <motion.div
          layoutId="nav-indicator"
          className="absolute bottom-0 left-0 right-0 h-0.5 bg-ordem-red"
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        />
      )}
    </Link>
  );
}

export function MestreNavbar({
  title = 'MESTRE',
  subtitle = 'PAINEL DE CONTROLE',
  rightSlot,
  slotMobile,
  activeTab,
  voltarPara,
}: {
  title?: string;
  subtitle?: string;
  rightSlot?: React.ReactNode;
  slotMobile?: React.ReactNode;
  activeTab?: AbaMestre;
  voltarPara?: ComponentProps<typeof Link>['href'];
}) {
  const pathname = usePathname();

  const inFichas = pathname?.startsWith('/mestre/fichas');
  const inMestreRoot = pathname === '/mestre';
  const tab: AbaMestre = activeTab ?? (inFichas ? 'fichas' : 'ameacas');

  return (
    <header className="sticky top-0 z-50 shrink-0 border-b border-ordem-border bg-ordem-black/95 pt-[env(safe-area-inset-top)] backdrop-blur lg:pt-0">
      <div className="flex h-[52px] items-center gap-2 px-3 pr-[62px] lg:hidden">
        <Link
          href={voltarPara ?? '/'}
          aria-label={voltarPara ? 'Voltar' : 'Voltar ao início'}
          className="grid h-10 w-10 shrink-0 place-items-center border border-white/10 text-ordem-text-secondary transition active:border-white/30 active:text-white"
        >
          <Home size={17} />
        </Link>
        <div className="min-w-0 flex-1">
          <div className="truncate font-serif text-base leading-tight tracking-wide text-ordem-red">{title}</div>
          <div className="truncate font-mono text-[9px] leading-tight tracking-[0.15em] text-ordem-text-secondary">{subtitle}</div>
        </div>
        {(slotMobile ?? rightSlot) && <div className="flex shrink-0 items-center gap-1.5">{slotMobile ?? rightSlot}</div>}
      </div>

      <div className="hidden h-16 items-center justify-between gap-2 px-3 xl:gap-6 xl:px-6 lg:flex">
        <div className="flex min-w-0 items-center gap-3 xl:gap-8">
          <div className="flex min-w-0 flex-col">
            <h1 className="truncate font-serif text-xl leading-none tracking-wider text-ordem-red">{title}</h1>
            <span className="truncate font-mono text-[10px] tracking-[0.2em] text-ordem-text-secondary">{subtitle}</span>
          </div>

          <nav aria-label="Seções do mestre" className="flex items-center gap-1">
            {ABAS_MESTRE.map(({ id, rotulo }) => (
              <MestreLink key={id} href={hrefAbaMestre(id)} label={rotulo.toLocaleUpperCase('pt-BR')} active={tab === id && (inMestreRoot || Boolean(inFichas))} />
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-3 pr-[124px]">
          {slotMobile ? <><div className="2xl:hidden">{slotMobile}</div><div className="hidden 2xl:block">{rightSlot}</div></> : rightSlot}
          <Link
            href="/"
            title="Voltar ao início do site"
            className="flex items-center gap-1.5 font-mono text-xs text-ordem-text-secondary transition-colors hover:text-white"
          >
            <Home size={14} />
            INÍCIO
          </Link>
        </div>
      </div>
    </header>
  );
}
