"use client";

import { MestreNavbar } from '../../../components/master/MestreNavbar';
import { FichasManager } from '../../../components/master/FichasManager';
import { AbasDoMestre } from '../../../components/master/AbasDoMestre';

export default function FichasPage() {
  return (
    <div className="h-dvh min-h-0 bg-ordem-black text-ordem-white flex flex-col">
      <MestreNavbar
        title="MESTRE"
        subtitle="ARQUIVO // FICHAS"
      />
      <main className="flex min-h-0 flex-1 flex-col overflow-hidden bg-ordem-black-deep">
        <FichasManager />
      </main>
      <AbasDoMestre />
    </div>
  );
}
