import React, { useState, useMemo, useEffect } from 'react';
import { AMEACAS } from '../../data/monsters';
import { Ameaca } from '../../core/types';
import { useCloudMonsters } from '../../core/storage';
import { MonsterEditor } from './MonsterEditor';
import { Cloud, CloudOff } from 'lucide-react';

export const MonsterList: React.FC = () => {
  const [search, setSearch] = useState(() => {
    if (typeof window === 'undefined') return '';
    return window.localStorage.getItem('ameacas.search') ?? '';
  });
  const [selectedElement, setSelectedElement] = useState<string>(() => {
    if (typeof window === 'undefined') return 'Todos';
    return window.localStorage.getItem('ameacas.element') ?? 'Todos';
  });
  const [vdRange, setVdRange] = useState<[number, number]>(() => {
    if (typeof window === 'undefined') return [0, 400];
    const raw = window.localStorage.getItem('ameacas.vd');
    if (!raw) return [0, 400];
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length === 2) return [Number(parsed[0]), Number(parsed[1])];
    } catch { }
    return [0, 400];
  });
  const [order, setOrder] = useState<'nome' | 'vd-desc' | 'vd-asc'>(() => {
    if (typeof window === 'undefined') return 'nome';
    return (window.localStorage.getItem('ameacas.order') as any) ?? 'nome';
  });
  const [customOnly, setCustomOnly] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.localStorage.getItem('ameacas.custom') === 'true';
  });
  const { monstros, salvar, remover, isCloudMode, loading } = useCloudMonsters();
  const [showEditor, setShowEditor] = useState(false);
  const [editingMonster, setEditingMonster] = useState<{ ameaca: Ameaca, id?: string } | null>(null);

  const allMonsters = useMemo(() => {
    const customMonsters = monstros.map(m => ({ ...m.ameaca, id: m.id, isCustom: true }));
    const staticMonsters = AMEACAS.map(m => ({ ...m, id: undefined, isCustom: false }));
    return [...customMonsters, ...staticMonsters] as (Ameaca & { id?: string, isCustom: boolean })[];
  }, [monstros]);

  const filteredMonsters = useMemo(() => {
    const filtered = allMonsters.filter((monster) => {
      if (!monster || !monster.nome) return false;
      const matchesSearch = monster.nome.toLowerCase().includes(search.toLowerCase());
      const matchesElement = selectedElement === 'Todos' || monster.tipo === selectedElement;
      const matchesVd = monster.vd >= vdRange[0] && monster.vd <= vdRange[1];
      const matchesCustom = !customOnly || monster.isCustom === true;
      return matchesSearch && matchesElement && matchesVd && matchesCustom;
    });
    return [...filtered].sort((a, b) => {
      if (order === 'vd-desc') return b.vd - a.vd;
      if (order === 'vd-asc') return a.vd - b.vd;
      return a.nome.localeCompare(b.nome);
    });
  }, [search, selectedElement, vdRange, customOnly, order, allMonsters]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem('ameacas.search', search);
    window.localStorage.setItem('ameacas.element', selectedElement);
    window.localStorage.setItem('ameacas.vd', JSON.stringify(vdRange));
    window.localStorage.setItem('ameacas.order', order);
    window.localStorage.setItem('ameacas.custom', String(customOnly));
  }, [search, selectedElement, vdRange, order, customOnly]);

  const elements = ['Todos', 'Sangue', 'Morte', 'Conhecimento', 'Energia', 'Medo'];

  const handleSave = (monster: Ameaca) => {
    salvar(monster, editingMonster?.id);
    setShowEditor(false);
    setEditingMonster(null);
  };

  const handleCreate = () => {
    setEditingMonster(null);
    setShowEditor(true);
  };

  const handleEdit = (monster: Ameaca, id: string) => {
    setEditingMonster({ ameaca: monster, id });
    setShowEditor(true);
  };

  const handleClone = (monster: Ameaca) => {
    const cloned = { ...monster, nome: `${monster.nome} (Cópia)` };
    setEditingMonster({ ameaca: cloned });
    setShowEditor(true);
  };

  return (
    <div className="flex flex-col h-full relative">
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6 p-1">
        <input
          type="text"
          placeholder="Buscar ameaça..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Escape') setSearch('');
          }}
          className="bg-ordem-black/40 border border-ordem-border-light text-white px-3 py-2 rounded focus:border-ordem-red focus:outline-none font-mono text-sm"
        />

        <select
          value={selectedElement}
          onChange={(e) => setSelectedElement(e.target.value)}
          className="bg-ordem-black/40 border border-ordem-border-light text-white px-3 py-2 rounded focus:border-ordem-red focus:outline-none font-mono text-sm"
        >
          {elements.map((el) => (
            <option key={el} value={el}>{el}</option>
          ))}
        </select>

        <div className="flex items-center gap-2 bg-ordem-black/40 border border-ordem-border-light px-3 rounded">
            <span className="text-xs font-mono text-ordem-text-muted">VD:</span>
            <input
                type="number"
                min="0"
                max="400"
                value={vdRange[0]}
                onChange={(e) => {
                  const min = Number(e.target.value);
                  const max = Math.max(min, vdRange[1]);
                  setVdRange([min, max]);
                }}
                className="w-16 bg-transparent text-white text-sm font-mono focus:outline-none text-center"
            />
            <span className="text-ordem-text-muted">-</span>
            <input
                type="number"
                min="0"
                max="400"
                value={vdRange[1]}
                onChange={(e) => {
                  const max = Number(e.target.value);
                  const min = Math.min(vdRange[0], max);
                  setVdRange([min, max]);
                }}
                className="w-16 bg-transparent text-white text-sm font-mono focus:outline-none text-center"
            />
        </div>

        <select
          value={order}
          onChange={(e) => setOrder(e.target.value as any)}
          className="bg-ordem-black/40 border border-ordem-border-light text-white px-3 py-2 rounded focus:border-ordem-red focus:outline-none font-mono text-sm"
        >
          <option value="nome">Nome (A→Z)</option>
          <option value="vd-desc">VD (↓)</option>
          <option value="vd-asc">VD (↑)</option>
        </select>
      </div>

      <div className="flex flex-wrap items-center gap-2 mb-4">
        <div className="text-[10px] text-ordem-text-muted font-mono uppercase tracking-widest flex items-center gap-2">
          {loading ? 'Carregando...' : `${filteredMonsters.length} resultado(s)`}
          {isCloudMode ? (
            <span className="flex items-center gap-1 text-ordem-green" title="Monstros customizados sincronizados na nuvem">
              <Cloud size={12} />
            </span>
          ) : (
            <span className="flex items-center gap-1 text-ordem-text-muted" title="Dados locais">
              <CloudOff size={12} />
            </span>
          )}
        </div>
        <button
          onClick={() => setCustomOnly((prev) => !prev)}
          className={`px-3 py-2 rounded border font-mono text-[10px] uppercase tracking-widest ${
            customOnly
              ? 'border-blue-500 text-blue-300 bg-blue-900/20'
              : 'border-ordem-border text-ordem-text-muted bg-ordem-black/40'
          }`}
        >
          {customOnly ? 'Apenas custom' : 'Todas'}
        </button>
        {(search || selectedElement !== 'Todos' || customOnly || vdRange[0] !== 0 || vdRange[1] !== 400 || order !== 'nome') && (
          <button
            onClick={() => {
              setSearch('');
              setSelectedElement('Todos');
              setVdRange([0, 400]);
              setOrder('nome');
              setCustomOnly(false);
            }}
            className="px-3 py-2 rounded border border-ordem-border text-ordem-text-muted font-mono text-[10px] uppercase tracking-widest"
          >
            Limpar filtros
          </button>
        )}
        <button
          onClick={handleCreate}
          className="ml-auto bg-ordem-red/20 border border-ordem-red text-white px-3 py-2 rounded hover:bg-ordem-red/40 transition-colors font-mono text-sm uppercase"
        >
          + Criar Ameaça
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 overflow-y-auto custom-scrollbar pr-2 pb-4">
        {filteredMonsters.map((monster, index) => (
          <MonsterCard
            key={`${monster.nome}-${index}`}
            monster={monster}
            onEdit={monster.isCustom ? () => handleEdit(monster, monster.id!) : undefined}
            onDelete={monster.isCustom ? () => remover(monster.id!) : undefined}
            onClone={() => handleClone(monster)}
          />
        ))}
        {filteredMonsters.length === 0 && (
            <div className="text-center text-ordem-text-muted font-mono py-8">
                Nenhuma ameaça encontrada.
            </div>
        )}
      </div>

      {showEditor && (
        <MonsterEditor
          initialData={editingMonster?.ameaca}
          onSave={handleSave}
          onCancel={() => setShowEditor(false)}
        />
      )}
    </div>
  );
};

interface MonsterCardProps {
  monster: Ameaca & { isCustom?: boolean, id?: string };
  onEdit?: () => void;
  onDelete?: () => void;
  onClone?: () => void;
}

const MonsterCard: React.FC<MonsterCardProps> = ({ monster, onEdit, onDelete, onClone }) => {
  const [expanded, setExpanded] = useState(false);

  const getElementColor = (type: string) => {
    switch (type) {
      case 'Sangue': return 'text-red-600 border-red-900/50 bg-red-900/10';
      case 'Morte': return 'text-ordem-text-secondary border-ordem-border-light bg-ordem-ooze/30';
      case 'Conhecimento': return 'text-amber-500 border-amber-900/50 bg-amber-900/10';
      case 'Energia': return 'text-purple-500 border-purple-900/50 bg-purple-900/10';
      case 'Medo': return 'text-white border-white/20 bg-white/5';
      default: return 'text-ordem-text-secondary border-ordem-border';
    }
  };

  const styleClass = getElementColor(monster.tipo);

  return (
    <div className={`border rounded transition-colors duration-300 ${expanded ? 'bg-ordem-black/80 border-ordem-border-light' : 'bg-ordem-black/40 border-ordem-border hover:border-ordem-border-light'}`}>
      <div
        className="p-4 flex items-center justify-between cursor-pointer select-none"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-4">
            <div className={`w-12 h-12 flex items-center justify-center rounded border font-bold text-lg ${styleClass}`}>
                {monster.vd}
            </div>
            <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-serif text-white">{monster.nome}</h3>
                  {monster.isCustom && <span className="text-[10px] bg-blue-900/30 text-blue-400 border border-blue-900/50 px-1 rounded uppercase">Custom</span>}
                </div>
                <p className="text-xs font-mono text-ordem-text-secondary">{monster.tipo} &bull; {monster.tamanho}</p>
            </div>
        </div>

        <div className="flex items-center gap-6">
            <div className="text-right hidden md:block">
                <div className="text-[10px] font-mono text-ordem-text-muted uppercase">Vida</div>
                <div className="text-lg font-bold text-white">{monster.vida}</div>
            </div>
            <div className="text-right hidden md:block">
                <div className="text-[10px] font-mono text-ordem-text-muted uppercase">Defesa</div>
                <div className="text-lg font-bold text-white">{monster.defesa}</div>
            </div>
            <div className={`transform transition-transform duration-300 ${expanded ? 'rotate-180' : ''}`}>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M5 7.5L10 12.5L15 7.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
            </div>
        </div>
      </div>

      {expanded && (
        <div className="p-4 border-t border-ordem-border bg-ordem-black/20">
            <div className="flex justify-end gap-2 mb-4 border-b border-ordem-border pb-2">
              {onClone && (
                <button onClick={(e) => { e.stopPropagation(); onClone(); }} className="text-xs bg-ordem-ooze hover:bg-ordem-border-light text-white px-2 py-1 rounded border border-ordem-border-light">
                  Clonar / Editar Cópia
                </button>
              )}
              {onEdit && (
                <button onClick={(e) => { e.stopPropagation(); onEdit(); }} className="text-xs bg-blue-900/30 hover:bg-blue-900/50 text-blue-300 px-2 py-1 rounded border border-blue-900/50">
                  Editar
                </button>
              )}
              {onDelete && (
                <button onClick={(e) => { e.stopPropagation(); onDelete(); }} className="text-xs bg-red-900/30 hover:bg-red-900/50 text-red-300 px-2 py-1 rounded border border-red-900/50">
                  Excluir
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-6">
                    <div>
                        <h4 className="text-sm font-mono text-ordem-red mb-2 uppercase border-b border-ordem-border pb-1">Atributos</h4>
                        <div className="flex justify-between px-2">
                            {Object.entries(monster.atributos).map(([key, val]) => (
                                <div key={key} className="text-center">
                                    <div className="text-[10px] text-ordem-text-muted font-mono">{key}</div>
                                    <div className="font-bold text-xl text-white">{val}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div>
                        <h4 className="text-sm font-mono text-ordem-red mb-2 uppercase border-b border-ordem-border pb-1">Defesas & Resistências</h4>
                        <div className="text-sm text-ordem-white-muted space-y-1">
                            <div className="grid grid-cols-2 gap-2 mb-2">
                                <p><span className="text-ordem-text-muted">Defesa:</span> {monster.defesa}</p>
                                <p><span className="text-ordem-text-muted">Vida:</span> {monster.vida}</p>
                                <p><span className="text-ordem-text-muted">Fortitude:</span> {monster.fortitude || '—'}</p>
                                <p><span className="text-ordem-text-muted">Reflexos:</span> {monster.reflexos || '—'}</p>
                                <p><span className="text-ordem-text-muted">Vontade:</span> {monster.vontade || '—'}</p>
                                <p><span className="text-ordem-text-muted">Deslocamento:</span> {monster.deslocamento || '—'}</p>
                            </div>

                            {monster.sentidos && (
                                <p><span className="text-ordem-text-muted">Sentidos:</span> {monster.sentidos}</p>
                            )}

                            {monster.pericias && Object.keys(monster.pericias).length > 0 && (
                                <p><span className="text-ordem-text-muted">Perícias:</span> {Object.entries(monster.pericias).map(([k, v]) => `${k} ${v}`).join(', ')}</p>
                            )}

                            {monster.resistencias && monster.resistencias.length > 0 && (
                                <p><span className="text-ordem-text-muted">Resistências:</span> {monster.resistencias.join(', ')}</p>
                            )}
                            {monster.imunidades && monster.imunidades.length > 0 && (
                                <p><span className="text-ordem-text-muted">Imunidades:</span> {monster.imunidades.join(', ')}</p>
                            )}
                            {monster.vulnerabilidades && monster.vulnerabilidades.length > 0 && (
                                <p><span className="text-ordem-text-muted">Vulnerabilidades:</span> {monster.vulnerabilidades.join(', ')}</p>
                            )}
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <div>
                        <h4 className="text-sm font-mono text-ordem-red mb-2 uppercase border-b border-ordem-border pb-1">Ações & Habilidades</h4>
                        <div className="space-y-4">
                            {monster.acoes?.map((acao, idx) => (
                                <div key={`acao-${idx}`} className="text-sm bg-white/5 p-2 rounded border border-white/10">
                                    <div className="flex justify-between items-baseline mb-1">
                                        <span className="font-bold text-white">{acao.nome}</span>
                                        {acao.tipo && <span className="text-[10px] font-mono text-ordem-text-secondary uppercase border border-ordem-border-light px-1 rounded">{acao.tipo}</span>}
                                    </div>
                                    <p className="text-ordem-white-muted text-sm leading-relaxed">{acao.descricao}</p>
                                </div>
                            ))}

                            {monster.habilidades?.map((hab, idx) => (
                                <div key={`hab-${idx}`} className="text-sm pl-2 border-l-2 border-ordem-border-light">
                                    <span className="font-bold text-gray-200 italic">{hab.nome}: </span>
                                    <span className="text-ordem-text-secondary">{hab.descricao}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {monster.presencaPerturbadora && (
                        <div className="p-3 bg-purple-900/10 border border-purple-900/30 rounded">
                            <h4 className="text-xs font-mono text-purple-400 uppercase mb-1">Presença Perturbadora</h4>
                            <p className="text-sm text-ordem-white-muted">
                                <span className="text-purple-300">DT {monster.presencaPerturbadora.dt}</span> &bull; {monster.presencaPerturbadora.dano}
                                {monster.presencaPerturbadora.nexImune && ` &bull; NEX Imune: ${monster.presencaPerturbadora.nexImune}%`}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
      )}
    </div>
  );
};
