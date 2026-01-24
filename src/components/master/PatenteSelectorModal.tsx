"use client";

import React, { useState } from 'react';
import { Patente } from '../../core/types';
import { getPatenteConfig, TODAS_PATENTES } from '../../logic/rulesEngine';

interface PatenteSelectorModalProps {
    isOpen: boolean;
    currentPatente: Patente;
    onSelect: (patente: Patente) => void;
    onClose: () => void;
}

export function PatenteSelectorModal({
    isOpen,
    currentPatente,
    onSelect,
    onClose,
}: PatenteSelectorModalProps) {
    const [selected, setSelected] = useState<Patente>(currentPatente);

    if (!isOpen) return null;

    const handleConfirm = () => {
        onSelect(selected);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-ordem-ooze border border-ordem-border rounded-xl max-w-md w-full p-6 animate-in fade-in zoom-in-95 duration-200">
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <span className="text-ordem-gold">⚔</span> Alterar Patente
                </h2>

                <p className="text-sm text-ordem-text-secondary mb-4">
                    Selecione a nova patente. Isso afetará os limites de itens por categoria.
                </p>

                <div className="space-y-2 max-h-80 overflow-y-auto custom-scrollbar">
                    {TODAS_PATENTES.map((patente) => {
                        const config = getPatenteConfig(patente);
                        const isSelected = selected === patente;
                        const isCurrent = currentPatente === patente;

                        return (
                            <button
                                key={patente}
                                onClick={() => setSelected(patente)}
                                className={`w-full text-left p-3 rounded-lg border transition-all ${isSelected
                                        ? 'border-ordem-red bg-ordem-red/20'
                                        : 'border-ordem-border bg-ordem-black/20 hover:border-ordem-border-light'
                                    }`}
                            >
                                <div className="flex justify-between items-start">
                                    <div>
                                        <div className="font-semibold text-white flex items-center gap-2">
                                            {patente}
                                            {isCurrent && (
                                                <span className="text-[10px] bg-ordem-gold/20 text-ordem-gold px-1.5 py-0.5 rounded">
                                                    ATUAL
                                                </span>
                                            )}
                                        </div>
                                        <div className="text-xs text-ordem-text-muted mt-1">
                                            Crédito: {config.credito} • PP mín: {config.nexMin}
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-2 flex gap-2 text-xs">
                                    <span className="bg-ordem-ooze/50 px-2 py-1 rounded">
                                        I: {config.limiteItens.I}
                                    </span>
                                    <span className="bg-ordem-ooze/50 px-2 py-1 rounded">
                                        II: {config.limiteItens.II}
                                    </span>
                                    <span className="bg-ordem-ooze/50 px-2 py-1 rounded">
                                        III: {config.limiteItens.III}
                                    </span>
                                    <span className="bg-ordem-ooze/50 px-2 py-1 rounded">
                                        IV: {config.limiteItens.IV}
                                    </span>
                                </div>
                            </button>
                        );
                    })}
                </div>

                <div className="mt-6 flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 px-4 py-2.5 border border-ordem-border text-ordem-text-secondary hover:text-white hover:border-ordem-border-light rounded-lg transition"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleConfirm}
                        disabled={selected === currentPatente}
                        className="flex-1 px-4 py-2.5 bg-ordem-red text-white font-semibold rounded-lg hover:bg-ordem-red-light transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Confirmar
                    </button>
                </div>
            </div>
        </div>
    );
}
