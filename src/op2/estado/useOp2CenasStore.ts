import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  avancarRodada,
  criarCena,
  cumprirCondicao,
  registrarUso,
  revelarInformacao,
  revelarVarias,
  type AcaoUnicaPorCena,
  type CenaInvestigacao,
  type InformacaoPI,
  type PontoDeInteresse,
} from '../regras/investigacao';

interface Op2CenasState {
  cenas: CenaInvestigacao[];
  cenaAtiva: string | null;

  setCenaAtiva: (id: string | null) => void;
  adicionarCena: (titulo: string) => void;
  removerCena: (id: string) => void;
  renomearCena: (id: string, titulo: string) => void;
  cenaPorId: (id: string) => CenaInvestigacao | undefined;

  transformar: (id: string, transformacao: (cena: CenaInvestigacao) => CenaInvestigacao) => void;

  adicionarPonto: (cenaId: string, ponto: PontoDeInteresse) => void;
  removerPonto: (cenaId: string, pontoId: string) => void;
  adicionarInformacao: (cenaId: string, pontoId: string, informacao: InformacaoPI) => void;
  removerInformacao: (cenaId: string, pontoId: string, informacaoId: string) => void;

  revelar: (cenaId: string, informacaoId: string, personagemId: string) => void;
  revelarLote: (cenaId: string, informacoes: readonly InformacaoPI[], personagemId: string) => void;
  cumprirCondicao: (cenaId: string, condicao: string) => void;
  registrarUso: (cenaId: string, personagemId: string, acao: AcaoUnicaPorCena) => void;
  avancarRodada: (cenaId: string) => void;
}

function novoId(): string {
  const escopo = globalThis as { crypto?: { randomUUID?: () => string } };
  return escopo.crypto?.randomUUID?.() ?? `id-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export const useOp2CenasStore = create<Op2CenasState>()(
  persist(
    (set, get) => {
      const transformar = (
        id: string,
        transformacao: (cena: CenaInvestigacao) => CenaInvestigacao,
      ) =>
        set((estado) => ({
          cenas: estado.cenas.map((cena) => (cena.id === id ? transformacao(cena) : cena)),
        }));

      const mapearPonto = (
        cena: CenaInvestigacao,
        pontoId: string,
        transformacao: (ponto: PontoDeInteresse) => PontoDeInteresse,
      ): CenaInvestigacao => ({
        ...cena,
        pontos: cena.pontos.map((ponto) => (ponto.id === pontoId ? transformacao(ponto) : ponto)),
      });

      return {
        cenas: [],
        cenaAtiva: null,

        setCenaAtiva: (id) => set({ cenaAtiva: id }),

        adicionarCena: (titulo) => {
          const cena = criarCena({ id: novoId(), titulo });
          set((estado) => ({ cenas: [...estado.cenas, cena], cenaAtiva: cena.id }));
        },

        removerCena: (id) =>
          set((estado) => ({
            cenas: estado.cenas.filter((cena) => cena.id !== id),
            cenaAtiva: estado.cenaAtiva === id ? null : estado.cenaAtiva,
          })),

        renomearCena: (id, titulo) => transformar(id, (cena) => ({ ...cena, titulo })),

        cenaPorId: (id) => get().cenas.find((cena) => cena.id === id),

        transformar,

        adicionarPonto: (cenaId, ponto) =>
          transformar(cenaId, (cena) => ({ ...cena, pontos: [...cena.pontos, ponto] })),

        removerPonto: (cenaId, pontoId) =>
          transformar(cenaId, (cena) => ({
            ...cena,
            pontos: cena.pontos.filter((ponto) => ponto.id !== pontoId),
          })),

        adicionarInformacao: (cenaId, pontoId, informacao) =>
          transformar(cenaId, (cena) =>
            mapearPonto(cena, pontoId, (ponto) => ({
              ...ponto,
              informacoes: [...ponto.informacoes, informacao],
            })),
          ),

        removerInformacao: (cenaId, pontoId, informacaoId) =>
          transformar(cenaId, (cena) =>
            mapearPonto(cena, pontoId, (ponto) => ({
              ...ponto,
              informacoes: ponto.informacoes.filter((informacao) => informacao.id !== informacaoId),
            })),
          ),

        revelar: (cenaId, informacaoId, personagemId) =>
          transformar(cenaId, (cena) => revelarInformacao(cena, informacaoId, personagemId)),

        revelarLote: (cenaId, informacoes, personagemId) =>
          transformar(cenaId, (cena) => revelarVarias(cena, informacoes, personagemId)),

        cumprirCondicao: (cenaId, condicao) =>
          transformar(cenaId, (cena) => cumprirCondicao(cena, condicao)),

        registrarUso: (cenaId, personagemId, acao) =>
          transformar(cenaId, (cena) => registrarUso(cena, personagemId, acao)),

        avancarRodada: (cenaId) => transformar(cenaId, avancarRodada),
      };
    },
    {
      name: 'op2-cenas-store',
      partialize: (estado) => ({ cenas: estado.cenas }),
    },
  ),
);

export { novoId as novoIdDeCena };
