"use client";

import Link from 'next/link';
import type { ComponentProps } from 'react';
import { usePathname } from 'next/navigation';
import { LogOut, Home } from 'lucide-react';

type MestreTab = 'agentes' | 'ameacas' | 'inventario' | 'fichas';

function classNames(...parts: Array<string | false | undefined | null>) {
  return parts.filter(Boolean).join(' ');
}

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
      className={classNames(
        'px-3 sm:px-4 py-2.5 font-mono text-xs sm:text-sm border-b-2 transition-colors whitespace-nowrap touch-target-sm',
        active
          ? 'border-ordem-red text-white'
          : 'border-transparent text-ordem-text-secondary hover:text-ordem-white-muted active:text-white hover:border-ordem-border-light',
      )}
    >
      {label}
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
      className={classNames(
        'px-3 sm:px-4 py-2.5 font-mono text-xs sm:text-sm border-b-2 transition-colors whitespace-nowrap touch-target-sm',
        active
          ? 'border-ordem-red text-white'
          : 'border-transparent text-ordem-text-secondary hover:text-ordem-white-muted active:text-white hover:border-ordem-border-light',
      )}
    >
      {label}
    </button>
  );
}

export function MestreNavbar({
  title = 'MESTRE',
  subtitle = 'PAINEL DE CONTROLE',
  rightSlot,
  activeTab,
  onTabSelect,
}: {
  title?: string;
  subtitle?: string;
  rightSlot?: React.ReactNode;
  activeTab?: MestreTab;
  onTabSelect?: (tab: MestreTab) => void;
}) {
  const pathname = usePathname();

  const inFichas = pathname?.startsWith('/mestre/fichas');
  const inMestreRoot = pathname === '/mestre';
  const tab: MestreTab = activeTab ?? (inFichas ? 'fichas' : 'agentes');

  return (
    <header className="sticky top-0 z-50 min-h-[56px] sm:h-16 border-b border-ordem-border bg-ordem-black/95 backdrop-blur shrink-0 safe-top">
      <div className="h-full flex flex-col sm:flex-row sm:items-center sm:justify-between px-4 sm:px-6 py-2 sm:py-0 gap-2 sm:gap-0">
        {/* Logo e título + ações (mobile) */}
        <div className="flex items-center justify-between sm:justify-start gap-4 sm:gap-8">
          <div className="flex flex-col shrink-0">
            <h1 className="text-lg sm:text-xl font-serif text-ordem-red tracking-wider leading-none">{title}</h1>
            <span className="text-[9px] sm:text-[10px] text-ordem-text-secondary font-mono tracking-[0.15em] sm:tracking-[0.2em]">{subtitle}</span>
          </div>

          {/* Ações em mobile - aparecem no canto direito */}
          <div className="flex sm:hidden items-center gap-2">
            {rightSlot}
            <Link
              href="/"
              className="p-2 text-ordem-text-secondary hover:text-white active:text-ordem-red transition-colors touch-target-sm"
              aria-label="Sair"
            >
              <Home size={20} />
            </Link>
          </div>
        </div>

        {/* Navegação - scroll horizontal em mobile */}
        <nav className="flex items-center gap-0.5 sm:gap-1 overflow-x-auto touch-scroll custom-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0 no-select">
          {onTabSelect && inMestreRoot ? (
            <>
              <MestreButton label="AGENTES" active={tab === 'agentes'} onClick={() => onTabSelect('agentes')} />
              <MestreButton label="AMEAÇAS" active={tab === 'ameacas'} onClick={() => onTabSelect('ameacas')} />
              <MestreButton label="INVENTÁRIO" active={tab === 'inventario'} onClick={() => onTabSelect('inventario')} />
              <MestreLink href="/mestre/fichas" label="FICHAS" active={false} />
            </>
          ) : (
            <>
              <MestreLink href={{ pathname: '/mestre', query: { tab: 'agentes' } }} label="AGENTES" active={inMestreRoot && tab === 'agentes'} />
              <MestreLink href={{ pathname: '/mestre', query: { tab: 'ameacas' } }} label="AMEAÇAS" active={inMestreRoot && tab === 'ameacas'} />
              <MestreLink href={{ pathname: '/mestre', query: { tab: 'inventario' } }} label="INVENTÁRIO" active={inMestreRoot && tab === 'inventario'} />
              <MestreLink href="/mestre/fichas" label="FICHAS" active={inFichas} />
            </>
          )}
        </nav>

        {/* Ações em desktop */}
        <div className="hidden sm:flex items-center gap-3">
          {rightSlot}
          <Link
            href="/"
            className="text-xs font-mono text-ordem-text-secondary hover:text-white active:text-ordem-red transition-colors flex items-center gap-1.5 touch-target-sm"
          >
            <LogOut size={14} />
            SAIR
          </Link>
        </div>
      </div>
    </header>
  );
}
