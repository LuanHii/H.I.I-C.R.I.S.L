'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BookOpen, Package, ScrollText, Skull, Swords, UserRound } from 'lucide-react';
import { cn } from '@/lib/utils';

export type AbaMestre = 'ameacas' | 'inventario' | 'fichas' | 'guia' | 'combate' | 'npcs';

const ABAS: { id: AbaMestre; rotulo: string; Icone: typeof Skull }[] = [
  { id: 'fichas', rotulo: 'Fichas', Icone: ScrollText },
  { id: 'combate', rotulo: 'Combate', Icone: Swords },
  { id: 'ameacas', rotulo: 'Ameaças', Icone: Skull },
  { id: 'inventario', rotulo: 'Itens', Icone: Package },
  { id: 'npcs', rotulo: 'NPCs', Icone: UserRound },
  { id: 'guia', rotulo: 'Guia', Icone: BookOpen },
];

export function AbasDoMestre({
  activeTab,
  onTabSelect,
}: {
  activeTab?: AbaMestre;
  onTabSelect?: (aba: AbaMestre) => void;
}) {
  const pathname = usePathname();
  const emFichas = pathname?.startsWith('/mestre/fichas') ?? false;
  const atual: AbaMestre | undefined = emFichas ? 'fichas' : activeTab;

  return (
    <nav
      aria-label="Seções do mestre"
      className="fixed inset-x-0 bottom-0 z-[55] border-t border-white/10 bg-ordem-black/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden"
    >
      <ul className="grid grid-cols-6">
        {ABAS.map(({ id, rotulo, Icone }) => {
          const ativa = atual === id;
          const conteudo = (
            <>
              <span
                aria-hidden
                className={cn('h-0.5 w-6 transition-colors', ativa ? 'bg-ordem-red' : 'bg-transparent')}
              />
              <Icone size={19} strokeWidth={ativa ? 2.2 : 1.7} />
              <span className="font-carimbo text-[9px] uppercase tracking-[0.08em]">{rotulo}</span>
            </>
          );
          const classe = cn(
            'flex h-[60px] w-full flex-col items-center justify-center gap-1 transition-colors',
            ativa ? 'text-white' : 'text-ordem-text-muted active:text-white',
          );

          return (
            <li key={id}>
              {onTabSelect && !emFichas && id !== 'fichas' ? (
                <button type="button" onClick={() => onTabSelect(id)} aria-current={ativa ? 'page' : undefined} className={classe}>
                  {conteudo}
                </button>
              ) : (
                <Link
                  href={id === 'fichas' ? '/mestre/fichas' : `/mestre?tab=${id}`}
                  aria-current={ativa ? 'page' : undefined}
                  className={classe}
                >
                  {conteudo}
                </Link>
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
