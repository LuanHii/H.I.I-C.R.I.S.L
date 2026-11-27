'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useEncontroRascunho } from './EncontroRascunho';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Play, Pause, SkipForward, SkipBack, RotateCcw, Plus,
    Swords, Users, BookOpen, RefreshCw,
    AlertCircle, ChevronDown, Hash
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
import { remocaoDaCondicao } from '@/data/combat/conditions';

function SortableCombatantCard({
    combatant,
    isCurrentTurn,
    iniciativaVisivel,
    onUpdate,
    onRemove,
    onDuplicate,
    onMoveUp,
    onMoveDown,
}: {
    combatant: Combatant;
    isCurrentTurn: boolean;
    iniciativaVisivel: boolean;
    onUpdate: (updates: Partial<Combatant>) => void;
    onRemove: () => void;
    onDuplicate: () => void;
    onMoveUp?: () => void;
    onMoveDown?: () => void;
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
                iniciativaVisivel={iniciativaVisivel}
                onUpdate={onUpdate}
                onRemove={onRemove}
                onDuplicate={onDuplicate}
                onMoveUp={onMoveUp}
                onMoveDown={onMoveDown}
                isDragging={isDragging}
                dragHandleProps={{ ...attributes, ...listeners }}
            />
        </div>
    );
}

export function CombatManager() {
    const {
        state, sortedCombatants, inactiveCombatants, currentCombatant, proximoCombatente, aguardando,
        showAddModal, setShowAddModal, showQuickRef, setShowQuickRef,
        quickRefTab, setQuickRefTab, quickRefQuery, setQuickRefQuery,
        orderMode, sensors, agents, catalogoAmeacas, npcs,
        filteredQuickActions, filteredQuickConditions,
        addCombatants, updateCombatant, removeCombatant, duplicateCombatant,
        nextTurn, prevTurn, startCombat, endCombat, resetCombat,
        rerollAllInitiatives, handleDragEnd, moverCombatente, sortByInitiative,
    } = useCombatManager();
    const { entradas } = useEncontroRascunho();
    const totalRascunho = entradas.reduce((soma, item) => soma + item.quantidade, 0);
    const params = useSearchParams();
    const [revisandoEncontro, setRevisandoEncontro] = useState(false);
    const botaoMontagem = useRef<HTMLButtonElement>(null);
    useEffect(() => {
        if (params.get('montar') === '1') {
            setRevisandoEncontro(true);
            setShowAddModal(true);
            window.history.replaceState(null, '', '/mestre?tab=combate');
        }
    }, [params, setShowAddModal]);

    const emSessao = Boolean(state.isActive || state.isPaused);
    const proximo = proximoCombatente?.id === currentCombatant?.id ? null : proximoCombatente;
    const iniciativaVisivel = emSessao || Boolean(state.iniciativaPreparada);

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
                            type="button"
                            ref={botaoMontagem}
                            onClick={() => setShowAddModal(true)}
                            className="flex h-11 flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-lg bg-ordem-green-muted px-2 font-dados text-sm font-semibold text-ordem-black transition-colors hover:bg-ordem-white sm:flex-none sm:px-4"
                        >
                            <Plus size={16} className="shrink-0" aria-hidden /> {totalRascunho ? 'Montar encontro (' + totalRascunho + ')' : 'Montar encontro'}
                        </button>
                        <button
                            onClick={() => setShowQuickRef(!showQuickRef)}
                            aria-expanded={showQuickRef}
                            aria-controls="referencia-combate"
                            className={cn(
                                'flex h-11 flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-lg px-2 font-dados text-sm font-semibold transition-colors sm:flex-none sm:px-4',
                                showQuickRef
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-ordem-ooze border border-ordem-border text-ordem-text-secondary hover:text-white'
                            )}
                        >
                            <BookOpen size={16} className="shrink-0" /> Referência
                        </button>
                    </div>
                </div>
            </motion.div>

            <section aria-label="Turno e rodada" className="sticky top-0 z-20 mb-4 rounded-xl border border-ordem-border bg-ordem-black p-3 font-dados shadow-lg sm:p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex min-w-0 flex-1 items-center gap-3">
                        <div className="shrink-0 rounded-lg border border-ordem-border bg-ordem-ooze/50 px-2.5 py-1.5 text-center">
                            <p className="text-xs text-ordem-text-secondary">Rodada</p>
                            <p className="text-xl font-semibold tabular-nums">{state.round}</p>
                        </div>
                        <div className="min-w-0 text-sm leading-snug" aria-live="polite" aria-atomic="true">
                            <p className="break-words font-semibold text-ordem-white">
                                {emSessao && currentCombatant
                                    ? (state.isActive ? 'Vez de ' : 'Pausado na vez de ') + currentCombatant.name
                                    : emSessao ? 'Aguardando participantes' : 'Encontro em preparação'}
                            </p>
                            {!emSessao && sortedCombatants.length > 0 && <p className="text-xs text-ordem-text-secondary">{iniciativaVisivel ? 'Iniciativas prontas' : 'A iniciativa é rolada ao iniciar.'}</p>}
                            {proximo && emSessao && <p className="break-words text-xs text-ordem-text-secondary">Próximo: {proximo.name}</p>}
                        </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        {state.isActive ? <>
                            <button type="button" onClick={prevTurn} disabled={!sortedCombatants.length} aria-label="Turno anterior" className="grid min-h-11 min-w-11 place-items-center rounded-lg border border-ordem-border-light text-ordem-white hover:bg-ordem-ooze focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-ordem-green-muted disabled:opacity-45"><SkipBack size={17} aria-hidden /></button>
                            <button type="button" onClick={nextTurn} disabled={!proximoCombatente} className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-ordem-green-muted px-3 text-sm font-semibold text-ordem-black hover:bg-white focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-ordem-green-muted disabled:opacity-45"><SkipForward size={17} aria-hidden /> Próximo turno</button>
                            <button type="button" onClick={endCombat} className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-ordem-border-light px-3 text-sm text-ordem-white hover:bg-ordem-ooze focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-ordem-green-muted"><Pause size={16} aria-hidden /> Pausar</button>
                        </> : <button type="button" onClick={startCombat} disabled={!sortedCombatants.length && !(state.isPaused && aguardando.length)} className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-ordem-green-muted px-3 text-sm font-semibold text-ordem-black hover:bg-white focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-ordem-green-muted disabled:bg-ordem-ooze disabled:text-ordem-text-muted"><Play size={17} aria-hidden /> {state.isPaused ? 'Retomar' : 'Iniciar combate'}</button>}
                        <details className="sm:relative">
                            <summary className="flex min-h-11 cursor-pointer list-none items-center gap-1 rounded-lg border border-ordem-border-light px-2.5 text-sm text-ordem-text-secondary hover:text-white focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-ordem-green-muted">Opções <ChevronDown size={15} aria-hidden /></summary>
                            <div className="absolute right-3 top-full z-30 mt-1 grid w-56 gap-1 sm:right-0 rounded-lg border border-ordem-border-light bg-ordem-black p-2 shadow-xl">
                                <p className="px-2 py-1 text-xs text-ordem-text-secondary">Ordem {orderMode === 'initiative' ? 'por iniciativa' : 'manual'}</p>
                                <button type="button" onClick={sortByInitiative} disabled={!state.combatants.length} className="flex min-h-11 items-center gap-2 rounded px-2 text-left text-sm text-ordem-white hover:bg-ordem-ooze disabled:opacity-45"><Hash size={16} aria-hidden /> Ordenar por iniciativa</button>
                                <button type="button" onClick={() => { if (!emSessao || window.confirm('Rerolar todas as iniciativas e voltar ao início da ordem?')) rerollAllInitiatives(); }} disabled={!state.combatants.length} className="flex min-h-11 items-center gap-2 rounded px-2 text-left text-sm text-ordem-white hover:bg-ordem-ooze disabled:opacity-45"><RefreshCw size={16} aria-hidden /> Rerolar iniciativas</button>
                                <button type="button" onClick={resetCombat} disabled={!state.combatants.length} className="flex min-h-11 items-center gap-2 rounded px-2 text-left text-sm text-ordem-red-light hover:bg-ordem-ooze disabled:opacity-45"><RotateCcw size={16} aria-hidden /> Limpar combate</button>
                            </div>
                        </details>
                    </div>
                </div>
            </section>

            <div className="flex flex-col gap-5 lg:flex-row lg:gap-4 xl:gap-6">
                <div className="min-w-0 flex-1">
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
                                className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-ordem-border-light px-3 font-dados text-sm font-semibold text-ordem-white hover:border-ordem-green-muted/60 focus-visible:outline focus-visible:outline-ordem-green-muted"
                            >
                                <Plus size={16} aria-hidden /> Escolher participantes
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
                                            iniciativaVisivel={iniciativaVisivel}
                                            onUpdate={(updates) => updateCombatant(combatant.id, updates)}
                                            onRemove={() => removeCombatant(combatant.id)}
                                            onDuplicate={() => duplicateCombatant(combatant.id)}
                                            onMoveUp={index > 0 ? () => moverCombatente(combatant.id, sortedCombatants[index - 1].id) : undefined}
                                            onMoveDown={index < sortedCombatants.length - 1 ? () => moverCombatente(combatant.id, sortedCombatants[index + 1].id) : undefined}
                                        />
                                    ))}
                                </div>
                            </SortableContext>

                            {aguardando.length > 0 && (
                                <section className="mt-5 rounded-xl border border-ordem-border p-3 font-dados" aria-label="Aguardando a próxima rodada">
                                    <h3 className="font-semibold text-ordem-gold">Aguardando a próxima rodada</h3>
                                    <ul className="mt-2 space-y-2">
                                        {aguardando.map(c => <li key={c.id} className="flex items-center justify-between gap-2 rounded-lg border border-ordem-border px-3 py-1">
                                            <div className="min-w-0 break-words text-sm">{c.name}<p className="text-xs text-ordem-text-secondary">Rodada {c.entradaNaRodada} · Iniciativa {c.initiative}</p></div>
                                            <button type="button" aria-label={'Retirar ' + c.name + ' da próxima rodada'} onClick={() => removeCombatant(c.id)} className="min-h-11 shrink-0 px-2 text-sm text-ordem-text-secondary hover:text-white">Retirar</button>
                                        </li>)}
                                    </ul>
                                </section>
                            )}
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
                                                    iniciativaVisivel={iniciativaVisivel}
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
                            id="referencia-combate"
                            initial={{ opacity: 0, y: -8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="order-first w-full min-w-0 shrink-0 lg:order-none lg:w-72 xl:w-80"
                        >
                            <div className="w-full overflow-hidden rounded-xl border border-ordem-border bg-ordem-ooze/50">
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

                                <div className="max-h-[min(55dvh,36rem)] overflow-y-auto custom-scrollbar">
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
                                                aria-label="Buscar condições na referência rápida"
                                                className="w-full bg-ordem-black/40 border border-ordem-border-light text-white px-3 py-2 rounded focus:border-ordem-red focus:outline-none text-xs"
                                            />
                                            {filteredQuickConditions.map(grupo => (
                                                <section key={grupo.id} aria-label={grupo.titulo} className="border-t border-ordem-border pt-2">
                                                    <h4 className="px-2 text-xs font-semibold text-ordem-text-secondary">{grupo.titulo}</h4>
                                                    {grupo.condicoes.map(condicao => (
                                                        <details key={condicao.nome} className="rounded p-2 text-xs text-ordem-text-secondary hover:bg-ordem-ooze">
                                                            <summary className="cursor-pointer text-sm font-medium text-white">{condicao.nome}</summary>
                                                            <p className="mt-2">{condicao.descricao}</p>
                                                            {condicao.especial && <p className="mt-1">{condicao.especial}</p>}
                                                            {condicao.acumulo && <p className="mt-1">Pode agravar para {condicao.acumulo} quando a fonte permitir.</p>}
                                                            <p className="mt-2"><strong className="text-white">Como termina</strong> {remocaoDaCondicao(condicao)}</p>
                                                        </details>
                                                    ))}
                                                </section>
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
                revisao={revisandoEncontro}
                setRevisao={setRevisandoEncontro}
                onClose={() => setShowAddModal(false)}
                onAdd={addCombatants}
                agents={agents}
                threats={catalogoAmeacas}
                npcs={npcs}
                combatants={state.combatants}
                emSessao={emSessao}
                onReturnFocus={() => botaoMontagem.current?.focus()}
            />
        </div>
    );
}
