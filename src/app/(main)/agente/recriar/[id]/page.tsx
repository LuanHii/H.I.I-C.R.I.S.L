"use client";

import Link from 'next/link';
import { use as usePromise, useMemo } from 'react';
import CharacterCreator from '../../../../../components/CharacterCreator';
import { useStoredFichas } from '../../../../../core/storage/useStoredFichas';
import { buildRecreateDraftFromPersonagem } from '../../../../../logic/recreateFromPersonagem';
import type { Personagem } from '../../../../../core/types';
import { normalizePersonagem } from '../../../../../core/personagemUtils';

export default function RecriarFichaPage({ params }: { params: Promise<{ id: string }> }) {
  const resolved = usePromise(params);
  const { fichas, salvar } = useStoredFichas();
  const registro = fichas.find((f) => f.id === resolved.id);

  const draft = useMemo(() => {
    if (!registro) return null;
    return buildRecreateDraftFromPersonagem(registro.personagem);
  }, [registro]);

  const onCreated = (created: Personagem) => {
    // Recriação deve "corrigir avisos" da ficha original:
    // - remove overrides (recalcular do zero)
    // - limpa pendências de progressão (modo permissivo não deve travar a recriação)
    // - normaliza (patente, máximos, pe/rodada, perturbado, carga, etc)
    const cleaned: Personagem = {
      ...created,
      overrides: undefined,
      pontosAtributoPendentes: undefined,
      periciasTreinadasPendentes: undefined,
      periciasPromocaoPendentes: undefined,
      escolhaTrilhaPendente: undefined,
      habilidadesTrilhaPendentes: undefined,
    };

    // Se Determinação estiver ativa, zera PE/SAN para evitar avisos e refletir o modo PD.
    if (cleaned.usarPd === true) {
      cleaned.pe = { ...cleaned.pe, atual: 0, max: 0 };
      cleaned.san = { ...cleaned.san, atual: 0, max: 0, perturbado: false };
    } else {
      cleaned.pd = undefined;
    }

    const final = normalizePersonagem(cleaned, true);
    salvar(final, crypto.randomUUID());
  };

  if (!registro || !draft) {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center p-6">
        <div className="max-w-lg w-full bg-zinc-900/40 border border-zinc-800 rounded-xl p-6 text-center">
          <div className="text-xl font-serif mb-2">Ficha não encontrada</div>
          <div className="text-sm text-zinc-400 mb-5">Não foi possível localizar a ficha para recriar.</div>
          <Link href="/mestre/fichas" className="text-ordem-green underline">
            Voltar para fichas
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen p-8 flex items-center justify-center">
      <CharacterCreator initialDraft={draft} initialStep={1} onCreated={onCreated} />
    </main>
  );
}


