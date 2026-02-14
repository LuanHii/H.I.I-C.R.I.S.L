import React, { useState } from 'react';
import { NPC, AtributoKey, PericiaName } from '../../core/types';
import { Dices as DiceIcon, Shield, Heart, Footprints, Swords, Scroll, Save, X } from 'lucide-react';

interface NpcEditorProps {
    initialData?: NPC;
    onSave: (npc: NPC) => void;
    onCancel: () => void;
}

const DEFAULT_NPC: NPC = {
    nome: '',
    vida: 10,
    defesa: 10,
    deslocamento: '9m',
    atributos: { AGI: 1, FOR: 1, INT: 1, PRE: 1, VIG: 1 },
    pericias: {},
    ataques: [],
    habilidades: [],
    inventario: '',
    anotacoes: ''
};

export const NpcEditor: React.FC<NpcEditorProps> = ({ initialData, onSave, onCancel }) => {
    const [npc, setNpc] = useState<NPC>(initialData || DEFAULT_NPC);
    const [activeTab, setActiveTab] = useState<'geral' | 'combate' | 'detalhes'>('geral');

    const handleChange = (field: keyof NPC, value: any) => {
        setNpc(prev => ({ ...prev, [field]: value }));
    };

    const handleAtributo = (attr: AtributoKey, value: number) => {
        setNpc(prev => ({
            ...prev,
            atributos: { ...prev.atributos, [attr]: value }
        }));
    };

    const handlePericia = (pericia: string, value: string) => {
        setNpc(prev => {
            const newPericias = { ...prev.pericias };
            if (value.trim() === '') {
                delete newPericias[pericia as PericiaName];
            } else {
                newPericias[pericia as PericiaName] = value;
            }
            return { ...prev, pericias: newPericias };
        });
    };

    const addArrayItem = (field: 'ataques' | 'habilidades') => {
        if (field === 'ataques') {
            setNpc(prev => ({
                ...prev,
                ataques: [...prev.ataques, { nome: 'Novo Ataque', teste: '1d20', dano: '1d6' }]
            }));
        } else {
            setNpc(prev => ({
                ...prev,
                habilidades: [...prev.habilidades, { nome: 'Nova Habilidade', descricao: 'Descrição...' }]
            }));
        }
    };

    const updateArrayItem = (field: 'ataques' | 'habilidades', index: number, subField: string, value: string) => {
        setNpc(prev => {
            const newArray: any[] = [...prev[field]];
            newArray[index] = { ...newArray[index], [subField]: value };
            return { ...prev, [field]: newArray };
        });
    };

    const removeArrayItem = (field: 'ataques' | 'habilidades', index: number) => {
        setNpc(prev => ({
            ...prev,
            [field]: prev[field].filter((_, i) => i !== index)
        }));
    };

    return (
        <div className="fixed inset-0 bg-ordem-black/95 z-50 flex items-center justify-center p-4 overflow-y-auto backdrop-blur-sm">
            <div className="bg-ordem-ooze border border-ordem-border-light rounded-lg w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl shadow-black/50">

                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-ordem-border bg-ordem-black/40 rounded-t-lg">
                    <div className="flex items-center gap-3">
                        <div className="bg-ordem-red/20 p-2 rounded text-ordem-red border border-ordem-red/30">
                            <Scroll size={24} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-serif text-white leading-none mb-1">Editor de NPC</h2>
                            <p className="text-xs text-ordem-text-muted font-mono uppercase tracking-wider">Criar ou Editar Personagem do Mestre</p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={onCancel} className="flex items-center gap-2 px-4 py-2 text-sm text-ordem-text-secondary hover:text-white border border-ordem-border-light rounded transition-colors hover:bg-white/5">
                            <X size={16} /> Cancelar
                        </button>
                        <button onClick={() => onSave(npc)} className="flex items-center gap-2 px-4 py-2 text-sm bg-ordem-red text-white rounded hover:bg-red-700 transition-colors shadow-lg shadow-red-900/20 font-medium">
                            <Save size={16} /> Salvar NPC
                        </button>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-ordem-border bg-ordem-black/20">
                    <button
                        onClick={() => setActiveTab('geral')}
                        className={`px-6 py-3 text-sm font-mono uppercase tracking-wider transition-colors border-b-2 ${activeTab === 'geral' ? 'border-ordem-red text-white bg-white/5' : 'border-transparent text-ordem-text-muted hover:text-white hover:bg-white/5'}`}
                    >
                        Geral & Atributos
                    </button>
                    <button
                        onClick={() => setActiveTab('combate')}
                        className={`px-6 py-3 text-sm font-mono uppercase tracking-wider transition-colors border-b-2 ${activeTab === 'combate' ? 'border-ordem-red text-white bg-white/5' : 'border-transparent text-ordem-text-muted hover:text-white hover:bg-white/5'}`}
                    >
                        Combate & Inventário
                    </button>
                    <button
                        onClick={() => setActiveTab('detalhes')}
                        className={`px-6 py-3 text-sm font-mono uppercase tracking-wider transition-colors border-b-2 ${activeTab === 'detalhes' ? 'border-ordem-red text-white bg-white/5' : 'border-transparent text-ordem-text-muted hover:text-white hover:bg-white/5'}`}
                    >
                        Habilidades & Notas
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto custom-scrollbar p-6 bg-ordem-black/20">
                    {activeTab === 'geral' && (
                        <div className="space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-mono text-ordem-text-muted uppercase mb-1">Nome do NPC</label>
                                        <input
                                            type="text"
                                            value={npc.nome}
                                            onChange={e => handleChange('nome', e.target.value)}
                                            className="w-full bg-ordem-black/60 border border-ordem-border-light rounded px-4 py-3 text-white focus:border-ordem-red outline-none text-lg font-serif placeholder-white/20"
                                            placeholder="Ex: Guarda do Museu"
                                            autoFocus
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-mono text-ordem-text-muted uppercase mb-1">Descrição Breve</label>
                                        <textarea
                                            value={npc.descricao || ''}
                                            onChange={e => handleChange('descricao', e.target.value)}
                                            className="w-full bg-ordem-black/60 border border-ordem-border-light rounded px-4 py-3 text-white focus:border-ordem-red outline-none min-h-[100px] resize-none text-sm leading-relaxed"
                                            placeholder="Aparência, personalidade, função..."
                                        />
                                    </div>
                                </div>

                                <div>
                                    <h3 className="text-ordem-red font-mono text-sm uppercase border-b border-ordem-border pb-2 mb-4 flex items-center gap-2">
                                        <DiceIcon size={16} /> Atributos
                                    </h3>
                                    <div className="grid grid-cols-5 gap-3">
                                        {(['AGI', 'FOR', 'INT', 'PRE', 'VIG'] as AtributoKey[]).map(attr => (
                                            <div key={attr} className="flex flex-col items-center group">
                                                <label className="text-[10px] text-ordem-text-muted mb-1 font-mono group-hover:text-ordem-red transition-colors">{attr}</label>
                                                <div className="relative w-full aspect-square">
                                                    <svg viewBox="0 0 100 100" className="w-full h-full text-ordem-border-light group-hover:text-ordem-red transition-colors">
                                                        <polygon points="50,5 95,25 95,75 50,95 5,75 5,25" fill="none" stroke="currentColor" strokeWidth="2" className="fill-ordem-black/40" />
                                                    </svg>
                                                    <input
                                                        type="number"
                                                        value={npc.atributos[attr]}
                                                        onChange={e => handleAtributo(attr, Number(e.target.value))}
                                                        className="absolute inset-0 w-full h-full bg-transparent text-center text-xl font-bold text-white focus:outline-none appearance-none"
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h3 className="text-ordem-red font-mono text-sm uppercase border-b border-ordem-border pb-2 mb-4">Perícias Principais</h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {['Atletismo', 'Furtividade', 'Iniciativa', 'Intimidação', 'Intuição', 'Investigação', 'Luta', 'Percepção', 'Pontaria', 'Reflexos', 'Vontade'].map(p => (
                                        <div key={p} className="flex items-center gap-2 bg-ordem-black/40 p-2 rounded border border-ordem-border-light/50">
                                            <span className="text-xs text-ordem-text-secondary w-24">{p}</span>
                                            <input
                                                type="text"
                                                placeholder="+0"
                                                value={npc.pericias[p as PericiaName] || ''}
                                                onChange={e => handlePericia(p, e.target.value)}
                                                className="flex-1 bg-transparent border-b border-white/10 text-white text-sm text-center focus:border-ordem-red outline-none"
                                            />
                                        </div>
                                    ))}
                                </div>
                                <p className="text-[10px] text-ordem-text-muted mt-2 italic">* Adicione apenas as perícias relevantes que o NPC possui bônus.</p>
                            </div>
                        </div>
                    )}

                    {activeTab === 'combate' && (
                        <div className="space-y-8">
                            <div className="grid grid-cols-3 gap-6">
                                <div className="bg-ordem-black/40 p-4 rounded border border-ordem-border flex flex-col items-center">
                                    <label className="text-xs text-ordem-text-muted font-mono uppercase mb-2 flex items-center gap-1">
                                        <Heart size={14} className="text-ordem-red" /> Vida (PV)
                                    </label>
                                    <input
                                        type="number"
                                        value={npc.vida}
                                        onChange={e => handleChange('vida', Number(e.target.value))}
                                        className="w-24 text-center bg-transparent text-3xl font-bold text-white border-b-2 border-ordem-border-light focus:border-ordem-red outline-none"
                                    />
                                </div>
                                <div className="bg-ordem-black/40 p-4 rounded border border-ordem-border flex flex-col items-center">
                                    <label className="text-xs text-ordem-text-muted font-mono uppercase mb-2 flex items-center gap-1">
                                        <Shield size={14} className="text-blue-400" /> Defesa
                                    </label>
                                    <input
                                        type="number"
                                        value={npc.defesa}
                                        onChange={e => handleChange('defesa', Number(e.target.value))}
                                        className="w-24 text-center bg-transparent text-3xl font-bold text-white border-b-2 border-ordem-border-light focus:border-ordem-red outline-none"
                                    />
                                </div>
                                <div className="bg-ordem-black/40 p-4 rounded border border-ordem-border flex flex-col items-center">
                                    <label className="text-xs text-ordem-text-muted font-mono uppercase mb-2 flex items-center gap-1">
                                        <Footprints size={14} className="text-green-400" /> Deslocamento
                                    </label>
                                    <input
                                        type="text"
                                        value={npc.deslocamento || ''}
                                        onChange={e => handleChange('deslocamento', e.target.value)}
                                        className="w-full text-center bg-transparent text-xl font-bold text-white border-b-2 border-ordem-border-light focus:border-ordem-red outline-none"
                                        placeholder="9m"
                                    />
                                </div>
                            </div>

                            <div>
                                <div className="flex justify-between items-center mb-4 border-b border-ordem-border pb-2">
                                    <h3 className="text-ordem-red font-mono text-sm uppercase flex items-center gap-2"><Swords size={16} /> Ataques</h3>
                                    <button onClick={() => addArrayItem('ataques')} className="text-xs text-green-400 hover:text-green-300 font-mono uppercase border border-green-900/50 bg-green-900/20 px-2 py-1 rounded transition-colors">+ Adicionar Ataque</button>
                                </div>
                                <div className="grid grid-cols-1 gap-4">
                                    {npc.ataques.map((atq, idx) => (
                                        <div key={idx} className="bg-ordem-black/40 p-4 rounded border border-ordem-border relative group">
                                            <button onClick={() => removeArrayItem('ataques', idx)} className="absolute top-2 right-2 text-ordem-text-muted hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <X size={14} />
                                            </button>
                                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                                <div className="md:col-span-1">
                                                    <input
                                                        value={atq.nome}
                                                        onChange={e => updateArrayItem('ataques', idx, 'nome', e.target.value)}
                                                        className="w-full bg-transparent border-b border-ordem-border-light text-white font-bold placeholder-white/20 focus:border-ordem-red outline-none"
                                                        placeholder="Nome do Ataque"
                                                    />
                                                </div>
                                                <div>
                                                    <input
                                                        value={atq.teste}
                                                        onChange={e => updateArrayItem('ataques', idx, 'teste', e.target.value)}
                                                        className="w-full bg-transparent border-b border-ordem-border-light text-ordem-text-secondary text-sm placeholder-white/20 focus:border-ordem-red outline-none text-center"
                                                        placeholder="Teste (ex: 3d20+5)"
                                                    />
                                                    <label className="block text-[10px] text-ordem-text-muted text-center mt-1">Teste</label>
                                                </div>
                                                <div>
                                                    <input
                                                        value={atq.dano}
                                                        onChange={e => updateArrayItem('ataques', idx, 'dano', e.target.value)}
                                                        className="w-full bg-transparent border-b border-ordem-border-light text-ordem-text-secondary text-sm placeholder-white/20 focus:border-ordem-red outline-none text-center"
                                                        placeholder="Dano (ex: 1d6+2)"
                                                    />
                                                    <label className="block text-[10px] text-ordem-text-muted text-center mt-1">Dano</label>
                                                </div>
                                                <div>
                                                    <input
                                                        value={atq.critico || ''}
                                                        onChange={e => updateArrayItem('ataques', idx, 'critico', e.target.value)}
                                                        className="w-full bg-transparent border-b border-ordem-border-light text-ordem-text-secondary text-sm placeholder-white/20 focus:border-ordem-red outline-none text-center"
                                                        placeholder="Crítico (ex: 19/x2)"
                                                    />
                                                    <label className="block text-[10px] text-ordem-text-muted text-center mt-1">Crítico</label>
                                                </div>
                                            </div>
                                            <div className="mt-3 flex gap-4">
                                                <input
                                                    value={atq.alcance || ''}
                                                    onChange={e => updateArrayItem('ataques', idx, 'alcance', e.target.value)}
                                                    className="bg-transparent border-b border-ordem-border-light text-ordem-text-secondary text-xs w-24 placeholder-white/20 focus:border-ordem-red outline-none"
                                                    placeholder="Alcance"
                                                />
                                                <input
                                                    value={atq.especial || ''}
                                                    onChange={e => updateArrayItem('ataques', idx, 'especial', e.target.value)}
                                                    className="flex-1 bg-transparent border-b border-ordem-border-light text-ordem-text-secondary text-xs placeholder-white/20 focus:border-ordem-red outline-none"
                                                    placeholder="Especial / Efeitos"
                                                />
                                            </div>
                                        </div>
                                    ))}
                                    {npc.ataques.length === 0 && (
                                        <div className="text-center py-8 text-ordem-text-muted text-sm border border-dashed border-ordem-border-light rounded bg-ordem-black/20">
                                            Nenhum ataque registrado.
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'detalhes' && (
                        <div className="space-y-8">
                            <div>
                                <div className="flex justify-between items-center mb-4 border-b border-ordem-border pb-2">
                                    <h3 className="text-ordem-red font-mono text-sm uppercase">Habilidades & Poderes</h3>
                                    <button onClick={() => addArrayItem('habilidades')} className="text-xs text-green-400 hover:text-green-300 font-mono uppercase border border-green-900/50 bg-green-900/20 px-2 py-1 rounded transition-colors">+ Nova Habilidade</button>
                                </div>
                                <div className="space-y-4">
                                    {npc.habilidades.map((hab, idx) => (
                                        <div key={idx} className="bg-ordem-black/40 p-4 rounded border border-ordem-border relative group">
                                            <button onClick={() => removeArrayItem('habilidades', idx)} className="absolute top-3 right-3 text-ordem-text-muted hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <X size={14} />
                                            </button>
                                            <input
                                                value={hab.nome}
                                                onChange={e => updateArrayItem('habilidades', idx, 'nome', e.target.value)}
                                                className="w-full bg-transparent border-b border-ordem-border-light text-white font-bold mb-2 focus:border-ordem-red outline-none"
                                                placeholder="Nome da Habilidade"
                                            />
                                            <textarea
                                                value={hab.descricao}
                                                onChange={e => updateArrayItem('habilidades', idx, 'descricao', e.target.value)}
                                                className="w-full bg-transparent text-ordem-text-secondary text-sm resize-none focus:bg-ordem-black/20 outline-none rounded p-1"
                                                rows={3}
                                                placeholder="Descrição do efeito..."
                                            />
                                        </div>
                                    ))}
                                    {npc.habilidades.length === 0 && (
                                        <div className="text-center py-8 text-ordem-text-muted text-sm border border-dashed border-ordem-border-light rounded bg-ordem-black/20">
                                            Nenhuma habilidade registrada.
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <h3 className="text-ordem-red font-mono text-sm uppercase border-b border-ordem-border pb-2 mb-4">Inventário</h3>
                                    <textarea
                                        value={npc.inventario || ''}
                                        onChange={e => handleChange('inventario', e.target.value)}
                                        className="w-full h-40 bg-ordem-black/40 border border-ordem-border-light rounded px-4 py-3 text-white focus:border-ordem-red outline-none text-sm leading-relaxed resize-none"
                                        placeholder="Liste os itens, equipamentos e tesouros..."
                                    />
                                </div>
                                <div>
                                    <h3 className="text-ordem-red font-mono text-sm uppercase border-b border-ordem-border pb-2 mb-4">Anotações do Mestre</h3>
                                    <textarea
                                        value={npc.anotacoes || ''}
                                        onChange={e => handleChange('anotacoes', e.target.value)}
                                        className="w-full h-40 bg-ordem-black/40 border border-ordem-border-light rounded px-4 py-3 text-white focus:border-ordem-red outline-none text-sm leading-relaxed resize-none"
                                        placeholder="Segredos, táticas, comportamento, voz..."
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
