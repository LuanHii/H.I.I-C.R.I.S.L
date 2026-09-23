"use client";

import { MestreNavbar } from '../../../components/master/MestreNavbar';
import { FichasManager } from '../../../components/master/FichasManager';
import { AbasDoMestre } from '../../../components/master/AbasDoMestre';

export default function FichasPage() {
  return (
    <div className="min-h-screen bg-ordem-black text-ordem-white flex flex-col">
      <MestreNavbar
        title="MESTRE"
        subtitle="ARQUIVO // FICHAS"
      />
      <main className="flex-1 overflow-hidden bg-ordem-black-deep">
        <FichasManager />
      </main>
      <AbasDoMestre />
    </div>
  );
}
