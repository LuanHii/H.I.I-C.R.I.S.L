'use client';

import Link from 'next/link';
import type { ComponentProps } from 'react';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { LogOut, Home } from 'lucide-react';
import { cn } from '@/lib/utils';

type MestreTab = 'agentes' | 'ameacas' | 'inventario' | 'fichas' | 'guia';

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
        'relative px-3 sm:px-4 py-2.5 font-mono text-xs sm:text-sm transition-colors whitespace-nowrap touch-target-sm',
        active
          ? 'text-white'
          : 'text-ordem-text-secondary hover:text-ordem-white-muted active:text-white',
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
    <motion.button
      type="button"
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={cn(
        'relative px-3 sm:px-4 py-2.5 font-mono text-xs sm:text-sm transition-colors whitespace-nowrap touch-target-sm',
        active
          ? 'text-white'
          : 'text-ordem-text-secondary hover:text-ordem-white-muted active:text-white',
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
    </motion.button>
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
          <motion.div
            className="flex flex-col shrink-0"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            <h1 className="text-lg sm:text-xl font-serif text-ordem-red tracking-wider leading-none">{title}</h1>
            <span className="text-[9px] sm:text-[10px] text-ordem-text-secondary font-mono tracking-[0.15em] sm:tracking-[0.2em]">{subtitle}</span>
          </motion.div>

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
              <MestreButton label="GUIA" active={tab === 'guia'} onClick={() => onTabSelect('guia')} />
              <MestreLink href="/mestre/fichas" label="FICHAS" active={false} />
            </>
          ) : (
            <>
              <MestreLink href={{ pathname: '/mestre', query: { tab: 'agentes' } }} label="AGENTES" active={inMestreRoot && tab === 'agentes'} />
              <MestreLink href={{ pathname: '/mestre', query: { tab: 'ameacas' } }} label="AMEAÇAS" active={inMestreRoot && tab === 'ameacas'} />
              <MestreLink href={{ pathname: '/mestre', query: { tab: 'inventario' } }} label="INVENTÁRIO" active={inMestreRoot && tab === 'inventario'} />
              <MestreLink href={{ pathname: '/mestre', query: { tab: 'guia' } }} label="GUIA" active={inMestreRoot && tab === 'guia'} />
              <MestreLink href="/mestre/fichas" label="FICHAS" active={inFichas} />
            </>
          )}
        </nav>

        {/* Ações em desktop */}
        <div className="hidden sm:flex items-center gap-3">
          {rightSlot}
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Link
              href="/"
              className="text-xs font-mono text-ordem-text-secondary hover:text-white active:text-ordem-red transition-colors flex items-center gap-1.5 touch-target-sm"
            >
              <LogOut size={14} />
              SAIR
            </Link>
          </motion.div>
        </div>
      </div>
    </header>
  );
}
