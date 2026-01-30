"use client";

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, Sparkles, Lock, Check, Flame, Skull, Brain, Zap, BookOpen } from 'lucide-react';
import { Personagem, Poder, Elemento, Ritual } from '../core/types';
import {
    getPoderesParanormaisElegiveis,
    contarPoderesElemento,
    PODERES
} from '../data/powers';
import { cn } from '../lib/utils';
import { RitualChoiceModal } from './RitualChoiceModal';

interface ParanormalPowerModalProps {
    agent: Personagem;
    onSelect: (poder: Poder, ritualSelecionado?: Ritual) => void;
    onClose?: () => void;
    title?: string;
}

const ELEMENTO_CONFIG: Record<Elemento, { icon: React.ElementType; color: string; bg: string }> = {
    Sangue: { icon: Flame, color: 'text-red-400', bg: 'bg-red-500/20' },
    Morte: { icon: Skull, color: 'text-purple-400', bg: 'bg-purple-500/20' },
    Conhecimento: { icon: Brain, color: 'text-blue-400', bg: 'bg-blue-500/20' },
    Energia: { icon: Zap, color: 'text-yellow-400', bg: 'bg-yellow-500/20' },
    Medo: { icon: Skull, color: 'text-gray-400', bg: 'bg-gray-500/20' },
};

export function ParanormalPowerModal({
    agent,
    onSelect,
    onClose,
    title = 'Escolher Poder Paranormal'
}: ParanormalPowerModalProps) {
    const [busca, setBusca] = useState('');
    const [filtroElemento, setFiltroElemento] = useState<Elemento | 'todos'>('todos');
    const [poderSelecionado, setPoderSelecionado] = useState<string | null>(null);
    const [showRitualModal, setShowRitualModal] = useState(false);
    const [poderAprenderRitual, setPoderAprenderRitual] = useState<Poder | null>(null);
    const contagemElementos = useMemo(() => {
        const elementos: Elemento[] = ['Sangue', 'Morte', 'Conhecimento', 'Energia'];
        return elementos.reduce((acc, elem) => {
            acc[elem] = contarPoderesElemento(agent, elem);
            return acc;
        }, {} as Record<Elemento, number>);
    }, [agent]);
    const poderesFiltrados = useMemo(() => {
        let lista = getPoderesParanormaisElegiveis(agent);
        if (filtroElemento !== 'todos') {
            lista = lista.filter(p => p.elemento === filtroElemento || !p.elemento);
        }
        if (busca.trim()) {
            const termo = busca.toLowerCase();
            lista = lista.filter(p =>
                p.nome.toLowerCase().includes(termo) ||
                p.descricao.toLowerCase().includes(termo) ||
                p.requisitos?.toLowerCase().includes(termo)
            );
        }
        return lista.sort((a, b) => {
            if (a.elegivel !== b.elegivel) return a.elegivel ? -1 : 1;
            if (a.elemento !== b.elemento) {
                if (!a.elemento) return 1;
                if (!b.elemento) return -1;
                return a.elemento.localeCompare(b.elemento);
            }
            return a.nome.localeCompare(b.nome);
        });
    }, [agent, filtroElemento, busca]);

    const handleConfirm = () => {
        if (!poderSelecionado) return;

        const poder = poderesFiltrados.find(p => p.nome === poderSelecionado);
        if (!poder || !poder.elegivel) return;
        if (poder.nome === 'Aprender Ritual') {
            setPoderAprenderRitual(poder);
            setShowRitualModal(true);
            return;
        }

        onSelect(poder);
    };

    const handleRitualSelect = (ritual: Ritual) => {
        if (poderAprenderRitual) {
            onSelect(poderAprenderRitual, ritual);
        }
        setShowRitualModal(false);
        setPoderAprenderRitual(null);
    };

    const renderElementoIcon = (elemento?: Elemento) => {
        if (!elemento) return <BookOpen size={14} className="text-ordem-text-muted" />;
        const config = ELEMENTO_CONFIG[elemento];
        const Icon = config.icon;
        return <Icon size={14} className={config.color} />;
    };

    const isAprenderRitual = (nome: string) => nome === 'Aprender Ritual';
    if (showRitualModal) {
        return (
            <RitualChoiceModal
                agent={agent}
                onSelect={handleRitualSelect}
                onClose={() => {
                    setShowRitualModal(false);
                    setPoderAprenderRitual(null);
                }}
            />
        );
    }

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
                {}
                <div className="p-4 border-b border-ordem-border bg-gradient-to-r from-purple-900/30 to-ordem-ooze">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <Sparkles className="text-purple-400" size={24} />
                            <div>
                                <h2 className="text-lg font-bold text-ordem-text">{title}</h2>
                                <p className="text-sm text-ordem-text-muted">
                                    Escolha um poder paranormal via Transcender
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

                    {}
                    <div className="flex gap-2 mb-4">
                        {(['Sangue', 'Morte', 'Conhecimento', 'Energia'] as Elemento[]).map(elem => {
                            const config = ELEMENTO_CONFIG[elem];
                            const Icon = config.icon;
                            const count = contagemElementos[elem];
                            return (
                                <div
                                    key={elem}
                                    className={cn(
                                        'flex items-center gap-1.5 px-2 py-1 rounded text-xs font-medium',
                                        config.bg, config.color
                                    )}
                                    title={`${count} poder(es) de ${elem}`}
                                >
                                    <Icon size={12} />
                                    <span>{elem}: {count}</span>
                                </div>
                            );
                        })}
                    </div>

                    {}
                    <div className="flex gap-2 flex-wrap">
                        <div className="flex-1 min-w-[200px] relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-ordem-text-muted" size={16} />
                            <input
                                type="text"
                                value={busca}
                                onChange={(e) => setBusca(e.target.value)}
                                placeholder="Buscar poder..."
                                className="w-full pl-10 pr-4 py-2 bg-ordem-bg border border-ordem-border rounded-lg text-ordem-text placeholder:text-ordem-text-muted focus:outline-none focus:border-purple-500/50"
                            />
                        </div>
                        <div className="flex gap-1 flex-wrap">
                            <button
                                onClick={() => setFiltroElemento('todos')}
                                className={cn(
                                    'px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                                    filtroElemento === 'todos'
                                        ? 'bg-purple-600 text-white'
                                        : 'bg-ordem-bg border border-ordem-border text-ordem-text-muted hover:text-ordem-text'
                                )}
                            >
                                Todos
                            </button>
                            {(['Sangue', 'Morte', 'Conhecimento', 'Energia'] as Elemento[]).map(elem => {
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
                </div>

                {}
                <div className="flex-1 overflow-y-auto p-4 space-y-2">
                    <AnimatePresence mode="popLayout">
                        {poderesFiltrados.length === 0 ? (
                            <div className="text-center py-8 text-ordem-text-muted">
                                Nenhum poder encontrado.
                            </div>
                        ) : (
                            poderesFiltrados.map((poder) => (
                                <motion.div
                                    key={poder.nome}
                                    layout
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    onClick={() => poder.elegivel && setPoderSelecionado(poder.nome)}
                                    className={cn(
                                        'p-3 rounded-lg border cursor-pointer transition-all',
                                        !poder.elegivel && 'opacity-50 cursor-not-allowed',
                                        poderSelecionado === poder.nome
                                            ? 'border-purple-500 bg-purple-500/10'
                                            : 'border-ordem-border hover:border-ordem-border-light bg-ordem-bg/50'
                                    )}
                                >
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                {renderElementoIcon(poder.elemento)}
                                                <h3 className="font-semibold text-ordem-text">{poder.nome}</h3>
                                                {!poder.elegivel && (
                                                    <Lock size={14} className="text-ordem-text-muted" />
                                                )}
                                                {poderSelecionado === poder.nome && (
                                                    <Check size={16} className="text-purple-400" />
                                                )}
                                            </div>
                                            <p className="text-sm text-ordem-text-muted mt-1">{poder.descricao}</p>
                                            {poder.requisitos && (
                                                <p className={cn(
                                                    'text-xs mt-1',
                                                    poder.elegivel ? 'text-green-400' : 'text-red-400'
                                                )}>
                                                    Requisitos: {poder.requisitos}
                                                </p>
                                            )}
                                            {!poder.elegivel && poder.motivo && (
                                                <p className="text-xs text-red-400 mt-1">
                                                    ⚠ {poder.motivo}
                                                </p>
                                            )}
                                        </div>
                                        {poder.elemento && (
                                            <span className={cn(
                                                'px-2 py-0.5 text-xs rounded font-medium',
                                                ELEMENTO_CONFIG[poder.elemento].bg,
                                                ELEMENTO_CONFIG[poder.elemento].color
                                            )}>
                                                {poder.elemento}
                                            </span>
                                        )}
                                    </div>
                                </motion.div>
                            ))
                        )}
                    </AnimatePresence>
                </div>

                {}
                <div className="p-4 border-t border-ordem-border bg-ordem-ooze/80 flex justify-between items-center gap-2">
                    <p className="text-xs text-ordem-text-muted">
                        ⚠ Ao escolher Transcender, você <strong>não ganha Sanidade</strong> neste aumento de NEX.
                    </p>
                    <div className="flex gap-2">
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
                            disabled={!poderSelecionado}
                            className={cn(
                                'px-4 py-2 rounded-lg font-medium transition-colors',
                                poderSelecionado
                                    ? 'bg-purple-600 text-white hover:bg-purple-500'
                                    : 'bg-ordem-border text-ordem-text-muted cursor-not-allowed'
                            )}
                        >
                            Confirmar Escolha
                        </button>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
}

export default ParanormalPowerModal;
