'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ChevronDown, Star } from 'lucide-react';
import {
    REGRAS,
    CATEGORIAS,
    buscarRegras,
    regrasPorCategoria,
    type Regra,
    type RegraCategoria
} from '@/data/guiaRegras';
import { cn } from '@/lib/utils';

export function GuiaMestre() {
    const [busca, setBusca] = useState('');
    const [categoriaAtiva, setCategoriaAtiva] = useState<RegraCategoria | 'todas'>('todas');
    const [expandidos, setExpandidos] = useState<Set<string>>(new Set());
    const [favoritos, setFavoritos] = useState<Set<string>>(() => {
        if (typeof window === 'undefined') return new Set();
        try {
            const saved = localStorage.getItem('guia-favoritos');
            return saved ? new Set(JSON.parse(saved)) : new Set();
        } catch {
            return new Set();
        }
    });

    // Filtrar regras
    const regrasFiltradas = useMemo(() => {
        let resultado = busca.trim()
            ? buscarRegras(busca)
            : categoriaAtiva === 'todas'
                ? REGRAS
                : regrasPorCategoria(categoriaAtiva);

        // Favoritos primeiro
        return resultado.sort((a, b) => {
            const aFav = favoritos.has(a.id) ? 0 : 1;
            const bFav = favoritos.has(b.id) ? 0 : 1;
            return aFav - bFav;
        });
    }, [busca, categoriaAtiva, favoritos]);

    const toggleExpandido = (id: string) => {
        setExpandidos(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    const toggleFavorito = (id: string) => {
        setFavoritos(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            try {
                localStorage.setItem('guia-favoritos', JSON.stringify(Array.from(next)));
            } catch { }
            return next;
        });
    };

    return (
        <div className="max-w-5xl mx-auto p-4 sm:p-6">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6"
            >
                <h1 className="text-2xl font-serif text-white mb-2">
                    📖 Guia Rápido do Mestre
                </h1>
                <p className="text-ordem-text-secondary text-sm">
                    Consulta rápida de regras durante a sessão
                </p>
            </motion.div>

            {/* Busca */}
            <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-ordem-text-muted" />
                <input
                    type="text"
                    placeholder="Buscar regra... (ex: agarrar, crítico, DT)"
                    value={busca}
                    onChange={(e) => setBusca(e.target.value)}
                    className="w-full bg-ordem-ooze border border-ordem-border-light rounded-lg pl-10 pr-4 py-3 text-white placeholder:text-ordem-text-muted focus:outline-none focus:ring-2 focus:ring-ordem-red/50 focus:border-ordem-red"
                />
                {busca && (
                    <button
                        onClick={() => setBusca('')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-ordem-text-muted hover:text-white"
                    >
                        ✕
                    </button>
                )}
            </div>

            {/* Categorias */}
            <div className="flex flex-wrap gap-2 mb-6">
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setCategoriaAtiva('todas')}
                    className={cn(
                        'px-3 py-1.5 rounded-lg text-sm font-mono border transition-colors',
                        categoriaAtiva === 'todas'
                            ? 'bg-ordem-red/20 border-ordem-red text-white'
                            : 'bg-ordem-ooze border-ordem-border-light text-ordem-text-muted hover:text-white'
                    )}
                >
                    📋 Todas
                </motion.button>
                {CATEGORIAS.map(cat => (
                    <motion.button
                        key={cat.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setCategoriaAtiva(cat.id)}
                        className={cn(
                            'px-3 py-1.5 rounded-lg text-sm font-mono border transition-colors',
                            categoriaAtiva === cat.id
                                ? 'bg-ordem-red/20 border-ordem-red text-white'
                                : 'bg-ordem-ooze border-ordem-border-light text-ordem-text-muted hover:text-white'
                        )}
                    >
                        {cat.icone} {cat.nome}
                    </motion.button>
                ))}
            </div>

            {/* Resultados */}
            <div className="text-xs text-ordem-text-muted mb-3">
                {regrasFiltradas.length} regra(s) encontrada(s)
                {favoritos.size > 0 && ` • ${favoritos.size} favorito(s)`}
            </div>

            {/* Lista de Regras */}
            <div className="space-y-3">
                <AnimatePresence mode="popLayout">
                    {regrasFiltradas.map((regra, index) => (
                        <motion.div
                            key={regra.id}
                            layout
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ delay: index * 0.02 }}
                        >
                            <RegraCard
                                regra={regra}
                                expandido={expandidos.has(regra.id)}
                                favorito={favoritos.has(regra.id)}
                                onToggle={() => toggleExpandido(regra.id)}
                                onFavorito={() => toggleFavorito(regra.id)}
                            />
                        </motion.div>
                    ))}
                </AnimatePresence>

                {regrasFiltradas.length === 0 && (
                    <div className="text-center py-12 text-ordem-text-muted">
                        <p className="text-lg mb-2">Nenhuma regra encontrada</p>
                        <p className="text-sm">Tente buscar por outro termo</p>
                    </div>
                )}
            </div>
        </div>
    );
}

// Card de Regra
interface RegraCardProps {
    regra: Regra;
    expandido: boolean;
    favorito: boolean;
    onToggle: () => void;
    onFavorito: () => void;
}

function RegraCard({ regra, expandido, favorito, onToggle, onFavorito }: RegraCardProps) {
    const categoria = CATEGORIAS.find(c => c.id === regra.categoria);

    return (
        <div className={cn(
            'border rounded-xl overflow-hidden transition-colors',
            'bg-ordem-ooze/50 border-ordem-border-light',
            expandido && 'border-ordem-red/30'
        )}>
            {/* Header */}
            <div className="flex items-center">
                {/* Botão de favorito - FORA do botão principal */}
                <button
                    onClick={onFavorito}
                    className={cn(
                        'p-3 border-r border-ordem-border/30 transition-colors hover:bg-ordem-ooze/80',
                        favorito ? 'text-yellow-400' : 'text-ordem-text-muted hover:text-yellow-400'
                    )}
                >
                    <Star size={16} fill={favorito ? 'currentColor' : 'none'} />
                </button>

                {/* Botão de expandir */}
                <button
                    onClick={onToggle}
                    className="flex-1 p-4 flex items-start justify-between text-left hover:bg-ordem-ooze/80 transition-colors"
                >
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                            <span className={cn('text-sm', categoria?.cor)}>
                                {categoria?.icone}
                            </span>
                            <h3 className="font-bold text-white">{regra.titulo}</h3>
                            <span className="text-[10px] uppercase tracking-wider text-ordem-text-muted px-1.5 py-0.5 rounded bg-ordem-black-deep">
                                {categoria?.nome}
                            </span>
                        </div>
                        <p className="text-sm text-ordem-text-secondary">{regra.resumo}</p>
                    </div>

                    <motion.div
                        animate={{ rotate: expandido ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                        className="ml-2 shrink-0"
                    >
                        <ChevronDown className="w-5 h-5 text-ordem-text-secondary" />
                    </motion.div>
                </button>
            </div>

            {/* Conteúdo Expandido */}
            <AnimatePresence>
                {expandido && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                    >
                        <div className="px-4 pb-4 pt-0 border-t border-ordem-border/30">
                            {/* Detalhes */}
                            {regra.detalhes && (
                                <div className="mt-3 p-3 bg-ordem-black-deep rounded-lg">
                                    <pre className="text-sm text-ordem-white-muted whitespace-pre-wrap font-mono">
                                        {regra.detalhes}
                                    </pre>
                                </div>
                            )}

                            {/* Tabela */}
                            {regra.tabela && (
                                <div className="mt-3 overflow-x-auto">
                                    <table className="w-full text-sm border-collapse">
                                        <thead>
                                            <tr className="bg-ordem-black-deep">
                                                {regra.tabela.cabecalho.map((h, i) => (
                                                    <th key={i} className="px-3 py-2 text-left text-ordem-text-secondary font-mono text-xs uppercase border-b border-ordem-border">
                                                        {h}
                                                    </th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {regra.tabela.linhas.map((linha, i) => (
                                                <tr key={i} className="hover:bg-ordem-ooze/50">
                                                    {linha.map((cel, j) => (
                                                        <td key={j} className="px-3 py-2 text-ordem-white-muted border-b border-ordem-border/30">
                                                            {cel}
                                                        </td>
                                                    ))}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}

                            {/* Dica */}
                            {regra.dica && (
                                <div className="mt-3 p-3 bg-yellow-900/20 border border-yellow-800/30 rounded-lg">
                                    <div className="flex items-start gap-2">
                                        <span className="text-yellow-400">💡</span>
                                        <p className="text-sm text-yellow-200">{regra.dica}</p>
                                    </div>
                                </div>
                            )}

                            {/* Tags */}
                            <div className="mt-3 flex flex-wrap gap-1">
                                {regra.tags.map(tag => (
                                    <span
                                        key={tag}
                                        className="text-[10px] px-2 py-0.5 rounded bg-ordem-border text-ordem-text-muted"
                                    >
                                        #{tag}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
