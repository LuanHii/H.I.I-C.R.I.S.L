"use client";

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, Star, Lock, Check, Zap, Sparkles } from 'lucide-react';
import { Personagem, Poder, Ritual } from '../core/types';
import { getPoderesClasse, getPoderesGerais, verificarRequisitos, PODERES } from '../data/powers';
import { cn } from '../lib/utils';
import { ParanormalPowerModal } from './ParanormalPowerModal';

interface PowerChoiceModalProps {
    agent: Personagem;
    onSelect: (poderNome: string) => void;
    onClose?: () => void;

    onTranscenderComplete?: (poderParanormal: Poder, ritual?: Ritual) => void;
}

export function PowerChoiceModal({
    agent,
    onSelect,
    onClose,
    onTranscenderComplete
}: PowerChoiceModalProps) {
    const [busca, setBusca] = useState('');
    const [filtro, setFiltro] = useState<'todos' | 'classe' | 'gerais'>('todos');
    const [poderSelecionado, setPoderSelecionado] = useState<string | null>(null);
    const [showParanormalModal, setShowParanormalModal] = useState(false);

    const pendentes = agent.poderesClassePendentes || 0;
    const { poderesClasse, poderesGerais, todosPoderes } = useMemo(() => {
        const classe = getPoderesClasse(agent.classe);
        const gerais = getPoderesGerais();
        const todos = [...classe, ...gerais].filter((p, idx, arr) =>
            arr.findIndex(x => x.nome === p.nome) === idx
        );

        return { poderesClasse: classe, poderesGerais: gerais, todosPoderes: todos };
    }, [agent.classe]);
    const poderesFiltrados = useMemo(() => {
        let lista = filtro === 'classe' ? poderesClasse :
            filtro === 'gerais' ? poderesGerais :
                todosPoderes;
        const nomesPossuidos = new Set(agent.poderes.map(p => p.nome));
        lista = lista.filter(p => {
            if (p.nome === 'Transcender') return true;
            if (p.nome === 'Treinamento em Perícia') return true;
            if (p.nome === 'Aumento de Atributo') return true;
            return !nomesPossuidos.has(p.nome);
        });
        if (busca.trim()) {
            const termo = busca.toLowerCase();
            lista = lista.filter(p =>
                p.nome.toLowerCase().includes(termo) ||
                p.descricao.toLowerCase().includes(termo) ||
                p.requisitos?.toLowerCase().includes(termo)
            );
        }
        return lista.map(p => ({
            ...p,
            ...verificarRequisitos(p, agent)
        }));
    }, [filtro, busca, poderesClasse, poderesGerais, todosPoderes, agent]);

    const handleConfirm = () => {
        if (!poderSelecionado) return;
        if (poderSelecionado === 'Transcender') {
            setShowParanormalModal(true);
            return;
        }

        onSelect(poderSelecionado);
    };

    const handleParanormalSelect = (poderParanormal: Poder, ritual?: Ritual) => {
        setShowParanormalModal(false);
        if (onTranscenderComplete) {
            onTranscenderComplete(poderParanormal, ritual);
        } else {
            console.error("Erro: Callback onTranscenderComplete não fornecido.");
        }
    };

    const isTranscender = (nome: string) => nome === 'Transcender';
    if (showParanormalModal) {
        return (
            <ParanormalPowerModal
                agent={agent}
                onSelect={handleParanormalSelect}
                onClose={() => setShowParanormalModal(false)}
                title="Escolher Poder Paranormal (Transcender)"
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
                className="relative w-full max-w-2xl max-h-[85vh] bg-ordem-ooze border border-ordem-border rounded-xl overflow-hidden flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                {}
                <div className="p-4 border-b border-ordem-border bg-ordem-ooze/80">
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                            <Zap className="text-ordem-red" size={24} />
                            <div>
                                <h2 className="text-lg font-bold text-ordem-text">Escolher Poder de Classe</h2>
                                <p className="text-sm text-ordem-text-muted">
                                    {pendentes} poder{pendentes !== 1 ? 'es' : ''} pendente{pendentes !== 1 ? 's' : ''}
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
                    <div className="flex gap-2">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-ordem-text-muted" size={16} />
                            <input
                                type="text"
                                value={busca}
                                onChange={(e) => setBusca(e.target.value)}
                                placeholder="Buscar poder..."
                                className="w-full pl-10 pr-4 py-2 bg-ordem-bg border border-ordem-border rounded-lg text-ordem-text placeholder:text-ordem-text-muted focus:outline-none focus:border-ordem-red/50"
                            />
                        </div>
                        <div className="flex gap-1">
                            {[
                                { id: 'todos', label: 'Todos' },
                                { id: 'classe', label: agent.classe },
                                { id: 'gerais', label: 'Gerais' },
                            ].map((f) => (
                                <button
                                    key={f.id}
                                    onClick={() => setFiltro(f.id as any)}
                                    className={cn(
                                        'px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                                        filtro === f.id
                                            ? 'bg-ordem-red text-white'
                                            : 'bg-ordem-bg border border-ordem-border text-ordem-text-muted hover:text-ordem-text'
                                    )}
                                >
                                    {f.label}
                                </button>
                            ))}
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
                                            ? 'border-ordem-red bg-ordem-red/10'
                                            : 'border-ordem-border hover:border-ordem-border-light bg-ordem-bg/50',
                                        isTranscender(poder.nome) && 'border-purple-500/50 bg-purple-900/20'
                                    )}
                                >
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                {isTranscender(poder.nome) && (
                                                    <Sparkles size={16} className="text-purple-400" />
                                                )}
                                                <h3 className="font-semibold text-ordem-text">{poder.nome}</h3>
                                                {!poder.elegivel && (
                                                    <Lock size={14} className="text-ordem-text-muted" />
                                                )}
                                                {poderSelecionado === poder.nome && (
                                                    <Check size={16} className="text-ordem-red" />
                                                )}
                                            </div>
                                            <p className="text-sm text-ordem-text-muted mt-1">{poder.descricao}</p>
                                            {isTranscender(poder.nome) && (
                                                <p className="text-xs text-purple-400 mt-1">
                                                    ⚠ Escolher Transcender abrirá seleção de poder paranormal
                                                </p>
                                            )}
                                            {poder.requisitos && !isTranscender(poder.nome) && (
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
                                        <span className={cn(
                                            'px-2 py-0.5 text-xs rounded font-medium',
                                            poder.tipo === 'Classe' && 'bg-blue-500/20 text-blue-400',
                                            poder.tipo === 'Geral' && 'bg-purple-500/20 text-purple-400'
                                        )}>
                                            {poder.tipo}
                                        </span>
                                    </div>
                                </motion.div>
                            ))
                        )}
                    </AnimatePresence>
                </div>

                {}
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
                        disabled={!poderSelecionado}
                        className={cn(
                            'px-4 py-2 rounded-lg font-medium transition-colors',
                            poderSelecionado
                                ? poderSelecionado === 'Transcender'
                                    ? 'bg-purple-600 text-white hover:bg-purple-500'
                                    : 'bg-ordem-red text-white hover:bg-ordem-red/80'
                                : 'bg-ordem-border text-ordem-text-muted cursor-not-allowed'
                        )}
                    >
                        {poderSelecionado === 'Transcender' ? 'Escolher Poder Paranormal' : 'Confirmar Escolha'}
                    </button>
                </div>
            </motion.div>
        </motion.div>
    );
}

export default PowerChoiceModal;

