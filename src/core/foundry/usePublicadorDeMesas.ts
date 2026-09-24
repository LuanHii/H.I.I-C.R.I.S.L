"use client";

import { useEffect } from 'react';
import { collection, onSnapshot, type Unsubscribe } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuthOptional } from '../firebase/auth';
import { assinarMesasDoDono, atualizarFichasDaMesa } from '../firebase/mesasService';
import type { CampanhaCloud, FichaRegistroCloud, WatchedFichaCloud } from '../firebase/userDataService';
import { mesmasFichas, montarFichasDaMesa, type MesaFoundry } from './mesa';

const ESPERA_ANTES_DE_PUBLICAR_MS = 1500;

interface Fontes {
  fichas?: FichaRegistroCloud[];
  campanhas?: CampanhaCloud[];
  acompanhadas?: WatchedFichaCloud[];
  mesas?: MesaFoundry[];
}

/**
 * Mantem a lista de fichas de cada mesa do Foundry igual ao que o mestre tem
 * no site, enquanto ele usa as telas de mestre.
 *
 * As escutas sao proprias, nao as de `userDataService`: aquelas chamam o
 * callback com `[]` quando o Firestore da erro, e publicar isso apagaria a
 * lista da mesa numa queda de rede. Aqui uma fonte com erro so suspende a
 * publicacao ate voltar.
 */
export function usePublicadorDeMesas() {
  const auth = useAuthOptional();
  const userId = auth?.user?.uid;

  useEffect(() => {
    if (!userId) return undefined;

    const fontes: Fontes = {};
    const comErro = new Set<keyof Fontes>();
    let temporizador: ReturnType<typeof setTimeout> | null = null;

    const publicar = async () => {
      const { fichas, campanhas, acompanhadas, mesas } = fontes;
      if (comErro.size || !fichas || !campanhas || !acompanhadas || !mesas) return;

      for (const mesa of mesas) {
        const novas = montarFichasDaMesa(
          mesa,
          fichas.map((f) => ({ id: f.id, personagem: f.personagem, campanha: f.campanha })),
          campanhas,
          acompanhadas,
        );
        // A comparacao evita o laco: gravar a mesa dispara a escuta de mesas.
        if (mesmasFichas(novas, mesa.fichas ?? [])) continue;
        try {
          await atualizarFichasDaMesa(mesa.id, novas);
        } catch (erro) {
          console.error(`Erro ao publicar a mesa "${mesa.nome}" para o Foundry:`, erro);
        }
      }
    };

    const agendar = () => {
      if (temporizador) clearTimeout(temporizador);
      temporizador = setTimeout(publicar, ESPERA_ANTES_DE_PUBLICAR_MS);
    };

    const escutar = <T>(chave: keyof Fontes, caminho: string[]): Unsubscribe => onSnapshot(
      collection(db, 'users', userId, ...caminho),
      (snapshot) => {
        comErro.delete(chave);
        (fontes as Record<string, unknown>)[chave] = snapshot.docs.map((d) => d.data() as T);
        agendar();
      },
      (erro) => {
        comErro.add(chave);
        console.error(`Publicador de mesas: falha ao escutar ${chave}.`, erro);
      },
    );

    const cancelar: Unsubscribe[] = [
      escutar<FichaRegistroCloud>('fichas', ['fichas']),
      escutar<CampanhaCloud>('campanhas', ['campanhas']),
      escutar<WatchedFichaCloud>('acompanhadas', ['watchedFichas']),
      assinarMesasDoDono(userId, (mesas) => {
        fontes.mesas = mesas;
        agendar();
      }),
    ];

    return () => {
      if (temporizador) clearTimeout(temporizador);
      cancelar.forEach((c) => c());
    };
  }, [userId]);
}

/** Componente sem interface, para montar o publicador num layout de servidor. */
export function PublicadorDeMesas() {
  usePublicadorDeMesas();
  return null;
}
