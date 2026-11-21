import { redirect } from 'next/navigation';
import { MasterDashboard, type AbaPainel } from '@/components/MasterDashboard';

function abaValida(aba: unknown): aba is AbaPainel {
  return aba === 'ameacas' || aba === 'combate' || aba === 'inventario' || aba === 'guia' || aba === 'npcs';
}

export default async function MestrePage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string | string[] }>;
}) {
  const { tab } = await searchParams;
  if (!abaValida(tab)) redirect('/mestre/fichas');
  return <MasterDashboard aba={tab} />;
}
