import { useCallback, useEffect, useMemo, useState } from 'react';
import { Personagem } from '../types';
import { saveAgentToCloud } from '../firebase/firestore';

export interface FichaRegistro {
  id: string;
  personagem: Personagem;
  atualizadoEm: string;
  campanha?: string;
  sincronizadaNaNuvem?: boolean;
}

export interface Campanha {
  id: string;
  nome: string;
  cor?: string;
  ordem: number;
}

const STORAGE_KEY = 'fichas-origem';
const CAMPANHAS_KEY = 'campanhas';
const LIMITE_FICHAS = 50;

function lerFichas(): FichaRegistro[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    const normalizados = parsed
      .map((entry) => normalizarRegistro(entry))
      .filter((registro): registro is FichaRegistro => Boolean(registro));
    return normalizados;
  } catch (err) {
    console.error('Erro ao ler fichas locais', err);
    return [];
  }
}

function normalizarRegistro(entrada: unknown): FichaRegistro | null {
  if (!entrada || typeof entrada !== 'object') return null;
  const registroPossivel = entrada as Partial<FichaRegistro>;
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

function gravarFichas(fichas: FichaRegistro[]) {
  if (typeof window === 'undefined') return;
  try {
    const payload = JSON.stringify(fichas.slice(0, LIMITE_FICHAS));
    window.localStorage.setItem(STORAGE_KEY, payload);
  } catch (err) {
    console.error('Erro ao salvar fichas locais', err);
  }
}

function lerCampanhas(): Campanha[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(CAMPANHAS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch (err) {
    console.error('Erro ao ler campanhas', err);
    return [];
  }
}

function gravarCampanhas(campanhas: Campanha[]) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(CAMPANHAS_KEY, JSON.stringify(campanhas));
  } catch (err) {
    console.error('Erro ao salvar campanhas', err);
  }
}

export function useStoredFichas() {
  const [fichas, setFichas] = useState<FichaRegistro[]>([]);

  useEffect(() => {
    setFichas(lerFichas());
  }, []);

  const salvar = useCallback((personagem: Personagem, id?: string, campanha?: string) => {
    setFichas((prev) => {
      const fichaId = id ?? personagem.nome ?? crypto.randomUUID();
      const fichaExistente = prev.find((f) => f.id === fichaId);
      const registro: FichaRegistro = {
        id: fichaId,
        personagem,
        atualizadoEm: new Date().toISOString(),
        campanha: campanha ?? fichaExistente?.campanha,
        sincronizadaNaNuvem: fichaExistente?.sincronizadaNaNuvem,
      };
      const existentes = prev.filter((f) => f.id !== fichaId);
      const atualizadas = [registro, ...existentes];
      gravarFichas(atualizadas);

      if (fichaExistente?.sincronizadaNaNuvem) {
        saveAgentToCloud(fichaId, personagem).catch((err) => {
          console.error('Erro ao sincronizar ficha com a nuvem:', err);
        });
      }

      return atualizadas;
    });
  }, []);

  const marcarComoSincronizada = useCallback((id: string) => {
    setFichas((prev) => {
      const atualizadas = prev.map((f) =>
        f.id === id ? { ...f, sincronizadaNaNuvem: true, atualizadoEm: new Date().toISOString() } : f
      );
      gravarFichas(atualizadas);
      return atualizadas;
    });
  }, []);

  const remover = useCallback((id: string) => {
    setFichas((prev) => {
      const filtradas = prev.filter((f) => f.id !== id);
      gravarFichas(filtradas);
      return filtradas;
    });
  }, []);

  const duplicar = useCallback((id: string) => {
    setFichas((prev) => {
      const alvo = prev.find((f) => f.id === id);
      if (!alvo) return prev;
      const novo: FichaRegistro = {
        id: crypto.randomUUID(),
        personagem: { ...alvo.personagem, nome: `${alvo.personagem.nome} (cópia)` },
        atualizadoEm: new Date().toISOString(),
        campanha: alvo.campanha,
      };
      const atualizadas = [novo, ...prev];
      gravarFichas(atualizadas);
      return atualizadas;
    });
  }, []);

  const moverParaCampanha = useCallback((fichaId: string, campanhaId: string | undefined) => {
    setFichas((prev) => {
      const atualizadas = prev.map((f) =>
        f.id === fichaId ? { ...f, campanha: campanhaId, atualizadoEm: new Date().toISOString() } : f
      );
      gravarFichas(atualizadas);
      return atualizadas;
    });
  }, []);

  return useMemo(
    () => ({ fichas, salvar, remover, duplicar, moverParaCampanha, marcarComoSincronizada }),
    [fichas, salvar, remover, duplicar, moverParaCampanha, marcarComoSincronizada],
  );
}

export function useCampanhas() {
  const [campanhas, setCampanhas] = useState<Campanha[]>([]);

  useEffect(() => {
    setCampanhas(lerCampanhas());
  }, []);

  const criarCampanha = useCallback((nome: string, cor?: string) => {
    setCampanhas((prev) => {
      const nova: Campanha = {
        id: crypto.randomUUID(),
        nome,
        cor: cor || '#dc2626',
        ordem: prev.length,
      };
      const atualizadas = [...prev, nova];
      gravarCampanhas(atualizadas);
      return atualizadas;
    });
  }, []);

  const renomearCampanha = useCallback((id: string, nome: string) => {
    setCampanhas((prev) => {
      const atualizadas = prev.map((c) => (c.id === id ? { ...c, nome } : c));
      gravarCampanhas(atualizadas);
      return atualizadas;
    });
  }, []);

  const removerCampanha = useCallback((id: string) => {
    setCampanhas((prev) => {
      const filtradas = prev.filter((c) => c.id !== id);
      gravarCampanhas(filtradas);
      return filtradas;
    });
  }, []);

  const alterarCorCampanha = useCallback((id: string, cor: string) => {
    setCampanhas((prev) => {
      const atualizadas = prev.map((c) => (c.id === id ? { ...c, cor } : c));
      gravarCampanhas(atualizadas);
      return atualizadas;
    });
  }, []);

  return useMemo(
    () => ({ campanhas, criarCampanha, renomearCampanha, removerCampanha, alterarCorCampanha }),
    [campanhas, criarCampanha, renomearCampanha, removerCampanha, alterarCorCampanha],
  );
}
