"use client";

import { useCallback, useEffect, useMemo, useState } from 'react';
import { carimbarSincronizacao } from './carimboDeSincronizacao';
import { Personagem } from '../types';
import { useAuthOptional } from '../firebase/auth';
import {
  saveFichaToCloud,
  deleteFichaFromCloud,
  subscribeToFichas,
  FichaRegistroCloud,
} from '../firebase/userDataService';
import { saveAgentToCloud } from '../firebase/firestore';
import type { FichaPersistida } from '../ficha/tipos';
import type { FichaRegistro } from './registros';
import { resolverPersonagem } from '../ficha/leitura';
import { prepararGravacao } from './gravacaoDeSessao';
import { registrarEscolha, limparEscolha } from '../ficha/registrarEscolha';
import { definirNivel } from '../ficha/buildFicha';
import { paraPersonagem } from '../ficha/paraPersonagem';
import type { EscolhaId, Problema, ValorEscolha } from '../ficha/tipos';

export type FichaRegistroCloudType = FichaRegistro;

export function paraNuvem(registro: FichaRegistroCloudType): FichaRegistroCloud {
  return {
    id: registro.id,
    personagem: registro.personagem,
    atualizadoEm: registro.atualizadoEm,
    campanha: registro.campanha,
    ficha: registro.ficha,
    fichaMigradaDe: registro.fichaMigradaDe,
    fichaConfirmada: registro.fichaConfirmada,
    personagemOriginal: registro.personagemOriginal,
  };
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
      ficha: registroPossivel.ficha,
      fichaMigradaDe: registroPossivel.fichaMigradaDe,
      fichaConfirmada: registroPossivel.fichaConfirmada,
      personagemOriginal: registroPossivel.personagemOriginal,
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
          ficha: f.ficha,
          fichaMigradaDe: f.fichaMigradaDe,
          fichaConfirmada: f.fichaConfirmada,
          personagemOriginal: f.personagemOriginal,
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

  const persistir = useCallback(
    async (registro: FichaRegistroCloudType) => {
      if (isAuthenticated && userId) {
        await saveFichaToCloud(userId, paraNuvem(registro));
        await saveAgentToCloud(registro.id, registro.personagem);
        setFichas((prev) => prev.map((f) => (f.id === registro.id ? registro : f)));
      } else {
        setFichas((prev) => {
          const atualizadas = prev.map((f) => (f.id === registro.id ? registro : f));
          gravarFichasLocal(atualizadas);
          return atualizadas;
        });
      }
    },
    [isAuthenticated, userId],
  );

  const salvar = useCallback(
    async (personagem: Personagem, id?: string, campanha?: string) => {
      const fichaId = id ?? crypto.randomUUID();
      const now = new Date().toISOString();

      setFichas((prev) => {
        const fichaExistente = prev.find((f) => f.id === fichaId);
        const campanhaFinal = campanha !== undefined ? campanha : fichaExistente?.campanha;

        const gravacao = prepararGravacao(fichaExistente, personagem, now);
        const camposV2 = fichaExistente?.ficha
          ? { ficha: gravacao.ficha, fichaMigradaDe: gravacao.fichaMigradaDe }
          : {};

        if (isAuthenticated && userId) {
          const registro: FichaRegistroCloudType = {
            ...fichaExistente,
            ...camposV2,
            id: fichaId,
            personagem: gravacao.personagem,
            atualizadoEm: now,
            campanha: campanhaFinal,
            sincronizadaNaNuvem: true,
          };

          saveFichaToCloud(userId, paraNuvem(registro)).catch((err) =>
            console.error('Erro ao salvar ficha na nuvem:', err)
          );
          saveAgentToCloud(fichaId, gravacao.personagem).catch((err) =>
            console.error('Erro saveAgent:', err)
          );
          const existentes = prev.filter((f) => f.id !== fichaId);
          return [registro, ...existentes];
        } else {
          const registro: FichaRegistroCloudType = {
            ...fichaExistente,
            ...camposV2,
            id: fichaId,
            personagem: gravacao.personagem,
            atualizadoEm: now,
            campanha: campanhaFinal,
            sincronizadaNaNuvem: fichaExistente?.sincronizadaNaNuvem,
          };
          const existentes = prev.filter((f) => f.id !== fichaId);
          const atualizadas = [registro, ...existentes];
          gravarFichasLocal(atualizadas);

          if (fichaExistente?.sincronizadaNaNuvem) {
            saveAgentToCloud(fichaId, gravacao.personagem).catch(console.error);
          }

          return atualizadas;
        }
      });
    },
    [isAuthenticated, userId]
  );

  const importarRegistro = useCallback(
    async (registro: FichaRegistro) => {
      if (isAuthenticated && userId) {
        const naNuvem = { ...registro, sincronizadaNaNuvem: true as const };
        await saveFichaToCloud(userId, paraNuvem(naNuvem));
        await saveAgentToCloud(registro.id, registro.personagem);
        setFichas((prev) => [naNuvem, ...prev.filter((f) => f.id !== registro.id)]);
      } else {
        setFichas((prev) => {
          const atualizadas = [registro, ...prev.filter((f) => f.id !== registro.id)];
          gravarFichasLocal(atualizadas);
          return atualizadas;
        });
      }
    },
    [isAuthenticated, userId],
  );

  const sincronizarFicha = useCallback(
    async (id: string) => {
      if (!isAuthenticated || !userId) return;

      const alvo = fichas.find((f) => f.id === id);
      if (!alvo) return;

      const now = new Date().toISOString();

      try {
        const carimbado = carimbarSincronizacao(alvo, now);

        await saveFichaToCloud(userId, paraNuvem(carimbado));
        await saveAgentToCloud(alvo.id, alvo.personagem);

        setFichas((prev) => prev.map(f => f.id === id ? carimbado : f));
      } catch (err) {
        console.error('Erro ao sincronizar ficha manualmente:', err);
        throw err;
      }
    },
    [isAuthenticated, userId, fichas]
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
          f.id === id ? carimbarSincronizacao(f, new Date().toISOString()) : f
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
        try {
          await saveFichaToCloud(userId, {
            id: novoId,
            personagem: novoPersonagem,
            atualizadoEm: now,
            campanha: alvo.campanha,
          });
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

  const migrar = useCallback(
    async (id: string, ficha: FichaPersistida, opcoes?: { confirmada?: boolean }) => {
      const alvo = fichas.find((f) => f.id === id);
      if (!alvo) return;

      const atualizado: FichaRegistroCloudType = {
        ...alvo,
        ficha,
        fichaMigradaDe: alvo.atualizadoEm,
        fichaConfirmada: opcoes?.confirmada ?? false,
        personagemOriginal: alvo.personagemOriginal ?? alvo.personagem,
      };

      if (isAuthenticated && userId) {
        await saveFichaToCloud(userId, paraNuvem(atualizado));
        setFichas((prev) => prev.map((f) => (f.id === id ? atualizado : f)));
      } else {
        setFichas((prev) => {
          const atualizadas = prev.map((f) => (f.id === id ? atualizado : f));
          gravarFichasLocal(atualizadas);
          return atualizadas;
        });
      }
    },
    [fichas, isAuthenticated, userId],
  );

  const responderEscolha = useCallback(
    async (id: string, escolhaId: EscolhaId, valor: ValorEscolha): Promise<Problema[]> => {
      const alvo = fichas.find((f) => f.id === id);
      if (!alvo?.ficha) {
        return [{
          gravidade: 'erro',
          codigo: 'ficha_nao_convertida',
          mensagem: 'Esta ficha ainda não foi convertida para o motor novo.',
        }];
      }

      const resultado = registrarEscolha(alvo.ficha, escolhaId, valor);
      if (!resultado.aplicada) return resultado.problemas;

      const now = new Date().toISOString();
      const atualizado: FichaRegistroCloudType = {
        ...alvo,
        ficha: resultado.ficha,
        personagem: paraPersonagem({ ficha: resultado.ficha, carregarDe: alvo.personagem }),
        atualizadoEm: now,
        fichaMigradaDe: now,
      };

      await persistir(atualizado);
      return resultado.problemas;
    },
    [fichas, persistir],
  );

  const definirNivelDaFicha = useCallback(
    async (id: string, nivel: number) => {
      const alvo = fichas.find((f) => f.id === id);
      if (!alvo?.ficha) return;

      const ficha = definirNivel(alvo.ficha, nivel);
      const now = new Date().toISOString();
      await persistir({
        ...alvo,
        ficha,
        personagem: paraPersonagem({ ficha, carregarDe: alvo.personagem }),
        atualizadoEm: now,
        fichaMigradaDe: now,
      });
    },
    [fichas, persistir],
  );

  const desfazerEscolha = useCallback(
    async (id: string, escolhaId: EscolhaId) => {
      const alvo = fichas.find((f) => f.id === id);
      if (!alvo?.ficha) return;

      const ficha = limparEscolha(alvo.ficha, escolhaId);
      const now = new Date().toISOString();
      await persistir({
        ...alvo,
        ficha,
        personagem: paraPersonagem({ ficha, carregarDe: alvo.personagem }),
        atualizadoEm: now,
        fichaMigradaDe: now,
      });
    },
    [fichas, persistir],
  );

  const editarFicha = useCallback(
    async (id: string, transformar: (ficha: FichaPersistida) => FichaPersistida) => {
      const alvo = fichas.find((f) => f.id === id);
      if (!alvo?.ficha) return;

      const ficha = transformar(alvo.ficha);
      if (ficha === alvo.ficha) return;

      const now = new Date().toISOString();
      await persistir({
        ...alvo,
        ficha,
        personagem: paraPersonagem({ ficha, carregarDe: alvo.personagem }),
        atualizadoEm: now,
        fichaMigradaDe: now,
      });
    },
    [fichas, persistir],
  );

  const criar = useCallback(
    async (personagem: Personagem, ficha: FichaPersistida, opcoes?: { id?: string; campanha?: string }) => {
      const id = opcoes?.id ?? crypto.randomUUID();
      const now = new Date().toISOString();
      const registro: FichaRegistroCloudType = {
        id,
        ficha,
        personagem: paraPersonagem({ ficha, carregarDe: personagem }),
        atualizadoEm: now,
        fichaMigradaDe: now,
        fichaConfirmada: true,
        campanha: opcoes?.campanha,
      };

      if (isAuthenticated && userId) {
        const naNuvem = { ...registro, sincronizadaNaNuvem: true as const };
        await saveFichaToCloud(userId, paraNuvem(naNuvem));
        await saveAgentToCloud(id, naNuvem.personagem);
        setFichas((prev) => [naNuvem, ...prev.filter((f) => f.id !== id)]);
      } else {
        setFichas((prev) => {
          const atualizadas = [registro, ...prev.filter((f) => f.id !== id)];
          gravarFichasLocal(atualizadas);
          return atualizadas;
        });
      }

      return id;
    },
    [isAuthenticated, userId],
  );

  const moverParaCampanha = useCallback(
    async (fichaId: string, campanhaId: string | undefined) => {
      setFichas((prev) => {
        const ficha = prev.find((f) => f.id === fichaId);
        if (!ficha) return prev;

        const atualizadas = prev.map((f) =>
          f.id === fichaId ? { ...f, campanha: campanhaId, atualizadoEm: new Date().toISOString() } : f
        );

        if (isAuthenticated && userId) {
          saveFichaToCloud(
            userId,
            paraNuvem({ ...ficha, campanha: campanhaId, atualizadoEm: new Date().toISOString() }),
          ).catch((err) => console.error('Erro ao mover ficha de campanha:', err));
        } else {
          gravarFichasLocal(atualizadas);
        }
        return atualizadas;
      });
    },
    [isAuthenticated, userId]
  );

  const fichasResolvidas = useMemo(
    () => fichas.map((registro) => {
      const { personagem, fonte, motivo } = resolverPersonagem(registro);
      return { ...registro, personagem, fonte, motivoDaFonte: motivo };
    }),
    [fichas],
  );

  return useMemo(
    () => ({
      fichas: fichasResolvidas,
      fichasBrutas: fichas,
      loading,
      salvar,
      remover,
      duplicar,
      moverParaCampanha,
      marcarComoSincronizada,
      sincronizarFicha,
      migrar,
      responderEscolha,
      desfazerEscolha,
      definirNivelDaFicha,
      editarFicha,
      criar,
      importarRegistro,
      isCloudMode: isAuthenticated,
    }),
    [fichas, fichasResolvidas, loading, salvar, remover, duplicar, moverParaCampanha, marcarComoSincronizada, sincronizarFicha, migrar, responderEscolha, desfazerEscolha, definirNivelDaFicha, editarFicha, criar, importarRegistro, isAuthenticated]
  );
}
