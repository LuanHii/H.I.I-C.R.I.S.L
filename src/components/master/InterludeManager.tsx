'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Moon, Coffee, Wrench, Activity, Heart, Shield } from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Personagem } from '../../core/types';
import { FichaRegistro } from '../../core/storage/useStoredFichas';
import { cn } from '@/lib/utils';

export interface InterludeManagerProps {
    fichas: FichaRegistro[];
    onUpdate: (id: string, personagem: Personagem) => void;
}

type InterludeAction = 'Dormir' | 'Relaxar' | 'Manutenção';

interface AgentSelection {
    id: string;
    nome: string;
    selected: boolean;
    action?: InterludeAction;
}

export const InterludeManager: React.FC<InterludeManagerProps> = ({ fichas, onUpdate }) => {
    const [selections, setSelections] = useState<AgentSelection[]>(() =>
        fichas.map(f => ({ id: f.id, nome: f.personagem.nome, selected: true, action: undefined }))
    );

    const toggleSelection = (id: string) => {
        setSelections(prev => prev.map(s => s.id === id ? { ...s, selected: !s.selected } : s));
    };

    const setActionForSelected = (action: InterludeAction) => {
        setSelections(prev => prev.map(s => s.selected ? { ...s, action } : s));
    };

    const aplicarEfeitos = () => {
        let log: string[] = [];

        selections.forEach(sel => {
            if (!sel.selected || !sel.action) return;

            const ficha = fichas.find(f => f.id === sel.id);
            if (!ficha) return;
            const agent = ficha.personagem;

            let updated = { ...agent };

            if (sel.action === 'Dormir') {
                updated.pv = { ...agent.pv, atual: agent.pv.max };
                updated.pe = { ...agent.pe, atual: agent.pe.max };
                log.push(`${agent.nome} dormiu e recuperou PV e PE.`);
            } else if (sel.action === 'Relaxar') {
                const recover = 5;
                updated.san = {
                    ...agent.san,
                    atual: Math.min(agent.san.max, agent.san.atual + recover)
                };
                log.push(`${agent.nome} relaxou e recuperou ${recover} SAN.`);
            }

            if (sel.action !== 'Manutenção') {
                onUpdate(ficha.id, updated);
            }
        });

        if (log.length > 0) {
            alert(`Ações Aplicadas:\n${log.join('\n')}`);
        } else {
            alert('Nenhuma ação mecânica aplicada (apenas narrativa ou nenhum agente selecionado).');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-start">
                <div>
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <Moon className="w-6 h-6 text-blue-400" />
                        Interlúdio
                    </h2>
                    <p className="text-sm text-ordem-text-secondary">Gerencie ações de descanso e recuperação entre missões.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {}
                <div className="bg-ordem-ooze/30 border border-ordem-border rounded-xl p-4 space-y-3 h-fit">
                    <h3 className="font-bold text-white mb-2 text-sm uppercase tracking-wider">Ações de Interlúdio</h3>

                    <button
                        onClick={() => setActionForSelected('Dormir')}
                        className="w-full text-left p-3 rounded-lg border border-ordem-border-light bg-ordem-black/40 hover:bg-blue-900/20 hover:border-blue-500/50 transition group"
                    >
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-500/20 rounded text-blue-400 group-hover:text-blue-300">
                                <Moon size={20} />
                            </div>
                            <div>
                                <div className="font-bold text-white group-hover:text-blue-200">Dormir</div>
                                <div className="text-xs text-ordem-text-secondary">Recupera PV e PE.</div>
                            </div>
                        </div>
                    </button>

                    <button
                        onClick={() => setActionForSelected('Relaxar')}
                        className="w-full text-left p-3 rounded-lg border border-ordem-border-light bg-ordem-black/40 hover:bg-purple-900/20 hover:border-purple-500/50 transition group"
                    >
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-purple-500/20 rounded text-purple-400 group-hover:text-purple-300">
                                <Coffee size={20} />
                            </div>
                            <div>
                                <div className="font-bold text-white group-hover:text-purple-200">Relaxar</div>
                                <div className="text-xs text-ordem-text-secondary">Recupera Sanidade.</div>
                            </div>
                        </div>
                    </button>

                    <button
                        onClick={() => setActionForSelected('Manutenção')}
                        className="w-full text-left p-3 rounded-lg border border-ordem-border-light bg-ordem-black/40 hover:bg-yellow-900/20 hover:border-yellow-500/50 transition group"
                    >
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-yellow-500/20 rounded text-yellow-400 group-hover:text-yellow-300">
                                <Wrench size={20} />
                            </div>
                            <div>
                                <div className="font-bold text-white group-hover:text-yellow-200">Manutenção</div>
                                <div className="text-xs text-ordem-text-secondary">Repara equipamentos.</div>
                            </div>
                        </div>
                    </button>
                </div>

                {}
                <div className="md:col-span-2 bg-ordem-ooze/20 border border-ordem-border rounded-xl p-4">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold text-white text-sm uppercase tracking-wider">Agentes no Grupo</h3>
                        <Button size="sm" variant="ghost" onClick={() => setSelections(selections.map(s => ({ ...s, selected: !s.selected })))}>
                            Alternar Seleção
                        </Button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {selections.map((sel, idx) => {
                            const ficha = fichas.find(f => f.id === sel.id);
                            if (!ficha) return null;
                            const agent = ficha.personagem;

                            return (
                                <div
                                    key={idx}
                                    onClick={() => toggleSelection(sel.id)}
                                    className={cn(
                                        "relative p-3 rounded-lg border cursor-pointer transition-all overflow-hidden",
                                        sel.selected ? "bg-ordem-ooze border-ordem-text-muted/50" : "bg-ordem-black/40 border-ordem-border opacity-60"
                                    )}
                                >
                                    <div className="flex justify-between items-start z-10 relative">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-full bg-ordem-border flex items-center justify-center font-bold text-xs">
                                                {agent.classe.substring(0, 3).toUpperCase()}
                                            </div>
                                            <div>
                                                <div className="font-bold text-white text-sm">{agent.nome}</div>
                                                <div className="flex gap-2 text-[10px] text-ordem-text-muted mt-0.5">
                                                    <span className="flex items-center gap-0.5"><Heart size={10} className="text-red-500" /> {agent.pv.atual}/{agent.pv.max}</span>
                                                    <span className="flex items-center gap-0.5"><Activity size={10} className="text-yellow-500" /> {agent.pe.atual}/{agent.pe.max}</span>
                                                    <span className="flex items-center gap-0.5"><Shield size={10} className="text-blue-500" /> {agent.san.atual}/{agent.san.max}</span>
                                                </div>
                                            </div>
                                        </div>
                                        {sel.action && (
                                            <Badge variant="default" className="text-xs bg-black/50">
                                                {sel.action}
                                            </Badge>
                                        )}
                                    </div>
                                    {sel.selected && (
                                        <div className="absolute inset-0 border-2 border-ordem-gold/20 rounded-lg pointer-events-none" />
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    {fichas.length === 0 && (
                        <div className="text-center py-8 text-ordem-text-muted italic">
                            Nenhuma ficha salva para aplicar interlúdio.
                        </div>
                    )}

                    <div className="mt-6 flex justify-end">
                        <Button
                            onClick={aplicarEfeitos}
                            disabled={!selections.some(s => s.selected && s.action)}
                            className="w-full sm:w-auto"
                        >
                            Aplicar Efeitos do Interlúdio
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};
