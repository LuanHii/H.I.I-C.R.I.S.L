import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { LivroDeRegras, OpcoesCatalogo } from '@/core/rules/catalogo';
import { CATALOGO_PADRAO } from '@/core/rules/catalogo';

interface CatalogoState extends OpcoesCatalogo {
  setHomebrewHabilitado: (habilitado: boolean) => void;
  toggleHomebrew: () => void;
  setLivrosHabilitados: (livros: readonly LivroDeRegras[]) => void;
}

export const useCatalogoStore = create<CatalogoState>()(
  persist(
    (set) => ({
      homebrewHabilitado: CATALOGO_PADRAO.homebrewHabilitado,
      livrosHabilitados: CATALOGO_PADRAO.livrosHabilitados,
      setHomebrewHabilitado: (habilitado) => set({ homebrewHabilitado: habilitado }),
      toggleHomebrew: () => set((estado) => ({ homebrewHabilitado: !estado.homebrewHabilitado })),
      setLivrosHabilitados: (livros) => set({ livrosHabilitados: livros }),
    }),
    { name: 'hiicris-catalogo' },
  ),
);
