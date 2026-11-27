import React, { useState, useMemo } from 'react';
import { ITENS } from '../../data/equipment/items';
import { WEAPONS } from '../../data/combat/weapons';
import { useCloudItems } from '../../core/storage';
import { Item, Weapow } from '../../core/types';
import { ChevronDown } from 'lucide-react';

export const ItemManager: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'items' | 'weapons'>('items');
  const [isCreating, setIsCreating] = useState(false);
  const { customItems, customWeapons, addCustomItem, addCustomWeapon, removeCustomItem, removeCustomWeapon, isCloudMode, loading } = useCloudItems();
  const [newItem, setNewItem] = useState<Partial<Item>>({
    categoria: 1,
    espaco: 1,
    tipo: 'Geral',
    livro: 'Regras Básicas'
  });

  const [newWeapon, setNewWeapon] = useState<Partial<Weapow>>({
    categoria: 1,
    espaco: 1,
    tipo: 'Simples',
    proficiencia: 'Simples',
    livro: 'Regras Básicas',
    stats: {
      Dano_Base: '1d6',
      Dano_Tipo: 'Impacto',
      Critico: 'x2',
      Alcance: 'Curto'
    }
  });

  const allItems = useMemo(() => [...ITENS, ...customItems], [customItems]);
  const allWeapons = useMemo(() => [...WEAPONS, ...customWeapons], [customWeapons]);

  const handleCreateItem = () => {
    if (!newItem.nome || !newItem.descricao) return;
    addCustomItem(newItem as Item);
    setIsCreating(false);
    setNewItem({ categoria: 1, espaco: 1, tipo: 'Geral', livro: 'Regras Básicas' });
  };

  const handleCreateWeapon = () => {
    if (!newWeapon.nome || !newWeapon.descricao) return;
    addCustomWeapon(newWeapon as Weapow);
    setIsCreating(false);
    setNewWeapon({
      categoria: 1,
      espaco: 1,
      tipo: 'Simples',
      proficiencia: 'Simples',
      livro: 'Regras Básicas',
      stats: {
        Dano_Base: '1d6',
        Dano_Tipo: 'Impacto',
        Critico: 'x2',
        Alcance: 'Curto'
      }
    });
  };

  return (
    <div className="mx-auto flex h-full w-full max-w-7xl flex-col p-3 sm:p-6">
      <div className="mb-4 flex items-center justify-between gap-2 border-b border-ordem-border pb-3 sm:mb-6 sm:pb-4">
        <div className="flex gap-1 sm:gap-4">
          <button
            onClick={() => setActiveTab('items')}
            className={`h-11 whitespace-nowrap px-3 font-mono text-sm transition-colors sm:px-4 ${activeTab === 'items'
                ? 'text-ordem-red border-b-2 border-ordem-red'
                : 'text-ordem-text-muted hover:text-ordem-white-muted'
              }`}
          >
            ITENS GERAIS
          </button>
          <button
            onClick={() => setActiveTab('weapons')}
            className={`h-11 whitespace-nowrap px-3 font-mono text-sm transition-colors sm:px-4 ${activeTab === 'weapons'
                ? 'text-ordem-red border-b-2 border-ordem-red'
                : 'text-ordem-text-muted hover:text-ordem-white-muted'
              }`}
          >
            ARMAS
          </button>
        </div>
        <button
          onClick={() => setIsCreating(true)}
          className="flex h-11 shrink-0 items-center whitespace-nowrap border border-ordem-red/50 bg-ordem-red/20 px-3 font-mono text-sm uppercase tracking-wider text-ordem-red transition-colors hover:bg-ordem-red/30 sm:px-4"
        >
          + <span className="ml-1 hidden sm:inline">Criar </span>{activeTab === 'items' ? 'Item' : 'Arma'}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="grid grid-cols-1 items-start gap-3 md:grid-cols-2 lg:grid-cols-3 lg:gap-4">
          {(activeTab === 'items' ? allItems : allWeapons).map((entry, idx) => {
            const isCustom = idx >= (activeTab === 'items' ? ITENS.length : WEAPONS.length);
            return (
              <article key={`${activeTab}-${entry.nome}-${idx}`} className="min-w-0 rounded border border-ordem-border bg-ordem-black/40 hover:border-ordem-border-light">
                <details className="group">
                  <summary aria-label={`Descrição de ${entry.nome}`} className="cursor-pointer list-none rounded p-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-ordem-red [&::-webkit-details-marker]:hidden">
                    <span className="mb-2 flex items-start justify-between gap-2">
                      <span className="break-words font-bold text-gray-200">{entry.nome}</span>
                      <span className="shrink-0 rounded border border-ordem-border px-1 font-mono text-xs text-ordem-text-muted">Cat {entry.categoria}</span>
                    </span>
                    <span aria-hidden="true" className="mb-3 line-clamp-2 break-words text-sm text-ordem-text-secondary group-open:hidden">{entry.descricao}</span>
                    {'proficiencia' in entry ? (
                      <span className="grid grid-cols-2 gap-2 rounded bg-ordem-black/20 p-2 font-mono text-xs text-ordem-white-muted">
                        <span>Dano: {entry.stats.Dano_Base}</span>
                        <span>Crítico: {entry.stats.Critico}</span>
                        <span>Tipo: {entry.stats.Dano_Tipo}</span>
                        <span>Alcance: {entry.stats.Alcance}</span>
                      </span>
                    ) : (
                      <span className="block font-mono text-xs text-ordem-text-muted">{entry.tipo} · {entry.espaco} espaços</span>
                    )}
                    <span className="mt-3 flex items-center gap-1 text-sm text-ordem-white-muted">
                      <ChevronDown aria-hidden="true" size={16} className="group-open:rotate-180" />
                      <span className="group-open:hidden">Ler descrição</span>
                      <span className="hidden group-open:inline">Recolher descrição</span>
                    </span>
                  </summary>
                  <p className="whitespace-pre-wrap break-words border-t border-ordem-border p-4 text-sm leading-relaxed text-ordem-white-muted">{entry.descricao}</p>
                </details>
                {isCustom && (
                  <button type="button" aria-label={`Remover ${entry.nome}`}
                    onClick={() => activeTab === 'items' ? removeCustomItem(entry.nome) : removeCustomWeapon(entry.nome)}
                    className="mx-4 mb-2 min-h-11 text-xs text-red-400 hover:underline">
                    Remover
                  </button>
                )}
              </article>
            );
          })}
        </div>
      </div>
      {isCreating && (
        <div className="fixed inset-0 bg-ordem-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-ordem-ooze border border-ordem-border-light p-6 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-serif text-white mb-6 border-b border-ordem-border pb-2">
              Criar Novo {activeTab === 'items' ? 'Item' : 'Arma'}
            </h2>

            <div className="space-y-4">
              {activeTab === 'items' ? (
                <>
                  <div>
                    <label className="block text-xs text-ordem-text-muted uppercase mb-1">Nome</label>
                    <input
                      type="text"
                      value={newItem.nome || ''}
                      onChange={e => setNewItem({ ...newItem, nome: e.target.value })}
                      className="w-full bg-ordem-black/50 border border-ordem-border-light rounded p-2 text-white focus:border-ordem-red outline-none"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-ordem-text-muted uppercase mb-1">Categoria</label>
                      <select
                        value={newItem.categoria}
                        onChange={e => setNewItem({ ...newItem, categoria: Number(e.target.value) as any })}
                        className="w-full bg-ordem-black/50 border border-ordem-border-light rounded p-2 text-white focus:border-ordem-red outline-none"
                      >
                        {[0, 1, 2, 3, 4].map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-ordem-text-muted uppercase mb-1">Espaço</label>
                      <input
                        type="number"
                        value={newItem.espaco}
                        onChange={e => setNewItem({ ...newItem, espaco: Number(e.target.value) })}
                        className="w-full bg-ordem-black/50 border border-ordem-border-light rounded p-2 text-white focus:border-ordem-red outline-none"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs text-ordem-text-muted uppercase mb-1">Tipo</label>
                    <select
                      value={newItem.tipo}
                      onChange={e => setNewItem({ ...newItem, tipo: e.target.value as any })}
                      className="w-full bg-ordem-black/50 border border-ordem-border-light rounded p-2 text-white focus:border-ordem-red outline-none"
                    >
                      <option value="Geral">Geral</option>
                      <option value="Acessório">Acessório</option>
                      <option value="Proteção">Proteção</option>
                      <option value="Amaldiçoado">Amaldiçoado</option>
                      <option value="Explosivo">Explosivo</option>
                      <option value="Paranormal">Paranormal</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-ordem-text-muted uppercase mb-1">Descrição</label>
                    <textarea
                      value={newItem.descricao || ''}
                      onChange={e => setNewItem({ ...newItem, descricao: e.target.value })}
                      className="w-full bg-ordem-black/50 border border-ordem-border-light rounded p-2 text-white focus:border-ordem-red outline-none h-32"
                    />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="block text-xs text-ordem-text-muted uppercase mb-1">Nome</label>
                    <input
                      type="text"
                      value={newWeapon.nome || ''}
                      onChange={e => setNewWeapon({ ...newWeapon, nome: e.target.value })}
                      className="w-full bg-ordem-black/50 border border-ordem-border-light rounded p-2 text-white focus:border-ordem-red outline-none"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-ordem-text-muted uppercase mb-1">Categoria</label>
                      <select
                        value={newWeapon.categoria}
                        onChange={e => setNewWeapon({ ...newWeapon, categoria: Number(e.target.value) as any })}
                        className="w-full bg-ordem-black/50 border border-ordem-border-light rounded p-2 text-white focus:border-ordem-red outline-none"
                      >
                        {[0, 1, 2, 3, 4].map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-ordem-text-muted uppercase mb-1">Espaço</label>
                      <input
                        type="number"
                        value={newWeapon.espaco}
                        onChange={e => setNewWeapon({ ...newWeapon, espaco: Number(e.target.value) })}
                        className="w-full bg-ordem-black/50 border border-ordem-border-light rounded p-2 text-white focus:border-ordem-red outline-none"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-ordem-text-muted uppercase mb-1">Tipo</label>
                      <input
                        type="text"
                        value={newWeapon.tipo}
                        onChange={e => setNewWeapon({ ...newWeapon, tipo: e.target.value })}
                        className="w-full bg-ordem-black/50 border border-ordem-border-light rounded p-2 text-white focus:border-ordem-red outline-none"
                        placeholder="Ex: Tática"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-ordem-text-muted uppercase mb-1">Proficiência</label>
                      <input
                        type="text"
                        value={newWeapon.proficiencia}
                        onChange={e => setNewWeapon({ ...newWeapon, proficiencia: e.target.value })}
                        className="w-full bg-ordem-black/50 border border-ordem-border-light rounded p-2 text-white focus:border-ordem-red outline-none"
                        placeholder="Ex: Armas Táticas"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 bg-ordem-black/20 p-4 rounded border border-ordem-border">
                    <div>
                      <label className="block text-xs text-ordem-text-muted uppercase mb-1">Dano</label>
                      <input
                        type="text"
                        value={newWeapon.stats?.Dano_Base || ''}
                        onChange={e => setNewWeapon({ ...newWeapon, stats: { ...newWeapon.stats!, Dano_Base: e.target.value } })}
                        className="w-full bg-ordem-black/50 border border-ordem-border-light rounded p-2 text-white focus:border-ordem-red outline-none"
                        placeholder="Ex: 1d8"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-ordem-text-muted uppercase mb-1">Crítico</label>
                      <input
                        type="text"
                        value={newWeapon.stats?.Critico || ''}
                        onChange={e => setNewWeapon({ ...newWeapon, stats: { ...newWeapon.stats!, Critico: e.target.value } })}
                        className="w-full bg-ordem-black/50 border border-ordem-border-light rounded p-2 text-white focus:border-ordem-red outline-none"
                        placeholder="Ex: 19/x2"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-ordem-text-muted uppercase mb-1">Tipo Dano</label>
                      <input
                        type="text"
                        value={newWeapon.stats?.Dano_Tipo || ''}
                        onChange={e => setNewWeapon({ ...newWeapon, stats: { ...newWeapon.stats!, Dano_Tipo: e.target.value } })}
                        className="w-full bg-ordem-black/50 border border-ordem-border-light rounded p-2 text-white focus:border-ordem-red outline-none"
                        placeholder="Ex: Corte"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-ordem-text-muted uppercase mb-1">Alcance</label>
                      <input
                        type="text"
                        value={newWeapon.stats?.Alcance || ''}
                        onChange={e => setNewWeapon({ ...newWeapon, stats: { ...newWeapon.stats!, Alcance: e.target.value } })}
                        className="w-full bg-ordem-black/50 border border-ordem-border-light rounded p-2 text-white focus:border-ordem-red outline-none"
                        placeholder="Ex: Curto"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs text-ordem-text-muted uppercase mb-1">Descrição</label>
                    <textarea
                      value={newWeapon.descricao || ''}
                      onChange={e => setNewWeapon({ ...newWeapon, descricao: e.target.value })}
                      className="w-full bg-ordem-black/50 border border-ordem-border-light rounded p-2 text-white focus:border-ordem-red outline-none h-32"
                    />
                  </div>
                </>
              )}
            </div>

            <div className="flex justify-end gap-4 mt-6 pt-4 border-t border-ordem-border">
              <button
                onClick={() => setIsCreating(false)}
                className="px-4 py-2 text-ordem-text-secondary hover:text-white transition-colors font-mono text-sm"
              >
                CANCELAR
              </button>
              <button
                onClick={activeTab === 'items' ? handleCreateItem : handleCreateWeapon}
                className="px-6 py-2 bg-ordem-red text-white font-bold hover:bg-red-700 transition-colors font-mono text-sm uppercase tracking-wider"
              >
                CRIAR {activeTab === 'items' ? 'ITEM' : 'ARMA'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
