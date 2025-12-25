import React, { useState, useMemo } from 'react';
import { ITENS } from '../../data/items';
import { WEAPOWS } from '../../data/weapows';
import { useStoredItems } from '../../core/storage/useStoredItems';
import { Item } from '../../core/types';

interface ItemSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (item: Item) => void;
}

export const ItemSelectorModal: React.FC<ItemSelectorModalProps> = ({ isOpen, onClose, onSelect }) => {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<number | 'all'>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const { customItems, customWeapons } = useStoredItems();

  const allItems = useMemo(() => {
    const allWeaponsSource = [...WEAPOWS, ...customWeapons];
    const weaponsAsItems: Item[] = allWeaponsSource.map(w => ({
      nome: w.nome,
      categoria: w.categoria,
      espaco: w.espaco,
      tipo: w.tipo === 'Munição' ? 'Geral' : 'Arma',
      descricao: `${w.descricao} ${w.proficiencia !== 'N/A' ? `[${w.proficiencia}]` : ''}`,
      stats: {
        dano: w.stats.Dano_Base !== '—' ? w.stats.Dano_Base : undefined,
        tipoDano: w.stats.Dano_Tipo !== '—' ? w.stats.Dano_Tipo : undefined,
        critico: w.stats.Critico !== '—' ? w.stats.Critico : undefined,
        alcance: w.stats.Alcance !== '—' ? w.stats.Alcance : undefined,
      },
      livro: w.livro as any
    }));
    return [...ITENS, ...customItems, ...weaponsAsItems];
  }, [customItems, customWeapons]);

  const uniqueTypes = useMemo(() => {
    const types = new Set(allItems.map(i => i.tipo));
    return Array.from(types).sort();
  }, [allItems]);

  const filteredItems = useMemo(() => {
    return allItems.filter(item => {
      const matchesSearch = item.nome.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = categoryFilter === 'all' || item.categoria === categoryFilter;
      const matchesType = typeFilter === 'all' || item.tipo === typeFilter;
      return matchesSearch && matchesCategory && matchesType;
    }).sort((a, b) => a.nome.localeCompare(b.nome));
  }, [search, categoryFilter, typeFilter, allItems]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ordem-black/80 backdrop-blur-sm p-4">
      <div className="bg-ordem-ooze border border-ordem-border-light rounded-lg w-full max-w-2xl max-h-[80vh] flex flex-col shadow-2xl">
        
        <div className="p-4 border-b border-ordem-border flex justify-between items-center">
          <h2 className="text-xl font-serif text-white">Adicionar Item</h2>
          <button onClick={onClose} className="text-ordem-text-secondary hover:text-white">✕</button>
        </div>

        <div className="p-4 space-y-3 bg-ordem-ooze/50">
          <input
            type="text"
            placeholder="Pesquisar item..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-ordem-black/40 border border-ordem-border-light text-white px-3 py-2 rounded focus:border-ordem-red outline-none"
            autoFocus
          />
          
          <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
            <select 
              value={categoryFilter} 
              onChange={(e) => setCategoryFilter(e.target.value === 'all' ? 'all' : Number(e.target.value))}
              className="bg-ordem-black/40 border border-ordem-border-light text-white text-xs px-2 py-1 rounded outline-none"
            >
              <option value="all">Todas Categorias</option>
              {[0, 1, 2, 3, 4].map(cat => (
                <option key={cat} value={cat}>Categoria {cat}</option>
              ))}
            </select>

            <select 
              value={typeFilter} 
              onChange={(e) => setTypeFilter(e.target.value)}
              className="bg-ordem-black/40 border border-ordem-border-light text-white text-xs px-2 py-1 rounded outline-none max-w-[200px]"
            >
              <option value="all">Todos Tipos</option>
              {uniqueTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar bg-ordem-black/20">
          {filteredItems.length === 0 ? (
            <div className="text-center text-ordem-text-muted py-8">Nenhum item encontrado.</div>
          ) : (
            filteredItems.map((item, idx) => (
              <button
                key={`${item.nome}-${idx}`}
                onClick={() => onSelect(item)}
                className="w-full text-left p-3 rounded hover:bg-ordem-ooze border border-transparent hover:border-ordem-border-light transition-colors group"
              >
                <div className="flex justify-between items-start">
                  <span className="font-bold text-gray-200 group-hover:text-white">{item.nome}</span>
                  <span className="text-xs font-mono text-ordem-text-muted bg-ordem-ooze px-1.5 py-0.5 rounded border border-ordem-border">
                    Cat {item.categoria} | {item.espaco} espaço(s)
                  </span>
                </div>
                <div className="text-xs text-ordem-text-muted mt-1 flex justify-between">
                    <span>{item.tipo}</span>
                    <span className="italic opacity-50">{item.livro}</span>
                </div>
                {item.descricao && (
                    <p className="text-xs text-ordem-text-muted mt-1 line-clamp-2 group-hover:text-ordem-text-secondary transition-colors">
                        {item.descricao}
                    </p>
                )}
              </button>
            ))
          )}
        </div>

        <div className="p-3 border-t border-ordem-border text-right">
            <button onClick={onClose} className="text-sm text-ordem-text-secondary hover:text-white px-4 py-2">
                Cancelar
            </button>
        </div>
      </div>
    </div>
  );
};
