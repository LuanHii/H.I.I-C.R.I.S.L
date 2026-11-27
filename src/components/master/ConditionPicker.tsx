'use client';

import React, { useEffect, useId, useRef, useState } from 'react';
import { ChevronDown, Search, X } from 'lucide-react';
import { ConditionBadge } from '@/components/ConditionBadge';
import { agruparCondicoes, buscarCondicoes, getCondicao, type CondicaoCompleta } from '@/data/combat/conditions';
import { REGRAS } from '@/data/reference/guiaRegras';
import type { ReaplicacaoCondicao } from '@/core/rules/condicoes';
import { cn } from '@/lib/utils';

const REFERENCIAS_ANTIGAS = new Set([
    'ferimento-morte', 'dano-nao-letal', 'condicoes-debilitantes',
    'condicoes-paralisia-dano', 'imunidade-e-remocao-de-condicoes',
    'condicoes-sentidos-mente', 'outras-condicoes',
]);
const TITULOS_ANTIGOS = new Map(
    REGRAS.filter(regra => REFERENCIAS_ANTIGAS.has(regra.id)).map(regra => [regra.id, regra.titulo]),
);

interface ConditionPickerProps {
    selectedConditions: string[];
    onAdd: (nome: string, reaplicacao?: ReaplicacaoCondicao) => void;
    onRemove: (nome: string) => void;
    compact?: boolean;
}

export function ConditionPicker({ selectedConditions, onAdd, onRemove, compact = false }: ConditionPickerProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState('');
    const [reaplicando, setReaplicando] = useState<CondicaoCompleta | null>(null);
    const container = useRef<HTMLDivElement>(null);
    const trigger = useRef<HTMLButtonElement>(null);
    const campo = useRef<HTMLInputElement>(null);
    const id = useId();

    useEffect(() => {
        if (!isOpen) return;
        const fecharFora = (event: MouseEvent) => {
            if (!container.current?.contains(event.target as Node)) setIsOpen(false);
        };
        document.addEventListener('mousedown', fecharFora);
        return () => document.removeEventListener('mousedown', fecharFora);
    }, [isOpen]);

    const grupos = agruparCondicoes(buscarCondicoes(search));
    const selecionadas = new Set(selectedConditions.map(nome => getCondicao(nome)?.nome));
    const voltar = () => {
        setReaplicando(null);
        campo.current?.focus();
    };

    return (
        <div
            ref={container}
            onKeyDown={event => {
                if (event.key !== 'Escape' || !isOpen) return;
                event.preventDefault();
                event.stopPropagation();
                setIsOpen(false);
                trigger.current?.focus();
            }}
        >
            {selectedConditions.length > 0 && <ConditionBadges conditions={selectedConditions} onRemove={onRemove} />}

            <button
                ref={trigger}
                type="button"
                aria-expanded={isOpen}
                aria-controls={id}
                onClick={() => {
                    setSearch('');
                    setReaplicando(null);
                    setIsOpen(!isOpen);
                }}
                className={cn(
                    'mt-2 inline-flex min-h-9 items-center gap-2 rounded border border-ordem-border bg-ordem-ooze px-3 py-1.5 text-ordem-text-secondary hover:text-white focus-visible:outline focus-visible:outline-ordem-green-muted',
                    compact ? 'text-xs' : 'text-sm',
                )}
            >
                <span>+ Condição</span>
                <ChevronDown size={14} aria-hidden className={cn(isOpen && 'rotate-180')} />
            </button>

            {isOpen && (
                <div id={id} className="mt-2 w-full max-w-xl rounded-lg border border-ordem-border-light bg-ordem-black-deep">
                    <div className="relative border-b border-ordem-border p-2">
                        <Search size={15} aria-hidden className="absolute left-4 top-1/2 -translate-y-1/2 text-ordem-text-muted" />
                        <input
                            ref={campo}
                            type="search"
                            aria-label="Buscar condição"
                            placeholder="Buscar condição…"
                            value={search}
                            onChange={event => {
                                setSearch(event.target.value);
                                setReaplicando(null);
                            }}
                            className="min-h-9 w-full rounded border border-ordem-border bg-ordem-ooze py-1.5 pl-8 pr-3 text-sm text-white focus-visible:outline focus-visible:outline-ordem-green-muted"
                            autoFocus
                        />
                    </div>

                    {reaplicando ? (
                        <div role="group" aria-label={'Reaplicar ' + reaplicando.nome} className="space-y-2 p-3">
                            <p className="text-sm font-semibold text-white">Reaplicar {reaplicando.nome}</p>
                            <p className="text-xs text-ordem-text-secondary">Efeitos de dois rituais não acumulam. Agrave a condição quando a fonte permitir.</p>
                            <div className="flex flex-wrap gap-2">
                                <button type="button" className="rounded border border-ordem-border px-2.5 py-2 text-xs text-white" onClick={voltar}>
                                    Manter {reaplicando.nome}
                                </button>
                                <button
                                    type="button"
                                    className="rounded border border-ordem-red/50 px-2.5 py-2 text-xs text-white"
                                    onClick={() => {
                                        onAdd(reaplicando.nome, 'acumulo-permitido');
                                        voltar();
                                    }}
                                >
                                    Agravar condição
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="max-h-72 overflow-y-auto custom-scrollbar">
                            {grupos.map(grupo => (
                                <section key={grupo.id} aria-label={grupo.titulo}>
                                    <h4 className="sticky top-0 z-10 border-y border-ordem-border bg-ordem-black-deep px-3 py-1.5 text-xs font-semibold text-ordem-text-secondary">
                                        {grupo.titulo}
                                    </h4>
                                    {grupo.condicoes.map(condicao => {
                                        const ativa = selecionadas.has(condicao.nome);
                                        return (
                                            <button
                                                key={condicao.nome}
                                                type="button"
                                                disabled={ativa && !condicao.acumulo}
                                                aria-label={ativa && condicao.acumulo ? 'Reaplicar ' + condicao.nome : condicao.nome}
                                                onClick={() => ativa ? setReaplicando(condicao) : onAdd(condicao.nome)}
                                                className="block w-full px-3 py-2 text-left hover:bg-ordem-ooze focus-visible:outline focus-visible:outline-ordem-green-muted disabled:opacity-50"
                                            >
                                                <span className="flex items-center justify-between gap-2 text-sm font-medium text-white">
                                                    {condicao.nome}
                                                    {ativa && <span className="text-xs font-normal text-ordem-text-secondary">{condicao.acumulo ? 'Reaplicar' : 'Ativa'}</span>}
                                                </span>
                                                <span className="mt-0.5 line-clamp-2 text-xs text-ordem-text-secondary">{condicao.descricao}</span>
                                            </button>
                                        );
                                    })}
                                </section>
                            ))}
                            {grupos.length === 0 && <p className="p-3 text-sm text-ordem-text-muted">Nenhuma condição encontrada.</p>}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export function ConditionBadges({
    conditions, onRemove,
}: {
    conditions: string[];
    onRemove?: (nome: string) => void;
}) {
    return (
        <div className="flex flex-wrap gap-1.5">
            {Array.from(new Set(conditions)).map(valor => {
                const condicao = getCondicao(valor);
                if (condicao) {
                    return <ConditionBadge key={valor} nome={condicao.nome} compact onRemove={onRemove ? () => onRemove(valor) : undefined} />;
                }

                const titulo = TITULOS_ANTIGOS.get(valor);
                return (
                    <span
                        key={valor}
                        className="inline-flex max-w-full items-center gap-1.5 border border-ordem-border bg-ordem-ooze/50 px-1.5 py-0.5 text-xs text-ordem-text-secondary"
                        title={titulo ? 'Remova este registro e aplique a condição individual que está valendo.' : undefined}
                    >
                        <span className="break-words">{titulo ? 'Registro antigo · ' + titulo : valor}</span>
                        {onRemove && (
                            <button
                                type="button"
                                aria-label={'Remover ' + (titulo ?? valor)}
                                className="shrink-0 rounded p-0.5 hover:bg-white/20 focus-visible:outline focus-visible:outline-ordem-green-muted"
                                onClick={() => onRemove(valor)}
                            >
                                <X size={12} aria-hidden />
                            </button>
                        )}
                    </span>
                );
            })}
        </div>
    );
}
