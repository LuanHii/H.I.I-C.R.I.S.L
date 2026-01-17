"use client";

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, BookOpen, Lock, Check, Flame, Skull, Brain, Zap, Ghost } from 'lucide-react';
import { Personagem, Ritual, Elemento } from '../core/types';
import { RITUAIS } from '../data/rituals';
import { cn } from '../lib/utils';

interface RitualChoiceModalProps {
    agent: Personagem;
    onSelect: (ritual: Ritual) => void;
    onClose?: () => void;
    /** Círculo máximo permitido baseado no NEX */
    circuloMaximo?: number;
}

const ELEMENTO_CONFIG: Record<Elemento, { icon: React.ElementType; color: string; bg: string }> = {
    Sangue: { icon: Flame, color: 'text-red-400', bg: 'bg-red-500/20' },
    Morte: { icon: Skull, color: 'text-purple-400', bg: 'bg-purple-500/20' },
    Conhecimento: { icon: Brain, color: 'text-blue-400', bg: 'bg-blue-500/20' },
    Energia: { icon: Zap, color: 'text-yellow-400', bg: 'bg-yellow-500/20' },
    Medo: { icon: Ghost, color: 'text-gray-400', bg: 'bg-gray-500/20' },
};

/**
 * Calcula o círculo máximo de ritual baseado no NEX
 * 1º círculo: NEX 15% (base)
 * 2º círculo: NEX 45%
 * 3º círculo: NEX 75%
 */
function calcularCirculoMaximo(nex: number): number {
    if (nex >= 75) return 3;
    if (nex >= 45) return 2;
    return 1;
}

export function RitualChoiceModal({
    agent,
    onSelect,
    onClose,
    circuloMaximo: circuloMaximoProp
}: RitualChoiceModalProps) {
    const [busca, setBusca] = useState('');
    const [filtroElemento, setFiltroElemento] = useState<Elemento | 'todos'>('todos');
    const [filtroCirculo, setFiltroCirculo] = useState<number | 'todos'>('todos');
    const [ritualSelecionado, setRitualSelecionado] = useState<string | null>(null);

    // Calcular círculo máximo baseado no NEX
    const circuloMaximo = circuloMaximoProp ?? calcularCirculoMaximo(agent.nex);

    // Rituais já conhecidos
    const rituaisConhecidos = useMemo(() => new Set(agent.rituais.map(r => r.nome)), [agent.rituais]);

    // Filtrar rituais
    const rituaisFiltrados = useMemo(() => {
        let lista = RITUAIS.filter(r => {
            // Filtrar por círculo máximo
            if (r.circulo > circuloMaximo) return false;
            // Não mostrar rituais já conhecidos
            if (rituaisConhecidos.has(r.nome)) return false;
            // Não mostrar rituais de 4º círculo (não disponível via Aprender Ritual)
            if (r.circulo === 4) return false;
            return true;
        });

        // Filtrar por elemento
        if (filtroElemento !== 'todos') {
            lista = lista.filter(r => r.elemento === filtroElemento);
        }

        // Filtrar por círculo
        if (filtroCirculo !== 'todos') {
            lista = lista.filter(r => r.circulo === filtroCirculo);
        }

        // Busca
        if (busca.trim()) {
            const termo = busca.toLowerCase();
            lista = lista.filter(r =>
                r.nome.toLowerCase().includes(termo) ||
                r.descricao.toLowerCase().includes(termo) ||
                r.elemento.toLowerCase().includes(termo)
            );
        }

        // Ordenar por círculo, depois por nome
        return lista.sort((a, b) => {
            if (a.circulo !== b.circulo) return a.circulo - b.circulo;
            return a.nome.localeCompare(b.nome);
        });
    }, [circuloMaximo, rituaisConhecidos, filtroElemento, filtroCirculo, busca]);

    const handleConfirm = () => {
        if (!ritualSelecionado) return;
        const ritual = rituaisFiltrados.find(r => r.nome === ritualSelecionado);
        if (ritual) {
            onSelect(ritual);
        }
    };

    const renderElementoIcon = (elemento: Elemento) => {
        const config = ELEMENTO_CONFIG[elemento];
        const Icon = config.icon;
        return <Icon size={14} className={config.color} />;
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="relative w-full max-w-3xl max-h-[90vh] bg-ordem-ooze border border-ordem-border rounded-xl overflow-hidden flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="p-4 border-b border-ordem-border bg-gradient-to-r from-blue-900/30 to-ordem-ooze">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <BookOpen className="text-blue-400" size={24} />
                            <div>
                                <h2 className="text-lg font-bold text-ordem-text">Aprender Ritual</h2>
                                <p className="text-sm text-ordem-text-muted">
                                    Escolha um ritual de até {circuloMaximo}º círculo
                                </p>
                            </div>
                        </div>
                        {onClose && (
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-ordem-border/50 rounded-lg transition-colors"
                            >
                                <X size={20} className="text-ordem-text-muted" />
                            </button>
                        )}
                    </div>

                    {/* Busca e Filtros */}
                    <div className="flex gap-2 flex-wrap">
                        <div className="flex-1 min-w-[200px] relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-ordem-text-muted" size={16} />
                            <input
                                type="text"
                                value={busca}
                                onChange={(e) => setBusca(e.target.value)}
                                placeholder="Buscar ritual..."
                                className="w-full pl-10 pr-4 py-2 bg-ordem-bg border border-ordem-border rounded-lg text-ordem-text placeholder:text-ordem-text-muted focus:outline-none focus:border-blue-500/50"
                            />
                        </div>

                        {/* Filtro de Círculo */}
                        <div className="flex gap-1">
                            <button
                                onClick={() => setFiltroCirculo('todos')}
                                className={cn(
                                    'px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                                    filtroCirculo === 'todos'
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-ordem-bg border border-ordem-border text-ordem-text-muted hover:text-ordem-text'
                                )}
                            >
                                Todos
                            </button>
                            {[1, 2, 3].filter(c => c <= circuloMaximo).map(circulo => (
                                <button
                                    key={circulo}
                                    onClick={() => setFiltroCirculo(circulo)}
                                    className={cn(
                                        'px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                                        filtroCirculo === circulo
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-ordem-bg border border-ordem-border text-ordem-text-muted hover:text-ordem-text'
                                    )}
                                >
                                    {circulo}º
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Filtro de Elemento */}
                    <div className="flex gap-1 mt-2 flex-wrap">
                        <button
                            onClick={() => setFiltroElemento('todos')}
                            className={cn(
                                'px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                                filtroElemento === 'todos'
                                    ? 'bg-ordem-border text-ordem-text'
                                    : 'bg-ordem-bg border border-ordem-border text-ordem-text-muted hover:text-ordem-text'
                            )}
                        >
                            Todos
                        </button>
                        {(['Sangue', 'Morte', 'Conhecimento', 'Energia', 'Medo'] as Elemento[]).map(elem => {
                            const config = ELEMENTO_CONFIG[elem];
                            const Icon = config.icon;
                            return (
                                <button
                                    key={elem}
                                    onClick={() => setFiltroElemento(elem)}
                                    className={cn(
                                        'px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5',
                                        filtroElemento === elem
                                            ? `${config.bg} ${config.color} border border-current`
                                            : 'bg-ordem-bg border border-ordem-border text-ordem-text-muted hover:text-ordem-text'
                                    )}
                                >
                                    <Icon size={14} />
                                    {elem}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Lista de Rituais */}
                <div className="flex-1 overflow-y-auto p-4 space-y-2">
                    <AnimatePresence mode="popLayout">
                        {rituaisFiltrados.length === 0 ? (
                            <div className="text-center py-8 text-ordem-text-muted">
                                Nenhum ritual encontrado.
                            </div>
                        ) : (
                            rituaisFiltrados.map((ritual) => (
                                <motion.div
                                    key={ritual.nome}
                                    layout
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    onClick={() => setRitualSelecionado(ritual.nome)}
                                    className={cn(
                                        'p-3 rounded-lg border cursor-pointer transition-all',
                                        ritualSelecionado === ritual.nome
                                            ? 'border-blue-500 bg-blue-500/10'
                                            : 'border-ordem-border hover:border-ordem-border-light bg-ordem-bg/50'
                                    )}
                                >
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                {renderElementoIcon(ritual.elemento)}
                                                <h3 className="font-semibold text-ordem-text">{ritual.nome}</h3>
                                                <span className="text-xs px-1.5 py-0.5 bg-ordem-border rounded">
                                                    {ritual.circulo}º círculo
                                                </span>
                                                {ritualSelecionado === ritual.nome && (
                                                    <Check size={16} className="text-blue-400" />
                                                )}
                                            </div>
                                            <p className="text-sm text-ordem-text-muted mt-1 line-clamp-2">
                                                {ritual.descricao}
                                            </p>
                                            <div className="flex gap-4 mt-2 text-xs text-ordem-text-muted">
                                                <span>Execução: {ritual.execucao}</span>
                                                <span>Alcance: {ritual.alcance}</span>
                                                <span>Duração: {ritual.duracao}</span>
                                            </div>
                                        </div>
                                        <span className={cn(
                                            'px-2 py-0.5 text-xs rounded font-medium flex-shrink-0',
                                            ELEMENTO_CONFIG[ritual.elemento].bg,
                                            ELEMENTO_CONFIG[ritual.elemento].color
                                        )}>
                                            {ritual.elemento}
                                        </span>
                                    </div>
                                </motion.div>
                            ))
                        )}
                    </AnimatePresence>
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-ordem-border bg-ordem-ooze/80 flex justify-end gap-2">
                    {onClose && (
                        <button
                            onClick={onClose}
                            className="px-4 py-2 rounded-lg border border-ordem-border text-ordem-text-muted hover:text-ordem-text transition-colors"
                        >
                            Cancelar
                        </button>
                    )}
                    <button
                        onClick={handleConfirm}
                        disabled={!ritualSelecionado}
                        className={cn(
                            'px-4 py-2 rounded-lg font-medium transition-colors',
                            ritualSelecionado
                                ? 'bg-blue-600 text-white hover:bg-blue-500'
                                : 'bg-ordem-border text-ordem-text-muted cursor-not-allowed'
                        )}
                    >
                        Aprender Ritual
                    </button>
                </div>
            </motion.div>
        </motion.div>
    );
}

export default RitualChoiceModal;
