"use client";

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Ameaca } from '../types';
import { useAuthOptional } from '../firebase/auth';
import {
  saveMonstroToCloud,
  deleteMonstroFromCloud,
  subscribeToMonstros,
  MonsterRegistroCloud,
} from '../firebase/userDataService';

export interface MonsterRegistro {
  id: string;
  ameaca: Ameaca;
  atualizadoEm: string;
}

const STORAGE_KEY = 'monstros-customizados';
const LIMITE_MONSTROS = 50;

function lerMonstrosLocal(): MonsterRegistro[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch (err) {
    console.error('Erro ao ler monstros locais', err);
    return [];
  }
}

function gravarMonstrosLocal(monstros: MonsterRegistro[]) {
  if (typeof window === 'undefined') return;
  try {
    const payload = JSON.stringify(monstros.slice(0, LIMITE_MONSTROS));
    window.localStorage.setItem(STORAGE_KEY, payload);
  } catch (err) {
    console.error('Erro ao salvar monstros locais', err);
  }
}

export function useCloudMonsters() {
  const auth = useAuthOptional();
  const userId = auth?.user?.uid;
  const isAuthenticated = auth?.isAuthenticated ?? false;
  const authLoading = auth?.loading ?? true;

  const [monstros, setMonstros] = useState<MonsterRegistro[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) {
      return;
    }

    if (!isAuthenticated || !userId) {
      setMonstros(lerMonstrosLocal());
      setLoading(false);
      return;
    }

    setLoading(true);
    const unsubscribe = subscribeToMonstros(userId, (cloudMonstros) => {
      const converted: MonsterRegistro[] = cloudMonstros.map(m => ({
        id: m.id,
        ameaca: m.ameaca,
        atualizadoEm: m.atualizadoEm,
      }));
      setMonstros(converted);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [isAuthenticated, userId, authLoading]);

  const salvar = useCallback(
    async (ameaca: Ameaca, id?: string) => {
      const monsterId = id ?? crypto.randomUUID();
      const now = new Date().toISOString();

      if (isAuthenticated && userId) {
        const monstroCloud: MonsterRegistroCloud = {
          id: monsterId,
          ameaca,
          atualizadoEm: now,
        };
        try {
          await saveMonstroToCloud(userId, monstroCloud);
        } catch (err) {
          console.error('Erro ao salvar monstro na nuvem:', err);
        }
      } else {
        setMonstros((prev) => {
          const registro: MonsterRegistro = {
            id: monsterId,
            ameaca,
            atualizadoEm: now,
          };
          const existentes = prev.filter((m) => m.id !== monsterId);
          const atualizados = [registro, ...existentes];
          gravarMonstrosLocal(atualizados);
          return atualizados;
        });
      }
    },
    [isAuthenticated, userId]
  );

  const remover = useCallback(
    async (id: string) => {
      if (isAuthenticated && userId) {
        try {
          await deleteMonstroFromCloud(userId, id);
        } catch (err) {
          console.error('Erro ao remover monstro da nuvem:', err);
        }
      } else {
        setMonstros((prev) => {
          const filtrados = prev.filter((m) => m.id !== id);
          gravarMonstrosLocal(filtrados);
          return filtrados;
        });
      }
    },
    [isAuthenticated, userId]
  );

  return useMemo(
    () => ({
      monstros,
      loading,
      salvar,
      remover,
      isCloudMode: isAuthenticated,
    }),
    [monstros, loading, salvar, remover, isAuthenticated]
  );
}
