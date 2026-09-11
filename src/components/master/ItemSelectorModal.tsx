import React, { useState, useMemo } from 'react';
import { ITENS } from '../../data/equipment/items';
import { WEAPONS } from '../../data/combat/weapons';
import { useCloudItems } from '../../core/storage';
import { ClasseName, Item } from '../../core/types';
import { Fita } from './ui/Pecas';
import { OpcaoDoSeletor, SELECT_DO_SELETOR, SeletorModal } from './ui/SeletorModal';

interface ItemSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (item: Item) => void;
  classe?: ClasseName;
}

export const ItemSelectorModal: React.FC<ItemSelectorModalProps> = ({ isOpen, onClose, onSelect, classe }) => {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<number | 'all'>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const { customItems, customWeapons } = useCloudItems();

  const allItems = useMemo(() => {
    const allWeaponsSource = [...WEAPONS, ...customWeapons];
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

  return (
    <SeletorModal
      aberto={isOpen}
      onFechar={onClose}
      rotulo="Inventário"
      titulo="Adicionar item"
      classe={classe}
      busca={{ valor: search, aoMudar: setSearch, placeholder: 'Pesquisar item…' }}
      filtros={(
        <>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value === 'all' ? 'all' : Number(e.target.value))}
            className={SELECT_DO_SELETOR}
            aria-label="Categoria"
          >
            <option value="all">Todas as categorias</option>
            {[0, 1, 2, 3, 4].map(cat => (
              <option key={cat} value={cat}>Categoria {cat}</option>
            ))}
          </select>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className={`${SELECT_DO_SELETOR} max-w-[220px]`}
            aria-label="Tipo"
          >
            <option value="all">Todos os tipos</option>
            {uniqueTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
          <span className="ml-auto font-mono text-[11px] text-ordem-text-muted">{filteredItems.length}</span>
        </>
      )}
    >
      {filteredItems.length === 0 ? (
        <p className="py-8 text-center text-sm italic text-ordem-text-muted">Nenhum item encontrado.</p>
      ) : (
        <ul className="grid gap-2 sm:grid-cols-2">
          {filteredItems.map((item, idx) => (
            <li key={`${item.nome}-${idx}`}>
              <OpcaoDoSeletor
                titulo={item.nome}
                meta={<Fita variante="neutra">Cat. {item.categoria} · {item.espaco} esp.</Fita>}
                descricao={item.descricao}
                rodape={(
                  <span className="flex justify-between text-[11px] text-ordem-text-muted">
                    <span>{item.tipo}</span>
                    <span className="italic opacity-70">{item.livro}</span>
                  </span>
                )}
                onClick={() => onSelect(item)}
              />
            </li>
          ))}
        </ul>
      )}
    </SeletorModal>
  );
};
