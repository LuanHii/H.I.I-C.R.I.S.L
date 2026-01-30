'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, Users, Skull, UserPlus, Dice6, PlusCircle } from 'lucide-react';
import { type Combatant, generateCombatantId, rollInitiative, type CombatantAbility } from './CombatManagerTypes';
import { cn } from '@/lib/utils';
interface AgentData {
    id: string;
    nome: string;
    pvAtual: number;
    pvMax: number;
    peAtual: number;
    peMax: number;
    sanAtual: number;
    sanMax: number;
    defesa: number;
    pericias?: { Iniciativa?: { total?: number } };
    abilities?: CombatantAbility[];
}

interface AmeacaData {
    id?: string;
    nome: string;
    pv?: number;
    defesa?: number;
    iniciativa?: number;
    abilities?: CombatantAbility[];
}

interface AddCombatantModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAdd: (combatants: Combatant[]) => void;
    agents: AgentData[];
    creatures: AmeacaData[];
    onCreateThreat?: (threat: any) => void;
}

type ModalTab = 'agents' | 'creatures' | 'custom';

export function AddCombatantModal({
    isOpen,
    onClose,
    onAdd,
    agents,
    creatures,
    onCreateThreat
}: AddCombatantModalProps) {
    const [tab, setTab] = useState<ModalTab>('agents');
    const [search, setSearch] = useState('');
    const [selectedAgents, setSelectedAgents] = useState<Set<string>>(new Set());
    const [selectedCreatures, setSelectedCreatures] = useState<Set<string>>(new Set());
    const [customName, setCustomName] = useState('');
    const [customHp, setCustomHp] = useState('20');
    const [customDefense, setCustomDefense] = useState('12');
    const [customInitBonus, setCustomInitBonus] = useState('0');

    const [customCount, setCustomCount] = useState('1');
    const [isCreatingThreat, setIsCreatingThreat] = useState(false);
    const [newThreat, setNewThreat] = useState({ nome: '', vd: 0, pv: 10, defesa: 10, iniciativa: 0 });
    const [newThreatAction, setNewThreatAction] = useState('');

    const filteredAgents = useMemo(() => {
        if (!search.trim()) return agents;
        const term = search.toLowerCase();
        return agents.filter(a => a.nome.toLowerCase().includes(term));
    }, [agents, search]);

    const filteredCreatures = useMemo(() => {
        if (!search.trim()) return creatures;
        const term = search.toLowerCase();
        return creatures.filter(c => c.nome.toLowerCase().includes(term));
    }, [creatures, search]);

    const toggleAgent = (id: string) => {
        const next = new Set(selectedAgents);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        setSelectedAgents(next);
    };

    const toggleCreature = (nome: string) => {
        const next = new Set(selectedCreatures);
        if (next.has(nome)) next.delete(nome);
        else next.add(nome);
        setSelectedCreatures(next);
    };

    const handleCreateThreat = () => {
        if (!newThreat.nome) return;

        const abilities: CombatantAbility[] = [];
        if (newThreatAction.trim()) {
            abilities.push({
                name: 'Ação/Habilidade',
                description: newThreatAction,
                type: 'Ação'
            });
        }

        const threatData = {
            ...newThreat,
            abilities,
            acoes: [],
            habilidades: [],
            tipo: 'Sangue',
            tamanho: 'Médio',
            sentidos: `Iniciativa +${newThreat.iniciativa}`,
            pericias: {},
            atributos: { AGI: 1, FOR: 1, INT: 1, PRE: 1, VIG: 1 }
        };

        if (onCreateThreat) {
            onCreateThreat(threatData);
            setIsCreatingThreat(false);
            setNewThreat({ nome: '', vd: 0, pv: 10, defesa: 10, iniciativa: 0 });
            setNewThreatAction('');
        }
    };

    const handleAddSelected = () => {
        const combatants: Combatant[] = [];
        selectedAgents.forEach(id => {
            const agent = agents.find(a => a.id === id);
            if (agent) {
                const initBonus = agent.pericias?.Iniciativa?.total ?? 0;
                combatants.push({
                    id: generateCombatantId(),
                    name: agent.nome,
                    type: 'agent',
                    sourceId: agent.id,
                    initiative: rollInitiative(1, initBonus),
                    initiativeBonus: initBonus,
                    hp: { current: agent.pvAtual, max: agent.pvMax },
                    pe: { current: agent.peAtual, max: agent.peMax },
                    san: { current: agent.sanAtual, max: agent.sanMax },
                    defense: agent.defesa,
                    conditions: [],
                    notes: '',
                    isActive: true,
                    abilities: agent.abilities,
                });
            }
        });
        selectedCreatures.forEach(nome => {
            const creature = creatures.find(c => c.nome === nome);
            if (creature) {
                combatants.push({
                    id: generateCombatantId(),
                    name: creature.nome,
                    type: 'creature',
                    initiative: rollInitiative(1, creature.iniciativa ?? 0),
                    initiativeBonus: creature.iniciativa ?? 0,
                    hp: { current: creature.pv ?? 20, max: creature.pv ?? 20 },
                    defense: creature.defesa ?? 12,
                    conditions: [],
                    notes: '',
                    isActive: true,
                    abilities: creature.abilities,
                });
            }
        });

        if (combatants.length > 0) {
            onAdd(combatants);
            setSelectedAgents(new Set());
            setSelectedCreatures(new Set());
        }
    };

    const handleAddCustom = () => {
        const count = Math.max(1, parseInt(customCount, 10) || 1);
        const hp = parseInt(customHp, 10) || 20;
        const def = parseInt(customDefense, 10) || 12;
        const initBonus = parseInt(customInitBonus, 10) || 0;
        const baseName = customName.trim() || 'NPC';

        const combatants: Combatant[] = [];
        for (let i = 0; i < count; i++) {
            combatants.push({
                id: generateCombatantId(),
                name: count > 1 ? `${baseName} #${i + 1}` : baseName,
                type: 'npc',
                initiative: rollInitiative(1, initBonus),
                initiativeBonus: initBonus,
                hp: { current: hp, max: hp },
                defense: def,
                conditions: [],
                notes: '',
                isActive: true,
            });
        }

        onAdd(combatants);
        setCustomName('');
        setCustomHp('20');
        setCustomDefense('12');
        setCustomInitBonus('0');
        setCustomCount('1');
    };

    if (!isOpen) return null;

    const totalSelected = selectedAgents.size + selectedCreatures.size;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4"
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    onClick={e => e.stopPropagation()}
                    className="w-full max-w-2xl bg-ordem-black border border-ordem-border rounded-xl shadow-2xl overflow-hidden"
                >
                    {}
                    <div className="px-4 py-3 border-b border-ordem-border flex items-center justify-between bg-ordem-ooze">
                        <h2 className="text-lg font-serif text-white">Adicionar Combatentes</h2>
                        <button onClick={onClose} className="p-1 text-ordem-text-secondary hover:text-white">
                            <X size={20} />
                        </button>
                    </div>

                    {}
                    <div className="flex border-b border-ordem-border">
                        <button
                            onClick={() => setTab('agents')}
                            className={cn(
                                'flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-colors',
                                tab === 'agents'
                                    ? 'bg-ordem-ooze text-ordem-green border-b-2 border-ordem-green'
                                    : 'text-ordem-text-secondary hover:text-white hover:bg-ordem-ooze/50'
                            )}
                        >
                            <Users size={16} /> Agentes ({agents.length})
                        </button>
                        <button
                            onClick={() => setTab('creatures')}
                            className={cn(
                                'flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-colors',
                                tab === 'creatures'
                                    ? 'bg-ordem-ooze text-ordem-red border-b-2 border-ordem-red'
                                    : 'text-ordem-text-secondary hover:text-white hover:bg-ordem-ooze/50'
                            )}
                        >
                            <Skull size={16} /> Ameaças ({creatures.length})
                        </button>
                        <button
                            onClick={() => setTab('custom')}
                            className={cn(
                                'flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-colors',
                                tab === 'custom'
                                    ? 'bg-ordem-ooze text-yellow-400 border-b-2 border-yellow-400'
                                    : 'text-ordem-text-secondary hover:text-white hover:bg-ordem-ooze/50'
                            )}
                        >
                            <UserPlus size={16} /> NPC Genérico
                        </button>
                    </div>

                    {}
                    <div className="p-4">
                        {}
                        {(tab === 'agents' || tab === 'creatures') && (
                            <div className="relative mb-4">
                                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ordem-text-muted" />
                                <input
                                    type="text"
                                    placeholder={tab === 'agents' ? 'Buscar agente...' : 'Buscar ameaça...'}
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                    className="w-full bg-ordem-ooze border border-ordem-border-light rounded-lg pl-10 pr-4 py-2 text-sm text-white placeholder:text-ordem-text-muted focus:outline-none focus:border-ordem-green/50"
                                />
                            </div>
                        )}



                        {}
                        {isCreatingThreat ? (
                            <div className="space-y-4">
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="font-bold text-white text-sm">Nova Ameaça</h3>
                                    <button
                                        onClick={() => setIsCreatingThreat(false)}
                                        className="text-xs text-ordem-text-secondary hover:text-white underline"
                                    >
                                        Voltar para lista
                                    </button>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs text-ordem-text-muted mb-1">Nome</label>
                                        <input
                                            value={newThreat.nome}
                                            onChange={e => setNewThreat({ ...newThreat, nome: e.target.value })}
                                            className="w-full bg-ordem-black border border-ordem-border rounded px-2 py-1 text-sm text-white"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-ordem-text-muted mb-1">VD</label>
                                        <input
                                            value={newThreat.vd}
                                            onChange={e => setNewThreat({ ...newThreat, vd: parseInt(e.target.value) || 0 })}
                                            className="w-full bg-ordem-black border border-ordem-border rounded px-2 py-1 text-sm text-white"
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-3 gap-3">
                                    <div>
                                        <label className="block text-xs text-ordem-text-muted mb-1">PV</label>
                                        <input
                                            type="number"
                                            value={newThreat.pv}
                                            onChange={e => setNewThreat({ ...newThreat, pv: parseInt(e.target.value) || 1 })}
                                            className="w-full bg-ordem-black border border-ordem-border rounded px-2 py-1 text-sm text-white"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-ordem-text-muted mb-1">Defesa</label>
                                        <input
                                            type="number"
                                            value={newThreat.defesa}
                                            onChange={e => setNewThreat({ ...newThreat, defesa: parseInt(e.target.value) || 0 })}
                                            className="w-full bg-ordem-black border border-ordem-border rounded px-2 py-1 text-sm text-white"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-ordem-text-muted mb-1">Iniciativa</label>
                                        <input
                                            type="number"
                                            value={newThreat.iniciativa}
                                            onChange={e => setNewThreat({ ...newThreat, iniciativa: parseInt(e.target.value) || 0 })}
                                            className="w-full bg-ordem-black border border-ordem-border rounded px-2 py-1 text-sm text-white"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs text-ordem-text-muted mb-1">Ações/Habilidades (Opcional)</label>
                                    <textarea
                                        placeholder="Ex: Ataque de Garra (Padrão): 1d20+10 (2d6+5)"
                                        className="w-full h-20 bg-ordem-black border border-ordem-border rounded px-2 py-1 text-xs text-white resize-none"
                                        value={newThreatAction}
                                        onChange={e => setNewThreatAction(e.target.value)}
                                    />
                                    <p className="text-[10px] text-ordem-text-muted mt-1">
                                        Adicione uma breve descrição para aparecer no card.
                                    </p>
                                </div>
                                <button
                                    onClick={handleCreateThreat}
                                    className="w-full py-2 bg-ordem-red hover:bg-red-700 text-white rounded font-bold transition-colors"
                                >
                                    Salvar Ameaça
                                </button>
                            </div>
                        ) : (
                            tab === 'creatures' && (
                                <button
                                    onClick={() => setIsCreatingThreat(true)}
                                    className="w-full mb-3 flex items-center justify-center gap-2 py-2 border border-dashed border-ordem-border hover:border-ordem-red text-ordem-text-secondary hover:text-ordem-red rounded transition-colors"
                                >
                                    <PlusCircle size={16} /> Criar Nova Ameaça
                                </button>
                            )
                        )}

                        {}
                        {tab === 'agents' && (
                            <div className="max-h-72 overflow-y-auto custom-scrollbar space-y-2">
                                {filteredAgents.length === 0 ? (
                                    <p className="text-center text-ordem-text-muted py-8">Nenhum agente encontrado</p>
                                ) : (
                                    filteredAgents.map(agent => (
                                        <button
                                            key={agent.id}
                                            onClick={() => toggleAgent(agent.id)}
                                            className={cn(
                                                'w-full p-3 rounded-lg border flex items-center gap-3 transition-colors text-left',
                                                selectedAgents.has(agent.id)
                                                    ? 'bg-ordem-green/20 border-ordem-green'
                                                    : 'bg-ordem-ooze/50 border-ordem-border hover:border-ordem-green/50'
                                            )}
                                        >
                                            <div className={cn(
                                                'w-5 h-5 rounded border-2 flex items-center justify-center shrink-0',
                                                selectedAgents.has(agent.id) ? 'border-ordem-green bg-ordem-green' : 'border-ordem-border'
                                            )}>
                                                {selectedAgents.has(agent.id) && <span className="text-white text-xs">✓</span>}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium text-white truncate">{agent.nome}</p>
                                                <p className="text-xs text-ordem-text-muted">
                                                    PV: {agent.pvAtual}/{agent.pvMax} | DEF: {agent.defesa}
                                                </p>
                                            </div>
                                        </button>
                                    ))
                                )}
                            </div>
                        )}

                        {}
                        {tab === 'creatures' && (
                            <div className="max-h-72 overflow-y-auto custom-scrollbar space-y-2">
                                {filteredCreatures.length === 0 ? (
                                    <p className="text-center text-ordem-text-muted py-8">Nenhuma ameaça encontrada</p>
                                ) : (
                                    filteredCreatures.map((creature, idx) => (
                                        <button
                                            key={creature.nome + idx}
                                            onClick={() => toggleCreature(creature.nome)}
                                            className={cn(
                                                'w-full p-3 rounded-lg border flex items-center gap-3 transition-colors text-left',
                                                selectedCreatures.has(creature.nome)
                                                    ? 'bg-ordem-red/20 border-ordem-red'
                                                    : 'bg-ordem-ooze/50 border-ordem-border hover:border-ordem-red/50'
                                            )}
                                        >
                                            <div className={cn(
                                                'w-5 h-5 rounded border-2 flex items-center justify-center shrink-0',
                                                selectedCreatures.has(creature.nome) ? 'border-ordem-red bg-ordem-red' : 'border-ordem-border'
                                            )}>
                                                {selectedCreatures.has(creature.nome) && <span className="text-white text-xs">✓</span>}
                                            </div>
                                            <Skull size={16} className="text-ordem-red shrink-0" />
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium text-white truncate">{creature.nome}</p>
                                                <p className="text-xs text-ordem-text-muted">
                                                    PV: {creature.pv ?? '?'} | DEF: {creature.defesa ?? '?'}
                                                </p>
                                            </div>
                                        </button>
                                    ))
                                )}
                            </div>
                        )}

                        {}
                        {tab === 'custom' && (
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs text-ordem-text-secondary mb-1">Nome</label>
                                    <input
                                        type="text"
                                        value={customName}
                                        onChange={e => setCustomName(e.target.value)}
                                        placeholder="Zumbi, Cultista, Guarda..."
                                        className="w-full bg-ordem-ooze border border-ordem-border rounded px-3 py-2 text-white placeholder:text-ordem-text-muted"
                                    />
                                </div>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                    <div>
                                        <label className="block text-xs text-ordem-text-secondary mb-1">PV</label>
                                        <input
                                            type="number"
                                            value={customHp}
                                            onChange={e => setCustomHp(e.target.value)}
                                            className="w-full bg-ordem-ooze border border-ordem-border rounded px-3 py-2 text-white text-center"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-ordem-text-secondary mb-1">Defesa</label>
                                        <input
                                            type="number"
                                            value={customDefense}
                                            onChange={e => setCustomDefense(e.target.value)}
                                            className="w-full bg-ordem-ooze border border-ordem-border rounded px-3 py-2 text-white text-center"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-ordem-text-secondary mb-1">Bônus Init.</label>
                                        <input
                                            type="number"
                                            value={customInitBonus}
                                            onChange={e => setCustomInitBonus(e.target.value)}
                                            className="w-full bg-ordem-ooze border border-ordem-border rounded px-3 py-2 text-white text-center"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-ordem-text-secondary mb-1">Quantidade</label>
                                        <input
                                            type="number"
                                            value={customCount}
                                            onChange={e => setCustomCount(e.target.value)}
                                            min="1"
                                            max="20"
                                            className="w-full bg-ordem-ooze border border-ordem-border rounded px-3 py-2 text-white text-center"
                                        />
                                    </div>
                                </div>
                                <button
                                    onClick={handleAddCustom}
                                    disabled={!customName.trim()}
                                    className="w-full py-2.5 bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
                                >
                                    <Dice6 size={16} />
                                    Adicionar {parseInt(customCount, 10) > 1 ? `${customCount}x ` : ''}{customName || 'NPC'}
                                </button>
                            </div>
                        )}
                    </div>

                    {}
                    {(tab === 'agents' || tab === 'creatures') && (
                        <div className="px-4 py-3 border-t border-ordem-border bg-ordem-ooze flex items-center justify-between">
                            <span className="text-sm text-ordem-text-secondary">
                                {totalSelected} selecionado(s)
                            </span>
                            <div className="flex gap-2">
                                <button
                                    onClick={onClose}
                                    className="px-4 py-2 text-sm text-ordem-text-secondary hover:text-white transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={handleAddSelected}
                                    disabled={totalSelected === 0}
                                    className="px-4 py-2 bg-ordem-green hover:bg-green-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
                                >
                                    <Dice6 size={14} />
                                    Adicionar e Rolar Iniciativa
                                </button>
                            </div>
                        </div>
                    )}
                </motion.div>
            </motion.div>
        </AnimatePresence >
    );
}
