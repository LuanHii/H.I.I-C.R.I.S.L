"use client";

import { useCallback, useEffect, useMemo, useState } from 'react';
import { NPC, NPCRegistro } from '../types';
import { useAuthOptional } from '../firebase/auth';
import {
    saveNPCToCloud,
    deleteNPCFromCloud,
    subscribeToNPCs,
    NPCRegistroCloud,
} from '../firebase/userDataService';

const STORAGE_KEY = 'npcs-customizados';
const LIMITE_NPCS = 50;

function lerNPCsLocal(): NPCRegistro[] {
    if (typeof window === 'undefined') return [];
    try {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        if (!raw) return [];
        const parsed = JSON.parse(raw);
        if (!Array.isArray(parsed)) return [];
        // Basic validation/migration could go here if needed
        return parsed;
    } catch (err) {
        console.error('Erro ao ler NPCs locais', err);
        return [];
    }
}

function gravarNPCsLocal(npcs: NPCRegistro[]) {
    if (typeof window === 'undefined') return;
    try {
        const payload = JSON.stringify(npcs.slice(0, LIMITE_NPCS));
        window.localStorage.setItem(STORAGE_KEY, payload);
    } catch (err) {
        console.error('Erro ao salvar NPCs locais', err);
    }
}

export function useCloudNPCs() {
    const auth = useAuthOptional();
    const userId = auth?.user?.uid;
    const isAuthenticated = auth?.isAuthenticated ?? false;
    const authLoading = auth?.loading ?? true;

    const [npcs, setNpcs] = useState<NPCRegistro[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (authLoading) {
            return;
        }

        if (!isAuthenticated || !userId) {
            setNpcs(lerNPCsLocal());
            setLoading(false);
            return;
        }

        setLoading(true);
        const unsubscribe = subscribeToNPCs(userId, (cloudNpcs) => {
            const converted: NPCRegistro[] = cloudNpcs.map(n => ({
                id: n.id,
                npc: n.npc,
                atualizadoEm: n.atualizadoEm,
                sincronizadoNaNuvem: true
            }));
            setNpcs(converted);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [isAuthenticated, userId, authLoading]);

    const salvar = useCallback(
        async (npc: NPC, id?: string) => {
            const npcId = id ?? crypto.randomUUID();
            const now = new Date().toISOString();

            if (isAuthenticated && userId) {
                const npcCloud: NPCRegistroCloud = {
                    id: npcId,
                    npc,
                    atualizadoEm: now,
                };
                try {
                    await saveNPCToCloud(userId, npcCloud);
                } catch (err) {
                    console.error('Erro ao salvar NPC na nuvem:', err);
                }
            } else {
                setNpcs((prev) => {
                    const registro: NPCRegistro = {
                        id: npcId,
                        npc,
                        atualizadoEm: now,
                    };
                    const existentes = prev.filter((n) => n.id !== npcId);
                    const atualizados = [registro, ...existentes];
                    gravarNPCsLocal(atualizados);
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
                    await deleteNPCFromCloud(userId, id);
                } catch (err) {
                    console.error('Erro ao remover NPC da nuvem:', err);
                }
            } else {
                setNpcs((prev) => {
                    const filtrados = prev.filter((n) => n.id !== id);
                    gravarNPCsLocal(filtrados);
                    return filtrados;
                });
            }
        },
        [isAuthenticated, userId]
    );

    const duplicar = useCallback(
        async (id: string) => {
            const alvo = npcs.find((n) => n.id === id);
            if (!alvo) return;

            const novoId = crypto.randomUUID();
            const now = new Date().toISOString();
            const novoNpc = { ...alvo.npc, nome: `${alvo.npc.nome} (Cópia)` };

            if (isAuthenticated && userId) {
                const novoRegistro: NPCRegistroCloud = {
                    id: novoId,
                    npc: novoNpc,
                    atualizadoEm: now,
                };
                try {
                    await saveNPCToCloud(userId, novoRegistro);
                } catch (err) {
                    console.error('Erro ao duplicar NPC na nuvem:', err);
                }
            } else {
                setNpcs((prev) => {
                    const novo: NPCRegistro = {
                        id: novoId,
                        npc: novoNpc,
                        atualizadoEm: now,
                    };
                    const atualizados = [novo, ...prev];
                    gravarNPCsLocal(atualizados);
                    return atualizados;
                });
            }
        },
        [npcs, isAuthenticated, userId]
    );

    return useMemo(
        () => ({
            npcs,
            loading,
            salvar,
            remover,
            duplicar,
            isCloudMode: isAuthenticated,
        }),
        [npcs, loading, salvar, remover, duplicar, isAuthenticated]
    );
}
