'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Play, Pause, SkipForward, SkipBack, RotateCcw, Plus,
    Swords, Users, BookOpen, RefreshCw,
    AlertCircle, ArrowUpDown, Hash
} from 'lucide-react';
import {
    DndContext,
    closestCenter,
} from '@dnd-kit/core';
import {
    SortableContext,
    useSortable,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { type Combatant } from './CombatManagerTypes';
import { CombatantCard } from './CombatantCard';
import { AddCombatantModal } from './AddCombatantModal';
import { DiceRoller } from './DiceRoller';
import { cn } from '@/lib/utils';
import { useCombatManager } from '@/hooks/useCombatManager';

function SortableCombatantCard({
    combatant,
    isCurrentTurn,
    onUpdate,
    onRemove,
    onDuplicate,
}: {
    combatant: Combatant;
    isCurrentTurn: boolean;
    onUpdate: (updates: Partial<Combatant>) => void;
    onRemove: () => void;
    onDuplicate: () => void;
}) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: combatant.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <div ref={setNodeRef} style={style}>
            <CombatantCard
                combatant={combatant}
                isCurrentTurn={isCurrentTurn}
                onUpdate={onUpdate}
                onRemove={onRemove}
                onDuplicate={onDuplicate}
                isDragging={isDragging}
                dragHandleProps={{ ...attributes, ...listeners }}
            />
        </div>
    );
}

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
    const {
        state, sortedCombatants, inactiveCombatants, currentCombatant,
        showAddModal, setShowAddModal, showQuickRef, setShowQuickRef,
        quickRefTab, setQuickRefTab, quickRefQuery, setQuickRefQuery,
        orderMode, sensors, agents, mergedCreatures, npcData, salvarMonstro,
        filteredQuickActions, filteredQuickConditions,
        addCombatants, updateCombatant, removeCombatant, duplicateCombatant,
        nextTurn, prevTurn, startCombat, endCombat, resetCombat,
        rerollAllInitiatives, handleDragEnd, sortByInitiative,
    } = useCombatManager(creatures);

    return (
        <div className="max-w-7xl mx-auto p-4 sm:p-6">

            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6"
            >
                <div className="flex items-center justify-between flex-wrap gap-4">
                    <div>
                        <h1 className="flex items-center gap-3 font-serif text-xl text-white sm:text-2xl">
                            <Swords className="text-ordem-red" />
                            Gerenciador de Combate
                        </h1>
                        <p className="text-ordem-text-secondary text-sm mt-1">
                            Controle iniciativa, turnos e condições da batalha
                        </p>
                    </div>

                    <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto">
                        <button
                            onClick={() => setShowAddModal(true)}
                            className="flex h-11 flex-1 items-center justify-center gap-2 rounded-lg bg-ordem-green px-4 text-white transition-colors hover:bg-green-600 sm:flex-none"
                        >
                            <Plus size={16} /> Adicionar
                        </button>
                        <button
                            onClick={() => setShowQuickRef(!showQuickRef)}
                            className={cn(
                                'flex h-11 flex-1 items-center justify-center gap-2 rounded-lg px-4 transition-colors sm:flex-none',
                                showQuickRef
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-ordem-ooze border border-ordem-border text-ordem-text-secondary hover:text-white'
                            )}
                        >
                            <BookOpen size={16} /> Referência
                        </button>
                        <button
                            onClick={resetCombat}
                            className="flex h-11 flex-1 items-center justify-center gap-2 rounded-lg border border-ordem-border bg-ordem-ooze px-4 text-ordem-text-secondary transition-colors hover:border-red-800 hover:bg-red-900/50 hover:text-red-200 sm:flex-none"
                            title="Resetar e limpar combate"
                        >
                            <RotateCcw size={16} /> Encerrar
                        </button>
                    </div>
                </div>
            </motion.div>

            <div className="flex gap-6">

                <div className="flex-1 min-w-0">

                    <div className="mb-4 p-4 bg-ordem-ooze/50 border border-ordem-border rounded-xl">
                        <div className="flex items-center justify-between flex-wrap gap-3">
                            <div className="flex items-center gap-4">

                                <div className="text-center">
                                    <span className="text-2xl font-bold text-white">{state.round}</span>
                                    <p className="text-[10px] text-ordem-text-muted uppercase">Rodada</p>
                                </div>

                                <div className="text-center">
                                    <span className="text-2xl font-bold text-ordem-green">
                                        {sortedCombatants.length > 0 ? state.currentTurnIndex + 1 : 0}
                                    </span>
                                    <span className="text-lg text-ordem-text-muted">/{sortedCombatants.length}</span>
                                    <p className="text-[10px] text-ordem-text-muted uppercase">Turno</p>
                                </div>

                                {currentCombatant && state.isActive && (
                                    <div className="hidden sm:block pl-4 border-l border-ordem-border">
                                        <p className="text-xs text-ordem-text-muted">Vez de:</p>
                                        <p className="text-lg font-bold text-ordem-green">{currentCombatant.name}</p>
                                    </div>
                                )}
                            </div>

                            <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto sm:flex-nowrap">
                                <button
                                    onClick={prevTurn}
                                    disabled={!state.isActive || sortedCombatants.length === 0}
                                    className="grid h-11 w-11 shrink-0 place-items-center rounded-lg border border-ordem-border bg-ordem-ooze text-ordem-text-secondary transition-colors hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                                    title="Turno anterior"
                                >
                                    <SkipBack size={18} />
                                </button>

                                {state.isActive ? (
                                    <button
                                        onClick={endCombat}
                                        className="flex h-11 flex-1 items-center justify-center gap-2 rounded-lg bg-yellow-600 px-4 text-white transition-colors hover:bg-yellow-700 sm:flex-none min-w-[120px]"
                                    >
                                        <Pause size={16} /> Pausar
                                    </button>
                                ) : (
                                    <button
                                        onClick={startCombat}
                                        disabled={sortedCombatants.length === 0}
                                        className="flex h-11 flex-1 items-center justify-center gap-2 rounded-lg bg-ordem-green px-4 text-white transition-colors hover:bg-green-600 disabled:cursor-not-allowed disabled:bg-gray-600 sm:flex-none min-w-[120px]"
                                    >
                                        <Play size={16} /> Iniciar
                                    </button>
                                )}

                                <button
                                    onClick={nextTurn}
                                    disabled={!state.isActive || sortedCombatants.length === 0}
                                    className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-ordem-green text-white transition-colors hover:bg-green-600 disabled:cursor-not-allowed disabled:bg-gray-600"
                                    title="Próximo turno"
                                >
                                    <SkipForward size={18} />
                                </button>

                                <div className="mx-1 hidden h-8 w-px bg-ordem-border sm:block" />

                                <button
                                    onClick={rerollAllInitiatives}
                                    disabled={state.combatants.length === 0}
                                    className="grid h-11 w-11 shrink-0 place-items-center rounded-lg border border-ordem-border bg-ordem-ooze text-ordem-text-secondary transition-colors hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                                    title="Rerolar iniciativas"
                                >
                                    <RefreshCw size={18} />
                                </button>

                                <button
                                    onClick={sortByInitiative}
                                    disabled={state.combatants.length === 0}
                                    className={cn(
                                        'grid h-11 w-11 shrink-0 place-items-center rounded-lg border transition-colors disabled:cursor-not-allowed disabled:opacity-50',
                                        orderMode === 'initiative'
                                            ? 'bg-ordem-green/20 border-ordem-green text-ordem-green'
                                            : 'bg-ordem-ooze border-ordem-border text-ordem-text-secondary hover:text-white'
                                    )}
                                    title="Ordenar por iniciativa"
                                >
                                    <Hash size={18} />
                                </button>

                                <button
                                    onClick={resetCombat}
                                    className="grid h-11 w-11 shrink-0 place-items-center rounded-lg border border-red-600/30 bg-red-600/20 text-red-400 transition-colors hover:bg-red-600/40"
                                    title="Resetar combate"
                                >
                                    <RotateCcw size={18} />
                                </button>
                            </div>
                        </div>

                        {state.combatants.length > 0 && (
                            <div className="flex items-center justify-between mt-3 pt-3 border-t border-ordem-border/50">
                                <div className="flex items-center gap-2 text-xs text-ordem-text-muted">
                                    <ArrowUpDown size={14} />
                                    <span>Arraste para reordenar • Clique na iniciativa para editar</span>
                                </div>
                                <div className={cn(
                                    "text-[10px] px-2 py-1 rounded font-mono",
                                    orderMode === 'initiative'
                                        ? 'bg-ordem-green/20 text-ordem-green'
                                        : 'bg-ordem-gold/20 text-ordem-gold'
                                )}>
                                    {orderMode === 'initiative' ? 'ORDEM: INICIATIVA' : 'ORDEM: MANUAL'}
                                </div>
                            </div>
                        )}
                    </div>

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
                        <DndContext
                            sensors={sensors}
                            collisionDetection={closestCenter}
                            onDragEnd={handleDragEnd}
                        >
                            <SortableContext
                                items={sortedCombatants.map(c => c.id)}
                                strategy={verticalListSortingStrategy}
                            >
                                <div className="space-y-2">
                                    {sortedCombatants.map((combatant, index) => (
                                        <SortableCombatantCard
                                            key={combatant.id}
                                            combatant={combatant}
                                            isCurrentTurn={state.isActive && index === state.currentTurnIndex}
                                            onUpdate={(updates) => updateCombatant(combatant.id, updates)}
                                            onRemove={() => removeCombatant(combatant.id)}
                                            onDuplicate={() => duplicateCombatant(combatant.id)}
                                        />
                                    ))}
                                </div>
                            </SortableContext>

                            {inactiveCombatants.length > 0 && (
                                <div className="mt-6 pt-4 border-t border-ordem-border">
                                    <h3 className="text-sm text-ordem-text-muted mb-3 flex items-center gap-2">
                                        <AlertCircle size={14} /> Inativos ({inactiveCombatants.length})
                                    </h3>
                                    <SortableContext
                                        items={inactiveCombatants.map(c => c.id)}
                                        strategy={verticalListSortingStrategy}
                                    >
                                        <div className="space-y-2 opacity-60">
                                            {inactiveCombatants.map(combatant => (
                                                <SortableCombatantCard
                                                    key={combatant.id}
                                                    combatant={combatant}
                                                    isCurrentTurn={false}
                                                    onUpdate={(updates) => updateCombatant(combatant.id, updates)}
                                                    onRemove={() => removeCombatant(combatant.id)}
                                                    onDuplicate={() => duplicateCombatant(combatant.id)}
                                                />
                                            ))}
                                        </div>
                                    </SortableContext>
                                </div>
                            )}
                        </DndContext>
                    )}
                </div>

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

                                <div className="max-h-[calc(100vh-300px)] overflow-y-auto custom-scrollbar">
                                    {quickRefTab === 'dice' && (
                                        <div className="p-2">
                                            <DiceRoller compact />
                                        </div>
                                    )}
                                    {quickRefTab === 'actions' && (
                                        <div className="p-2 space-y-2">
                                            <input
                                                value={quickRefQuery}
                                                onChange={(e) => setQuickRefQuery(e.target.value)}
                                                placeholder="Buscar ações..."
                                                className="w-full bg-ordem-black/40 border border-ordem-border-light text-white px-3 py-2 rounded focus:border-ordem-red focus:outline-none text-xs"
                                            />
                                            <div className="text-[10px] text-ordem-text-muted">
                                                {filteredQuickActions.length} resultado(s)
                                            </div>
                                            {filteredQuickActions.map(rule => (
                                                <div
                                                    key={rule.id}
                                                    className="p-2 hover:bg-ordem-ooze rounded transition-colors"
                                                    title={rule.detalhes || rule.resumo}
                                                >
                                                    <h4 className="text-sm font-medium text-white">{rule.titulo}</h4>
                                                    <p className="text-xs text-ordem-text-muted">{rule.resumo}</p>
                                                </div>
                                            ))}
                                            {filteredQuickActions.length === 0 && (
                                                <div className="text-xs text-ordem-text-muted italic py-2">
                                                    Nenhuma ação encontrada.
                                                </div>
                                            )}
                                        </div>
                                    )}
                                    {quickRefTab === 'conditions' && (
                                        <div className="p-2 space-y-2">
                                            <input
                                                value={quickRefQuery}
                                                onChange={(e) => setQuickRefQuery(e.target.value)}
                                                placeholder="Buscar condições..."
                                                className="w-full bg-ordem-black/40 border border-ordem-border-light text-white px-3 py-2 rounded focus:border-ordem-red focus:outline-none text-xs"
                                            />
                                            <div className="text-[10px] text-ordem-text-muted">
                                                {filteredQuickConditions.length} resultado(s)
                                            </div>
                                            {filteredQuickConditions.map(rule => (
                                                <div
                                                    key={rule.id}
                                                    className="p-2 hover:bg-ordem-ooze rounded transition-colors"
                                                    title={rule.detalhes || rule.resumo}
                                                >
                                                    <h4 className="text-sm font-medium text-white">{rule.titulo}</h4>
                                                    <p className="text-xs text-ordem-text-muted">{rule.resumo}</p>
                                                </div>
                                            ))}
                                            {filteredQuickConditions.length === 0 && (
                                                <div className="text-xs text-ordem-text-muted italic py-2">
                                                    Nenhuma condição encontrada.
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <AddCombatantModal
                isOpen={showAddModal}
                onClose={() => setShowAddModal(false)}
                onAdd={addCombatants}
                agents={agents}
                creatures={mergedCreatures}
                npcs={npcData}
                onCreateThreat={(t) => salvarMonstro(t)}
            />
        </div>
    );
}
