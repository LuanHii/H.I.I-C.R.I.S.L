import React, { useState, useMemo } from 'react';
import { NPC } from '../../core/types';
import { useCloudNPCs } from '../../core/storage';
import { NpcEditor } from './NpcEditor';
import { Cloud, CloudOff, Swords, Heart, Shield, Search, UserMinus, Copy, Edit, Trash2 } from 'lucide-react';

export const NpcList: React.FC = () => {
    const { npcs, salvar, remover, duplicar, isCloudMode, loading } = useCloudNPCs();
    const [search, setSearch] = useState('');
    const [showEditor, setShowEditor] = useState(false);
    const [editingNpc, setEditingNpc] = useState<{ npc: NPC, id?: string } | null>(null);

    const filteredNpcs = useMemo(() => {
        return npcs.filter(registro =>
            registro.npc.nome.toLowerCase().includes(search.toLowerCase())
        ).sort((a, b) => a.npc.nome.localeCompare(b.npc.nome));
    }, [npcs, search]);

    const handleSave = (npc: NPC) => {
        salvar(npc, editingNpc?.id);
        setShowEditor(false);
        setEditingNpc(null);
    };

    const handleCreate = () => {
        setEditingNpc(null);
        setShowEditor(true);
    };

    const handleEdit = (npc: NPC, id: string) => {
        setEditingNpc({ npc, id });
        setShowEditor(true);
    };

    return (
        <div className="flex flex-col h-full relative p-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 border-b border-ordem-border pb-4">
                <div>
                    <h2 className="text-2xl font-serif text-white flex items-center gap-2">
                        <UserMinus className="text-ordem-red" />
                        NPCs & Coadjuvantes
                    </h2>
                    <p className="text-xs text-ordem-text-muted font-mono uppercase tracking-wider mt-1">
                        {loading ? 'Carregando...' : `${filteredNpcs.length} Personagem(ns) registrado(s)`}
                        {isCloudMode && <span className="ml-2 inline-flex items-center gap-1 text-green-500" title="Sincronizado na nuvem"><Cloud size={10} /></span>}
                    </p>
                </div>

                <div className="flex gap-2 w-full md:w-auto">
                    <div className="relative flex-1 md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-ordem-text-muted" size={14} />
                        <input
                            type="text"
                            placeholder="Buscar NPC..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full bg-ordem-black/40 border border-ordem-border-light pl-9 pr-3 py-2 rounded text-sm text-white focus:border-ordem-red outline-none shadow-inner"
                        />
                    </div>
                    <button
                        onClick={handleCreate}
                        className="bg-ordem-red hover:bg-red-700 text-white px-4 py-2 rounded transition-colors font-mono text-sm uppercase shadow-lg shadow-red-900/20 whitespace-nowrap"
                    >
                        + Novo NPC
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 overflow-y-auto custom-scrollbar pb-10">
                {filteredNpcs.map((registro) => (
                    <NpcCard
                        key={registro.id}
                        npc={registro.npc}
                        onEdit={() => handleEdit(registro.npc, registro.id)}
                        onDelete={() => remover(registro.id)}
                        onClone={() => duplicar(registro.id)}
                    />
                ))}

                {filteredNpcs.length === 0 && !loading && (
                    <div className="col-span-full flex flex-col items-center justify-center py-12 text-ordem-text-muted bg-ordem-black/20 rounded border border-dashed border-ordem-border-light">
                        <UserMinus size={48} className="mb-4 opacity-20" />
                        <p className="text-lg font-serif">Nenhum NPC encontrado</p>
                        <p className="text-sm">Clique em "+ Novo NPC" para começar.</p>
                    </div>
                )}
            </div>

            {showEditor && (
                <NpcEditor
                    initialData={editingNpc?.npc}
                    onSave={handleSave}
                    onCancel={() => setShowEditor(false)}
                />
            )}
        </div>
    );
};

interface NpcCardProps {
    npc: NPC;
    onEdit: () => void;
    onDelete: () => void;
    onClone: () => void;
}

const NpcCard: React.FC<NpcCardProps> = ({ npc, onEdit, onDelete, onClone }) => {
    const [expanded, setExpanded] = useState(false);

    return (
        <div className={`bg-ordem-black/40 border border-ordem-border hover:border-ordem-border-light rounded transition-colors group relative flex flex-col ${expanded ? 'bg-ordem-ooze/10' : ''}`}>

            {/* Header / Summary */}
            <div className="p-4 cursor-pointer" onClick={() => setExpanded(!expanded)}>
                <div className="flex justify-between items-start mb-2">
                    <div>
                        <h3 className="text-lg font-serif text-white font-bold leading-none">{npc.nome}</h3>
                        <div className="flex items-center gap-3 mt-2 text-xs font-mono text-ordem-text-muted">
                            <span className="flex items-center gap-1 text-red-400"><Heart size={12} /> {npc.vida} PV</span>
                            <span className="flex items-center gap-1 text-blue-400"><Shield size={12} /> {npc.defesa} DEF</span>
                        </div>
                    </div>
                    {npc.ataques.length > 0 && (
                        <div className="bg-red-900/20 px-2 py-1 rounded border border-red-900/30 text-[10px] text-red-300 uppercase tracking-wider font-mono">
                            Combatente
                        </div>
                    )}
                </div>

                {npc.descricao && (
                    <p className="text-xs text-ordem-text-secondary line-clamp-2 mt-1 italic">
                        {npc.descricao}
                    </p>
                )}
            </div>

            {/* Expanded Details */}
            {expanded && (
                <div className="px-4 pb-4 pt-0 space-y-4 text-sm animate-in fade-in slide-in-from-top-2 duration-200">
                    <hr className="border-ordem-border-light/30" />

                    {/* Attributes */}
                    <div className="grid grid-cols-5 gap-1 text-center bg-black/20 p-2 rounded">
                        {Object.entries(npc.atributos).map(([key, val]) => (
                            <div key={key}>
                                <div className="text-[9px] text-ordem-text-muted uppercase">{key}</div>
                                <div className="font-bold text-white">{val}</div>
                            </div>
                        ))}
                    </div>

                    {/* Attacks */}
                    {npc.ataques.length > 0 && (
                        <div>
                            <h4 className="text-xs font-mono text-ordem-red uppercase mb-2 flex items-center gap-1"><Swords size={12} /> Ataques</h4>
                            <div className="space-y-2">
                                {npc.ataques.map((atq, i) => (
                                    <div key={i} className="flex justify-between items-center text-xs bg-white/5 p-2 rounded">
                                        <span className="font-bold text-white">{atq.nome}</span>
                                        <div className="text-right">
                                            <span className="text-ordem-text-secondary">{atq.teste}</span>
                                            <span className="mx-1 text-ordem-text-muted">•</span>
                                            <span className="text-white">{atq.dano}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex justify-end gap-2 pt-2">
                        <button
                            onClick={(e) => { e.stopPropagation(); onClone(); }}
                            className="p-1.5 text-ordem-text-muted hover:text-white hover:bg-white/10 rounded transition-colors"
                            title="Duplicar"
                        >
                            <Copy size={14} />
                        </button>
                        <button
                            onClick={(e) => { e.stopPropagation(); onEdit(); }}
                            className="p-1.5 text-blue-400 hover:text-blue-300 hover:bg-blue-900/20 rounded transition-colors"
                            title="Editar"
                        >
                            <Edit size={14} />
                        </button>
                        <button
                            onClick={(e) => { e.stopPropagation(); onDelete(); }}
                            className="p-1.5 text-red-500 hover:text-red-400 hover:bg-red-900/20 rounded transition-colors"
                            title="Excluir"
                        >
                            <Trash2 size={14} />
                        </button>
                    </div>
                </div>
            )}

            {/* Collapsed Actions (Hover only) */}
            {!expanded && (
                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                        onClick={(e) => { e.stopPropagation(); onEdit(); }}
                        className="p-1.5 bg-ordem-black text-blue-400 hover:text-blue-300 rounded border border-ordem-border shadow"
                    >
                        <Edit size={12} />
                    </button>
                </div>
            )}
        </div>
    );
};
