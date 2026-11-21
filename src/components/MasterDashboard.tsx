'use client';

import dynamic from 'next/dynamic';
import { AbasDoMestre, type AbaMestre } from './master/AbasDoMestre';
import { MestreNavbar } from './master/MestreNavbar';
import { Skeleton } from './ui/Skeleton';

function CarregandoPainel() {
  return (
    <div role="status" className="mx-auto w-full max-w-7xl space-y-4 px-4 py-6 sm:px-6">
      <span className="sr-only">Carregando painel</span>
      <Skeleton className="h-7 w-48" />
      <Skeleton className="h-44 w-full" />
    </div>
  );
}

const PAINEIS = {
  ameacas: dynamic(() => import('./master/MonsterList').then(m => m.MonsterList), { loading: CarregandoPainel }),
  combate: dynamic(() => import('./master/CombatManager').then(m => m.CombatManager), { loading: CarregandoPainel }),
  inventario: dynamic(() => import('./master/ItemManager').then(m => m.ItemManager), { loading: CarregandoPainel }),
  guia: dynamic(() => import('./master/GuiaMestre').then(m => m.GuiaMestreComFichas), { loading: CarregandoPainel }),
  npcs: dynamic(() => import('./master/NpcList').then(m => m.NpcList), { loading: CarregandoPainel }),
};

const TITULOS: Record<AbaPainel, string> = {
  ameacas: 'Ameaças',
  combate: 'Combate',
  inventario: 'Inventário',
  guia: 'Guia do mestre',
  npcs: 'NPCs',
};

export type AbaPainel = Exclude<AbaMestre, 'fichas'>;

export function MasterDashboard({ aba }: { aba: AbaPainel }) {
  const Painel = PAINEIS[aba];
  return (
    <div className="flex h-dvh min-h-0 flex-col bg-ordem-black text-ordem-white">
      <MestreNavbar activeTab={aba} subtitle={TITULOS[aba]} />
      <main className="relative min-h-0 flex-1 overflow-y-auto bg-ordem-black-deep pb-[calc(60px+env(safe-area-inset-bottom))] lg:pb-0">
        {aba === 'ameacas' ? (
          <section className="mx-auto max-w-7xl px-4 py-5 sm:px-6 sm:py-6">
            <h2 className="mb-5 border-b border-ordem-border pb-3 font-display text-xl text-ordem-white sm:text-2xl">Bestiário Paranormal</h2>
            <Painel />
          </section>
        ) : <Painel />}
      </main>
      <AbasDoMestre activeTab={aba} />
    </div>
  );
}
