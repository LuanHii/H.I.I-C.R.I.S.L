import React, { useState, useMemo } from 'react';
import { ITENS } from '../../data/items';
import { WEAPOWS } from '../../data/weapows';
import { useStoredItems } from '../../core/storage/useStoredItems';
import { Item, Weapow } from '../../core/types';

export const ItemManager: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'items' | 'weapons'>('items');
  const [isCreating, setIsCreating] = useState(false);
  const { customItems, customWeapons, addCustomItem, addCustomWeapon, removeCustomItem, removeCustomWeapon } = useStoredItems();

  // Form states
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
  const allWeapons = useMemo(() => [...WEAPOWS, ...customWeapons], [customWeapons]);

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
    <div className="h-full flex flex-col p-6 max-w-7xl mx-auto w-full">
      <div className="flex justify-between items-center mb-6 border-b border-gray-800 pb-4">
        <div className="flex gap-4">
          <button
            onClick={() => setActiveTab('items')}
            className={`px-4 py-2 font-mono text-sm transition-colors ${
              activeTab === 'items' 
                ? 'text-ordem-red border-b-2 border-ordem-red' 
                : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            ITENS GERAIS
          </button>
          <button
            onClick={() => setActiveTab('weapons')}
            className={`px-4 py-2 font-mono text-sm transition-colors ${
              activeTab === 'weapons' 
                ? 'text-ordem-red border-b-2 border-ordem-red' 
                : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            ARMAS
          </button>
        </div>
        <button
          onClick={() => setIsCreating(true)}
          className="px-4 py-2 bg-ordem-red/20 text-ordem-red border border-ordem-red/50 hover:bg-ordem-red/30 transition-colors font-mono text-sm uppercase tracking-wider"
        >
          + Criar {activeTab === 'items' ? 'Item' : 'Arma'}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {activeTab === 'items' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {allItems.map((item, idx) => (
              <div key={idx} className="bg-black/40 border border-gray-800 p-4 rounded hover:border-gray-600 transition-colors group relative">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-gray-200 group-hover:text-white">{item.nome}</h3>
                  <span className="text-xs font-mono text-gray-500 border border-gray-800 px-1 rounded">
                    Cat {item.categoria}
                  </span>
                </div>
                <p className="text-sm text-gray-400 mb-3 line-clamp-2">{item.descricao}</p>
                <div className="flex gap-2 text-xs text-gray-500 font-mono">
                  <span>{item.tipo}</span>
                  <span>•</span>
                  <span>{item.espaco} slots</span>
                </div>
                {customItems.some(i => i.nome === item.nome) && (
                  <button 
                    onClick={() => removeCustomItem(item.nome)}
                    className="absolute top-2 right-2 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Remover item customizado"
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {allWeapons.map((weapon, idx) => (
              <div key={idx} className="bg-black/40 border border-gray-800 p-4 rounded hover:border-gray-600 transition-colors group relative">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-gray-200 group-hover:text-white">{weapon.nome}</h3>
                  <span className="text-xs font-mono text-gray-500 border border-gray-800 px-1 rounded">
                    Cat {weapon.categoria}
                  </span>
                </div>
                <p className="text-sm text-gray-400 mb-3 line-clamp-2">{weapon.descricao}</p>
                <div className="grid grid-cols-2 gap-2 text-xs text-gray-500 font-mono bg-black/20 p-2 rounded">
                  <div>Dano: <span className="text-gray-300">{weapon.stats.Dano_Base}</span></div>
                  <div>Crítico: <span className="text-gray-300">{weapon.stats.Critico}</span></div>
                  <div>Tipo: <span className="text-gray-300">{weapon.stats.Dano_Tipo}</span></div>
                  <div>Alcance: <span className="text-gray-300">{weapon.stats.Alcance}</span></div>
                </div>
                {customWeapons.some(w => w.nome === weapon.nome) && (
                  <button 
                    onClick={() => removeCustomWeapon(weapon.nome)}
                    className="absolute top-2 right-2 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Remover arma customizada"
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {isCreating && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-gray-700 p-6 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-serif text-white mb-6 border-b border-gray-800 pb-2">
              Criar Novo {activeTab === 'items' ? 'Item' : 'Arma'}
            </h2>
            
            <div className="space-y-4">
              {activeTab === 'items' ? (
                <>
                  <div>
                    <label className="block text-xs text-gray-500 uppercase mb-1">Nome</label>
                    <input 
                      type="text" 
                      value={newItem.nome || ''} 
                      onChange={e => setNewItem({...newItem, nome: e.target.value})}
                      className="w-full bg-black/50 border border-gray-700 rounded p-2 text-white focus:border-ordem-red outline-none"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-gray-500 uppercase mb-1">Categoria</label>
                      <select 
                        value={newItem.categoria} 
                        onChange={e => setNewItem({...newItem, categoria: Number(e.target.value) as any})}
                        className="w-full bg-black/50 border border-gray-700 rounded p-2 text-white focus:border-ordem-red outline-none"
                      >
                        {[0, 1, 2, 3, 4].map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 uppercase mb-1">Espaço</label>
                      <input 
                        type="number" 
                        value={newItem.espaco} 
                        onChange={e => setNewItem({...newItem, espaco: Number(e.target.value)})}
                        className="w-full bg-black/50 border border-gray-700 rounded p-2 text-white focus:border-ordem-red outline-none"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 uppercase mb-1">Tipo</label>
                    <select 
                      value={newItem.tipo} 
                      onChange={e => setNewItem({...newItem, tipo: e.target.value as any})}
                      className="w-full bg-black/50 border border-gray-700 rounded p-2 text-white focus:border-ordem-red outline-none"
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
                    <label className="block text-xs text-gray-500 uppercase mb-1">Descrição</label>
                    <textarea 
                      value={newItem.descricao || ''} 
                      onChange={e => setNewItem({...newItem, descricao: e.target.value})}
                      className="w-full bg-black/50 border border-gray-700 rounded p-2 text-white focus:border-ordem-red outline-none h-32"
                    />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="block text-xs text-gray-500 uppercase mb-1">Nome</label>
                    <input 
                      type="text" 
                      value={newWeapon.nome || ''} 
                      onChange={e => setNewWeapon({...newWeapon, nome: e.target.value})}
                      className="w-full bg-black/50 border border-gray-700 rounded p-2 text-white focus:border-ordem-red outline-none"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-gray-500 uppercase mb-1">Categoria</label>
                      <select 
                        value={newWeapon.categoria} 
                        onChange={e => setNewWeapon({...newWeapon, categoria: Number(e.target.value) as any})}
                        className="w-full bg-black/50 border border-gray-700 rounded p-2 text-white focus:border-ordem-red outline-none"
                      >
                        {[0, 1, 2, 3, 4].map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 uppercase mb-1">Espaço</label>
                      <input 
                        type="number" 
                        value={newWeapon.espaco} 
                        onChange={e => setNewWeapon({...newWeapon, espaco: Number(e.target.value)})}
                        className="w-full bg-black/50 border border-gray-700 rounded p-2 text-white focus:border-ordem-red outline-none"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-gray-500 uppercase mb-1">Tipo</label>
                      <input 
                        type="text" 
                        value={newWeapon.tipo} 
                        onChange={e => setNewWeapon({...newWeapon, tipo: e.target.value})}
                        className="w-full bg-black/50 border border-gray-700 rounded p-2 text-white focus:border-ordem-red outline-none"
                        placeholder="Ex: Tática"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 uppercase mb-1">Proficiência</label>
                      <input 
                        type="text" 
                        value={newWeapon.proficiencia} 
                        onChange={e => setNewWeapon({...newWeapon, proficiencia: e.target.value})}
                        className="w-full bg-black/50 border border-gray-700 rounded p-2 text-white focus:border-ordem-red outline-none"
                        placeholder="Ex: Armas Táticas"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 bg-black/20 p-4 rounded border border-gray-800">
                    <div>
                      <label className="block text-xs text-gray-500 uppercase mb-1">Dano</label>
                      <input 
                        type="text" 
                        value={newWeapon.stats?.Dano_Base || ''} 
                        onChange={e => setNewWeapon({...newWeapon, stats: {...newWeapon.stats!, Dano_Base: e.target.value}})}
                        className="w-full bg-black/50 border border-gray-700 rounded p-2 text-white focus:border-ordem-red outline-none"
                        placeholder="Ex: 1d8"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 uppercase mb-1">Crítico</label>
                      <input 
                        type="text" 
                        value={newWeapon.stats?.Critico || ''} 
                        onChange={e => setNewWeapon({...newWeapon, stats: {...newWeapon.stats!, Critico: e.target.value}})}
                        className="w-full bg-black/50 border border-gray-700 rounded p-2 text-white focus:border-ordem-red outline-none"
                        placeholder="Ex: 19/x2"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 uppercase mb-1">Tipo Dano</label>
                      <input 
                        type="text" 
                        value={newWeapon.stats?.Dano_Tipo || ''} 
                        onChange={e => setNewWeapon({...newWeapon, stats: {...newWeapon.stats!, Dano_Tipo: e.target.value}})}
                        className="w-full bg-black/50 border border-gray-700 rounded p-2 text-white focus:border-ordem-red outline-none"
                        placeholder="Ex: Corte"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 uppercase mb-1">Alcance</label>
                      <input 
                        type="text" 
                        value={newWeapon.stats?.Alcance || ''} 
                        onChange={e => setNewWeapon({...newWeapon, stats: {...newWeapon.stats!, Alcance: e.target.value}})}
                        className="w-full bg-black/50 border border-gray-700 rounded p-2 text-white focus:border-ordem-red outline-none"
                        placeholder="Ex: Curto"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 uppercase mb-1">Descrição</label>
                    <textarea 
                      value={newWeapon.descricao || ''} 
                      onChange={e => setNewWeapon({...newWeapon, descricao: e.target.value})}
                      className="w-full bg-black/50 border border-gray-700 rounded p-2 text-white focus:border-ordem-red outline-none h-32"
                    />
                  </div>
                </>
              )}
            </div>

            <div className="flex justify-end gap-4 mt-6 pt-4 border-t border-gray-800">
              <button 
                onClick={() => setIsCreating(false)}
                className="px-4 py-2 text-gray-400 hover:text-white transition-colors font-mono text-sm"
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
