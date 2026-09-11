"use client";

import React, { useEffect, useState } from 'react';
import { ClasseName, Patente } from '../../core/types';
import { getPatenteConfig, TODAS_PATENTES } from '../../logic/rulesEngine';
import { Fita } from './ui/Pecas';
import { OpcaoDoSeletor, SeletorModal } from './ui/SeletorModal';

interface PatenteSelectorModalProps {
    isOpen: boolean;
    currentPatente: Patente;
    onSelect: (patente: Patente) => void;
    onClose: () => void;
    classe?: ClasseName;
}

export function PatenteSelectorModal({
    isOpen,
    currentPatente,
    onSelect,
    onClose,
    classe,
}: PatenteSelectorModalProps) {
    const [selected, setSelected] = useState<Patente>(currentPatente);

    useEffect(() => {
        if (isOpen) setSelected(currentPatente);
    }, [isOpen, currentPatente]);

    const handleConfirm = () => {
        onSelect(selected);
        onClose();
    };

    return (
        <SeletorModal
            aberto={isOpen}
            onFechar={onClose}
            rotulo="Prestígio"
            titulo="Alterar patente"
            largura="md"
            classe={classe}
            rodape={(
                <>
                    <span className="text-xs text-ordem-text-muted">Muda os limites de itens por categoria e grava os pontos de prestígio.</span>
                    <div className="flex shrink-0 gap-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="border border-white/10 px-4 py-2 whitespace-nowrap font-carimbo text-[11px] uppercase tracking-[0.16em] text-ordem-text-secondary transition hover:border-white/30 hover:text-white"
                        >
                            Cancelar
                        </button>
                        <button
                            type="button"
                            onClick={handleConfirm}
                            disabled={selected === currentPatente}
                            className="border border-[var(--mestre-primary,#DC2626)] bg-[var(--mestre-primary,#DC2626)]/15 px-5 py-2 whitespace-nowrap font-carimbo text-[11px] uppercase tracking-[0.16em] text-white transition hover:bg-[var(--mestre-primary,#DC2626)]/30 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                            Confirmar
                        </button>
                    </div>
                </>
            )}
        >
            <ul className="space-y-2">
                {TODAS_PATENTES.map((patente) => {
                    const config = getPatenteConfig(patente);
                    const isCurrent = currentPatente === patente;
                    return (
                        <li key={patente}>
                            <OpcaoDoSeletor
                                titulo={(
                                    <span className="flex items-center gap-2">
                                        {patente}
                                        {isCurrent && <Fita variante="neutra">atual</Fita>}
                                    </span>
                                )}
                                meta={<span className="font-mono text-[11px] text-ordem-gold">{config.ppMin} PP</span>}
                                descricao={`Crédito ${config.credito}`}
                                rodape={(
                                    <span className="flex gap-1.5 font-mono text-[11px] text-ordem-text-muted">
                                        {(['I', 'II', 'III', 'IV'] as const).map((cat) => (
                                            <span key={cat} className="border border-white/10 px-1.5 py-0.5">{cat}: {config.limiteItens[cat]}</span>
                                        ))}
                                    </span>
                                )}
                                selecionada={selected === patente}
                                onClick={() => setSelected(patente)}
                            />
                        </li>
                    );
                })}
            </ul>
        </SeletorModal>
    );
}
