"use client";

import { MestreNavbar } from '../../../components/master/MestreNavbar';
import { FichasManager } from '../../../components/master/FichasManager';

export default function FichasPage() {
  return (
    <div className="min-h-screen bg-ordem-black text-ordem-white flex flex-col">
      <MestreNavbar
        title="MESTRE"
        subtitle="ARQUIVO // FICHAS"
      />
      <main className="flex-1 bg-ordem-black-deep overflow-hidden">
        <FichasManager />
      </main>
    </div>
  );
}
