"use client";

import Link from 'next/link';
import { use as usePromise, useMemo, useState, useEffect, useCallback } from 'react';
import { AgentDetailView } from '../../../../components/master/AgentDetailView';
import { useStoredFichas } from '../../../../core/storage/useStoredFichas';
import { Personagem } from '../../../../core/types';
import { clamp, normalizePersonagem } from '../../../../core/personagemUtils';
import { MestreNavbar } from '../../../../components/master/MestreNavbar';

const SECTION_KEYS = ['tracking', 'pericias', 'habilidades', 'inventario'] as const;
type SectionKey = typeof SECTION_KEYS[number];

export default function FichaDetalhePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = usePromise(params);
  const { fichas, salvar } = useStoredFichas();
  const registro = fichas.find((ficha) => ficha.id === resolvedParams.id);
  const [personagemView, setPersonagemView] = useState<Personagem | null>(
    registro ? registro.personagem : null,
  );

  useEffect(() => {
    setPersonagemView(registro?.personagem ?? null);
  }, [registro?.personagem]);

  const atualizarPersonagem = useCallback(
    (updater: Personagem | ((prev: Personagem) => Personagem)) => {
      if (!registro) return;
      setPersonagemView((prev) => {
        const base = prev ?? registro.personagem;
        const atualizado = typeof updater === 'function' ? updater(base) : updater;
        const final = normalizePersonagem(atualizado, true);
        salvar(final, registro.id);
        return final;
      });
    },
    [registro, salvar],
  );

  if (!registro) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Ficha não encontrada</h1>
          <Link href="/mestre/fichas" className="text-ordem-red hover:underline">
            Voltar para lista
          </Link>
        </div>
      </div>
    );
  }

  const personagemAtual = personagemView ?? registro.personagem;

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <MestreNavbar
        title="MESTRE"
        subtitle="ARQUIVO // EDIÇÃO"
        rightSlot={
          <Link
            href="/mestre/fichas"
            className="px-3 py-2 text-[10px] font-mono tracking-[0.25em] border border-zinc-700 text-zinc-300 hover:border-zinc-500 hover:text-white rounded-lg transition"
          >
            VOLTAR
          </Link>
        }
      />

      <main className="flex-1 bg-zinc-950 p-4">
        <div className="max-w-7xl mx-auto h-[calc(100vh-96px)] flex flex-col">
          <header className="flex items-center justify-between mb-4 shrink-0">
            <h1 className="text-xl font-bold text-white">
              Editando: <span className="text-ordem-red">{personagemAtual.nome}</span>
            </h1>
          </header>

          <div className="flex-1 overflow-y-auto bg-zinc-900/50 border border-zinc-800 rounded-xl">
            <AgentDetailView
              agent={personagemAtual}
              onUpdate={atualizarPersonagem}
              readOnly={false}
              disableInteractionModals={true}
            />
          </div>
        </div>
      </main>
    </div>
  );
}

