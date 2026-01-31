"use client";

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuthOptional } from '../firebase/auth';
import {
  addWatchedFicha,
  removeWatchedFicha,
  subscribeToWatchedFichas,
  WatchedFichaCloud,
} from '../firebase/userDataService';
import { subscribeToAgent } from '../firebase/firestore';
import { Personagem } from '../types';

export interface WatchedFicha {
  id: string;
  agentId: string;
  nome: string;
  classe: string;
  nex: number;
  adicionadoEm: string;
  personagem?: Personagem;
}

export function useWatchedFichas() {
  const auth = useAuthOptional();
  const userId = auth?.user?.uid;
  const isAuthenticated = auth?.isAuthenticated ?? false;
  const authLoading = auth?.loading ?? true;

  const [watchedFichas, setWatchedFichas] = useState<WatchedFicha[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) {
      return;
    }

    if (!isAuthenticated || !userId) {
      setWatchedFichas([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const unsubscribe = subscribeToWatchedFichas(userId, (cloudFichas) => {
      const converted: WatchedFicha[] = cloudFichas.map(f => ({
        id: f.id,
        agentId: f.agentId,
        nome: f.nome,
        classe: f.classe,
        nex: f.nex,
        adicionadoEm: f.adicionadoEm,
      }));
      setWatchedFichas(converted);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [isAuthenticated, userId, authLoading]);

  const addWatch = useCallback(
    async (agentId: string, personagem: Personagem) => {
      if (!isAuthenticated || !userId) {
        return false;
      }

      const watchData: WatchedFichaCloud = {
        id: agentId,
        agentId,
        nome: personagem.nome,
        classe: personagem.classe,
        nex: personagem.nex,
        adicionadoEm: new Date().toISOString(),
      };

      try {
        await addWatchedFicha(userId, watchData);
        return true;
      } catch (err) {
        console.error('Erro ao adicionar ficha observada:', err);
        return false;
      }
    },
    [isAuthenticated, userId]
  );

  const removeWatch = useCallback(
    async (agentId: string) => {
      if (!isAuthenticated || !userId) {
        return false;
      }

      try {
        await removeWatchedFicha(userId, agentId);
        return true;
      } catch (err) {
        console.error('Erro ao remover ficha observada:', err);
        return false;
      }
    },
    [isAuthenticated, userId]
  );

  const isWatching = useCallback(
    (agentId: string) => {
      return watchedFichas.some(f => f.agentId === agentId);
    },
    [watchedFichas]
  );

  return useMemo(
    () => ({
      watchedFichas,
      loading,
      addWatch,
      removeWatch,
      isWatching,
      isAuthenticated,
    }),
    [watchedFichas, loading, addWatch, removeWatch, isWatching, isAuthenticated]
  );
}
