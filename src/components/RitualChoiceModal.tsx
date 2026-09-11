"use client";

import React, { useState, useMemo } from 'react';
import { Personagem, Ritual, Elemento } from '../core/types';
import { RITUAIS } from '../data/magic/rituals';
import { ELEMENTO_CONFIG } from '../data/magic/elementColors';
import { Fita } from './master/ui/Pecas';
import { CHIP_DO_SELETOR, OpcaoDoSeletor, SeletorModal } from './master/ui/SeletorModal';

interface RitualChoiceModalProps {
    agent: Personagem;
    onSelect: (ritual: Ritual) => void;
    onClose?: () => void;

    circuloMaximo?: number;
}

const ELEMENTOS: Elemento[] = ['Sangue', 'Morte', 'Conhecimento', 'Energia', 'Medo'];

function calcularCirculoMaximo(nex: number): number {
    if (nex >= 75) return 3;
    if (nex >= 45) return 2;
    return 1;
}

export function RitualChoiceModal({
    agent,
    onSelect,
    onClose,
    circuloMaximo: circuloMaximoProp
}: RitualChoiceModalProps) {
    const [busca, setBusca] = useState('');
    const [filtroElemento, setFiltroElemento] = useState<Elemento | 'todos'>('todos');
    const [filtroCirculo, setFiltroCirculo] = useState<number | 'todos'>('todos');
    const [ritualSelecionado, setRitualSelecionado] = useState<string | null>(null);
    const circuloMaximo = circuloMaximoProp ?? calcularCirculoMaximo(agent.nex);
    const rituaisConhecidos = useMemo(() => new Set(agent.rituais.map(r => r.nome)), [agent.rituais]);

    const rituaisFiltrados = useMemo(() => {
        let lista = RITUAIS.filter(r => {
            if (r.circulo > circuloMaximo) return false;
            if (rituaisConhecidos.has(r.nome)) return false;
            if (r.circulo === 4) return false;
            return true;
        });
        if (filtroElemento !== 'todos') {
            lista = lista.filter(r => r.elemento === filtroElemento);
        }
        if (filtroCirculo !== 'todos') {
            lista = lista.filter(r => r.circulo === filtroCirculo);
        }
        if (busca.trim()) {
            const termo = busca.toLowerCase();
            lista = lista.filter(r =>
                r.nome.toLowerCase().includes(termo) ||
                r.descricao.toLowerCase().includes(termo) ||
                r.elemento.toLowerCase().includes(termo)
            );
        }
        return lista.sort((a, b) => {
            if (a.circulo !== b.circulo) return a.circulo - b.circulo;
            return a.nome.localeCompare(b.nome);
        });
    }, [busca, filtroElemento, filtroCirculo, circuloMaximo, rituaisConhecidos]);

    const ritualId = (r: Ritual) => `${r.nome}|${r.elemento}`;

    const handleConfirm = () => {
        if (!ritualSelecionado) return;
        const ritual = rituaisFiltrados.find(r => ritualId(r) === ritualSelecionado);
        if (ritual) onSelect(ritual);
    };

    const circulosDisponiveis = Array.from({ length: Math.min(circuloMaximo, 3) }, (_, i) => i + 1);

    return (
        <SeletorModal
            aberto
            onFechar={() => onClose?.()}
            rotulo={`Até ${circuloMaximo}º círculo`}
            titulo="Aprender ritual"
            classe={agent.classe}
            busca={{ valor: busca, aoMudar: setBusca, placeholder: 'Buscar ritual…' }}
            filtros={(
                <>
                    <button type="button" onClick={() => setFiltroElemento('todos')} className={CHIP_DO_SELETOR(filtroElemento === 'todos')}>Todos</button>
                    {ELEMENTOS.map((elem) => {
                        const Icon = ELEMENTO_CONFIG[elem].icon;
                        return (
                            <button key={elem} type="button" onClick={() => setFiltroElemento(elem)} className={`${CHIP_DO_SELETOR(filtroElemento === elem)} flex items-center gap-1`}>
                                <Icon size={11} className={ELEMENTO_CONFIG[elem].color} /> {elem}
                            </button>
                        );
                    })}
                    <span className="mx-1 h-4 w-px bg-white/10" aria-hidden />
                    <button type="button" onClick={() => setFiltroCirculo('todos')} className={CHIP_DO_SELETOR(filtroCirculo === 'todos')}>Qualquer círculo</button>
                    {circulosDisponiveis.map((c) => (
                        <button key={c} type="button" onClick={() => setFiltroCirculo(c)} className={CHIP_DO_SELETOR(filtroCirculo === c)}>{c}º</button>
                    ))}
                    <span className="ml-auto font-mono text-[11px] text-ordem-text-muted">{rituaisFiltrados.length}</span>
                </>
            )}
            rodape={(
                <>
                    <span className="text-xs text-ordem-text-muted">
                        {ritualSelecionado ? 'Ritual marcado — confirme para aprender.' : 'Marque um ritual da lista.'}
                    </span>
                    <div className="flex shrink-0 gap-2">
                        <button
                            type="button"
                            onClick={() => onClose?.()}
                            className="border border-white/10 px-4 py-2 whitespace-nowrap font-carimbo text-[11px] uppercase tracking-[0.16em] text-ordem-text-secondary transition hover:border-white/30 hover:text-white"
                        >
                            Cancelar
                        </button>
                        <button
                            type="button"
                            onClick={handleConfirm}
                            disabled={!ritualSelecionado}
                            className="border border-[var(--mestre-primary,#DC2626)] bg-[var(--mestre-primary,#DC2626)]/15 px-5 py-2 whitespace-nowrap font-carimbo text-[11px] uppercase tracking-[0.16em] text-white transition hover:bg-[var(--mestre-primary,#DC2626)]/30 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                            Aprender
                        </button>
                    </div>
                </>
            )}
        >
            {rituaisFiltrados.length === 0 ? (
                <p className="py-8 text-center text-sm italic text-ordem-text-muted">Nenhum ritual disponível com esses filtros.</p>
            ) : (
                <ul className="grid gap-2 sm:grid-cols-2">
                    {rituaisFiltrados.map((ritual) => {
                        const config = ELEMENTO_CONFIG[ritual.elemento];
                        const Icon = config.icon;
                        return (
                            <li key={ritualId(ritual)}>
                                <OpcaoDoSeletor
                                    titulo={(
                                        <span className="flex items-center gap-2">
                                            <Icon size={13} className={config.color} />
                                            {ritual.nome}
                                        </span>
                                    )}
                                    meta={<Fita variante="neutra">{ritual.circulo}º · {ritual.elemento}</Fita>}
                                    descricao={ritual.descricao}
                                    rodape={(
                                        <span className="flex flex-wrap gap-3 font-mono text-[11px] text-ordem-text-muted">
                                            {ritual.execucao && <span>{ritual.execucao}</span>}
                                            {ritual.alcance && <span>{ritual.alcance}</span>}
                                            {ritual.duracao && <span>{ritual.duracao}</span>}
                                        </span>
                                    )}
                                    selecionada={ritualSelecionado === ritualId(ritual)}
                                    onClick={() => setRitualSelecionado(ritualId(ritual))}
                                />
                            </li>
                        );
                    })}
                </ul>
            )}
        </SeletorModal>
    );
}
