'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
} from '@dnd-kit/core';
import {
    arrayMove,
    sortableKeyboardCoordinates,
} from '@dnd-kit/sortable';
import { type Combatant, type CombatState, generateCombatantId, rollInitiative } from '@/components/master/CombatManagerTypes';
import { REGRAS } from '@/data/reference/guiaRegras';
import { AMEACAS } from '@/data/combat/monsters';
import { useCloudFichas, useCloudMonsters, useCloudNPCs } from '@/core/storage';
import type { CombatantAbility } from '@/components/master/CombatManagerTypes';

const QUICK_ACTIONS = REGRAS.filter(r =>
    r.categoria === 'combate' || r.categoria === 'ataques' || r.categoria === 'manobras'
).slice(0, 15);

const QUICK_CONDITIONS = REGRAS.filter(r => r.categoria === 'condicoes').slice(0, 12);

interface CombatManagerCreature {
    id?: string;
    nome: string;
    pv?: number;
    defesa?: number;
    iniciativa?: number;
}

export function useCombatManager(creatures: CombatManagerCreature[] = []) {
    const { fichas, salvar: salvarFicha } = useCloudFichas();
    const { monstros, salvar: salvarMonstro } = useCloudMonsters();

    const userThreats = useMemo(() => monstros.map(m => m.ameaca), [monstros]);

    const agents = useMemo(() => fichas.map(f => {
        const p = f.personagem;
        const iniciativaBonus = p.periciasDetalhadas?.Iniciativa?.bonusFixo ?? 0;
        const abilities: CombatantAbility[] = [];

        p.poderes.forEach(poder => {
            abilities.push({
                name: poder.nome,
                description: poder.descricao,
                type: 'Poder'
            });
        });

        p.rituais.forEach(ritual => {
            abilities.push({
                name: ritual.nome,
                description: ritual.descricao,
                type: 'Ritual',
                cost: `${ritual.circulo} PE`
            });
        });

        return {
            id: f.id,
            nome: p.nome,
            pvAtual: p.pv?.atual ?? 0,
            pvMax: p.pv?.max ?? 0,
            peAtual: p.pe?.atual ?? 0,
            peMax: p.pe?.max ?? 0,
            sanAtual: p.san?.atual ?? 0,
            sanMax: p.san?.max ?? 0,
            defesa: p.defesa ?? 10,
            pericias: { Iniciativa: { total: iniciativaBonus } },
            abilities
        };
    }), [fichas]);

    const { npcs } = useCloudNPCs();
    const npcData = useMemo(() => npcs.map(n => n.npc), [npcs]);

    const allCreatures = useMemo(() => {
        const parseIniciativa = (sentidos: string | undefined): number => {
            if (!sentidos) return 0;
            const match = sentidos.match(/Iniciativa\s+(?:O\+?(\d+)|(\d+)d20\+(\d+))/i);
            if (match) {
                if (match[1]) return parseInt(match[1], 10);
                if (match[3]) return parseInt(match[3], 10);
            }
            return 0;
        };

        const sourceThreats = [...AMEACAS, ...userThreats];

        return sourceThreats.map(a => {
            const abilities: CombatantAbility[] = [];

            a.acoes.forEach(acao => {
                abilities.push({
                    name: acao.nome,
                    description: `${acao.descricao}${acao.teste ? ` (Teste: ${acao.teste})` : ''}${acao.dano ? ` (Dano: ${acao.dano})` : ''}`,
                    type: acao.tipo
                });
            });

            a.habilidades.forEach(h => {
                abilities.push({
                    name: h.nome,
                    description: h.descricao,
                    type: 'Habilidade'
                });
            });

            return {
                id: `ameaca-${a.nome.toLowerCase().replace(/\s+/g, '-')}`,
                nome: a.nome,
                pv: a.vida ?? 0,
                defesa: a.defesa ?? 10,
                iniciativa: parseIniciativa(a.sentidos),
                abilities,
                atributos: a.atributos,
                fortitude: (a as any).fortitude,
                reflexos: (a as any).reflexos,
                vontade: (a as any).vontade,
                resistencias: (a as any).resistencias,
                imunidades: (a as any).imunidades,
                vulnerabilidades: (a as any).vulnerabilidades,
                deslocamento: (a as any).deslocamento,
            };
        });
    }, [userThreats]);

    const mergedCreatures = useMemo(() => {
        return [...allCreatures, ...creatures];
    }, [allCreatures, creatures]);

    const loadState = (): CombatState => {
        if (typeof window === 'undefined') return { isActive: false, combatants: [], currentTurnIndex: 0, round: 1 };
        try {
            const saved = localStorage.getItem('combat-state');
            if (saved) return JSON.parse(saved);
        } catch { }
        return { isActive: false, combatants: [], currentTurnIndex: 0, round: 1 };
    };

    const [state, setState] = useState<CombatState>(loadState);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showQuickRef, setShowQuickRef] = useState(false);
    const [quickRefTab, setQuickRefTab] = useState<'dice' | 'actions' | 'conditions'>('dice');
    const [quickRefQuery, setQuickRefQuery] = useState('');
    const [orderMode, setOrderMode] = useState<'initiative' | 'manual'>('initiative');

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    useEffect(() => {
        setQuickRefQuery('');
    }, [quickRefTab]);

    const filteredQuickActions = useMemo(() => {
        const q = quickRefQuery.trim().toLowerCase();
        if (!q) return QUICK_ACTIONS;
        return QUICK_ACTIONS.filter(rule =>
            rule.titulo.toLowerCase().includes(q) ||
            rule.resumo.toLowerCase().includes(q) ||
            (rule.tags || []).some(t => t.toLowerCase().includes(q))
        );
    }, [quickRefQuery]);

    const filteredQuickConditions = useMemo(() => {
        const q = quickRefQuery.trim().toLowerCase();
        if (!q) return QUICK_CONDITIONS;
        return QUICK_CONDITIONS.filter(rule =>
            rule.titulo.toLowerCase().includes(q) ||
            rule.resumo.toLowerCase().includes(q) ||
            (rule.tags || []).some(t => t.toLowerCase().includes(q))
        );
    }, [quickRefQuery]);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            localStorage.setItem('combat-state', JSON.stringify(state));
        }
    }, [state]);

    const sortedCombatants = useMemo(() => {
        const active = state.combatants.filter(c => c.isActive);
        if (orderMode === 'manual') {
            return active;
        }
        return [...active].sort((a, b) => b.initiative - a.initiative);
    }, [state.combatants, orderMode]);

    const inactiveCombatants = useMemo(() => {
        return state.combatants.filter(c => !c.isActive);
    }, [state.combatants]);

    const currentCombatant = sortedCombatants[state.currentTurnIndex] || null;

    const addCombatants = useCallback((newCombatants: Combatant[]) => {
        setState(prev => ({
            ...prev,
            combatants: [...prev.combatants, ...newCombatants],
        }));
        setShowAddModal(false);
    }, []);

    const syncAgentStats = useCallback((combatant: Combatant) => {
        if (combatant.type !== 'agent' || !combatant.sourceId) return;

        const ficha = fichas.find(f => f.id === combatant.sourceId);
        if (!ficha) return;

        const novoPersonagem = { ...ficha.personagem };
        let changed = false;

        if (novoPersonagem.pv.atual !== combatant.hp.current) {
            novoPersonagem.pv = { ...novoPersonagem.pv, atual: combatant.hp.current };
            changed = true;
        }

        if (combatant.pe && novoPersonagem.pe.atual !== combatant.pe.current) {
            novoPersonagem.pe = { ...novoPersonagem.pe, atual: combatant.pe.current };
            changed = true;
        }

        if (combatant.san && novoPersonagem.san.atual !== combatant.san.current) {
            novoPersonagem.san = { ...novoPersonagem.san, atual: combatant.san.current };
            changed = true;
        }

        if (changed) {
            salvarFicha(novoPersonagem, combatant.sourceId);
        }
    }, [fichas, salvarFicha]);

    const updateCombatant = useCallback((id: string, updates: Partial<Combatant>) => {
        setState(prev => {
            const newCombatants = prev.combatants.map(c => {
                if (c.id === id) {
                    const updated = { ...c, ...updates };
                    syncAgentStats(updated);
                    return updated;
                }
                return c;
            });

            return {
                ...prev,
                combatants: newCombatants
            };
        });
    }, [syncAgentStats]);

    const removeCombatant = useCallback((id: string) => {
        setState(prev => {
            const newCombatants = prev.combatants.filter(c => c.id !== id);
            const newActiveCount = newCombatants.filter(c => c.isActive).length;
            return {
                ...prev,
                combatants: newCombatants,
                currentTurnIndex: Math.min(prev.currentTurnIndex, Math.max(0, newActiveCount - 1)),
            };
        });
    }, []);

    const duplicateCombatant = useCallback((id: string) => {
        setState(prev => {
            const original = prev.combatants.find(c => c.id === id);
            if (!original) return prev;

            const duplicate: Combatant = {
                ...original,
                id: generateCombatantId(),
                name: `${original.name} (cópia)`,
                initiative: rollInitiative(1, original.initiativeBonus),
            };

            return {
                ...prev,
                combatants: [...prev.combatants, duplicate],
            };
        });
    }, []);

    const nextTurn = useCallback(() => {
        setState(prev => {
            const activeCount = prev.combatants.filter(c => c.isActive).length;
            if (activeCount === 0) return prev;

            const nextIndex = prev.currentTurnIndex + 1;
            if (nextIndex >= activeCount) {
                return { ...prev, currentTurnIndex: 0, round: prev.round + 1 };
            }
            return { ...prev, currentTurnIndex: nextIndex };
        });
    }, []);

    const prevTurn = useCallback(() => {
        setState(prev => {
            const activeCount = prev.combatants.filter(c => c.isActive).length;
            if (activeCount === 0) return prev;

            if (prev.currentTurnIndex === 0) {
                if (prev.round > 1) {
                    return { ...prev, currentTurnIndex: activeCount - 1, round: prev.round - 1 };
                }
                return prev;
            }
            return { ...prev, currentTurnIndex: prev.currentTurnIndex - 1 };
        });
    }, []);

    const startCombat = useCallback(() => {
        setState(prev => ({ ...prev, isActive: true, currentTurnIndex: 0, round: 1 }));
    }, []);

    const endCombat = useCallback(() => {
        setState(prev => ({ ...prev, isActive: false }));
    }, []);

    const resetCombat = useCallback(() => {
        if (confirm('Tem certeza que deseja resetar o combate? Isso removerá todos os combatentes.')) {
            setState({ isActive: false, combatants: [], currentTurnIndex: 0, round: 1 });
        }
    }, []);

    const rerollAllInitiatives = useCallback(() => {
        setState(prev => ({
            ...prev,
            combatants: prev.combatants.map(c => ({
                ...c,
                initiative: rollInitiative(1, c.initiativeBonus),
            })),
            currentTurnIndex: 0,
        }));
        setOrderMode('initiative');
    }, []);

    const handleDragEnd = useCallback((event: DragEndEvent) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            setState(prev => {
                const activeIndex = prev.combatants.findIndex(c => c.id === active.id);
                const overIndex = prev.combatants.findIndex(c => c.id === over.id);

                return {
                    ...prev,
                    combatants: arrayMove(prev.combatants, activeIndex, overIndex),
                    currentTurnIndex: 0,
                };
            });
            setOrderMode('manual');
        }
    }, []);

    const sortByInitiative = useCallback(() => {
        setState(prev => ({
            ...prev,
            combatants: [...prev.combatants].sort((a, b) => {
                if (a.isActive !== b.isActive) return a.isActive ? -1 : 1;
                return b.initiative - a.initiative;
            }),
            currentTurnIndex: 0,
        }));
        setOrderMode('initiative');
    }, []);

    return {
        
        state,
        sortedCombatants,
        inactiveCombatants,
        currentCombatant,
        showAddModal, setShowAddModal,
        showQuickRef, setShowQuickRef,
        quickRefTab, setQuickRefTab,
        quickRefQuery, setQuickRefQuery,
        orderMode,
        
        sensors,
        agents,
        mergedCreatures,
        npcData,
        salvarMonstro,
        filteredQuickActions,
        filteredQuickConditions,
        
        addCombatants,
        updateCombatant,
        removeCombatant,
        duplicateCombatant,
        nextTurn,
        prevTurn,
        startCombat,
        endCombat,
        resetCombat,
        rerollAllInitiatives,
        handleDragEnd,
        sortByInitiative,
    };
}
