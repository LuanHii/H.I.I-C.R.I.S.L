"use client";

import React from 'react';
import { Item } from '../core/types';
import { calcularStatsModificados, MODIFICACOES_ARMAS } from '../data/modifications';
import { Swords, Target, Zap, ArrowRight, Shield, Crosshair, Flame } from 'lucide-react';
import { cn } from '@/lib/utils';

interface WeaponStatsDisplayProps {
    item: Item;
    compact?: boolean;
    showDescription?: boolean;
    className?: string;
}

export function WeaponStatsDisplay({
    item,
    compact = false,
    showDescription = true,
    className
}: WeaponStatsDisplayProps) {
    const hasMods = item.modificacoes && item.modificacoes.length > 0;
    const displayStats = hasMods ? calcularStatsModificados(item) : item.stats;
    const baseStats = item.stats;
    const isCursed = item.tipo?.includes('Amaldiçoado');

    const isWeapon = item.tipo === 'Arma' || (item.stats && (item.stats.dano || item.stats.danoBase));

    if (!isWeapon) {
        return (
            <div className={cn("bg-ordem-black/20 border border-ordem-border rounded-lg p-3", className)}>
                <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                        <div className={cn("font-bold truncate", isCursed ? 'text-purple-300' : 'text-zinc-100')}>
                            {item.nome}
                        </div>
                        <div className="text-[11px] text-ordem-text-muted">
                            {item.tipo} • Cat {['0', 'I', 'II', 'III', 'IV'][item.categoria]} • {item.espaco} espaço{item.espaco !== 1 ? 's' : ''}
                        </div>
                    </div>
                </div>
                {showDescription && item.descricao && (
                    <div className="text-xs text-ordem-text-secondary mt-2 whitespace-pre-line">{item.descricao}</div>
                )}
            </div>
        );
    }

    return (
        <div className={cn(
            "border rounded-lg overflow-hidden",
            isCursed ? 'border-purple-900/50 bg-purple-900/10' :
                hasMods ? 'border-ordem-green/30 bg-ordem-green/5' :
                    'border-ordem-border bg-ordem-black/20',
            className
        )}>
            <div className="p-3">
                <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                            <Swords size={14} className={cn(
                                isCursed ? 'text-purple-400' :
                                    hasMods ? 'text-ordem-green' : 'text-ordem-gold'
                            )} />
                            <span className={cn(
                                "font-bold truncate",
                                isCursed ? 'text-purple-300' : 'text-zinc-100'
                            )}>
                                {item.nome}
                            </span>
                            {hasMods && (
                                <span className="text-[9px] px-1.5 py-0.5 bg-ordem-green/20 text-ordem-green rounded font-mono whitespace-nowrap">
                                    +{item.modificacoes!.length} mod{item.modificacoes!.length > 1 ? 's' : ''}
                                </span>
                            )}
                        </div>
                        <div className="text-[11px] text-ordem-text-muted mt-0.5 flex items-center gap-2 flex-wrap">
                            <span>Cat {['0', 'I', 'II', 'III', 'IV'][item.categoria]}</span>
                            {item.categoriaBase !== undefined && item.categoriaBase !== item.categoria && (
                                <span className="text-ordem-text-muted opacity-60">(base: {['0', 'I', 'II', 'III', 'IV'][item.categoriaBase]})</span>
                            )}
                            <span className="text-ordem-border">•</span>
                            <span>{item.espaco} espaço{item.espaco !== 1 ? 's' : ''}</span>
                        </div>
                    </div>
                </div>

                {displayStats && (
                    <div className={cn(
                        "mt-3 rounded-lg p-2",
                        hasMods ? 'bg-ordem-black/40' : 'bg-ordem-black/20'
                    )}>
                        <div className={cn(
                            "grid gap-2",
                            compact ? "grid-cols-2" : "grid-cols-2 sm:grid-cols-4"
                        )}>
                            {displayStats.dano && (
                                <div className="flex items-center gap-1.5">
                                    <Zap size={12} className="text-ordem-text-muted shrink-0" />
                                    <span className="text-[10px] text-ordem-text-muted">Dano:</span>
                                    <span className={cn(
                                        "text-xs font-mono font-bold",
                                        hasMods && baseStats?.dano !== displayStats.dano ? 'text-ordem-green' : 'text-white'
                                    )}>
                                        {displayStats.dano}
                                    </span>
                                </div>
                            )}

                            {displayStats.critico && (
                                <div className="flex items-center gap-1.5">
                                    <Target size={12} className="text-ordem-text-muted shrink-0" />
                                    <span className="text-[10px] text-ordem-text-muted">Crit:</span>
                                    <span className={cn(
                                        "text-xs font-mono font-bold",
                                        hasMods && baseStats?.critico !== displayStats.critico ? 'text-ordem-red' : 'text-white'
                                    )}>
                                        {displayStats.critico}
                                    </span>
                                </div>
                            )}

                            {displayStats.alcance && (
                                <div className="flex items-center gap-1.5">
                                    <Crosshair size={12} className="text-ordem-text-muted shrink-0" />
                                    <span className="text-[10px] text-ordem-text-muted">Alcance:</span>
                                    <span className={cn(
                                        "text-xs font-mono",
                                        hasMods && baseStats?.alcance !== displayStats.alcance ? 'text-blue-400 font-bold' : 'text-white'
                                    )}>
                                        {displayStats.alcance === 'Corpo a corpo' ? 'CaC' : displayStats.alcance}
                                    </span>
                                </div>
                            )}

                            {displayStats.ataqueBonus && displayStats.ataqueBonus > 0 && (
                                <div className="flex items-center gap-1.5">
                                    <ArrowRight size={12} className="text-ordem-text-muted shrink-0" />
                                    <span className="text-[10px] text-ordem-text-muted">Ataque:</span>
                                    <span className="text-xs font-mono font-bold text-ordem-green">
                                        +{displayStats.ataqueBonus}
                                    </span>
                                </div>
                            )}

                            {displayStats.automatica && (
                                <div className="flex items-center gap-1.5">
                                    <Flame size={12} className="text-orange-400 shrink-0" />
                                    <span className="text-[10px] text-orange-400 font-mono">AUTO</span>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {hasMods && (
                    <div className="mt-2 pt-2 border-t border-ordem-border/30">
                        <div className="text-[9px] text-ordem-text-muted uppercase tracking-widest mb-1.5">Modificações</div>
                        <div className="flex flex-wrap gap-1">
                            {item.modificacoes!.map(modNome => {
                                const mod = MODIFICACOES_ARMAS.find(m => m.nome === modNome);
                                return (
                                    <div
                                        key={modNome}
                                        className="group relative"
                                    >
                                        <span className="text-[9px] px-1.5 py-0.5 bg-ordem-gold/10 text-ordem-gold border border-ordem-gold/30 rounded font-mono cursor-help">
                                            {modNome}
                                        </span>
                                        {mod && (
                                            <div className="absolute bottom-full left-0 mb-1 hidden group-hover:block z-50 pointer-events-none">
                                                <div className="bg-ordem-black border border-ordem-border rounded-lg p-2 shadow-xl max-w-xs">
                                                    <div className="text-[10px] font-bold text-white mb-1">{mod.nome}</div>
                                                    <div className="text-[9px] text-ordem-text-secondary leading-relaxed">{mod.efeito}</div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>

            {showDescription && item.descricao && (
                <div className="px-3 pb-3">
                    <div className="text-xs text-ordem-text-secondary border-t border-ordem-border/30 pt-2 leading-relaxed">
                        {item.descricao}
                    </div>
                </div>
            )}
        </div>
    );
}

interface WeaponListProps {
    items: Item[];
    compact?: boolean;
    showDescription?: boolean;
    emptyMessage?: string;
}

export function WeaponList({
    items,
    compact = false,
    showDescription = true,
    emptyMessage = "Nenhum item."
}: WeaponListProps) {
    if (items.length === 0) {
        return <div className="text-sm text-ordem-text-muted italic py-4 text-center">{emptyMessage}</div>;
    }

    return (
        <div className="space-y-2">
            {items.map((item, idx) => (
                <WeaponStatsDisplay
                    key={`${item.nome}-${idx}`}
                    item={item}
                    compact={compact}
                    showDescription={showDescription}
                />
            ))}
        </div>
    );
}
