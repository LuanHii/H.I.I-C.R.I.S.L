import { redirect } from 'next/navigation';
import { MasterDashboard } from '../../components/MasterDashboard';

export default async function MestrePage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const params = await searchParams;
  if (!params?.tab) {
    redirect('/mestre/fichas');
  }

  return (
    <main className="min-h-screen bg-ordem-black text-ordem-white">
      <MasterDashboard />
    </main>
  );
}

