import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AtributoOp2, FichaOp2 } from '../regras/tipos';
import {
  adicionarPassoDeCena,
  alternarCondicao,
  aplicarResultadoDeTeste,
  ativarHabilidade,
  curar,
  definirPd,
  definirPv,
  descansar,
  encerrarCena,
  ganharDadosDeAvaliacao,
  gastarDadosDeAvaliacao,
  gastarImpeto,
  gastarPd,
  recuperarPd,
  registrarTesteDeFerimento,
  registrarTesteDeTrauma,
  sofrerDano,
} from '../regras/sessao';

interface Op2FichasState {
  fichas: FichaOp2[];
  fichaAtiva: string | null;

  setFichaAtiva: (id: string | null) => void;
  adicionarFicha: (ficha: FichaOp2) => void;
  substituirFicha: (ficha: FichaOp2) => void;
  removerFicha: (id: string) => void;
  definirFichas: (fichas: FichaOp2[]) => void;
  fichaPorId: (id: string) => FichaOp2 | undefined;

  transformar: (id: string, transformacao: (ficha: FichaOp2) => FichaOp2) => void;

  sofrerDano: (id: string, quantidade: number) => void;
  curar: (id: string, quantidade: number) => void;
  gastarPd: (id: string, quantidade: number) => void;
  recuperarPd: (id: string, quantidade: number) => void;
  definirPv: (id: string, valor: number) => void;
  definirPd: (id: string, valor: number) => void;

  gastarImpeto: (id: string, espacos: 1 | 3) => void;
  ganharDadosDeAvaliacao: (id: string) => void;
  gastarDadosDeAvaliacao: (id: string, dados: 1 | 2) => void;

  ativarHabilidade: (id: string, habilidadeId: string) => void;
  registrarResultadoDeTeste: (id: string, resultado: { contaComoFalhaParaImpeto: boolean }) => void;

  adicionarPassoDeCena: (id: string, alvo: AtributoOp2, motivo: string) => void;
  encerrarCena: (id: string) => void;
  descansar: (id: string) => void;
  alternarCondicao: (id: string, condicao: string) => void;
  registrarTesteDeFerimento: (id: string) => void;
  registrarTesteDeTrauma: (id: string) => void;
}

export const useOp2FichasStore = create<Op2FichasState>()(
  persist(
    (set, get) => {
      const transformar = (id: string, transformacao: (ficha: FichaOp2) => FichaOp2) =>
        set((estado) => ({
          fichas: estado.fichas.map((ficha) => (ficha.id === id ? transformacao(ficha) : ficha)),
        }));

      return {
        fichas: [],
        fichaAtiva: null,

        setFichaAtiva: (id) => set({ fichaAtiva: id }),

        adicionarFicha: (ficha) =>
          set((estado) => ({
            fichas: estado.fichas.some((atual) => atual.id === ficha.id)
              ? estado.fichas.map((atual) => (atual.id === ficha.id ? ficha : atual))
              : [...estado.fichas, ficha],
          })),

        substituirFicha: (ficha) =>
          set((estado) => ({
            fichas: estado.fichas.map((atual) => (atual.id === ficha.id ? ficha : atual)),
          })),

        removerFicha: (id) =>
          set((estado) => ({
            fichas: estado.fichas.filter((ficha) => ficha.id !== id),
            fichaAtiva: estado.fichaAtiva === id ? null : estado.fichaAtiva,
          })),

        definirFichas: (fichas) => set({ fichas }),

        fichaPorId: (id) => get().fichas.find((ficha) => ficha.id === id),

        transformar,

        sofrerDano: (id, quantidade) => transformar(id, (ficha) => sofrerDano(ficha, quantidade)),
        curar: (id, quantidade) => transformar(id, (ficha) => curar(ficha, quantidade)),
        gastarPd: (id, quantidade) => transformar(id, (ficha) => gastarPd(ficha, quantidade)),
        recuperarPd: (id, quantidade) => transformar(id, (ficha) => recuperarPd(ficha, quantidade)),
        definirPv: (id, valor) => transformar(id, (ficha) => definirPv(ficha, valor)),
        definirPd: (id, valor) => transformar(id, (ficha) => definirPd(ficha, valor)),

        gastarImpeto: (id, espacos) => transformar(id, (ficha) => gastarImpeto(ficha, espacos)),
        ganharDadosDeAvaliacao: (id) => transformar(id, ganharDadosDeAvaliacao),
        gastarDadosDeAvaliacao: (id, dados) =>
          transformar(id, (ficha) => gastarDadosDeAvaliacao(ficha, dados)),

        ativarHabilidade: (id, habilidadeId) =>
          transformar(id, (ficha) => ativarHabilidade(ficha, habilidadeId)),

        registrarResultadoDeTeste: (id, resultado) =>
          transformar(id, (ficha) => aplicarResultadoDeTeste(ficha, resultado)),

        adicionarPassoDeCena: (id, alvo, motivo) =>
          transformar(id, (ficha) => adicionarPassoDeCena(ficha, alvo, motivo)),

        encerrarCena: (id) => transformar(id, encerrarCena),
        descansar: (id) => transformar(id, descansar),
        alternarCondicao: (id, condicao) => transformar(id, (ficha) => alternarCondicao(ficha, condicao)),
        registrarTesteDeFerimento: (id) => transformar(id, registrarTesteDeFerimento),
        registrarTesteDeTrauma: (id) => transformar(id, registrarTesteDeTrauma),
      };
    },
    {
      name: 'op2-fichas-store',
      partialize: (estado) => ({ fichas: estado.fichas }),
    },
  ),
);

export const useFichaOp2Ativa = (): FichaOp2 | undefined => {
  const fichaAtiva = useOp2FichasStore((estado) => estado.fichaAtiva);
  const fichas = useOp2FichasStore((estado) => estado.fichas);
  return fichas.find((ficha) => ficha.id === fichaAtiva);
};
