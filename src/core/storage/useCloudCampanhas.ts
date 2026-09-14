"use client";

import { useCallback, useEffect, useMemo, useState } from 'react';
import { apenasAsQueMudaram, moverNaOrdem, priorizarNaOrdem } from './ordemCampanhas';
import { useAuthOptional } from '../firebase/auth';
import type { Campanha } from './registros';
import {
  saveCampanhaToCloud,
  deleteCampanhaFromCloud,
  subscribeToCampanhas,
  CampanhaCloud,
} from '../firebase/userDataService';

export type CampanhaCloudType = Campanha;

const CAMPANHAS_KEY = 'campanhas';

function lerCampanhasLocal(): CampanhaCloudType[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(CAMPANHAS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch (err) {
    console.error('Erro ao ler campanhas locais', err);
    return [];
  }
}

function gravarCampanhasLocal(campanhas: CampanhaCloudType[]) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(CAMPANHAS_KEY, JSON.stringify(campanhas));
  } catch (err) {
    console.error('Erro ao salvar campanhas locais', err);
  }
}

export function useCloudCampanhas() {
  const auth = useAuthOptional();
  const userId = auth?.user?.uid;
  const isAuthenticated = auth?.isAuthenticated ?? false;
  const authLoading = auth?.loading ?? true;

  const [campanhas, setCampanhas] = useState<CampanhaCloudType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) {
      return;
    }

    if (!isAuthenticated || !userId) {
      setCampanhas(lerCampanhasLocal());
      setLoading(false);
      return;
    }

    setLoading(true);
    const unsubscribe = subscribeToCampanhas(userId, (cloudCampanhas) => {
      const converted: CampanhaCloudType[] = cloudCampanhas.map(c => ({
        id: c.id,
        nome: c.nome,
        cor: c.cor,
        ordem: c.ordem,
      }));
      setCampanhas(converted.sort((a, b) => a.ordem - b.ordem));
      setLoading(false);
    });

    return () => unsubscribe();
  }, [isAuthenticated, userId, authLoading]);

  const criarCampanha = useCallback(
    async (nome: string, cor?: string) => {
      const novoId = crypto.randomUUID();
      const novaCampanha: CampanhaCloudType = {
        id: novoId,
        nome,
        cor: cor || '#dc2626',
        ordem: campanhas.length,
      };

      if (isAuthenticated && userId) {
        try {
          await saveCampanhaToCloud(userId, novaCampanha);
        } catch (err) {
          console.error('Erro ao criar campanha na nuvem:', err);
        }
      } else {
        setCampanhas((prev) => {
          const atualizadas = [...prev, novaCampanha];
          gravarCampanhasLocal(atualizadas);
          return atualizadas;
        });
      }
    },
    [campanhas.length, isAuthenticated, userId]
  );

  const renomearCampanha = useCallback(
    async (id: string, nome: string) => {
      const campanha = campanhas.find(c => c.id === id);
      if (!campanha) return;

      if (isAuthenticated && userId) {
        try {
          await saveCampanhaToCloud(userId, { ...campanha, nome });
        } catch (err) {
          console.error('Erro ao renomear campanha na nuvem:', err);
        }
      } else {
        setCampanhas((prev) => {
          const atualizadas = prev.map((c) => (c.id === id ? { ...c, nome } : c));
          gravarCampanhasLocal(atualizadas);
          return atualizadas;
        });
      }
    },
    [campanhas, isAuthenticated, userId]
  );

  const removerCampanha = useCallback(
    async (id: string) => {
      if (isAuthenticated && userId) {
        try {
          await deleteCampanhaFromCloud(userId, id);
        } catch (err) {
          console.error('Erro ao remover campanha da nuvem:', err);
        }
      } else {
        setCampanhas((prev) => {
          const filtradas = prev.filter((c) => c.id !== id);
          gravarCampanhasLocal(filtradas);
          return filtradas;
        });
      }
    },
    [isAuthenticated, userId]
  );

  const alterarCorCampanha = useCallback(
    async (id: string, cor: string) => {
      const campanha = campanhas.find(c => c.id === id);
      if (!campanha) return;

      if (isAuthenticated && userId) {
        try {
          await saveCampanhaToCloud(userId, { ...campanha, cor });
        } catch (err) {
          console.error('Erro ao alterar cor da campanha na nuvem:', err);
        }
      } else {
        setCampanhas((prev) => {
          const atualizadas = prev.map((c) => (c.id === id ? { ...c, cor } : c));
          gravarCampanhasLocal(atualizadas);
          return atualizadas;
        });
      }
    },
    [campanhas, isAuthenticated, userId]
  );

  const aplicarNovaOrdem = useCallback(
    async (renumeradas: CampanhaCloudType[] | null) => {
      if (!renumeradas) return;
      const mudaram = apenasAsQueMudaram(campanhas, renumeradas);
      if (mudaram.length === 0) return;

      if (isAuthenticated && userId) {
        setCampanhas(renumeradas);
        try {
          await Promise.all(mudaram.map((c) => saveCampanhaToCloud(userId, c)));
        } catch (err) {
          console.error('Erro ao reordenar campanhas na nuvem:', err);
        }
      } else {
        setCampanhas(() => {
          gravarCampanhasLocal(renumeradas);
          return renumeradas;
        });
      }
    },
    [campanhas, isAuthenticated, userId]
  );

  const moverCampanha = useCallback(
    (id: string, direcao: -1 | 1) => aplicarNovaOrdem(moverNaOrdem(campanhas, id, direcao)),
    [campanhas, aplicarNovaOrdem]
  );

  const priorizarCampanha = useCallback(
    (id: string) => aplicarNovaOrdem(priorizarNaOrdem(campanhas, id)),
    [campanhas, aplicarNovaOrdem]
  );

  return useMemo(
    () => ({
      campanhas,
      loading,
      criarCampanha,
      renomearCampanha,
      removerCampanha,
      alterarCorCampanha,
      moverCampanha,
      priorizarCampanha,
      isCloudMode: isAuthenticated,
    }),
    [campanhas, loading, criarCampanha, renomearCampanha, removerCampanha, alterarCorCampanha, moverCampanha, priorizarCampanha, isAuthenticated]
  );
}
