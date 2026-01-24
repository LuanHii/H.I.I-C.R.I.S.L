import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Ameaca } from '@/core/types';

interface ThreatsState {
    threats: Ameaca[];
    addThreat: (threat: Ameaca) => void;
    removeThreat: (nome: string) => void;
    updateThreat: (nome: string, threat: Partial<Ameaca>) => void;
}

export const useThreatsStore = create<ThreatsState>()(
    persist(
        (set) => ({
            threats: [],
            addThreat: (threat) => set((state) => ({
                threats: [...state.threats, threat]
            })),
            removeThreat: (nome) => set((state) => ({
                threats: state.threats.filter((t) => t.nome !== nome)
            })),
            updateThreat: (nome, updates) => set((state) => ({
                threats: state.threats.map((t) =>
                    t.nome === nome ? { ...t, ...updates } : t
                )
            })),
        }),
        {
            name: 'user-threats-store',
        }
    )
);
