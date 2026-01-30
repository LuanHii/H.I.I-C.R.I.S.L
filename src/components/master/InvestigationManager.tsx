'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plus, Trash2, CheckSquare, Square, FileText, AlertCircle } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card, CardHeader, CardContent } from '../ui/Card';
import { Input } from '../ui/Input';
import { Badge } from '../ui/Badge';
import { cn } from '@/lib/utils';

export interface Pista {
    id: string;
    nome: string;
    descricao: string;
    tipo: 'Principal' | 'Complementar';
    dt?: number;
    descoberta: boolean;
}

export interface CenaInvestigacao {
    id: string;
    titulo: string;
    descricao: string;
    pistas: Pista[];
}

export const InvestigationManager: React.FC = () => {
    const [cenas, setCenas] = useState<CenaInvestigacao[]>([]);
    const [isCreating, setIsCreating] = useState(false);
    const [novaCenaTitulo, setNovaCenaTitulo] = useState('');
    const [cenaExpandida, setCenaExpandida] = useState<string | null>(null);
    const [adicionandoPistaEm, setAdicionandoPistaEm] = useState<string | null>(null);
    const [novaPista, setNovaPista] = useState<Partial<Pista>>({ tipo: 'Principal' });

    const handleCriarCena = () => {
        if (!novaCenaTitulo.trim()) return;
        const novaCena: CenaInvestigacao = {
            id: crypto.randomUUID(),
            titulo: novaCenaTitulo,
            descricao: '',
            pistas: []
        };
        setCenas([novaCena, ...cenas]);
        setNovaCenaTitulo('');
        setIsCreating(false);
        setCenaExpandida(novaCena.id);
    };

    const handleAdicionarPista = (cenaId: string) => {
        if (!novaPista.nome || !novaPista.descricao) return;

        const pista: Pista = {
            id: crypto.randomUUID(),
            nome: novaPista.nome,
            descricao: novaPista.descricao,
            tipo: novaPista.tipo || 'Principal',
            dt: novaPista.dt,
            descoberta: false
        };

        setCenas(cenas.map(c => {
            if (c.id === cenaId) {
                return { ...c, pistas: [...c.pistas, pista] };
            }
            return c;
        }));

        setNovaPista({ tipo: 'Principal' });
        setAdicionandoPistaEm(null);
    };

    const togglePista = (cenaId: string, pistaId: string) => {
        setCenas(cenas.map(c => {
            if (c.id === cenaId) {
                return {
                    ...c,
                    pistas: c.pistas.map(p =>
                        p.id === pistaId ? { ...p, descoberta: !p.descoberta } : p
                    )
                };
            }
            return c;
        }));
    };

    const removerCena = (id: string) => {
        if (confirm('Tem certeza que deseja remover esta cena e todas as suas pistas?')) {
            setCenas(cenas.filter(c => c.id !== id));
        }
    };

    const removerPista = (cenaId: string, pistaId: string) => {
        setCenas(cenas.map(c => {
            if (c.id === cenaId) {
                return {
                    ...c,
                    pistas: c.pistas.filter(p => p.id !== pistaId)
                };
            }
            return c;
        }));
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <Search className="w-6 h-6 text-ordem-text-muted" />
                        Cenas de Investigação
                    </h2>
                    <p className="text-sm text-ordem-text-secondary">Gerencie pistas e progresso da investigação.</p>
                </div>
                {!isCreating && (
                    <Button onClick={() => setIsCreating(true)} size="sm">
                        <Plus size={16} /> Nova Cena
                    </Button>
                )}
            </div>

            {}
            <AnimatePresence>
                {isCreating && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="bg-ordem-ooze/50 border border-ordem-border rounded-lg p-4"
                    >
                        <div className="flex gap-2">
                            <Input
                                placeholder="Título da Cena (ex: O Escritório do Diretor)"
                                value={novaCenaTitulo}
                                onChange={(e) => setNovaCenaTitulo(e.target.value)}
                                autoFocus
                                onKeyDown={(e) => e.key === 'Enter' && handleCriarCena()}
                            />
                            <Button onClick={handleCriarCena} disabled={!novaCenaTitulo.trim()}>Criar</Button>
                            <Button variant="ghost" onClick={() => setIsCreating(false)}>Cancelar</Button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {}
            <div className="space-y-4">
                {cenas.length === 0 ? (
                    <div className="text-center py-10 text-ordem-text-muted italic border-2 border-dashed border-ordem-border/50 rounded-lg">
                        Nenhuma cena de investigação ativa.
                    </div>
                ) : (
                    cenas.map(cena => (
                        <Card key={cena.id} className="overflow-hidden border-ordem-border-light bg-ordem-black-deep/40">
                            <div
                                className="p-4 bg-ordem-ooze/80 flex justify-between items-center cursor-pointer hover:bg-ordem-ooze transition-colors"
                                onClick={() => setCenaExpandida(cenaExpandida === cena.id ? null : cena.id)}
                            >
                                <div className="flex items-center gap-3">
                                    <FileText className="text-ordem-text-muted" />
                                    <div>
                                        <h3 className="font-bold text-lg text-white">{cena.titulo}</h3>
                                        <div className="text-xs text-ordem-text-secondary flex gap-2">
                                            <span>{cena.pistas.filter(p => p.descoberta).length}/{cena.pistas.length} pistas encontradas</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="text-ordem-text-muted hover:text-red-500"
                                        onClick={() => { removerCena(cena.id); }}
                                    >
                                        <Trash2 size={16} />
                                    </Button>
                                </div>
                            </div>

                            <AnimatePresence>
                                {cenaExpandida === cena.id && (
                                    <motion.div
                                        initial={{ height: 0 }}
                                        animate={{ height: 'auto' }}
                                        exit={{ height: 0 }}
                                        className="border-t border-ordem-border-light"
                                    >
                                        <div className="p-4 space-y-4">
                                            {}
                                            <div className="flex justify-between items-center">
                                                <h4 className="text-sm font-bold uppercase tracking-wider text-ordem-text-muted">Pistas</h4>
                                                <Button
                                                    size="sm"
                                                    variant="secondary"
                                                    onClick={() => setAdicionandoPistaEm(cena.id)}
                                                    disabled={adicionandoPistaEm === cena.id}
                                                >
                                                    <Plus size={14} /> Adicionar Pista
                                                </Button>
                                            </div>

                                            {}
                                            {adicionandoPistaEm === cena.id && (
                                                <div className="p-3 bg-ordem-ooze rounded-lg border border-ordem-border space-y-3 animate-in fade-in slide-in-from-top-2">
                                                    <Input
                                                        placeholder="Nome da Pista (ex: Carta Queimada)"
                                                        value={novaPista.nome || ''}
                                                        onChange={e => setNovaPista({ ...novaPista, nome: e.target.value })}
                                                    />
                                                    <Input
                                                        placeholder="Descrição (O que os agentes descobrem?)"
                                                        value={novaPista.descricao || ''}
                                                        onChange={e => setNovaPista({ ...novaPista, descricao: e.target.value })}
                                                    />
                                                    <div className="flex gap-2">
                                                        <select
                                                            className="bg-ordem-black border border-ordem-border rounded px-3 py-2 text-sm text-ordem-text-secondary focus:outline-none focus:border-ordem-gold"
                                                            value={novaPista.tipo}
                                                            onChange={e => setNovaPista({ ...novaPista, tipo: e.target.value as any })}
                                                        >
                                                            <option value="Principal">Principal</option>
                                                            <option value="Complementar">Complementar</option>
                                                        </select>
                                                        <Input
                                                            type="number"
                                                            placeholder="DT (Opcional)"
                                                            className="w-24"
                                                            value={novaPista.dt || ''}
                                                            onChange={e => setNovaPista({ ...novaPista, dt: parseInt(e.target.value) || undefined })}
                                                        />
                                                        <div className="flex-1 flex justify-end gap-2">
                                                            <Button onClick={() => handleAdicionarPista(cena.id)} size="sm">Salvar</Button>
                                                            <Button variant="ghost" size="sm" onClick={() => setAdicionandoPistaEm(null)}>Cancelar</Button>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {}
                                            <div className="space-y-2">
                                                {cena.pistas.map(pista => (
                                                    <div
                                                        key={pista.id}
                                                        className={cn(
                                                            "flex justify-between items-start p-3 rounded-lg border transition-all",
                                                            pista.descoberta
                                                                ? "bg-green-900/10 border-green-900/30 opacity-70"
                                                                : "bg-ordem-black/30 border-ordem-border-light hover:border-ordem-text-muted"
                                                        )}
                                                    >
                                                        <div className="flex gap-3">
                                                            <button
                                                                onClick={() => togglePista(cena.id, pista.id)}
                                                                className={cn(
                                                                    "mt-1 hover:scale-110 transition",
                                                                    pista.descoberta ? "text-green-500" : "text-ordem-text-muted hover:text-white"
                                                                )}
                                                            >
                                                                {pista.descoberta ? <CheckSquare size={20} /> : <Square size={20} />}
                                                            </button>
                                                            <div>
                                                                <div className="flex items-center gap-2">
                                                                    <span className={cn("font-bold", pista.descoberta && "line-through text-ordem-text-muted")}>
                                                                        {pista.nome}
                                                                    </span>
                                                                    <Badge variant={pista.tipo === 'Principal' ? 'danger' : 'default'} size="sm">
                                                                        {pista.tipo}
                                                                    </Badge>
                                                                    {pista.dt && (
                                                                        <Badge variant="default" size="sm" className="font-mono">
                                                                            DT {pista.dt}
                                                                        </Badge>
                                                                    )}
                                                                </div>
                                                                <p className="text-sm text-ordem-text-secondary mt-1">{pista.descricao}</p>
                                                            </div>
                                                        </div>
                                                        <button
                                                            onClick={() => removerPista(cena.id, pista.id)}
                                                            className="text-ordem-text-muted hover:text-red-500 p-1 opacity-0 group-hover:opacity-100 transition"
                                                        >
                                                            <Trash2 size={14} />
                                                        </button>
                                                    </div>
                                                ))}
                                                {cena.pistas.length === 0 && !adicionandoPistaEm && (
                                                    <div className="text-sm text-ordem-text-muted text-center py-2">
                                                        Nenhuma pista cadastrada nesta cena.
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
};
