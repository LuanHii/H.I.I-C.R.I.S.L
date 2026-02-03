"use client";

import { useState, useCallback, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Minus, Swords, Target, Zap, Shield, ArrowRight, Info, Check } from 'lucide-react';
import { Personagem, Item, ModificacaoArma } from '../../core/types';
import {
    MODIFICACOES_ARMAS,
    calcularStatsModificados,
    parseCritico,
    parseDano,
    formatDano,
    formatCritico
} from '../../data/modifications';
import { cn } from '@/lib/utils';

interface WeaponModsModalProps {
    personagem: Personagem;
    onUpdate: (updated: Personagem) => void;
    isOpen: boolean;
    onClose: () => void;
}

function StatComparison({
    label,
    original,
    modified,
    icon: Icon,
    highlight = 'green'
}: {
    label: string;
    original: string | number;
    modified: string | number;
    icon?: React.ElementType;
    highlight?: 'green' | 'red' | 'blue';
}) {
    const changed = String(original) !== String(modified);
    const highlightColor = {
        green: 'text-ordem-green',
        red: 'text-ordem-red',
        blue: 'text-blue-400'
    }[highlight];

    return (
        <div className="flex items-center gap-2 text-xs">
            {Icon && <Icon size={12} className="text-ordem-text-muted" />}
            <span className="text-ordem-text-muted">{label}:</span>
            {changed ? (
                <>
                    <span className="text-ordem-text-secondary line-through opacity-50">{original}</span>
                    <ArrowRight size={10} className="text-ordem-text-muted" />
                    <span className={cn("font-bold", highlightColor)}>{modified}</span>
                </>
            ) : (
                <span className="text-white">{original}</span>
            )}
        </div>
    );
}

function ModChip({
    mod,
    applied,
    onToggle,
    disabled = false
}: {
    mod: ModificacaoArma;
    applied: boolean;
    onToggle: () => void;
    disabled?: boolean;
}) {
    return (
        <button
            type="button"
            onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (!disabled) onToggle();
            }}
            disabled={disabled && !applied}
            className={cn(
                "group relative px-3 py-2 text-xs font-mono rounded-lg border transition-all flex items-center gap-2",
                applied
                    ? "bg-ordem-green/20 border-ordem-green text-ordem-green hover:bg-ordem-red/20 hover:border-ordem-red hover:text-ordem-red"
                    : disabled
                        ? "bg-ordem-ooze/30 border-ordem-border/50 text-ordem-text-muted cursor-not-allowed opacity-50"
                        : "bg-ordem-ooze/50 border-ordem-border text-ordem-text-secondary hover:border-ordem-green hover:text-ordem-green"
            )}
            title={mod.efeito}
        >
            {applied ? <Check size={12} /> : <Plus size={12} />}
            <span>{mod.nome}</span>
            {mod.requisito && (
                <span className="text-[9px] text-ordem-text-muted">({mod.requisito})</span>
            )}
        </button>
    );
}

function WeaponCard({
    arma,
    armaIdx,
    onApplyMod,
    onRemoveMod
}: {
    arma: Item;
    armaIdx: number;
    onApplyMod: (modNome: string) => void;
    onRemoveMod: (modNome: string) => void;
}) {
    const [expanded, setExpanded] = useState(true);

    const modsAplicadas = useMemo(() => arma.modificacoes || [], [arma.modificacoes]);
    const statsModificados = calcularStatsModificados(arma);
    const statsBase = arma.stats || {};

    const isArmaFogo = (statsBase.alcance && statsBase.alcance !== 'Corpo a corpo') ||
        arma.descricao?.toLowerCase().includes('fogo') ||
        arma.descricao?.toLowerCase().includes('balas') ||
        arma.descricao?.toLowerCase().includes('disparo');

    const tipoArma: 'cac' | 'fogo' = isArmaFogo ? 'fogo' : 'cac';

    const modsDisponiveis = useMemo(() =>
        MODIFICACOES_ARMAS.filter(mod => {
            if (modsAplicadas.includes(mod.nome)) return false;
            if (mod.tipo === 'universal') return true;
            if (mod.tipo === 'cac' && tipoArma === 'cac') return true;
            if (mod.tipo === 'fogo' && tipoArma === 'fogo') return true;
            if (mod.tipo === 'disparo' && tipoArma === 'fogo') return true;
            return false;
        }), [modsAplicadas, tipoArma]);

    const modsAplicadasObj = useMemo(() =>
        modsAplicadas.map(nome => MODIFICACOES_ARMAS.find(m => m.nome === nome)).filter(Boolean) as ModificacaoArma[]
        , [modsAplicadas]);

    const podeAdicionar = arma.categoria < 4;
    const categoriaBase = arma.categoriaBase ?? arma.categoria - modsAplicadas.length;

    const danoBase = parseDano(statsBase.dano || statsBase.danoBase || '1d6');
    const danoMod = parseDano(statsModificados.dano || '1d6');
    const criticoBase = parseCritico(statsBase.critico || 'x2');
    const criticoMod = parseCritico(statsModificados.critico || 'x2');

    return (
        <motion.div
            layout
            className="bg-ordem-ooze/30 border border-ordem-border rounded-xl overflow-hidden"
        >
            <button
                type="button"
                onClick={() => setExpanded(!expanded)}
                className="w-full p-4 flex items-center justify-between text-left hover:bg-ordem-ooze/50 transition-colors"
            >
                <div className="flex items-center gap-3">
                    <Swords size={18} className="text-ordem-gold" />
                    <div>
                        <div className="font-bold text-white flex items-center gap-2">
                            {arma.nome}
                            {modsAplicadas.length > 0 && (
                                <span className="text-[10px] px-2 py-0.5 bg-ordem-green/20 text-ordem-green rounded-full font-mono">
                                    +{modsAplicadas.length} mod{modsAplicadas.length > 1 ? 's' : ''}
                                </span>
                            )}
                        </div>
                        <div className="text-xs text-ordem-text-muted flex items-center gap-2">
                            <span>Cat: <span className="text-ordem-gold font-bold">{['0', 'I', 'II', 'III', 'IV'][arma.categoria]}</span></span>
                            {modsAplicadas.length > 0 && (
                                <span className="text-ordem-text-muted">(base: {['0', 'I', 'II', 'III', 'IV'][Math.max(0, categoriaBase)]})</span>
                            )}
                            <span className="text-ordem-border">•</span>
                            <span className={cn(
                                tipoArma === 'fogo' ? 'text-orange-400' : 'text-blue-400'
                            )}>
                                {tipoArma === 'fogo' ? '🔫 Fogo' : '⚔️ Corpo a Corpo'}
                            </span>
                        </div>
                    </div>
                </div>
                <motion.div
                    animate={{ rotate: expanded ? 180 : 0 }}
                    className="text-ordem-text-muted"
                >
                    ▼
                </motion.div>
            </button>

            <AnimatePresence>
                {expanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="border-t border-ordem-border"
                    >
                        <div className="p-4 space-y-4">
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 bg-ordem-black/50 rounded-lg">
                                <StatComparison
                                    label="Dano"
                                    original={statsBase.dano || statsBase.danoBase || '1d6'}
                                    modified={statsModificados.dano || '1d6'}
                                    icon={Zap}
                                    highlight="green"
                                />
                                <StatComparison
                                    label="Crítico"
                                    original={statsBase.critico || 'x2'}
                                    modified={statsModificados.critico || 'x2'}
                                    icon={Target}
                                    highlight="red"
                                />
                                <StatComparison
                                    label="Alcance"
                                    original={statsBase.alcance || 'CaC'}
                                    modified={statsModificados.alcance || 'CaC'}
                                    icon={ArrowRight}
                                    highlight="blue"
                                />
                                {statsModificados.ataqueBonus && statsModificados.ataqueBonus > 0 && (
                                    <div className="flex items-center gap-2 text-xs">
                                        <Shield size={12} className="text-ordem-text-muted" />
                                        <span className="text-ordem-text-muted">Ataque:</span>
                                        <span className="font-bold text-ordem-green">+{statsModificados.ataqueBonus}</span>
                                    </div>
                                )}
                            </div>

                            {modsAplicadasObj.length > 0 && (
                                <div>
                                    <div className="text-[10px] text-ordem-text-muted uppercase tracking-widest mb-2 flex items-center gap-2">
                                        <Check size={12} /> Modificações Aplicadas
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {modsAplicadasObj.map(mod => (
                                            <ModChip
                                                key={mod.nome}
                                                mod={mod}
                                                applied={true}
                                                onToggle={() => onRemoveMod(mod.nome)}
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div>
                                <div className="text-[10px] text-ordem-text-muted uppercase tracking-widest mb-2 flex items-center gap-2">
                                    <Plus size={12} />
                                    Adicionar Modificação
                                    {!podeAdicionar && (
                                        <span className="text-ordem-red">(Categoria máxima)</span>
                                    )}
                                </div>

                                {modsDisponiveis.length === 0 ? (
                                    <p className="text-xs text-ordem-text-muted italic">
                                        Todas as modificações disponíveis já foram aplicadas.
                                    </p>
                                ) : (
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                        {modsDisponiveis.map(mod => (
                                            <ModChip
                                                key={mod.nome}
                                                mod={mod}
                                                applied={false}
                                                onToggle={() => onApplyMod(mod.nome)}
                                                disabled={!podeAdicionar}
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>

                            {modsAplicadasObj.length > 0 && (
                                <div className="p-3 bg-ordem-green/5 border border-ordem-green/20 rounded-lg">
                                    <div className="text-[10px] text-ordem-green uppercase tracking-widest mb-2 flex items-center gap-2">
                                        <Info size={12} /> Resumo das Modificações
                                    </div>
                                    <ul className="text-xs text-ordem-text-secondary space-y-1">
                                        {modsAplicadasObj.map(mod => (
                                            <li key={mod.nome} className="flex items-start gap-2">
                                                <span className="text-ordem-gold">•</span>
                                                <span>
                                                    <span className="font-bold text-white">{mod.nome}:</span>{' '}
                                                    {mod.efeito}
                                                </span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}

function WeaponModsModalContent({ personagem, onUpdate, onClose }: Omit<WeaponModsModalProps, 'isOpen'>) {
    const armas = useMemo(() =>
        personagem.equipamentos
            .map((eq, idx) => ({ eq, idx }))
            .filter(({ eq }) => eq.tipo === 'Arma' || (eq.stats && (eq.stats.dano || eq.stats.danoBase)))
        , [personagem.equipamentos]);

    const aplicarModificacao = useCallback((armaIdx: number, modNome: string) => {
        const equipamentos = [...personagem.equipamentos];
        const arma = { ...equipamentos[armaIdx] };

        if (!arma.categoriaBase) {
            arma.categoriaBase = arma.categoria;
        }

        const novaCategoria = Math.min(4, arma.categoria + 1) as 0 | 1 | 2 | 3 | 4;
        const novasMods = [...(arma.modificacoes || []), modNome];

        if (!arma.stats) arma.stats = {};
        if (!arma.stats.danoBase && arma.stats.dano) {
            arma.stats.danoBase = arma.stats.dano;
        }

        equipamentos[armaIdx] = {
            ...arma,
            categoria: novaCategoria,
            modificacoes: novasMods
        };

        onUpdate({ ...personagem, equipamentos });
    }, [personagem, onUpdate]);

    const removerModificacao = useCallback((armaIdx: number, modNome: string) => {
        const equipamentos = [...personagem.equipamentos];
        const arma = { ...equipamentos[armaIdx] };

        const novasMods = (arma.modificacoes || []).filter(m => m !== modNome);
        const categoriaBase = arma.categoriaBase ?? arma.categoria;
        const novaCategoria = Math.min(4, Math.max(0, categoriaBase + novasMods.length)) as 0 | 1 | 2 | 3 | 4;

        equipamentos[armaIdx] = {
            ...arma,
            categoria: novaCategoria,
            modificacoes: novasMods.length > 0 ? novasMods : undefined
        };

        onUpdate({ ...personagem, equipamentos });
    }, [personagem, onUpdate]);

    const handleBackdropClick = useCallback((e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            e.preventDefault();
            e.stopPropagation();
            onClose();
        }
    }, [onClose]);

    return (
        <div
            className="fixed inset-0 bg-black/80 flex items-center justify-center z-[9999] p-4"
            onClick={handleBackdropClick}
            onMouseDown={(e) => e.stopPropagation()}
        >
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-ordem-black border border-ordem-border rounded-xl max-w-3xl w-full max-h-[85vh] overflow-hidden flex flex-col"
                onClick={(e) => e.stopPropagation()}
                onMouseDown={(e) => e.stopPropagation()}
            >
                <div className="p-4 border-b border-ordem-border flex justify-between items-center bg-ordem-ooze/30">
                    <div>
                        <h2 className="text-lg font-bold text-white flex items-center gap-2">
                            <Swords size={20} className="text-ordem-gold" />
                            Modificações de Armas
                        </h2>
                        <p className="text-xs text-ordem-text-muted mt-0.5">
                            Cada modificação aumenta a categoria em +1
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            onClose();
                        }}
                        className="p-2 text-ordem-text-muted hover:text-white hover:bg-ordem-ooze rounded-lg transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                    {armas.length === 0 ? (
                        <div className="text-center py-12">
                            <Swords size={48} className="mx-auto text-ordem-text-muted mb-4 opacity-50" />
                            <p className="text-ordem-text-muted">
                                Nenhuma arma no inventário.
                            </p>
                            <p className="text-xs text-ordem-text-muted mt-2">
                                Adicione armas ao equipamento para aplicar modificações.
                            </p>
                        </div>
                    ) : (
                        armas.map(({ eq: arma, idx }) => (
                            <WeaponCard
                                key={`${arma.nome}-${idx}`}
                                arma={arma}
                                armaIdx={idx}
                                onApplyMod={(modNome) => aplicarModificacao(idx, modNome)}
                                onRemoveMod={(modNome) => removerModificacao(idx, modNome)}
                            />
                        ))
                    )}
                </div>

                <div className="p-4 border-t border-ordem-border bg-ordem-ooze/30">
                    <div className="flex items-center justify-between">
                        <div className="text-xs text-ordem-text-muted">
                            <span className="text-ordem-gold font-bold">{armas.length}</span> arma{armas.length !== 1 ? 's' : ''} no inventário
                        </div>
                        <button
                            type="button"
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                onClose();
                            }}
                            className="px-6 py-2 text-sm font-mono uppercase tracking-wider bg-ordem-green hover:bg-green-600 text-white rounded-lg transition"
                        >
                            Concluído
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}

export function WeaponModsModal({ personagem, onUpdate, isOpen, onClose }: WeaponModsModalProps) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!isOpen || !mounted) return null;
    return createPortal(
        <WeaponModsModalContent personagem={personagem} onUpdate={onUpdate} onClose={onClose} />,
        document.body
    );
}

interface WeaponModsButtonProps {
    personagem: Personagem;
    onUpdate: (updated: Personagem) => void;
    className?: string;
}

export function WeaponModsButton({ personagem, onUpdate, className = '' }: WeaponModsButtonProps) {
    const [showModal, setShowModal] = useState(false);
    const armasCount = personagem.equipamentos.filter(eq => eq.tipo === 'Arma' || (eq.stats && (eq.stats.dano || eq.stats.danoBase))).length;

    const handleOpenModal = useCallback((e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setShowModal(true);
    }, []);

    const handleCloseModal = useCallback(() => {
        setShowModal(false);
    }, []);

    if (armasCount === 0) return null;

    return (
        <>
            <button
                type="button"
                onClick={handleOpenModal}
                onMouseDown={(e) => e.stopPropagation()}
                className={cn(
                    "px-3 py-2 text-[10px] font-mono tracking-[0.15em] border border-ordem-gold text-ordem-gold hover:bg-ordem-gold/10 rounded-lg transition flex items-center gap-1.5",
                    className
                )}
                title="Modificar armas"
            >
                <Swords size={12} />
                MODS ({armasCount})
            </button>
            <WeaponModsModal
                personagem={personagem}
                onUpdate={onUpdate}
                isOpen={showModal}
                onClose={handleCloseModal}
            />
        </>
    );
}
