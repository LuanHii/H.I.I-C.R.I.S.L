'use client';

import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ChevronDown, Star, BookOpen, Swords, Target, Shield, Skull, Brain, Sparkles, Wrench, Eye, Menu, X } from 'lucide-react';
import {
    REGRAS,
    CATEGORIAS,
    buscarRegras,
    regrasPorCategoria,
    type Regra,
    type RegraCategoria
} from '@/data/guiaRegras';
import { cn } from '@/lib/utils';
import { InvestigationManager } from './InvestigationManager';
import { InterludeManager } from './InterludeManager';
import { Personagem } from '../../core/types';
import { FichaRegistro } from '../../core/storage/useStoredFichas';

interface GuiaMestreProps {
    fichas: FichaRegistro[];
    onUpdateFicha: (id: string, personagem: Personagem) => void;
}

type TabMestre = 'regras' | 'investigacao' | 'interludio';

const springTransition = { type: 'spring' as const, stiffness: 300, damping: 30 };

const CAT_ICONS: Record<string, React.ReactNode> = {
    'criacao': <BookOpen size={14} />,
    'testes': <Target size={14} />,
    'combate': <Swords size={14} />,
    'ataques': <Target size={14} />,
    'manobras': <Shield size={14} />,
    'condicoes': <Skull size={14} />,
    'sanidade': <Brain size={14} />,
    'rituais': <Sparkles size={14} />,
    'equipamento': <Wrench size={14} />,
    'investigacao': <Eye size={14} />,
};

const CAT_GRADIENTS: Record<string, string> = {
    'criacao': 'from-ordem-green/15 to-ordem-green/5',
    'testes': 'from-ordem-blue/15 to-ordem-blue/5',
    'combate': 'from-ordem-red/15 to-ordem-red/5',
    'ataques': 'from-ordem-gold/15 to-ordem-gold/5',
    'manobras': 'from-ordem-gold/15 to-ordem-gold/5',
    'condicoes': 'from-ordem-purple/15 to-ordem-purple/5',
    'sanidade': 'from-ordem-cyan/15 to-ordem-cyan/5',
    'rituais': 'from-ordem-purple/15 to-ordem-purple/5',
    'equipamento': 'from-ordem-green/15 to-ordem-green/5',
    'investigacao': 'from-ordem-gold/15 to-ordem-gold/5',
};

const CAT_GLOW: Record<string, string> = {
    'criacao': 'hover:shadow-[0_0_20px_rgba(0,255,0,0.06)]',
    'testes': 'hover:shadow-[0_0_20px_rgba(59,130,246,0.06)]',
    'combate': 'hover:shadow-[0_0_20px_rgba(220,38,38,0.06)]',
    'ataques': 'hover:shadow-[0_0_20px_rgba(255,215,0,0.06)]',
    'manobras': 'hover:shadow-[0_0_20px_rgba(255,215,0,0.06)]',
    'condicoes': 'hover:shadow-[0_0_20px_rgba(168,85,247,0.06)]',
    'sanidade': 'hover:shadow-[0_0_20px_rgba(34,211,238,0.06)]',
    'rituais': 'hover:shadow-[0_0_20px_rgba(168,85,247,0.06)]',
    'equipamento': 'hover:shadow-[0_0_20px_rgba(0,255,0,0.06)]',
    'investigacao': 'hover:shadow-[0_0_20px_rgba(255,215,0,0.06)]',
};

const CAT_ACTIVE_BORDER: Record<string, string> = {
    'criacao': 'border-ordem-green/40',
    'testes': 'border-ordem-blue/40',
    'combate': 'border-ordem-red/40',
    'ataques': 'border-ordem-gold/40',
    'manobras': 'border-ordem-gold/40',
    'condicoes': 'border-ordem-purple/40',
    'sanidade': 'border-ordem-cyan/40',
    'rituais': 'border-ordem-purple/40',
    'equipamento': 'border-ordem-green/40',
    'investigacao': 'border-ordem-gold/40',
};

export function GuiaMestre({ fichas, onUpdateFicha }: GuiaMestreProps) {
    const [activeTab, setActiveTab] = useState<TabMestre>('regras');
    const [busca, setBusca] = useState('');
    const [categoriaAtiva, setCategoriaAtiva] = useState<RegraCategoria | 'todas'>('todas');
    const [expandidos, setExpandidos] = useState<Set<string>>(new Set());
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [favoritos, setFavoritos] = useState<Set<string>>(() => {
        if (typeof window === 'undefined') return new Set();
        try {
            const saved = localStorage.getItem('guia-favoritos');
            return saved ? new Set(JSON.parse(saved)) : new Set();
        } catch {
            return new Set();
        }
    });

    const contentRef = useRef<HTMLDivElement>(null);

    const regrasFiltradas = useMemo(() => {
        let resultado = busca.trim()
            ? buscarRegras(busca)
            : categoriaAtiva === 'todas'
                ? REGRAS
                : regrasPorCategoria(categoriaAtiva);

        return resultado.sort((a, b) => {
            const aFav = favoritos.has(a.id) ? 0 : 1;
            const bFav = favoritos.has(b.id) ? 0 : 1;
            return aFav - bFav;
        });
    }, [busca, categoriaAtiva, favoritos]);

    const regrasPorCat = useMemo(() => {
        const map: Record<string, number> = {};
        CATEGORIAS.forEach(c => {
            map[c.id] = regrasPorCategoria(c.id).length;
        });
        return map;
    }, []);

    const toggleExpandido = useCallback((id: string) => {
        setExpandidos(prev => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });
    }, []);

    const toggleFavorito = useCallback((id: string) => {
        setFavoritos(prev => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            try { localStorage.setItem('guia-favoritos', JSON.stringify(Array.from(next))); } catch { }
            return next;
        });
    }, []);

    const selectCategory = useCallback((cat: RegraCategoria | 'todas') => {
        setCategoriaAtiva(cat);
        setBusca('');
        setSidebarOpen(false);
        contentRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
    }, []);

    const tabs: { key: TabMestre; label: string; icon: React.ReactNode }[] = [
        { key: 'regras', label: 'Regras', icon: <BookOpen size={14} /> },
        { key: 'investigacao', label: 'Investigação', icon: <Eye size={14} /> },
        { key: 'interludio', label: 'Interlúdio', icon: <Brain size={14} /> },
    ];

    return (
        <div className="max-w-7xl mx-auto p-4 sm:p-6">
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={springTransition}
                className="mb-6 flex flex-col md:flex-row md:justify-between md:items-end gap-4"
            >
                <div>
                    <h1 className="text-2xl font-semibold text-white mb-1 tracking-tight">
                        {activeTab === 'regras' && '📖 Guia Rápido'}
                        {activeTab === 'investigacao' && '🔍 Investigação'}
                        {activeTab === 'interludio' && '🌙 Interlúdio'}
                    </h1>
                    <p className="text-white/30 text-sm">
                        {activeTab === 'regras' && 'Consulta rápida de regras durante a sessão'}
                        {activeTab === 'investigacao' && 'Gerenciamento de pistas e cenas'}
                        {activeTab === 'interludio' && 'Descanso e manutenção entre missões'}
                    </p>
                </div>

                <div className="flex p-1 rounded-xl bg-white/[0.03] border border-white/[0.06] backdrop-blur-sm">
                    {tabs.map(tab => (
                        <motion.button
                            key={tab.key}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.97 }}
                            onClick={() => setActiveTab(tab.key)}
                            className={cn(
                                "flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                                activeTab === tab.key
                                    ? "bg-gradient-to-r from-red-500/20 to-red-500/5 text-white border border-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.08)]"
                                    : "text-white/30 hover:text-white/60 border border-transparent"
                            )}
                        >
                            {tab.icon}
                            {tab.label}
                        </motion.button>
                    ))}
                </div>
            </motion.div>

            {activeTab === 'investigacao' && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={springTransition}>
                    <InvestigationManager />
                </motion.div>
            )}

            {activeTab === 'interludio' && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={springTransition}>
                    <InterludeManager fichas={fichas} onUpdate={onUpdateFicha} />
                </motion.div>
            )}

            {activeTab === 'regras' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
                    <div className="flex gap-6">
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className="lg:hidden fixed bottom-6 left-6 z-50 w-12 h-12 rounded-xl bg-gradient-to-br from-red-500/20 to-red-500/5 border border-red-500/20 flex items-center justify-center text-white shadow-lg backdrop-blur-sm"
                        >
                            <Menu size={20} />
                        </button>

                        <AnimatePresence>
                            {sidebarOpen && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="fixed inset-0 bg-black/60 z-40 lg:hidden"
                                    onClick={() => setSidebarOpen(false)}
                                />
                            )}
                        </AnimatePresence>

                        <aside className={cn(
                            "fixed lg:sticky top-0 left-0 h-screen lg:h-[calc(100vh-200px)] lg:top-4 z-50 lg:z-0",
                            "w-64 shrink-0 transition-transform duration-300 lg:transform-none",
                            sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
                        )}>
                            <div className="h-full rounded-none lg:rounded-xl bg-[#0d0d0d]/95 lg:bg-white/[0.02] backdrop-blur-xl border-r lg:border border-white/[0.06] p-4 flex flex-col">
                                <div className="flex items-center justify-between mb-4 lg:mb-5">
                                    <span className="text-[10px] text-white/20 uppercase tracking-widest font-semibold">Categorias</span>
                                    <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-white/30 hover:text-white/60">
                                        <X size={18} />
                                    </button>
                                </div>

                                <nav className="flex-1 overflow-y-auto custom-scrollbar space-y-1">
                                    <button
                                        onClick={() => selectCategory('todas')}
                                        className={cn(
                                            "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all duration-200 group",
                                            categoriaAtiva === 'todas'
                                                ? "bg-gradient-to-r from-white/10 to-white/[0.03] border border-white/15 text-white"
                                                : "text-white/35 hover:text-white/60 hover:bg-white/[0.03] border border-transparent"
                                        )}
                                    >
                                        <div className={cn(
                                            "w-7 h-7 rounded-lg flex items-center justify-center transition-all",
                                            categoriaAtiva === 'todas' ? "bg-white/10" : "bg-white/[0.03] group-hover:bg-white/[0.06]"
                                        )}>
                                            <BookOpen size={13} className={categoriaAtiva === 'todas' ? 'text-white' : 'text-white/30'} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <span className="text-[12px] font-medium block">Todas as Regras</span>
                                            <span className="text-[9px] text-white/15 font-mono">{REGRAS.length}</span>
                                        </div>
                                    </button>

                                    {favoritos.size > 0 && (
                                        <button
                                            onClick={() => { setCategoriaAtiva('todas'); setBusca(''); contentRef.current?.scrollTo({ top: 0, behavior: 'smooth' }); }}
                                            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left text-yellow-400/50 hover:text-yellow-400/80 hover:bg-yellow-500/[0.03] border border-transparent transition-all duration-200"
                                        >
                                            <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-yellow-500/[0.06]">
                                                <Star size={12} className="text-yellow-400/60" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <span className="text-[12px] font-medium block">Favoritos</span>
                                                <span className="text-[9px] text-white/15 font-mono">{favoritos.size}</span>
                                            </div>
                                        </button>
                                    )}

                                    <div className="h-px bg-white/[0.04] my-2" />

                                    {CATEGORIAS.map(cat => {
                                        const isActive = categoriaAtiva === cat.id;
                                        return (
                                            <button
                                                key={cat.id}
                                                onClick={() => selectCategory(cat.id)}
                                                className={cn(
                                                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all duration-200 group",
                                                    isActive
                                                        ? `bg-gradient-to-r ${CAT_GRADIENTS[cat.id]} border ${CAT_ACTIVE_BORDER[cat.id]} text-white`
                                                        : "text-white/35 hover:text-white/60 hover:bg-white/[0.03] border border-transparent"
                                                )}
                                            >
                                                <div className={cn(
                                                    "w-7 h-7 rounded-lg flex items-center justify-center transition-all",
                                                    isActive
                                                        ? `bg-gradient-to-br ${CAT_GRADIENTS[cat.id]}`
                                                        : "bg-white/[0.03] group-hover:bg-white/[0.06]"
                                                )}>
                                                    <span className={isActive ? cat.cor : 'text-white/25'}>{CAT_ICONS[cat.id]}</span>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <span className="text-[12px] font-medium block">{cat.nome}</span>
                                                    <span className="text-[9px] text-white/15 font-mono">{regrasPorCat[cat.id]}</span>
                                                </div>
                                                {isActive && <div className="w-1.5 h-1.5 rounded-full bg-current opacity-60" />}
                                            </button>
                                        );
                                    })}
                                </nav>

                                <div className="mt-4 pt-3 border-t border-white/[0.04]">
                                    <div className="text-[9px] text-white/10 font-mono text-center">
                                        {REGRAS.length} regras · {CATEGORIAS.length} categorias
                                    </div>
                                </div>
                            </div>
                        </aside>

                        <div className="flex-1 min-w-0">
                            <div className="relative mb-5 group">
                                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-red-500/10 via-purple-500/5 to-transparent opacity-0 group-focus-within:opacity-100 transition-opacity -m-px" />
                                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-white/40 transition-colors" />
                                <input
                                    type="text"
                                    placeholder="Buscar regra... (ex: agarrar, crítico, DT)"
                                    value={busca}
                                    onChange={(e) => setBusca(e.target.value)}
                                    className="relative w-full bg-white/[0.03] border border-white/[0.06] rounded-xl pl-10 pr-10 py-3 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-white/15 transition-all backdrop-blur-sm"
                                />
                                {busca && (
                                    <button onClick={() => setBusca('')} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/20 hover:text-white/60 transition-colors">
                                        ✕
                                    </button>
                                )}
                            </div>

                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    {categoriaAtiva !== 'todas' && (() => {
                                        const cat = CATEGORIAS.find(c => c.id === categoriaAtiva);
                                        return cat ? (
                                            <div className="flex items-center gap-2">
                                                <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center bg-gradient-to-br", CAT_GRADIENTS[cat.id], "border border-white/[0.06]")}>
                                                    <span className={cat.cor}>{CAT_ICONS[cat.id]}</span>
                                                </div>
                                                <div>
                                                    <h2 className="text-sm font-semibold text-white">{cat.nome}</h2>
                                                    <span className="text-[10px] text-white/20 font-mono">{regrasFiltradas.length} regra(s)</span>
                                                </div>
                                            </div>
                                        ) : null;
                                    })()}
                                    {categoriaAtiva === 'todas' && !busca && (
                                        <span className="text-xs text-white/20 font-mono">{regrasFiltradas.length} regra(s)</span>
                                    )}
                                    {busca && (
                                        <span className="text-xs text-white/20 font-mono">{regrasFiltradas.length} resultado(s) para &ldquo;{busca}&rdquo;</span>
                                    )}
                                </div>
                                {favoritos.size > 0 && (
                                    <span className="text-[10px] text-yellow-400/30 font-mono flex items-center gap-1">
                                        <Star size={10} fill="currentColor" /> {favoritos.size}
                                    </span>
                                )}
                            </div>

                            <div ref={contentRef} className="space-y-2.5 overflow-y-auto max-h-[calc(100vh-280px)] pr-1 custom-scrollbar">
                                <AnimatePresence mode="popLayout">
                                    {regrasFiltradas.map((regra, index) => (
                                        <motion.div
                                            key={regra.id}
                                            layout="position"
                                            initial={{ opacity: 0, y: 6 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, scale: 0.97 }}
                                            transition={{ ...springTransition, delay: index * 0.012 }}
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
                                    <div className="text-center py-16">
                                        <p className="text-base text-white/20 mb-2">Nenhuma regra encontrada</p>
                                        <p className="text-sm text-white/10">Tente buscar por outro termo</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}
        </div>
    );
}

interface RegraCardProps {
    regra: Regra;
    expandido: boolean;
    favorito: boolean;
    onToggle: () => void;
    onFavorito: () => void;
}

function RegraCard({ regra, expandido, favorito, onToggle, onFavorito }: RegraCardProps) {
    const categoria = CATEGORIAS.find(c => c.id === regra.categoria);
    const gradient = CAT_GRADIENTS[regra.categoria] || '';
    const glow = CAT_GLOW[regra.categoria] || '';

    return (
        <motion.div
            whileHover={{ scale: 1.002 }}
            className={cn(
                'relative rounded-xl overflow-hidden transition-all duration-300',
                'border border-white/[0.06] backdrop-blur-sm',
                `bg-gradient-to-r ${gradient || 'from-white/[0.02] to-transparent'}`,
                glow,
                expandido && 'ring-1 ring-white/10 shadow-lg',
                !expandido && 'hover:border-white/[0.12]',
                favorito && !expandido && 'ring-1 ring-yellow-500/10'
            )}
        >
            <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent pointer-events-none" />

            <div className="relative flex items-center">
                <button
                    onClick={(e) => { e.stopPropagation(); onFavorito(); }}
                    className={cn(
                        'p-3 border-r border-white/[0.04] transition-all duration-200',
                        favorito ? 'text-yellow-400' : 'text-white/10 hover:text-yellow-400/50'
                    )}
                >
                    <Star size={13} fill={favorito ? 'currentColor' : 'none'} strokeWidth={favorito ? 2.5 : 1.5} />
                </button>

                <button
                    onClick={onToggle}
                    className="flex-1 p-3 sm:p-3.5 flex items-start justify-between text-left transition-colors"
                >
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-0.5">
                            {categoria && (
                                <div className={cn(
                                    'w-5.5 h-5.5 rounded-md flex items-center justify-center',
                                    `bg-gradient-to-br ${CAT_GRADIENTS[regra.categoria]} border border-white/[0.04]`
                                )}>
                                    <span className={cn(categoria.cor, 'scale-[0.85]')}>{CAT_ICONS[regra.categoria]}</span>
                                </div>
                            )}
                            <h3 className="font-semibold text-white text-[13px] leading-tight">{regra.titulo}</h3>
                            <span className="text-[8px] px-1.5 py-[1px] rounded-full bg-white/[0.04] text-white/20 border border-white/[0.03] uppercase tracking-wider font-medium">
                                {categoria?.nome}
                            </span>
                        </div>
                        <p className="text-[11px] text-white/30 leading-relaxed line-clamp-1 ml-[30px]">{regra.resumo}</p>
                    </div>

                    <motion.div
                        animate={{ rotate: expandido ? 180 : 0 }}
                        transition={{ duration: 0.25 }}
                        className="ml-2 shrink-0 mt-0.5"
                    >
                        <ChevronDown size={14} className="text-white/15" />
                    </motion.div>
                </button>
            </div>

            <AnimatePresence>
                {expandido && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
                        className="overflow-hidden"
                    >
                        <div className="px-4 pb-4 pt-0 border-t border-white/[0.04] space-y-3">
                            <p className="mt-3 text-sm text-white/45 leading-[1.7]">{regra.resumo}</p>

                            {regra.detalhes && (
                                <div className="p-3.5 rounded-lg bg-black/30 backdrop-blur-sm border border-white/[0.04]">
                                    <pre className="text-[12px] text-white/45 whitespace-pre-wrap font-mono leading-[1.8]">
                                        {regra.detalhes}
                                    </pre>
                                </div>
                            )}

                            {regra.tabela && (
                                <div className="overflow-x-auto rounded-lg border border-white/[0.04]">
                                    <table className="w-full text-sm border-collapse">
                                        <thead>
                                            <tr className="bg-white/[0.03]">
                                                {regra.tabela.cabecalho.map((h, i) => (
                                                    <th key={i} className="px-3 py-2.5 text-left text-white/25 font-medium text-[10px] uppercase tracking-widest border-b border-white/[0.04]">
                                                        {h}
                                                    </th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {regra.tabela.linhas.map((linha, i) => (
                                                <tr key={i} className="hover:bg-white/[0.02] transition-colors">
                                                    {linha.map((cel, j) => (
                                                        <td key={j} className="px-3 py-2 text-white/40 border-b border-white/[0.02] text-[12px]">
                                                            {cel}
                                                        </td>
                                                    ))}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}

                            {regra.dica && (
                                <div className="p-3 rounded-lg bg-amber-500/[0.05] border border-amber-500/10 flex items-start gap-2.5">
                                    <div className="w-5 h-5 rounded-md bg-amber-500/10 flex items-center justify-center shrink-0 mt-0.5">
                                        <Sparkles size={10} className="text-amber-400" />
                                    </div>
                                    <div>
                                        <span className="text-[9px] text-amber-400/40 uppercase tracking-wider font-medium block mb-0.5">Dica do Mestre</span>
                                        <p className="text-[12px] text-amber-300/60 leading-relaxed">{regra.dica}</p>
                                    </div>
                                </div>
                            )}

                            <div className="flex flex-wrap gap-1.5 pt-1">
                                {regra.tags.map(tag => (
                                    <span key={tag} className="text-[8px] px-2 py-0.5 rounded-full bg-white/[0.03] text-white/15 border border-white/[0.03]">
                                        #{tag}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
