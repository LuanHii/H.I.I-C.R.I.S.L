'use client';

import React, { useState, forwardRef } from 'react';
import { motion } from 'framer-motion';
import {
    Skull, Heart, Zap, Brain, Shield, Swords, ChevronDown, ChevronUp,
    Trash2, Copy, Check, X, Minus, Plus, StickyNote, GripVertical
} from 'lucide-react';
import { type Combatant } from './CombatManagerTypes';
import { ConditionPicker, ConditionBadges } from './ConditionPicker';
import { cn } from '@/lib/utils';

interface CombatantCardProps {
    combatant: Combatant;
    isCurrentTurn: boolean;
    onUpdate: (updates: Partial<Combatant>) => void;
    onRemove: () => void;
    onDuplicate: () => void;
    isDragging?: boolean;
    dragHandleProps?: React.HTMLAttributes<HTMLDivElement>;
}

export const CombatantCard = forwardRef<HTMLDivElement, CombatantCardProps>(function CombatantCard({
    combatant,
    isCurrentTurn,
    onUpdate,
    onRemove,
    onDuplicate,
    isDragging,
    dragHandleProps
}, ref) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [damageInput, setDamageInput] = useState('');
    const [isEditingName, setIsEditingName] = useState(false);
    const [editedName, setEditedName] = useState(combatant.name);
    const [isEditingInit, setIsEditingInit] = useState(false);
    const [editedInit, setEditedInit] = useState(String(combatant.initiative));

    const hpPercent = (combatant.hp.current / combatant.hp.max) * 100;
    const isDead = combatant.hp.current <= 0;
    const isDying = combatant.hp.current <= 0 && combatant.hp.current > -combatant.hp.max;
    const isCritical = hpPercent <= 25 && hpPercent > 0;
    const isDamaged = hpPercent <= 50 && hpPercent > 25;

    const applyDamage = (amount: number) => {
        const newHp = Math.max(-combatant.hp.max, combatant.hp.current - amount);
        onUpdate({ hp: { ...combatant.hp, current: newHp } });
    };

    const applyHealing = (amount: number) => {
        const newHp = Math.min(combatant.hp.max, combatant.hp.current + amount);
        onUpdate({ hp: { ...combatant.hp, current: newHp } });
    };

    const handleDamageSubmit = () => {
        const amount = parseInt(damageInput, 10);
        if (!isNaN(amount) && amount > 0) {
            applyDamage(amount);
            setDamageInput('');
        }
    };

    const handleNameSave = () => {
        if (editedName.trim()) {
            onUpdate({ name: editedName.trim() });
        }
        setIsEditingName(false);
    };

    const handleInitSave = () => {
        const newInit = parseInt(editedInit, 10);
        if (!isNaN(newInit)) {
            onUpdate({ initiative: newInit });
        }
        setIsEditingInit(false);
    };

    const getTypeIcon = () => {
        switch (combatant.type) {
            case 'agent': return <Shield size={14} className="text-ordem-green" />;
            case 'creature': return <Skull size={14} className="text-ordem-red" />;
            default: return <Swords size={14} className="text-yellow-500" />;
        }
    };

    const getHpColor = () => {
        if (isDead) return 'bg-gray-600';
        if (isCritical) return 'bg-red-600';
        if (isDamaged) return 'bg-yellow-600';
        return 'bg-green-600';
    };

    return (
        <div
            ref={ref}
            className={cn(
                'border rounded-lg overflow-hidden transition-all',
                'bg-ordem-ooze/50',
                isCurrentTurn && !isDead && 'ring-2 ring-ordem-green shadow-lg shadow-ordem-green/20',
                isDead && 'opacity-60 grayscale',
                !combatant.isActive && 'opacity-40',
                isDragging && 'opacity-90 shadow-2xl ring-2 ring-ordem-gold z-50'
            )}
        >
            <div className="p-3 flex items-center gap-2">
                <div
                    {...dragHandleProps}
                    className="cursor-grab active:cursor-grabbing p-1 text-ordem-text-muted hover:text-white transition-colors touch-none"
                    title="Arrastar para reordenar"
                >
                    <GripVertical size={18} />
                </div>

                {isCurrentTurn && !isDead && (
                    <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ repeat: Infinity, duration: 2 }}
                        className="w-3 h-3 rounded-full bg-ordem-green shrink-0"
                    />
                )}

                {isEditingInit ? (
                    <div className="w-14 flex items-center gap-0.5">
                        <input
                            type="number"
                            value={editedInit}
                            onChange={e => setEditedInit(e.target.value)}
                            onKeyDown={e => {
                                if (e.key === 'Enter') handleInitSave();
                                if (e.key === 'Escape') setIsEditingInit(false);
                            }}
                            onBlur={handleInitSave}
                            className="w-10 bg-ordem-black border border-ordem-green rounded px-1 py-0.5 text-center text-sm text-white font-bold"
                            autoFocus
                        />
                    </div>
                ) : (
                    <button
                        onClick={() => {
                            setEditedInit(String(combatant.initiative));
                            setIsEditingInit(true);
                        }}
                        className="w-10 text-center shrink-0 hover:bg-ordem-ooze rounded p-1 transition-colors group"
                        title="Clique para editar iniciativa"
                    >
                        <span className="text-lg font-bold text-white group-hover:text-ordem-green transition-colors">{combatant.initiative}</span>
                        <p className="text-[9px] text-ordem-text-muted uppercase">INIT</p>
                    </button>
                )}

                {}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                        {getTypeIcon()}
                        {isEditingName ? (
                            <div className="flex items-center gap-1">
                                <input
                                    type="text"
                                    value={editedName}
                                    onChange={e => setEditedName(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && handleNameSave()}
                                    className="bg-ordem-black border border-ordem-border rounded px-2 py-0.5 text-sm text-white"
                                    autoFocus
                                />
                                <button onClick={handleNameSave} className="text-ordem-green hover:text-green-400">
                                    <Check size={14} />
                                </button>
                                <button onClick={() => setIsEditingName(false)} className="text-red-400 hover:text-red-300">
                                    <X size={14} />
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={() => setIsEditingName(true)}
                                className={cn(
                                    'font-bold truncate hover:text-ordem-green transition-colors',
                                    isDead ? 'text-gray-400 line-through' : 'text-white'
                                )}
                            >
                                {combatant.name}
                            </button>
                        )}
                    </div>

                    {}
                    {combatant.conditions.length > 0 && (
                        <div className="mt-1">
                            <ConditionBadges
                                conditions={combatant.conditions}
                                onRemove={(id) => onUpdate({
                                    conditions: combatant.conditions.filter(c => c !== id)
                                })}
                            />
                        </div>
                    )}
                </div>

                {}
                <div className="flex items-center gap-4 shrink-0">
                    {}
                    <div className="text-center">
                        <div className="flex items-center gap-1 text-red-400">
                            <Heart size={12} />
                            <span className="text-sm font-mono">{combatant.hp.current}/{combatant.hp.max}</span>
                        </div>
                        {}
                        <div className="w-20 h-1.5 bg-ordem-black rounded-full overflow-hidden mt-0.5">
                            <motion.div
                                className={cn('h-full', getHpColor())}
                                initial={{ width: 0 }}
                                animate={{ width: `${Math.max(0, hpPercent)}%` }}
                                transition={{ duration: 0.3 }}
                            />
                        </div>
                    </div>

                    {}
                    <div className="text-center">
                        <div className="flex items-center gap-1 text-blue-400">
                            <Shield size={12} />
                            <span className="text-sm font-mono">{combatant.defense}</span>
                        </div>
                        <p className="text-[9px] text-ordem-text-muted">DEF</p>
                    </div>
                </div>

                {}
                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="p-1.5 text-ordem-text-secondary hover:text-white transition-colors"
                >
                    {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </button>
            </div>

            {}
            {isExpanded && (
                <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: 'auto' }}
                    exit={{ height: 0 }}
                    className="border-t border-ordem-border bg-ordem-black/50 p-3 space-y-3"
                >
                    {}
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs text-ordem-text-secondary">Dano:</span>
                        <div className="flex items-center gap-1">
                            <button onClick={() => applyDamage(1)} className="px-2 py-1 text-xs bg-red-600/20 hover:bg-red-600/40 text-red-400 rounded">-1</button>
                            <button onClick={() => applyDamage(5)} className="px-2 py-1 text-xs bg-red-600/20 hover:bg-red-600/40 text-red-400 rounded">-5</button>
                            <button onClick={() => applyDamage(10)} className="px-2 py-1 text-xs bg-red-600/20 hover:bg-red-600/40 text-red-400 rounded">-10</button>
                        </div>
                        <input
                            type="number"
                            value={damageInput}
                            onChange={e => setDamageInput(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleDamageSubmit()}
                            placeholder="Qtd"
                            className="w-14 px-2 py-1 text-xs bg-ordem-ooze border border-ordem-border rounded text-white text-center"
                        />
                        <button
                            onClick={handleDamageSubmit}
                            className="px-2 py-1 text-xs bg-red-600 hover:bg-red-700 text-white rounded"
                        >
                            Aplicar
                        </button>
                        <span className="text-xs text-ordem-text-secondary ml-2">Cura:</span>
                        <button onClick={() => applyHealing(1)} className="px-2 py-1 text-xs bg-green-600/20 hover:bg-green-600/40 text-green-400 rounded">+1</button>
                        <button onClick={() => applyHealing(5)} className="px-2 py-1 text-xs bg-green-600/20 hover:bg-green-600/40 text-green-400 rounded">+5</button>
                        <button onClick={() => applyHealing(10)} className="px-2 py-1 text-xs bg-green-600/20 hover:bg-green-600/40 text-green-400 rounded">+10</button>
                    </div>

                    {}
                    {(combatant.pe || combatant.san) && (
                        <div className="flex items-center gap-4">
                            {combatant.pe && (
                                <div className="flex items-center gap-2">
                                    <Zap size={14} className="text-yellow-400" />
                                    <span className="text-sm text-ordem-text-secondary">PE:</span>
                                    <div className="flex items-center gap-1">
                                        <button
                                            onClick={() => onUpdate({ pe: { ...combatant.pe!, current: Math.max(0, combatant.pe!.current - 1) } })}
                                            className="p-0.5 text-ordem-text-muted hover:text-white"
                                        ><Minus size={12} /></button>
                                        <span className="text-sm font-mono text-white">{combatant.pe.current}/{combatant.pe.max}</span>
                                        <button
                                            onClick={() => onUpdate({ pe: { ...combatant.pe!, current: Math.min(combatant.pe!.max, combatant.pe!.current + 1) } })}
                                            className="p-0.5 text-ordem-text-muted hover:text-white"
                                        ><Plus size={12} /></button>
                                    </div>
                                </div>
                            )}
                            {combatant.san && (
                                <div className="flex items-center gap-2">
                                    <Brain size={14} className="text-purple-400" />
                                    <span className="text-sm text-ordem-text-secondary">SAN:</span>
                                    <div className="flex items-center gap-1">
                                        <button
                                            onClick={() => onUpdate({ san: { ...combatant.san!, current: Math.max(0, combatant.san!.current - 1) } })}
                                            className="p-0.5 text-ordem-text-muted hover:text-white"
                                        ><Minus size={12} /></button>
                                        <span className="text-sm font-mono text-white">{combatant.san.current}/{combatant.san.max}</span>
                                        <button
                                            onClick={() => onUpdate({ san: { ...combatant.san!, current: Math.min(combatant.san!.max, combatant.san!.current + 1) } })}
                                            className="p-0.5 text-ordem-text-muted hover:text-white"
                                        ><Plus size={12} /></button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {}
                    <div>
                        <span className="text-xs text-ordem-text-secondary mb-1 block">Condições:</span>
                        <ConditionPicker
                            selectedConditions={combatant.conditions}
                            onAdd={(id) => onUpdate({ conditions: [...combatant.conditions, id] })}
                            onRemove={(id) => onUpdate({ conditions: combatant.conditions.filter(c => c !== id) })}
                            compact
                        />
                    </div>

                    {}
                    <div>
                        <div className="flex items-center gap-1 mb-1">
                            <StickyNote size={12} className="text-ordem-text-muted" />
                            <span className="text-xs text-ordem-text-secondary">Notas:</span>
                        </div>
                        <textarea
                            value={combatant.notes}
                            onChange={e => onUpdate({ notes: e.target.value })}
                            placeholder="Anotações do mestre..."
                            className="w-full h-16 px-2 py-1 text-xs bg-ordem-ooze border border-ordem-border rounded text-white placeholder:text-ordem-text-muted resize-none"
                        />
                    </div>

                    {}
                    {combatant.abilities && combatant.abilities.length > 0 && (
                        <div className="pt-2 border-t border-ordem-border/50">
                            <span className="text-xs text-ordem-text-secondary mb-2 block font-bold uppercase">Habilidades & Ações</span>
                            <div className="space-y-2">
                                {combatant.abilities.map((ability, idx) => (
                                    <div key={idx} className="bg-ordem-black-deep/30 p-2 rounded border border-ordem-border/50">
                                        <div className="flex justify-between items-start mb-0.5">
                                            <span className="text-xs font-bold text-white">{ability.name}</span>
                                            {ability.type && (
                                                <span className="text-[9px] bg-ordem-ooze px-1 rounded text-ordem-text-muted border border-ordem-border">
                                                    {ability.type}
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-[10px] text-ordem-text-secondary leading-snug">{ability.description}</p>
                                        {ability.cost && (
                                            <div className="mt-1 text-[9px] text-yellow-500 font-mono">
                                                Custo: {ability.cost}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {}
                    <div className="flex items-center gap-2 pt-2 border-t border-ordem-border/50">
                        <button
                            onClick={onDuplicate}
                            className="flex items-center gap-1 px-2 py-1 text-xs bg-ordem-ooze hover:bg-ordem-border rounded text-ordem-text-secondary hover:text-white transition-colors"
                        >
                            <Copy size={12} /> Duplicar
                        </button>
                        <button
                            onClick={() => onUpdate({ isActive: !combatant.isActive })}
                            className={cn(
                                'flex items-center gap-1 px-2 py-1 text-xs rounded transition-colors',
                                combatant.isActive
                                    ? 'bg-yellow-600/20 text-yellow-400 hover:bg-yellow-600/40'
                                    : 'bg-green-600/20 text-green-400 hover:bg-green-600/40'
                            )}
                        >
                            {combatant.isActive ? 'Desativar' : 'Reativar'}
                        </button>
                        <button
                            onClick={onRemove}
                            className="flex items-center gap-1 px-2 py-1 text-xs bg-red-600/20 hover:bg-red-600/40 text-red-400 rounded transition-colors ml-auto"
                        >
                            <Trash2 size={12} /> Remover
                        </button>
                    </div>
                </motion.div>
            )}
        </div>
    );
});
