'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dice1, Dice2, Dice3, Dice4, Dice5, Dice6, RotateCcw, Plus, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DiceRollerProps {
    compact?: boolean;
    onRollResult?: (result: number, details: string) => void;
}
function rollD20(diceCount: number): { rolls: number[]; total: number } {
    const rolls: number[] = [];
    for (let i = 0; i < Math.abs(diceCount); i++) {
        rolls.push(Math.floor(Math.random() * 20) + 1);
    }
    let total: number;
    if (diceCount >= 0) {
        total = rolls.length > 0 ? Math.max(...rolls) : 0;
    } else {
        total = rolls.length > 0 ? Math.min(...rolls) : 0;
    }

    return { rolls, total };
}
function rollDice(sides: number, count: number = 1): { rolls: number[]; total: number } {
    const rolls: number[] = [];
    for (let i = 0; i < count; i++) {
        rolls.push(Math.floor(Math.random() * sides) + 1);
    }
    return { rolls, total: rolls.reduce((a, b) => a + b, 0) };
}

export function DiceRoller({ compact = false, onRollResult }: DiceRollerProps) {
    const [d20Count, setD20Count] = useState(1);
    const [modifier, setModifier] = useState(0);
    const [lastRoll, setLastRoll] = useState<{
        rolls: number[];
        total: number;
        modifier: number;
        finalResult: number;
        diceType: string;
    } | null>(null);
    const [showDamage, setShowDamage] = useState(false);

    const handleD20Roll = () => {
        const result = rollD20(d20Count);
        const finalResult = result.total + modifier;
        const diceLabel = d20Count === 1 ? '1d20' :
            d20Count > 1 ? `${d20Count}d20 (melhor)` :
                `${Math.abs(d20Count)}d20 (pior)`;

        setLastRoll({
            rolls: result.rolls,
            total: result.total,
            modifier,
            finalResult,
            diceType: diceLabel,
        });

        onRollResult?.(finalResult, `${diceLabel} = [${result.rolls.join(', ')}] → ${result.total}${modifier !== 0 ? ` + ${modifier} = ${finalResult}` : ''}`);
    };

    const handleDamageRoll = (sides: number, count: number) => {
        const result = rollDice(sides, count);
        const finalResult = result.total + modifier;

        setLastRoll({
            rolls: result.rolls,
            total: result.total,
            modifier,
            finalResult,
            diceType: `${count}d${sides}`,
        });

        onRollResult?.(finalResult, `${count}d${sides} = [${result.rolls.join(', ')}] = ${result.total}${modifier !== 0 ? ` + ${modifier} = ${finalResult}` : ''}`);
    };

    const getCriticalStatus = () => {
        if (!lastRoll || !lastRoll.diceType.includes('d20')) return null;
        const hasNat20 = lastRoll.rolls.includes(20);
        const hasNat1 = lastRoll.rolls.includes(1);
        if (hasNat20 && lastRoll.total === 20) return 'critical';
        if (hasNat1 && lastRoll.total === 1) return 'fumble';
        return null;
    };

    return (
        <div className={cn('p-3 bg-ordem-ooze/50 border border-ordem-border rounded-xl', compact && 'p-2')}>
            <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    🎲 Rolador de Dados
                </h3>
                <button
                    onClick={() => setShowDamage(!showDamage)}
                    className={cn(
                        'text-xs px-2 py-1 rounded transition-colors',
                        showDamage ? 'bg-red-600 text-white' : 'bg-ordem-ooze border border-ordem-border text-ordem-text-secondary hover:text-white'
                    )}
                >
                    {showDamage ? 'Teste' : 'Dano'}
                </button>
            </div>

            {!showDamage ? (
                <div className="space-y-3">
                    {}
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-ordem-text-secondary w-16">Dados:</span>
                        <button
                            onClick={() => setD20Count(prev => Math.max(-3, prev - 1))}
                            className="p-1 bg-ordem-ooze border border-ordem-border rounded hover:bg-ordem-border transition-colors"
                        >
                            <Minus size={14} />
                        </button>
                        <span className={cn(
                            'w-20 text-center font-mono text-sm',
                            d20Count > 1 && 'text-green-400',
                            d20Count < 0 && 'text-red-400',
                            d20Count === 1 && 'text-white'
                        )}>
                            {d20Count > 1 ? `+${d20Count - 1}d20` : d20Count < 0 ? `${d20Count}d20` : '1d20'}
                        </span>
                        <button
                            onClick={() => setD20Count(prev => Math.min(4, prev + 1))}
                            className="p-1 bg-ordem-ooze border border-ordem-border rounded hover:bg-ordem-border transition-colors"
                        >
                            <Plus size={14} />
                        </button>
                        <span className="text-[10px] text-ordem-text-muted ml-2">
                            {d20Count > 1 ? '(vantagem)' : d20Count < 0 ? '(desvantagem)' : ''}
                        </span>
                    </div>

                    {}
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-ordem-text-secondary w-16">Bônus:</span>
                        <button
                            onClick={() => setModifier(prev => prev - 1)}
                            className="p-1 bg-ordem-ooze border border-ordem-border rounded hover:bg-ordem-border transition-colors"
                        >
                            <Minus size={14} />
                        </button>
                        <input
                            type="number"
                            value={modifier}
                            onChange={e => setModifier(parseInt(e.target.value) || 0)}
                            className="w-16 text-center bg-ordem-black border border-ordem-border rounded px-2 py-1 text-sm text-white"
                        />
                        <button
                            onClick={() => setModifier(prev => prev + 1)}
                            className="p-1 bg-ordem-ooze border border-ordem-border rounded hover:bg-ordem-border transition-colors"
                        >
                            <Plus size={14} />
                        </button>
                    </div>

                    {}
                    <button
                        onClick={handleD20Roll}
                        className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                        🎲 Rolar Teste
                    </button>
                </div>
            ) : (
                <div className="space-y-3">
                    {}
                    <div className="grid grid-cols-4 gap-2">
                        {[
                            { label: '1d4', sides: 4, count: 1 },
                            { label: '1d6', sides: 6, count: 1 },
                            { label: '1d8', sides: 8, count: 1 },
                            { label: '1d10', sides: 10, count: 1 },
                            { label: '1d12', sides: 12, count: 1 },
                            { label: '2d6', sides: 6, count: 2 },
                            { label: '2d8', sides: 8, count: 2 },
                            { label: '3d6', sides: 6, count: 3 },
                        ].map(dice => (
                            <button
                                key={dice.label}
                                onClick={() => handleDamageRoll(dice.sides, dice.count)}
                                className="py-2 bg-red-600/20 hover:bg-red-600/40 border border-red-600/30 text-red-400 text-xs font-mono rounded transition-colors"
                            >
                                {dice.label}
                            </button>
                        ))}
                    </div>

                    {}
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-ordem-text-secondary">Bônus dano:</span>
                        <button
                            onClick={() => setModifier(prev => prev - 1)}
                            className="p-1 bg-ordem-ooze border border-ordem-border rounded hover:bg-ordem-border transition-colors"
                        >
                            <Minus size={12} />
                        </button>
                        <span className="w-8 text-center text-sm text-white font-mono">{modifier >= 0 ? `+${modifier}` : modifier}</span>
                        <button
                            onClick={() => setModifier(prev => prev + 1)}
                            className="p-1 bg-ordem-ooze border border-ordem-border rounded hover:bg-ordem-border transition-colors"
                        >
                            <Plus size={12} />
                        </button>
                    </div>
                </div>
            )}

            {}
            <AnimatePresence mode="wait">
                {lastRoll && (
                    <motion.div
                        key={lastRoll.finalResult + lastRoll.rolls.join('')}
                        initial={{ opacity: 0, y: 10, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className={cn(
                            'mt-3 p-3 rounded-lg border text-center',
                            getCriticalStatus() === 'critical' && 'bg-green-900/30 border-green-500',
                            getCriticalStatus() === 'fumble' && 'bg-red-900/30 border-red-500',
                            !getCriticalStatus() && 'bg-ordem-black border-ordem-border'
                        )}
                    >
                        <p className="text-xs text-ordem-text-muted mb-1">{lastRoll.diceType}</p>
                        <div className="flex items-center justify-center gap-2 mb-1">
                            {lastRoll.rolls.map((roll, i) => (
                                <span
                                    key={i}
                                    className={cn(
                                        'w-8 h-8 flex items-center justify-center rounded font-bold text-sm',
                                        roll === 20 && 'bg-green-600 text-white',
                                        roll === 1 && 'bg-red-600 text-white',
                                        roll !== 20 && roll !== 1 && 'bg-ordem-ooze text-ordem-text-secondary'
                                    )}
                                >
                                    {roll}
                                </span>
                            ))}
                        </div>
                        <p className={cn(
                            'text-2xl font-bold',
                            getCriticalStatus() === 'critical' && 'text-green-400',
                            getCriticalStatus() === 'fumble' && 'text-red-400',
                            !getCriticalStatus() && 'text-white'
                        )}>
                            {lastRoll.finalResult}
                        </p>
                        {lastRoll.modifier !== 0 && (
                            <p className="text-xs text-ordem-text-muted">
                                {lastRoll.total} {lastRoll.modifier >= 0 ? '+' : ''}{lastRoll.modifier}
                            </p>
                        )}
                        {getCriticalStatus() === 'critical' && (
                            <p className="text-xs text-green-400 font-bold mt-1">🎯 CRÍTICO!</p>
                        )}
                        {getCriticalStatus() === 'fumble' && (
                            <p className="text-xs text-red-400 font-bold mt-1">💀 DESASTRE!</p>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
export function QuickDiceButton({
    label,
    diceExpression,
    onResult
}: {
    label: string;
    diceExpression: string;
    onResult?: (result: number, details: string) => void;
}) {
    const [lastResult, setLastResult] = useState<number | null>(null);

    const parseDice = (expr: string): number => {
        const match = expr.match(/(\d+)d(\d+)([+-]\d+)?/);
        if (!match) return 0;

        const count = parseInt(match[1]);
        const sides = parseInt(match[2]);
        const modifier = match[3] ? parseInt(match[3]) : 0;

        const result = rollDice(sides, count);
        return result.total + modifier;
    };

    const handleRoll = () => {
        const result = parseDice(diceExpression);
        setLastResult(result);
        onResult?.(result, `${diceExpression} = ${result}`);
        setTimeout(() => setLastResult(null), 2000);
    };

    return (
        <button
            onClick={handleRoll}
            className="px-2 py-1 bg-ordem-ooze border border-ordem-border rounded text-xs text-ordem-text-secondary hover:text-white hover:border-ordem-green/50 transition-colors"
        >
            {lastResult !== null ? (
                <span className="text-ordem-green font-bold">{lastResult}</span>
            ) : (
                label
            )}
        </button>
    );
}
