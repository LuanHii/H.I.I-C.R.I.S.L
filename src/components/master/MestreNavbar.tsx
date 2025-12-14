"use client";

import Link from 'next/link';
import type { ComponentProps } from 'react';
import { usePathname } from 'next/navigation';

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
        'px-4 py-2 font-mono text-sm border-b-2 transition-colors',
        active
          ? 'border-ordem-red text-white'
          : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-700',
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
        'px-4 py-2 font-mono text-sm border-b-2 transition-colors',
        active
          ? 'border-ordem-red text-white'
          : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-700',
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
    <header className="sticky top-0 z-50 h-16 border-b border-gray-800 bg-black/95 backdrop-blur flex items-center px-6 shrink-0 justify-between">
      <div className="flex items-center gap-8 min-w-0">
        <div className="flex flex-col shrink-0">
          <h1 className="text-xl font-serif text-ordem-red tracking-wider leading-none">{title}</h1>
          <span className="text-[10px] text-gray-400 font-mono tracking-[0.2em]">{subtitle}</span>
        </div>

        <nav className="flex items-center gap-1 overflow-x-auto custom-scrollbar">
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
      </div>

      <div className="flex items-center gap-3">
        {rightSlot}
        <Link href="/" className="text-xs font-mono text-gray-400 hover:text-white transition-colors">
          SAIR
        </Link>
      </div>
    </header>
  );
}


