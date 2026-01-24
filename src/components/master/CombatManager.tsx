'use client';

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Play, Pause, SkipForward, SkipBack, RotateCcw, Plus,
    Swords, Users, BookOpen, RefreshCw,
    AlertCircle, Dice6
} from 'lucide-react';
import { type Combatant, type CombatState, type CombatantAbility, generateCombatantId, rollInitiative } from './CombatManagerTypes';
import { CombatantCard } from './CombatantCard';
import { AddCombatantModal } from './AddCombatantModal';
import { DiceRoller } from './DiceRoller';
import { REGRAS } from '@/data/guiaRegras';
import { AMEACAS } from '@/data/monsters';
import { useStoredFichas } from '@/core/storage/useStoredFichas';
import { useStoredMonsters } from '@/core/storage/useStoredMonsters';
import { cn } from '@/lib/utils';

// Quick reference data
const QUICK_ACTIONS = REGRAS.filter(r =>
    r.categoria === 'combate' || r.categoria === 'ataques' || r.categoria === 'manobras'
).slice(0, 15);

const QUICK_CONDITIONS = REGRAS.filter(r => r.categoria === 'condicoes').slice(0, 12);

interface CombatManagerProps {
    creatures?: Array<{
        id?: string;
        nome: string;
        pv?: number;
        defesa?: number;
        iniciativa?: number;
    }>;
}

export function CombatManager({ creatures = [] }: CombatManagerProps) {
    // Load fichas from storage
    const { fichas, salvar: salvarFicha } = useStoredFichas();
    // Load custom threats from existing unified store
    const { monstros, salvar: salvarMonstro } = useStoredMonsters();

    const userThreats = useMemo(() => monstros.map(m => m.ameaca), [monstros]);

    // Transform fichas to agent format for AddCombatantModal
    const agents = useMemo(() => fichas.map(f => {
        const p = f.personagem;
        // Get iniciativa bonus from periciasDetalhadas if available
        const iniciativaBonus = p.periciasDetalhadas?.Iniciativa?.bonusFixo ?? 0;

        // Map abilities
        const abilities: CombatantAbility[] = [];

        // Powers
        p.poderes.forEach(poder => {
            abilities.push({
                name: poder.nome,
                description: poder.descricao,
                type: 'Poder'
            });
        });

        // Rituals
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
            abilities // Pass to modal
        };
    }), [fichas]);

    // Transform AMEACAS and userThreats to creatures format for AddCombatantModal
    const allCreatures = useMemo(() => {
        // Parse initiative from sentidos string (e.g., "Iniciativa O+5" or "Iniciativa 2d20+10")
        const parseIniciativa = (sentidos: string | undefined): number => {
            if (!sentidos) return 0;
            const match = sentidos.match(/Iniciativa\s+(?:O\+?(\d+)|(\d+)d20\+(\d+))/i);
            if (match) {
                if (match[1]) return parseInt(match[1], 10); // O+X format
                if (match[3]) return parseInt(match[3], 10); // XdY+Z format - return base bonus
            }
            return 0;
        };

        const sourceThreats = [...AMEACAS, ...userThreats];

        return sourceThreats.map(a => {
            const abilities: CombatantAbility[] = [];

            // Actions
            a.acoes.forEach(acao => {
                abilities.push({
                    name: acao.nome,
                    description: `${acao.descricao}${acao.teste ? ` (Teste: ${acao.teste})` : ''}${acao.dano ? ` (Dano: ${acao.dano})` : ''}`,
                    type: acao.tipo // Padrão, Movimento, etc.
                });
            });

            // Abilities
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
                abilities // Pass to modal
            };
        });
    }, [userThreats]);

    // Merge external creatures prop with AMEACAS data
    const mergedCreatures = useMemo(() => {
        return [...allCreatures, ...creatures];
    }, [allCreatures, creatures]);

    // Load state from localStorage
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

    // Save state to localStorage
    useEffect(() => {
        if (typeof window !== 'undefined') {
            localStorage.setItem('combat-state', JSON.stringify(state));
        }
    }, [state]);

    // Sorted combatants by initiative (highest first)
    const sortedCombatants = useMemo(() => {
        return [...state.combatants]
            .filter(c => c.isActive)
            .sort((a, b) => b.initiative - a.initiative);
    }, [state.combatants]);

    const inactiveCombatants = useMemo(() => {
        return state.combatants.filter(c => !c.isActive);
    }, [state.combatants]);

    // Current combatant
    const currentCombatant = sortedCombatants[state.currentTurnIndex] || null;

    // Actions
    const addCombatants = useCallback((newCombatants: Combatant[]) => {
        setState(prev => ({
            ...prev,
            combatants: [...prev.combatants, ...newCombatants],
        }));
        setShowAddModal(false);
    }, []);

    // Sync agent stats with stored fichas
    const syncAgentStats = useCallback((combatant: Combatant) => {
        if (combatant.type !== 'agent' || !combatant.sourceId) return;

        const ficha = fichas.find(f => f.id === combatant.sourceId);
        if (!ficha) return;

        const novoPersonagem = { ...ficha.personagem };
        let changed = false;

        // Update PV
        if (novoPersonagem.pv.atual !== combatant.hp.current) {
            // Ensure we preserve other pv properties
            novoPersonagem.pv = { ...novoPersonagem.pv, atual: combatant.hp.current };
            changed = true;
        }

        // Update PE
        if (combatant.pe && novoPersonagem.pe.atual !== combatant.pe.current) {
            novoPersonagem.pe = { ...novoPersonagem.pe, atual: combatant.pe.current };
            changed = true;
        }

        // Update SAN
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
                    // Sync with ficha if it's an agent
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
                // New round
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
    }, []);

    return (
        <div className="max-w-7xl mx-auto p-4 sm:p-6">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6"
            >
                <div className="flex items-center justify-between flex-wrap gap-4">
                    <div>
                        <h1 className="text-2xl font-serif text-white flex items-center gap-3">
                            <Swords className="text-ordem-red" />
                            Gerenciador de Combate
                        </h1>
                        <p className="text-ordem-text-secondary text-sm mt-1">
                            Controle iniciativa, turnos e condições da batalha
                        </p>
                    </div>

                    {/* Combat Controls */}
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setShowAddModal(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-ordem-green hover:bg-green-600 text-white rounded-lg transition-colors"
                        >
                            <Plus size={16} /> Adicionar
                        </button>
                        <button
                            onClick={() => setShowQuickRef(!showQuickRef)}
                            className={cn(
                                'flex items-center gap-2 px-4 py-2 rounded-lg transition-colors',
                                showQuickRef
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-ordem-ooze border border-ordem-border text-ordem-text-secondary hover:text-white'
                            )}
                        >
                            <BookOpen size={16} /> Referência
                        </button>
                        <button
                            onClick={resetCombat}
                            className="flex items-center gap-2 px-4 py-2 bg-ordem-ooze border border-ordem-border hover:bg-red-900/50 hover:border-red-800 text-ordem-text-secondary hover:text-red-200 rounded-lg transition-colors"
                            title="Resetar e limpar combate"
                        >
                            <RotateCcw size={16} /> Encerrar
                        </button>
                    </div>
                </div>
            </motion.div>

            {/* Main Content */}
            <div className="flex gap-6">
                {/* Initiative Tracker */}
                <div className="flex-1 min-w-0">
                    {/* Combat Status Bar */}
                    <div className="mb-4 p-4 bg-ordem-ooze/50 border border-ordem-border rounded-xl">
                        <div className="flex items-center justify-between flex-wrap gap-3">
                            <div className="flex items-center gap-4">
                                {/* Round Counter */}
                                <div className="text-center">
                                    <span className="text-2xl font-bold text-white">{state.round}</span>
                                    <p className="text-[10px] text-ordem-text-muted uppercase">Rodada</p>
                                </div>

                                {/* Turn Counter */}
                                <div className="text-center">
                                    <span className="text-2xl font-bold text-ordem-green">
                                        {sortedCombatants.length > 0 ? state.currentTurnIndex + 1 : 0}
                                    </span>
                                    <span className="text-lg text-ordem-text-muted">/{sortedCombatants.length}</span>
                                    <p className="text-[10px] text-ordem-text-muted uppercase">Turno</p>
                                </div>

                                {/* Current Combatant Name */}
                                {currentCombatant && state.isActive && (
                                    <div className="hidden sm:block pl-4 border-l border-ordem-border">
                                        <p className="text-xs text-ordem-text-muted">Vez de:</p>
                                        <p className="text-lg font-bold text-ordem-green">{currentCombatant.name}</p>
                                    </div>
                                )}
                            </div>

                            {/* Controls */}
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={prevTurn}
                                    disabled={!state.isActive || sortedCombatants.length === 0}
                                    className="p-2 bg-ordem-ooze border border-ordem-border rounded-lg text-ordem-text-secondary hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    title="Turno anterior"
                                >
                                    <SkipBack size={18} />
                                </button>

                                {state.isActive ? (
                                    <button
                                        onClick={endCombat}
                                        className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-colors flex items-center gap-2"
                                    >
                                        <Pause size={16} /> Pausar
                                    </button>
                                ) : (
                                    <button
                                        onClick={startCombat}
                                        disabled={sortedCombatants.length === 0}
                                        className="px-4 py-2 bg-ordem-green hover:bg-green-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center gap-2"
                                    >
                                        <Play size={16} /> Iniciar
                                    </button>
                                )}

                                <button
                                    onClick={nextTurn}
                                    disabled={!state.isActive || sortedCombatants.length === 0}
                                    className="p-2 bg-ordem-green hover:bg-green-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
                                    title="Próximo turno"
                                >
                                    <SkipForward size={18} />
                                </button>

                                <div className="w-px h-8 bg-ordem-border mx-1" />

                                <button
                                    onClick={rerollAllInitiatives}
                                    disabled={state.combatants.length === 0}
                                    className="p-2 bg-ordem-ooze border border-ordem-border rounded-lg text-ordem-text-secondary hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    title="Rerolar iniciativas"
                                >
                                    <RefreshCw size={18} />
                                </button>

                                <button
                                    onClick={resetCombat}
                                    className="p-2 bg-red-600/20 border border-red-600/30 rounded-lg text-red-400 hover:bg-red-600/40 transition-colors"
                                    title="Resetar combate"
                                >
                                    <RotateCcw size={18} />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Combatants List */}
                    {state.combatants.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-center py-16 border-2 border-dashed border-ordem-border rounded-xl"
                        >
                            <Users size={48} className="mx-auto text-ordem-text-muted mb-4" />
                            <h3 className="text-lg text-ordem-text-secondary mb-2">Nenhum combatente</h3>
                            <p className="text-sm text-ordem-text-muted mb-4">
                                Adicione agentes, criaturas ou NPCs para começar o combate
                            </p>
                            <button
                                onClick={() => setShowAddModal(true)}
                                className="px-4 py-2 bg-ordem-green hover:bg-green-600 text-white rounded-lg transition-colors inline-flex items-center gap-2"
                            >
                                <Plus size={16} /> Adicionar Combatentes
                            </button>
                        </motion.div>
                    ) : (
                        <div className="space-y-3">
                            <AnimatePresence mode="popLayout">
                                {sortedCombatants.map((combatant, index) => (
                                    <CombatantCard
                                        key={combatant.id}
                                        combatant={combatant}
                                        isCurrentTurn={state.isActive && index === state.currentTurnIndex}
                                        onUpdate={(updates) => updateCombatant(combatant.id, updates)}
                                        onRemove={() => removeCombatant(combatant.id)}
                                        onDuplicate={() => duplicateCombatant(combatant.id)}
                                    />
                                ))}
                            </AnimatePresence>

                            {/* Inactive Combatants */}
                            {inactiveCombatants.length > 0 && (
                                <div className="mt-6 pt-4 border-t border-ordem-border">
                                    <h3 className="text-sm text-ordem-text-muted mb-3 flex items-center gap-2">
                                        <AlertCircle size={14} /> Inativos ({inactiveCombatants.length})
                                    </h3>
                                    <div className="space-y-2 opacity-60">
                                        {inactiveCombatants.map(combatant => (
                                            <CombatantCard
                                                key={combatant.id}
                                                combatant={combatant}
                                                isCurrentTurn={false}
                                                onUpdate={(updates) => updateCombatant(combatant.id, updates)}
                                                onRemove={() => removeCombatant(combatant.id)}
                                                onDuplicate={() => duplicateCombatant(combatant.id)}
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Quick Reference Panel */}
                <AnimatePresence>
                    {showQuickRef && (
                        <motion.div
                            initial={{ opacity: 0, x: 20, width: 0 }}
                            animate={{ opacity: 1, x: 0, width: 320 }}
                            exit={{ opacity: 0, x: 20, width: 0 }}
                            className="shrink-0 overflow-hidden"
                        >
                            <div className="w-80 bg-ordem-ooze/50 border border-ordem-border rounded-xl overflow-hidden">
                                <div className="p-3 border-b border-ordem-border bg-ordem-black/50">
                                    <h3 className="font-bold text-white flex items-center gap-2">
                                        <BookOpen size={16} /> Referência Rápida
                                    </h3>
                                </div>

                                {/* Tabs */}
                                <div className="flex border-b border-ordem-border">
                                    <button
                                        onClick={() => setQuickRefTab('dice')}
                                        className={cn(
                                            'flex-1 px-3 py-2 text-xs font-medium transition-colors',
                                            quickRefTab === 'dice' ? 'bg-ordem-ooze text-white' : 'text-ordem-text-muted hover:text-white'
                                        )}
                                    >
                                        🎲 Dados
                                    </button>
                                    <button
                                        onClick={() => setQuickRefTab('actions')}
                                        className={cn(
                                            'flex-1 px-3 py-2 text-xs font-medium transition-colors',
                                            quickRefTab === 'actions' ? 'bg-ordem-ooze text-white' : 'text-ordem-text-muted hover:text-white'
                                        )}
                                    >
                                        Ações
                                    </button>
                                    <button
                                        onClick={() => setQuickRefTab('conditions')}
                                        className={cn(
                                            'flex-1 px-3 py-2 text-xs font-medium transition-colors',
                                            quickRefTab === 'conditions' ? 'bg-ordem-ooze text-white' : 'text-ordem-text-muted hover:text-white'
                                        )}
                                    >
                                        Condições
                                    </button>
                                </div>

                                {/* Content */}
                                <div className="max-h-[calc(100vh-300px)] overflow-y-auto custom-scrollbar">
                                    {quickRefTab === 'dice' && (
                                        <div className="p-2">
                                            <DiceRoller compact />
                                        </div>
                                    )}
                                    {quickRefTab === 'actions' && (
                                        <div className="p-2 space-y-1">
                                            {QUICK_ACTIONS.map(rule => (
                                                <div key={rule.id} className="p-2 hover:bg-ordem-ooze rounded transition-colors">
                                                    <h4 className="text-sm font-medium text-white">{rule.titulo}</h4>
                                                    <p className="text-xs text-ordem-text-muted">{rule.resumo}</p>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                    {quickRefTab === 'conditions' && (
                                        <div className="p-2 space-y-1">
                                            {QUICK_CONDITIONS.map(rule => (
                                                <div key={rule.id} className="p-2 hover:bg-ordem-ooze rounded transition-colors">
                                                    <h4 className="text-sm font-medium text-white">{rule.titulo}</h4>
                                                    <p className="text-xs text-ordem-text-muted">{rule.resumo}</p>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Add Combatant Modal */}
            <AddCombatantModal
                isOpen={showAddModal}
                onClose={() => setShowAddModal(false)}
                onAdd={addCombatants}
                agents={agents}
                creatures={mergedCreatures}
                onCreateThreat={(t) => salvarMonstro(t)}
            />
        </div>
    );
}
