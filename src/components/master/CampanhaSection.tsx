"use client";

import { useEffect, useRef, useState } from 'react';
import { Modal, ModalBody, ModalContent, ModalDescription, ModalHeader, ModalTitle } from '@/components/ui/Modal';
import { ChevronRight, Download, FolderInput, Plus } from 'lucide-react';
import { Fita } from './ui/Pecas';
import type { FichaRegistro, Campanha } from '../../core/storage/registros';

interface CampanhaSectionProps {
    campanha: Campanha | null;
    fichas: FichaRegistro[];
    selecionada: string | null;
    onSelecionar: (id: string) => void;
    onMover: (fichaId: string, campanhaId: string | undefined) => void;
    campanhasDisponiveis: Campanha[];
    renderFichaCard: (registro: FichaRegistro) => React.ReactNode;
    onRenomear?: (id: string, nome: string) => void;
    onRemoverCampanha?: (id: string) => void;
    onExportarCampanha?: (fichas: FichaRegistro[], campanhaNome: string, campanhaId?: string) => void;
    onConverterCampanha?: (fichas: FichaRegistro[], campanhaNome: string) => void;
    onMoverCampanha?: (id: string, direcao: -1 | 1) => void;
    onPriorizarCampanha?: (id: string) => void;
    podeSubir?: boolean;
    podeDescer?: boolean;
    forceExpanded?: { expandida: boolean };
    autoExpand?: boolean;
}

export function CampanhaSection({
    campanha,
    fichas,
    selecionada,
    onSelecionar,
    onMover,
    campanhasDisponiveis,
    renderFichaCard,
    onRenomear,
    onRemoverCampanha,
    onExportarCampanha,
    onConverterCampanha,
    onMoverCampanha,
    onPriorizarCampanha,
    podeSubir,
    podeDescer,
    forceExpanded,
    autoExpand,
}: CampanhaSectionProps) {
    const [expandida, setExpandida] = useState(true);
    const [editando, setEditando] = useState(false);
    const [novoNome, setNovoNome] = useState(campanha?.nome || '');
    const [fichaParaMover, setFichaParaMover] = useState<FichaRegistro | null>(null);
    const botaoMover = useRef<HTMLButtonElement | null>(null);
    useEffect(() => {
        if (forceExpanded !== undefined) {
            setExpandida(forceExpanded.expandida);
        }
    }, [forceExpanded]);

    useEffect(() => {
        if (autoExpand) setExpandida(true);
    }, [autoExpand]);

    const cor = campanha?.cor || '#71717a';
    const nome = campanha?.nome || 'Fichas Soltas';
    const id = campanha?.id;
    const hasSelected = Boolean(selecionada && fichas.some((f) => f.id === selecionada));

    const naoConvertidas = fichas.filter((f) => !f.ficha);

    const handleSalvarNome = () => {
        if (id && onRenomear && novoNome.trim()) {
            onRenomear(id, novoNome.trim());
        }
        setEditando(false);
    };

    return (
        <div className="mb-4">
            <div
                className="flex min-w-0 flex-wrap cursor-pointer items-center gap-2 px-3 py-2 transition hover:bg-white/[0.03]"
                style={{ borderLeft: `3px solid ${cor}` }}
                onClick={() => setExpandida(!expandida)}
                aria-expanded={expandida}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                    if (e.target === e.currentTarget && (e.key === 'Enter' || e.key === ' ')) {
                        e.preventDefault();
                        setExpandida(!expandida);
                    }
                }}
            >
                <ChevronRight
                    size={14}
                    className="shrink-0 text-ordem-text-muted transition-transform"
                    style={{ transform: expandida ? 'rotate(90deg)' : 'rotate(0deg)' }}
                />

                {editando && id ? (
                    <input
                        value={novoNome}
                        onChange={(e) => setNovoNome(e.target.value)}
                        onBlur={handleSalvarNome}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSalvarNome();
                            if (e.key === 'Escape') setEditando(false);
                        }}
                        onClick={(e) => e.stopPropagation()}
                        className="min-w-0 flex-1 border border-white/20 bg-black/40 px-2 py-1 text-sm font-semibold text-white focus:outline-none"
                        autoFocus
                    />
                ) : (
                    <span
                        className="min-w-0 flex-1 text-sm font-semibold text-white [overflow-wrap:anywhere]"
                        onDoubleClick={(e) => {
                            if (id) {
                                e.stopPropagation();
                                setNovoNome(nome);
                                setEditando(true);
                            }
                        }}
                    >
                        {nome}
                    </span>
                )}

                <span className="font-mono text-xs text-ordem-text-muted">
                    {fichas.length}
                </span>
                {hasSelected && !expandida && (
                    <Fita variante="contorno">aberta aqui</Fita>
                )}

                {onPriorizarCampanha && campanha && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onPriorizarCampanha(campanha.id);
                        }}
                        className="px-1 text-xs text-ordem-text-muted transition hover:text-ordem-gold"
                        title="Priorizar: manda esta campanha para o topo da lista"
                    >
                        ★
                    </button>
                )}

                {onMoverCampanha && campanha && (
                    <span className="flex items-center">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onMoverCampanha(campanha.id, -1);
                            }}
                            disabled={!podeSubir}
                            className="px-1 text-[11px] leading-none text-ordem-text-muted transition hover:text-white disabled:opacity-25 disabled:hover:text-ordem-text-muted"
                            title="Subir na lista"
                        >
                            ▲
                        </button>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onMoverCampanha(campanha.id, 1);
                            }}
                            disabled={!podeDescer}
                            className="px-1 text-[11px] leading-none text-ordem-text-muted transition hover:text-white disabled:opacity-25 disabled:hover:text-ordem-text-muted"
                            title="Descer na lista"
                        >
                            ▼
                        </button>
                    </span>
                )}

                {onExportarCampanha && fichas.length > 0 && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onExportarCampanha(fichas, nome, id);
                        }}
                        className="px-1.5 text-ordem-text-muted transition hover:text-ordem-gold"
                        title={`Exportar fichas da campanha "${nome}"`}
                        aria-label={`Exportar fichas da campanha "${nome}"`}
                    >
                        <Download size={13} />
                    </button>
                )}

                {onConverterCampanha && naoConvertidas.length > 0 && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onConverterCampanha(naoConvertidas, nome);
                        }}
                        className="font-carimbo text-[10px] uppercase tracking-[0.14em] text-ordem-text-muted underline-offset-2 transition hover:text-ordem-purple hover:underline"
                        title={`Comparar e converter ${naoConvertidas.length} ficha(s) desta campanha`}
                    >
                        converter {naoConvertidas.length}
                    </button>
                )}



                {id && onRemoverCampanha && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            if (confirm(`Remover campanha "${nome}"? As fichas serão movidas para "Fichas Soltas".`)) {
                                onRemoverCampanha(id);
                            }
                        }}
                        className="text-ordem-text-muted hover:text-ordem-red transition text-xs px-2"
                        title="Remover campanha"
                    >
                        ✕
                    </button>
                )}
            </div>

            {expandida && (
                <div className="mt-2 space-y-2 pl-4">
                    {fichas.map((registro) => (
                        <div key={registro.id} className="grid min-w-0 grid-cols-[minmax(0,1fr)_auto] items-start gap-1.5">
                            {renderFichaCard(registro)}
                            {campanhasDisponiveis.length > 0 && <div>
                                <button
                                    type="button"
                                    onClick={e => {
                                        botaoMover.current = e.currentTarget;
                                        setFichaParaMover(registro);
                                    }}
                                    className="grid size-11 place-items-center rounded-md border border-ordem-border bg-ordem-black text-ordem-text-secondary hover:border-ordem-border-light hover:text-white focus-visible:outline focus-visible:outline-ordem-green-muted"
                                    title="Mover para campanha"
                                    aria-label={'Mover ' + registro.personagem.nome + ' para campanha'}
                                    aria-haspopup="dialog"
                                >
                                    <FolderInput size={16} aria-hidden />
                                </button>
                            </div>}
                        </div>
                    ))}
                    {fichas.length === 0 && (
                        <div className="text-xs text-ordem-text-muted italic py-2">
                            Nenhuma ficha nesta campanha.
                        </div>
                    )}
                </div>
            )}
            <Modal open={Boolean(fichaParaMover)} onOpenChange={aberto => { if (!aberto) setFichaParaMover(null); }}>
                <ModalContent onCloseAutoFocus={evento => {
                    evento.preventDefault();
                    if (botaoMover.current?.isConnected) botaoMover.current.focus();
                    else document.querySelector<HTMLInputElement>('#busca-fichas-mestre')?.focus();
                }}>
                    <ModalHeader>
                        <ModalTitle>Mover para campanha</ModalTitle>
                        <ModalDescription className="break-words">{fichaParaMover?.personagem.nome}</ModalDescription>
                    </ModalHeader>
                    <ModalBody className="space-y-1 p-3">
                        {[{ id: undefined, nome: 'Fichas Soltas', cor: '#71717a' }, ...campanhasDisponiveis].map(c => (
                            <button
                                key={c.id ?? 'soltas'}
                                type="button"
                                onClick={() => {
                                    if (fichaParaMover && fichaParaMover.campanha !== c.id) onMover(fichaParaMover.id, c.id);
                                    setFichaParaMover(null);
                                }}
                                className="flex min-h-11 w-full items-center gap-2 rounded-md px-3 text-left text-sm text-ordem-white hover:bg-ordem-border focus-visible:outline focus-visible:outline-ordem-green-muted"
                            >
                                <span className="size-2 shrink-0 rounded-full" style={{ backgroundColor: c.cor }} aria-hidden />
                                <span className="min-w-0 flex-1 [overflow-wrap:anywhere]">{c.nome}</span>
                                {fichaParaMover?.campanha === c.id && <span className="text-xs text-ordem-text-secondary">Atual</span>}
                            </button>
                        ))}
                    </ModalBody>
                </ModalContent>
            </Modal>
        </div>
    );
}

interface NovaCampanhaFormProps {
    onCriar: (nome: string, cor?: string) => void;
}

export function NovaCampanhaForm({ onCriar }: NovaCampanhaFormProps) {
    const [aberto, setAberto] = useState(false);
    const [nome, setNome] = useState('');
    const [cor, setCor] = useState('#dc2626');

    const cores = [
        '#dc2626',
        '#f97316',
        '#eab308',
        '#22c55e',
        '#06b6d4',
        '#3b82f6',
        '#8b5cf6',
        '#ec4899',
    ];

    const handleCriar = () => {
        if (nome.trim()) {
            onCriar(nome.trim(), cor);
            setNome('');
            setAberto(false);
        }
    };

    if (!aberto) {
        return (
            <button
                onClick={() => setAberto(true)}
                className="flex w-full items-center justify-center gap-2 border border-dashed border-white/15 px-3 py-2 font-carimbo text-[10px] uppercase tracking-[0.16em] text-ordem-text-muted transition hover:border-white/40 hover:text-white"
            >
                <Plus size={13} /> Nova campanha
            </button>
        );
    }

    return (
        <div className="space-y-3 border border-white/10 bg-white/[0.02] p-3">
            <input
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Nome da campanha..."
                className="w-full border border-white/10 bg-black/30 px-3 py-2 font-mono text-sm text-white placeholder:text-ordem-text-muted focus:border-ordem-red/60 focus:outline-none"
                autoFocus
                onKeyDown={(e) => {
                    if (e.key === 'Enter') handleCriar();
                    if (e.key === 'Escape') setAberto(false);
                }}
            />

            <div className="flex gap-1">
                {cores.map((c) => (
                    <button
                        key={c}
                        onClick={() => setCor(c)}
                        className={`h-6 w-6 border-2 transition ${cor === c ? 'scale-110 border-white' : 'border-transparent'
                            }`}
                        aria-label={`Cor ${c}`}
                        style={{ backgroundColor: c }}
                    />
                ))}
            </div>

            <div className="flex gap-2">
                <button
                    onClick={handleCriar}
                    disabled={!nome.trim()}
                    className="flex-1 border border-ordem-red bg-ordem-red/15 px-3 py-2 font-carimbo text-[10px] uppercase tracking-[0.16em] text-white transition hover:bg-ordem-red/30 disabled:cursor-not-allowed disabled:opacity-40"
                >
                    Criar
                </button>
                <button
                    onClick={() => setAberto(false)}
                    className="border border-white/10 px-3 py-2 font-carimbo text-[10px] uppercase tracking-[0.16em] text-ordem-text-secondary transition hover:border-white/30 hover:text-white"
                >
                    Cancelar
                </button>
            </div>
        </div>
    );
}
