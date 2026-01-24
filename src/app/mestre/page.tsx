import { redirect } from 'next/navigation';
import { MasterDashboard } from '../../components/MasterDashboard';

export default function MestrePage({
  searchParams,
}: {
  searchParams: { tab?: string };
}) {
  if (!searchParams?.tab) {
    redirect('/mestre/fichas');
  }

  return (
    <main className="min-h-screen bg-ordem-black text-ordem-white">
      <MasterDashboard />
    </main>
  );
}

