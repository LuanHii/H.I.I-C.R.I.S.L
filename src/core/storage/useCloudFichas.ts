"use client";

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Personagem } from '../types';
import { useAuthOptional } from '../firebase/auth';
import {
  saveFichaToCloud,
  deleteFichaFromCloud,
  subscribeToFichas,
  FichaRegistroCloud,
} from '../firebase/userDataService';
import { saveAgentToCloud } from '../firebase/firestore';

export interface FichaRegistroCloudType {
  id: string;
  personagem: Personagem;
  atualizadoEm: string;
  campanha?: string;
  sincronizadaNaNuvem?: boolean;
}

const STORAGE_KEY = 'fichas-origem';
const LIMITE_FICHAS = 50;

function lerFichasLocal(): FichaRegistroCloudType[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.map(normalizarRegistro).filter((r): r is FichaRegistroCloudType => r !== null);
  } catch (err) {
    console.error('Erro ao ler fichas locais', err);
    return [];
  }
}

function normalizarRegistro(entrada: unknown): FichaRegistroCloudType | null {
  if (!entrada || typeof entrada !== 'object') return null;
  const registroPossivel = entrada as Partial<FichaRegistroCloudType>;
  if (registroPossivel.personagem) {
    return {
      id: registroPossivel.id ?? crypto.randomUUID(),
      personagem: registroPossivel.personagem,
      atualizadoEm: registroPossivel.atualizadoEm ?? new Date().toISOString(),
      campanha: registroPossivel.campanha,
      sincronizadaNaNuvem: registroPossivel.sincronizadaNaNuvem,
    };
  }
  const personagemPossivel = entrada as Personagem;
  if (personagemPossivel && typeof personagemPossivel === 'object' && 'classe' in personagemPossivel) {
    return {
      id: crypto.randomUUID(),
      personagem: personagemPossivel,
      atualizadoEm: new Date().toISOString(),
    };
  }
  return null;
}

function gravarFichasLocal(fichas: FichaRegistroCloudType[]) {
  if (typeof window === 'undefined') return;
  try {
    const payload = JSON.stringify(fichas.slice(0, LIMITE_FICHAS));
    window.localStorage.setItem(STORAGE_KEY, payload);
  } catch (err) {
    console.error('Erro ao salvar fichas locais', err);
  }
}

export function useCloudFichas() {
  const auth = useAuthOptional();
  const userId = auth?.user?.uid;
  const isAuthenticated = auth?.isAuthenticated ?? false;
  const authLoading = auth?.loading ?? true;

  const [fichas, setFichas] = useState<FichaRegistroCloudType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) {
      return;
    }

    if (!isAuthenticated || !userId) {
      setFichas(lerFichasLocal());
      setLoading(false);
      return;
    }

    setLoading(true);

    let retryTimeout: NodeJS.Timeout | null = null;
    let unsubscribe: (() => void) | null = null;
    let hasReceivedData = false;

    const setupSubscription = () => {
      unsubscribe = subscribeToFichas(userId, (cloudFichas) => {
        hasReceivedData = true;
        const converted: FichaRegistroCloudType[] = cloudFichas.map(f => ({
          id: f.id,
          personagem: f.personagem,
          atualizadoEm: f.atualizadoEm,
          campanha: f.campanha,
          sincronizadaNaNuvem: true,
        }));
        setFichas(converted);
        setLoading(false);
      });
    };

    setupSubscription();

    retryTimeout = setTimeout(() => {
      if (!hasReceivedData && unsubscribe) {
        unsubscribe();
        setupSubscription();
      }
    }, 2000);

    return () => {
      if (retryTimeout) clearTimeout(retryTimeout);
      if (unsubscribe) unsubscribe();
    };
  }, [isAuthenticated, userId, authLoading]);

  const salvar = useCallback(
    async (personagem: Personagem, id?: string, campanha?: string) => {
      const fichaId = id ?? crypto.randomUUID();
      const now = new Date().toISOString();

      if (isAuthenticated && userId) {

        const fichaCloud: FichaRegistroCloud = {
          id: fichaId,
          personagem,
          atualizadoEm: now,
          campanha,
        };
        try {
          await saveFichaToCloud(userId, fichaCloud);

          await saveAgentToCloud(fichaId, personagem);
        } catch (err) {
          console.error('Erro ao salvar ficha na nuvem:', err);
        }
      } else {

        setFichas((prev) => {
          const fichaExistente = prev.find((f) => f.id === fichaId);
          const registro: FichaRegistroCloudType = {
            id: fichaId,
            personagem,
            atualizadoEm: now,
            campanha: campanha ?? fichaExistente?.campanha,
            sincronizadaNaNuvem: fichaExistente?.sincronizadaNaNuvem,
          };
          const existentes = prev.filter((f) => f.id !== fichaId);
          const atualizadas = [registro, ...existentes];
          gravarFichasLocal(atualizadas);

          if (fichaExistente?.sincronizadaNaNuvem) {
            saveAgentToCloud(fichaId, personagem).catch(console.error);
          }

          return atualizadas;
        });
      }
    },
    [isAuthenticated, userId]
  );

  const marcarComoSincronizada = useCallback(
    async (id: string) => {
      if (isAuthenticated && userId) {

        const ficha = fichas.find(f => f.id === id);
        if (ficha) {
          await saveAgentToCloud(id, ficha.personagem);
        }
        return;
      }

      setFichas((prev) => {
        const atualizadas = prev.map((f) =>
          f.id === id ? { ...f, sincronizadaNaNuvem: true, atualizadoEm: new Date().toISOString() } : f
        );
        gravarFichasLocal(atualizadas);
        return atualizadas;
      });
    },
    [isAuthenticated, userId, fichas]
  );

  const remover = useCallback(
    async (id: string) => {
      if (isAuthenticated && userId) {
        try {
          await deleteFichaFromCloud(userId, id);
        } catch (err) {
          console.error('Erro ao remover ficha da nuvem:', err);
        }
      } else {
        setFichas((prev) => {
          const filtradas = prev.filter((f) => f.id !== id);
          gravarFichasLocal(filtradas);
          return filtradas;
        });
      }
    },
    [isAuthenticated, userId]
  );

  const duplicar = useCallback(
    async (id: string) => {
      const alvo = fichas.find((f) => f.id === id);
      if (!alvo) return;

      const novoId = crypto.randomUUID();
      const now = new Date().toISOString();
      const novoPersonagem = { ...alvo.personagem, nome: `${alvo.personagem.nome} (cópia)` };

      if (isAuthenticated && userId) {
        const novaFicha: FichaRegistroCloud = {
          id: novoId,
          personagem: novoPersonagem,
          atualizadoEm: now,
          campanha: alvo.campanha,
        };
        try {
          await saveFichaToCloud(userId, novaFicha);
        } catch (err) {
          console.error('Erro ao duplicar ficha na nuvem:', err);
        }
      } else {
        setFichas((prev) => {
          const novo: FichaRegistroCloudType = {
            id: novoId,
            personagem: novoPersonagem,
            atualizadoEm: now,
            campanha: alvo.campanha,
          };
          const atualizadas = [novo, ...prev];
          gravarFichasLocal(atualizadas);
          return atualizadas;
        });
      }
    },
    [fichas, isAuthenticated, userId]
  );

  const moverParaCampanha = useCallback(
    async (fichaId: string, campanhaId: string | undefined) => {
      const ficha = fichas.find((f) => f.id === fichaId);
      if (!ficha) return;

      if (isAuthenticated && userId) {
        const updated: FichaRegistroCloud = {
          id: fichaId,
          personagem: ficha.personagem,
          atualizadoEm: new Date().toISOString(),
          campanha: campanhaId,
        };
        try {
          await saveFichaToCloud(userId, updated);
        } catch (err) {
          console.error('Erro ao mover ficha de campanha:', err);
        }
      } else {
        setFichas((prev) => {
          const atualizadas = prev.map((f) =>
            f.id === fichaId ? { ...f, campanha: campanhaId, atualizadoEm: new Date().toISOString() } : f
          );
          gravarFichasLocal(atualizadas);
          return atualizadas;
        });
      }
    },
    [fichas, isAuthenticated, userId]
  );

  return useMemo(
    () => ({
      fichas,
      loading,
      salvar,
      remover,
      duplicar,
      moverParaCampanha,
      marcarComoSincronizada,
      isCloudMode: isAuthenticated,
    }),
    [fichas, loading, salvar, remover, duplicar, moverParaCampanha, marcarComoSincronizada, isAuthenticated]
  );
}
