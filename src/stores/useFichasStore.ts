import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Personagem } from '@/core/types';
export interface FichaRegistro {
    id: string;
    nome: string;
    classe: string;
    nex: number;
    salvoEm: number | string | { seconds: number };
    campanhaId?: string;
    sincronizadaNaNuvem?: boolean;
    dados: Personagem;
}

export interface Campanha {
    id: string;
    nome: string;
    cor?: string;
    criadaEm: number;
}

interface FichasState {
    fichas: FichaRegistro[];
    campanhas: Campanha[];
    fichaAtiva: string | null;
    campanhaAtiva: string | null;
    setFichaAtiva: (id: string | null) => void;
    setCampanhaAtiva: (id: string | null) => void;
    addFicha: (ficha: FichaRegistro) => void;
    updateFicha: (id: string, dados: Partial<Personagem>) => void;
    removeFicha: (id: string) => void;
    addCampanha: (campanha: Campanha) => void;
    updateCampanha: (id: string, data: Partial<Campanha>) => void;
    removeCampanha: (id: string) => void;
    setFichas: (fichas: FichaRegistro[]) => void;
    setCampanhas: (campanhas: Campanha[]) => void;
    getFichaById: (id: string) => FichaRegistro | undefined;
    getFichasByCampanha: (campanhaId: string | null) => FichaRegistro[];
}

export const useFichasStore = create<FichasState>()(
    persist(
        (set, get) => ({
            fichas: [],
            campanhas: [],
            fichaAtiva: null,
            campanhaAtiva: null,
            setFichaAtiva: (id) => set({ fichaAtiva: id }),
            setCampanhaAtiva: (id) => set({ campanhaAtiva: id }),
            addFicha: (ficha) => set((state) => ({
                fichas: [...state.fichas, ficha]
            })),

            updateFicha: (id, dados) => set((state) => ({
                fichas: state.fichas.map((f) =>
                    f.id === id
                        ? { ...f, dados: { ...f.dados, ...dados }, salvoEm: Date.now() }
                        : f
                )
            })),

            removeFicha: (id) => set((state) => ({
                fichas: state.fichas.filter((f) => f.id !== id),
                fichaAtiva: state.fichaAtiva === id ? null : state.fichaAtiva
            })),
            addCampanha: (campanha) => set((state) => ({
                campanhas: [...state.campanhas, campanha]
            })),

            updateCampanha: (id, data) => set((state) => ({
                campanhas: state.campanhas.map((c) =>
                    c.id === id ? { ...c, ...data } : c
                )
            })),

            removeCampanha: (id) => set((state) => ({
                campanhas: state.campanhas.filter((c) => c.id !== id),
                fichas: state.fichas.map((f) =>
                    f.campanhaId === id ? { ...f, campanhaId: undefined } : f
                ),
                campanhaAtiva: state.campanhaAtiva === id ? null : state.campanhaAtiva
            })),
            setFichas: (fichas) => set({ fichas }),
            setCampanhas: (campanhas) => set({ campanhas }),
            getFichaById: (id) => get().fichas.find((f) => f.id === id),
            getFichasByCampanha: (campanhaId) =>
                get().fichas.filter((f) =>
                    campanhaId ? f.campanhaId === campanhaId : !f.campanhaId
                ),
        }),
        {
            name: 'fichas-store',
            partialize: (state) => ({
                fichas: state.fichas,
                campanhas: state.campanhas,
            }),
        }
    )
);
export const useFichaAtiva = () => {
    const fichaAtiva = useFichasStore((state) => state.fichaAtiva);
    const fichas = useFichasStore((state) => state.fichas);
    return fichas.find((f) => f.id === fichaAtiva);
};
