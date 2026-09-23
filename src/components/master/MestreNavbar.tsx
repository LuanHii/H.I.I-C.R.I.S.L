'use client';

import Link from 'next/link';
import type { ComponentProps } from 'react';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { Home } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { AbaMestre } from './AbasDoMestre';

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
      className={cn(
        'relative px-4 py-2.5 font-mono text-sm transition-colors whitespace-nowrap',
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

function MestreButton({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'relative px-4 py-2.5 font-mono text-sm transition-colors whitespace-nowrap',
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
    </button>
  );
}

export function MestreNavbar({
  title = 'MESTRE',
  subtitle = 'PAINEL DE CONTROLE',
  rightSlot,
  slotMobile,
  activeTab,
  onTabSelect,
  voltarPara,
}: {
  title?: string;
  subtitle?: string;
  rightSlot?: React.ReactNode;
  slotMobile?: React.ReactNode;
  activeTab?: AbaMestre;
  onTabSelect?: (tab: AbaMestre) => void;
  voltarPara?: ComponentProps<typeof Link>['href'];
}) {
  const pathname = usePathname();

  const inFichas = pathname?.startsWith('/mestre/fichas');
  const inMestreRoot = pathname === '/mestre';
  const tab: AbaMestre = activeTab ?? (inFichas ? 'fichas' : 'ameacas');

  return (
    <header className="sticky top-0 z-50 shrink-0 border-b border-ordem-border bg-ordem-black/95 backdrop-blur">
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

      <div className="hidden h-16 items-center justify-between gap-6 px-6 lg:flex">
        <div className="flex items-center gap-8">
          <div className="flex shrink-0 flex-col">
            <h1 className="font-serif text-xl leading-none tracking-wider text-ordem-red">{title}</h1>
            <span className="font-mono text-[10px] tracking-[0.2em] text-ordem-text-secondary">{subtitle}</span>
          </div>

          <nav className="flex items-center gap-1">
            {onTabSelect && inMestreRoot ? (
              <>
                <MestreButton label="AMEAÇAS" active={tab === 'ameacas'} onClick={() => onTabSelect('ameacas')} />
                <MestreButton label="COMBATE" active={tab === 'combate'} onClick={() => onTabSelect('combate')} />
                <MestreButton label="INVENTÁRIO" active={tab === 'inventario'} onClick={() => onTabSelect('inventario')} />
                <MestreButton label="GUIA" active={tab === 'guia'} onClick={() => onTabSelect('guia')} />
                <MestreButton label="NPCs" active={tab === 'npcs'} onClick={() => onTabSelect('npcs')} />
                <MestreLink href="/mestre/fichas" label="FICHAS" active={false} />
              </>
            ) : (
              <>
                <MestreLink href="/mestre?tab=ameacas" label="AMEAÇAS" active={inMestreRoot && tab === 'ameacas'} />
                <MestreLink href="/mestre?tab=combate" label="COMBATE" active={inMestreRoot && tab === 'combate'} />
                <MestreLink href="/mestre?tab=inventario" label="INVENTÁRIO" active={inMestreRoot && tab === 'inventario'} />
                <MestreLink href="/mestre?tab=guia" label="GUIA" active={inMestreRoot && tab === 'guia'} />
                <MestreLink href="/mestre?tab=npcs" label="NPCs" active={inMestreRoot && tab === 'npcs'} />
                <MestreLink href="/mestre/fichas" label="FICHAS" active={inFichas} />
              </>
            )}
          </nav>
        </div>

        <div className="flex items-center gap-3 pr-[124px]">
          {rightSlot}
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
