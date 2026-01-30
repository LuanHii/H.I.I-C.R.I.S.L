"use client";

import { useState, useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Personagem, ModificacaoArma } from '../../core/types';
import { MODIFICACOES_ARMAS } from '../../data/modifications';

interface WeaponModsModalProps {
    personagem: Personagem;
    onUpdate: (updated: Personagem) => void;
    isOpen: boolean;
    onClose: () => void;
}

function WeaponModsModalContent({ personagem, onUpdate, onClose }: Omit<WeaponModsModalProps, 'isOpen'>) {
    const armas = personagem.equipamentos.filter(eq => eq.tipo === 'Arma' || (eq.stats && eq.stats.dano));
    const getModificacoesFromDescricao = (descricao: string): string[] => {
        const match = descricao.match(/\[Mods: ([^\]]+)\]/);
        if (!match) return [];
        return match[1].split(',').map(m => m.trim()).filter(Boolean);
    };
    const aplicarModificacao = useCallback((nomeArma: string, mod: ModificacaoArma) => {
        const equipamentos = [...personagem.equipamentos];
        const idx = equipamentos.findIndex(eq => eq.nome === nomeArma);
        if (idx === -1) return;

        const arma = equipamentos[idx];
        const novaCategoria = Math.min(4, arma.categoria + 1) as 0 | 1 | 2 | 3 | 4;

        equipamentos[idx] = {
            ...arma,
            categoria: novaCategoria,
            descricao: arma.descricao.includes('[Mods:')
                ? arma.descricao.replace(/\[Mods: ([^\]]+)\]/, `[Mods: $1, ${mod.nome}]`)
                : `${arma.descricao} [Mods: ${mod.nome}]`
        };

        onUpdate({ ...personagem, equipamentos });
    }, [personagem, onUpdate]);
    const removerModificacao = useCallback((nomeArma: string, modNome: string) => {
        const equipamentos = [...personagem.equipamentos];
        const idx = equipamentos.findIndex(eq => eq.nome === nomeArma);
        if (idx === -1) return;

        const arma = equipamentos[idx];
        const novaCategoria = Math.max(0, arma.categoria - 1) as 0 | 1 | 2 | 3 | 4;
        let novaDescricao = arma.descricao
            .replace(new RegExp(`,\\s*${modNome}`, 'g'), '')
            .replace(new RegExp(`${modNome},\\s*`, 'g'), '')
            .replace(new RegExp(`\\[Mods: ${modNome}\\]`, 'g'), '');
        if (novaDescricao.includes('[Mods: ]')) {
            novaDescricao = novaDescricao.replace('[Mods: ]', '').trim();
        }

        equipamentos[idx] = {
            ...arma,
            categoria: novaCategoria,
            descricao: novaDescricao.trim()
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

    const handleCloseClick = useCallback((e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        onClose();
    }, [onClose]);

    return (
        <div
            className="fixed inset-0 bg-black/80 flex items-center justify-center z-[9999] p-4"
            onClick={handleBackdropClick}
            onMouseDown={(e) => e.stopPropagation()}
        >
            <div
                className="bg-ordem-black border border-ordem-border rounded-xl max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col"
                onClick={(e) => e.stopPropagation()}
                onMouseDown={(e) => e.stopPropagation()}
            >
                <div className="p-4 border-b border-ordem-border flex justify-between items-center">
                    <h2 className="text-lg font-bold text-white">⚙ Modificações de Armas</h2>
                    <button
                        type="button"
                        onClick={handleCloseClick}
                        className="text-ordem-text-muted hover:text-white text-xl w-8 h-8 flex items-center justify-center"
                    >
                        ×
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {armas.length === 0 ? (
                        <p className="text-ordem-text-muted text-center py-8">
                            Nenhuma arma no inventário.
                        </p>
                    ) : (
                        armas.map(arma => {
                            const modsAplicadas = getModificacoesFromDescricao(arma.descricao);
                            const tipoArma = arma.stats?.alcance ? 'fogo' : 'cac';
                            const modsDisponiveis = MODIFICACOES_ARMAS.filter(mod => {
                                if (mod.tipo === 'universal') return true;
                                if (mod.tipo === 'cac' && tipoArma === 'cac') return true;
                                if (mod.tipo === 'fogo' && tipoArma === 'fogo') return true;
                                return false;
                            }).filter(mod => !modsAplicadas.includes(mod.nome));

                            const podeAdicionar = arma.categoria < 4;

                            return (
                                <div key={arma.nome} className="bg-ordem-ooze/30 border border-ordem-border rounded-lg p-4">
                                    <div className="flex justify-between items-start mb-3">
                                        <div>
                                            <div className="font-bold text-white">{arma.nome}</div>
                                            <div className="text-xs text-ordem-text-muted">
                                                Categoria: <span className="text-ordem-gold">{arma.categoria}</span>
                                                {arma.stats?.dano && <span className="ml-2">• Dano: {arma.stats.dano}</span>}
                                            </div>
                                        </div>
                                    </div>

                                    {}
                                    {modsAplicadas.length > 0 && (
                                        <div className="mb-3">
                                            <div className="text-[10px] text-ordem-text-muted uppercase tracking-widest mb-2">Aplicadas:</div>
                                            <div className="flex flex-wrap gap-2">
                                                {modsAplicadas.map(modNome => {
                                                    const mod = MODIFICACOES_ARMAS.find(m => m.nome === modNome);
                                                    return (
                                                        <button
                                                            key={modNome}
                                                            type="button"
                                                            onClick={(e) => {
                                                                e.preventDefault();
                                                                e.stopPropagation();
                                                                removerModificacao(arma.nome, modNome);
                                                            }}
                                                            className="px-2 py-1 text-xs font-mono border border-ordem-gold bg-ordem-gold/10 text-ordem-gold rounded flex items-center gap-1 hover:bg-ordem-red/10 hover:border-ordem-red hover:text-ordem-red transition-all"
                                                            title={mod?.efeito || modNome}
                                                        >
                                                            {modNome}
                                                            <span className="text-[10px]">×</span>
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}

                                    {}
                                    {podeAdicionar && modsDisponiveis.length > 0 && (
                                        <div>
                                            <div className="text-[10px] text-ordem-text-muted uppercase tracking-widest mb-2">
                                                Adicionar (+1 Cat → Cat {arma.categoria + 1}):
                                            </div>
                                            <div className="flex flex-wrap gap-2">
                                                {modsDisponiveis.slice(0, 8).map(mod => (
                                                    <button
                                                        key={mod.nome}
                                                        type="button"
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            e.stopPropagation();
                                                            aplicarModificacao(arma.nome, mod);
                                                        }}
                                                        className="px-2 py-1 text-xs font-mono border border-ordem-border text-ordem-text-muted rounded hover:border-ordem-gold hover:text-ordem-gold transition-all"
                                                        title={mod.efeito}
                                                    >
                                                        {mod.nome}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {!podeAdicionar && (
                                        <div className="text-xs text-ordem-text-muted italic">
                                            Categoria máxima atingida (IV).
                                        </div>
                                    )}
                                </div>
                            );
                        })
                    )}
                </div>

                <div className="p-4 border-t border-ordem-border">
                    <button
                        type="button"
                        onClick={handleCloseClick}
                        className="w-full py-3 text-sm font-mono uppercase tracking-wider bg-ordem-ooze text-white hover:bg-ordem-border transition rounded-lg"
                    >
                        Fechar
                    </button>
                </div>
            </div>
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
    const armasCount = personagem.equipamentos.filter(eq => eq.tipo === 'Arma' || (eq.stats && eq.stats.dano)).length;

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
                className={`px-3 py-2 text-[10px] font-mono tracking-[0.15em] border border-ordem-gold text-ordem-gold hover:bg-ordem-gold/10 rounded-lg transition flex items-center gap-1 ${className}`}
                title="Modificar armas"
            >
                ⚙ MODS
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
