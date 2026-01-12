import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Personagem } from '@/core/types';

// Tipo para registro de ficha (espelho do useStoredFichas)
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
    // Estado
    fichas: FichaRegistro[];
    campanhas: Campanha[];
    fichaAtiva: string | null;
    campanhaAtiva: string | null;

    // Actions
    setFichaAtiva: (id: string | null) => void;
    setCampanhaAtiva: (id: string | null) => void;

    // CRUD Fichas
    addFicha: (ficha: FichaRegistro) => void;
    updateFicha: (id: string, dados: Partial<Personagem>) => void;
    removeFicha: (id: string) => void;

    // CRUD Campanhas
    addCampanha: (campanha: Campanha) => void;
    updateCampanha: (id: string, data: Partial<Campanha>) => void;
    removeCampanha: (id: string) => void;

    // Bulk
    setFichas: (fichas: FichaRegistro[]) => void;
    setCampanhas: (campanhas: Campanha[]) => void;

    // Selectors (helpers)
    getFichaById: (id: string) => FichaRegistro | undefined;
    getFichasByCampanha: (campanhaId: string | null) => FichaRegistro[];
}

export const useFichasStore = create<FichasState>()(
    persist(
        (set, get) => ({
            // Estado inicial
            fichas: [],
            campanhas: [],
            fichaAtiva: null,
            campanhaAtiva: null,

            // Actions simples
            setFichaAtiva: (id) => set({ fichaAtiva: id }),
            setCampanhaAtiva: (id) => set({ campanhaAtiva: id }),

            // CRUD Fichas
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

            // CRUD Campanhas
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
                // Desvincular fichas da campanha removida
                fichas: state.fichas.map((f) =>
                    f.campanhaId === id ? { ...f, campanhaId: undefined } : f
                ),
                campanhaAtiva: state.campanhaAtiva === id ? null : state.campanhaAtiva
            })),

            // Bulk
            setFichas: (fichas) => set({ fichas }),
            setCampanhas: (campanhas) => set({ campanhas }),

            // Selectors
            getFichaById: (id) => get().fichas.find((f) => f.id === id),
            getFichasByCampanha: (campanhaId) =>
                get().fichas.filter((f) =>
                    campanhaId ? f.campanhaId === campanhaId : !f.campanhaId
                ),
        }),
        {
            name: 'fichas-store',
            // Apenas persistir dados essenciais
            partialize: (state) => ({
                fichas: state.fichas,
                campanhas: state.campanhas,
            }),
        }
    )
);

// Hook seletor para performance
export const useFichaAtiva = () => {
    const fichaAtiva = useFichasStore((state) => state.fichaAtiva);
    const fichas = useFichasStore((state) => state.fichas);
    return fichas.find((f) => f.id === fichaAtiva);
};
