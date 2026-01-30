'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, X, Search, Info } from 'lucide-react';
import { REGRAS, type Regra } from '@/data/guiaRegras';
import { getConditionColor } from './CombatManagerTypes';
import { cn } from '@/lib/utils';

interface ConditionPickerProps {
    selectedConditions: string[];
    onAdd: (conditionId: string) => void;
    onRemove: (conditionId: string) => void;
    compact?: boolean;
}
const CONDITIONS = REGRAS.filter(r => r.categoria === 'condicoes');

export function ConditionPicker({ selectedConditions, onAdd, onRemove, compact = false }: ConditionPickerProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState('');
    const [hoveredCondition, setHoveredCondition] = useState<Regra | null>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const filteredConditions = useMemo(() => {
        if (!search.trim()) return CONDITIONS;
        const term = search.toLowerCase();
        return CONDITIONS.filter(c =>
            c.titulo.toLowerCase().includes(term) ||
            c.resumo.toLowerCase().includes(term) ||
            c.tags.some(t => t.toLowerCase().includes(term))
        );
    }, [search]);

    const getConditionById = (id: string): Regra | undefined => {
        return CONDITIONS.find(c => c.id === id);
    };

    return (
        <div className="relative" ref={dropdownRef}>
            {}
            <div className="flex flex-wrap gap-1.5 mb-2">
                {selectedConditions.map(condId => {
                    const condition = getConditionById(condId);
                    if (!condition) return null;
                    return (
                        <motion.div
                            key={condId}
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.8, opacity: 0 }}
                            className="group relative"
                            onMouseEnter={() => setHoveredCondition(condition)}
                            onMouseLeave={() => setHoveredCondition(null)}
                        >
                            <span className={cn(
                                'inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium text-white',
                                getConditionColor(condId)
                            )}>
                                {condition.titulo}
                                <button
                                    onClick={() => onRemove(condId)}
                                    className="ml-0.5 hover:bg-white/20 rounded p-0.5 transition-colors"
                                >
                                    <X size={12} />
                                </button>
                            </span>

                            {}
                            {hoveredCondition?.id === condId && (
                                <motion.div
                                    initial={{ opacity: 0, y: 5 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="absolute z-50 bottom-full left-0 mb-2 w-64 p-3 bg-ordem-black border border-ordem-border rounded-lg shadow-xl"
                                >
                                    <h4 className="font-bold text-white mb-1">{condition.titulo}</h4>
                                    <p className="text-xs text-ordem-text-secondary">{condition.resumo}</p>
                                    {condition.detalhes && (
                                        <p className="text-xs text-ordem-text-muted mt-2 whitespace-pre-line">{condition.detalhes}</p>
                                    )}
                                </motion.div>
                            )}
                        </motion.div>
                    );
                })}
            </div>

            {}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    'flex items-center gap-2 px-3 py-1.5 rounded border transition-colors',
                    'bg-ordem-ooze border-ordem-border hover:border-ordem-green/50 text-ordem-text-secondary hover:text-white',
                    compact ? 'text-xs' : 'text-sm'
                )}
            >
                <span>+ Condição</span>
                <ChevronDown size={14} className={cn('transition-transform', isOpen && 'rotate-180')} />
            </button>

            {}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute z-50 top-full left-0 mt-1 w-72 bg-ordem-black border border-ordem-border rounded-lg shadow-xl overflow-hidden"
                    >
                        {}
                        <div className="p-2 border-b border-ordem-border">
                            <div className="relative">
                                <Search size={14} className="absolute left-2 top-1/2 -translate-y-1/2 text-ordem-text-muted" />
                                <input
                                    type="text"
                                    placeholder="Buscar condição..."
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                    className="w-full bg-ordem-ooze border border-ordem-border-light rounded pl-8 pr-3 py-1.5 text-sm text-white placeholder:text-ordem-text-muted focus:outline-none focus:border-ordem-green/50"
                                    autoFocus
                                />
                            </div>
                        </div>

                        {}
                        <div className="max-h-64 overflow-y-auto custom-scrollbar">
                            {filteredConditions.length === 0 ? (
                                <p className="p-3 text-sm text-ordem-text-muted text-center">Nenhuma condição encontrada</p>
                            ) : (
                                filteredConditions.map(condition => {
                                    const isSelected = selectedConditions.includes(condition.id);
                                    return (
                                        <button
                                            key={condition.id}
                                            onClick={() => {
                                                if (!isSelected) {
                                                    onAdd(condition.id);
                                                }
                                            }}
                                            disabled={isSelected}
                                            className={cn(
                                                'w-full px-3 py-2 text-left flex items-start gap-2 transition-colors',
                                                isSelected
                                                    ? 'bg-ordem-ooze/50 opacity-50 cursor-not-allowed'
                                                    : 'hover:bg-ordem-ooze'
                                            )}
                                        >
                                            <span className={cn(
                                                'shrink-0 w-2 h-2 rounded-full mt-1.5',
                                                getConditionColor(condition.id)
                                            )} />
                                            <div className="flex-1 min-w-0">
                                                <h4 className="text-sm font-medium text-white">{condition.titulo}</h4>
                                                <p className="text-xs text-ordem-text-muted truncate">{condition.resumo}</p>
                                            </div>
                                            {isSelected && (
                                                <span className="text-xs text-ordem-green">✓</span>
                                            )}
                                        </button>
                                    );
                                })
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
export function ConditionBadges({
    conditions,
    onRemove,
    showTooltip = true
}: {
    conditions: string[];
    onRemove?: (id: string) => void;
    showTooltip?: boolean;
}) {
    const [hoveredCondition, setHoveredCondition] = useState<Regra | null>(null);

    return (
        <div className="flex flex-wrap gap-1">
            {conditions.map(condId => {
                const condition = CONDITIONS.find(c => c.id === condId);
                if (!condition) return null;

                return (
                    <div
                        key={condId}
                        className="relative group"
                        onMouseEnter={() => showTooltip && setHoveredCondition(condition)}
                        onMouseLeave={() => setHoveredCondition(null)}
                    >
                        <span className={cn(
                            'inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium text-white cursor-default',
                            getConditionColor(condId)
                        )}>
                            {condition.titulo}
                            {onRemove && (
                                <button
                                    onClick={(e) => { e.stopPropagation(); onRemove(condId); }}
                                    className="hover:bg-white/20 rounded p-0.5"
                                >
                                    <X size={10} />
                                </button>
                            )}
                        </span>

                        {}
                        {showTooltip && hoveredCondition?.id === condId && (
                            <motion.div
                                initial={{ opacity: 0, y: 5 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="absolute z-50 bottom-full left-0 mb-2 w-56 p-2 bg-ordem-black border border-ordem-border rounded shadow-xl pointer-events-none"
                            >
                                <h4 className="font-bold text-white text-xs mb-0.5">{condition.titulo}</h4>
                                <p className="text-[10px] text-ordem-text-secondary">{condition.resumo}</p>
                            </motion.div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}
