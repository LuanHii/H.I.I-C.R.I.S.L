"use client";

import { useEffect, useState } from 'react';
import type { FichaRegistro, Campanha } from '../../core/storage/useStoredFichas';

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
    forceExpanded?: boolean;
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
    forceExpanded,
    autoExpand,
}: CampanhaSectionProps) {
    const [expandida, setExpandida] = useState(false);
    const [editando, setEditando] = useState(false);
    const [novoNome, setNovoNome] = useState(campanha?.nome || '');
    const [menuAberto, setMenuAberto] = useState<string | null>(null);
    useEffect(() => {
        if (forceExpanded !== undefined) {
            setExpandida(forceExpanded);
        }
    }, [forceExpanded]);

    useEffect(() => {
        if (autoExpand && !expandida) {
            setExpandida(true);
        }
    }, [autoExpand, expandida]);

    const cor = campanha?.cor || '#71717a';
    const nome = campanha?.nome || 'Fichas Soltas';
    const id = campanha?.id;
    const hasSelected = Boolean(selecionada && fichas.some((f) => f.id === selecionada));

    const handleSalvarNome = () => {
        if (id && onRenomear && novoNome.trim()) {
            onRenomear(id, novoNome.trim());
        }
        setEditando(false);
    };

    return (
        <div className="mb-4">
            {}
            <div
                className="flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition hover:bg-ordem-ooze/50"
                style={{ borderLeft: `3px solid ${cor}` }}
                onClick={() => setExpandida(!expandida)}
                aria-expanded={expandida}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setExpandida(!expandida);
                    }
                }}
            >
                <span
                    className="text-lg transition-transform"
                    style={{ transform: expandida ? 'rotate(90deg)' : 'rotate(0deg)' }}
                >
                    ▶
                </span>

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
                        className="bg-ordem-ooze border border-ordem-text-muted text-white px-2 py-1 rounded text-sm font-semibold"
                        autoFocus
                    />
                ) : (
                    <span
                        className="font-semibold text-white text-sm flex-1"
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

                <span className="text-xs text-ordem-text-secondary font-mono">
                    {fichas.length} ficha{fichas.length !== 1 ? 's' : ''}
                </span>
                {hasSelected && !expandida && (
                    <span className="text-[10px] px-2 py-0.5 rounded border border-ordem-green text-ordem-green">
                        selecionada
                    </span>
                )}

                {onExportarCampanha && fichas.length > 0 && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onExportarCampanha(fichas, nome, id);
                        }}
                        className="text-ordem-text-muted hover:text-ordem-gold transition text-xs px-2"
                        title={`Exportar fichas da campanha "${nome}"`}
                    >
                        📤
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

            {}
            {expandida && (
                <div className="mt-2 space-y-2 pl-4">
                    {fichas.map((registro) => (
                        <div key={registro.id} className="relative group">
                            {renderFichaCard(registro)}

                            {}
                            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition">
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setMenuAberto(menuAberto === registro.id ? null : registro.id);
                                    }}
                                    className="text-xs px-2 py-1 bg-ordem-ooze border border-ordem-border-light rounded hover:border-ordem-text-muted text-ordem-text-secondary"
                                    title="Mover para campanha"
                                >
                                    📁
                                </button>

                                {menuAberto === registro.id && (
                                    <div className="absolute right-0 top-full mt-1 bg-ordem-ooze border border-ordem-border-light rounded-lg shadow-xl z-50 min-w-[150px]">
                                        <div className="py-1">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onMover(registro.id, undefined);
                                                    setMenuAberto(null);
                                                }}
                                                className={`w-full text-left px-3 py-2 text-xs hover:bg-ordem-ooze ${!registro.campanha ? 'text-ordem-green' : 'text-ordem-white-muted'
                                                    }`}
                                            >
                                                📂 Fichas Soltas
                                            </button>
                                            {campanhasDisponiveis.map((c) => (
                                                <button
                                                    key={c.id}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        onMover(registro.id, c.id);
                                                        setMenuAberto(null);
                                                    }}
                                                    className={`w-full text-left px-3 py-2 text-xs hover:bg-ordem-ooze flex items-center gap-2 ${registro.campanha === c.id ? 'text-ordem-green' : 'text-ordem-white-muted'
                                                        }`}
                                                >
                                                    <span
                                                        className="w-2 h-2 rounded-full"
                                                        style={{ backgroundColor: c.cor }}
                                                    />
                                                    {c.nome}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                    {fichas.length === 0 && (
                        <div className="text-xs text-ordem-text-muted italic py-2">
                            Nenhuma ficha nesta campanha.
                        </div>
                    )}
                </div>
            )}
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
                className="w-full px-3 py-2 text-xs font-mono border border-dashed border-ordem-border-light text-ordem-text-muted hover:border-ordem-text-muted hover:text-ordem-white-muted rounded-lg transition"
            >
                + NOVA CAMPANHA
            </button>
        );
    }

    return (
        <div className="border border-ordem-border-light rounded-lg p-3 space-y-3 bg-ordem-ooze/50">
            <input
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Nome da campanha..."
                className="w-full bg-ordem-black/40 border border-ordem-border text-white px-3 py-2 rounded-lg focus:border-ordem-red focus:outline-none font-mono text-sm"
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
                        className={`w-6 h-6 rounded-full border-2 transition ${cor === c ? 'border-white scale-110' : 'border-transparent'
                            }`}
                        style={{ backgroundColor: c }}
                    />
                ))}
            </div>

            <div className="flex gap-2">
                <button
                    onClick={handleCriar}
                    disabled={!nome.trim()}
                    className="flex-1 px-3 py-2 text-xs font-mono border border-ordem-green text-ordem-green hover:bg-ordem-green/10 rounded-lg transition disabled:opacity-50"
                >
                    CRIAR
                </button>
                <button
                    onClick={() => setAberto(false)}
                    className="px-3 py-2 text-xs font-mono border border-ordem-border-light text-ordem-text-secondary hover:border-ordem-text-muted rounded-lg transition"
                >
                    CANCELAR
                </button>
            </div>
        </div>
    );
}
