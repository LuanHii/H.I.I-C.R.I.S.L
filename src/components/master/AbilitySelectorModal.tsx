import React, { useState, useMemo } from 'react';
import { PODERES } from '../../data/powers';
import { CLASS_ABILITIES } from '../../data/classAbilities';
import { Poder, ClasseName } from '../../core/types';

interface AbilitySelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (ability: Poder) => void;
}

export const AbilitySelectorModal: React.FC<AbilitySelectorModalProps> = ({ isOpen, onClose, onSelect }) => {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  const allAbilities = useMemo(() => {
    const classAbilitiesAsPowers: Poder[] = [];
    
    Object.entries(CLASS_ABILITIES).forEach(([classe, abilities]) => {
        abilities.forEach(a => {
            classAbilitiesAsPowers.push({
                nome: a.nome,
                descricao: a.descricao,
                tipo: 'Classe',
                custo: a.custo,
                acao: a.acao,
                livro: 'Regras Básicas'
            });
        });
    });

    return [...PODERES, ...classAbilitiesAsPowers];
  }, []);

  const uniqueTypes = useMemo(() => {
    const types = new Set(allAbilities.map(i => i.tipo));
    return Array.from(types).sort();
  }, [allAbilities]);

  const filteredAbilities = useMemo(() => {
    return allAbilities.filter(ability => {
      const matchesSearch = ability.nome.toLowerCase().includes(search.toLowerCase());
      const matchesType = typeFilter === 'all' || ability.tipo === typeFilter;
      return matchesSearch && matchesType;
    }).sort((a, b) => a.nome.localeCompare(b.nome));
  }, [search, typeFilter, allAbilities]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ordem-black/80 backdrop-blur-sm p-4">
      <div className="bg-ordem-black-deep border border-ordem-border rounded-xl w-full max-w-2xl max-h-[80vh] flex flex-col shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        
        <div className="p-6 border-b border-ordem-border flex justify-between items-center bg-ordem-ooze/50">
          <div>
            <h3 className="text-xl font-bold text-white">Adicionar Habilidade</h3>
            <p className="text-ordem-text-secondary text-sm">Selecione um poder ou habilidade para adicionar à ficha.</p>
          </div>
          <button onClick={onClose} className="text-ordem-text-muted hover:text-white transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 18 12"/></svg>
          </button>
        </div>

        <div className="p-4 border-b border-ordem-border bg-ordem-ooze/30 flex gap-4">
          <div className="relative flex-1">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute left-3 top-1/2 -translate-y-1/2 text-ordem-text-muted"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
            <input 
              type="text" 
              placeholder="Buscar habilidade..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-ordem-black-deep border border-ordem-border rounded-lg pl-10 pr-4 py-2 text-ordem-white focus:outline-none focus:border-ordem-text-muted transition-colors"
              autoFocus
            />
          </div>
          
          <select 
            value={typeFilter} 
            onChange={(e) => setTypeFilter(e.target.value)}
            className="bg-ordem-black-deep border border-ordem-border rounded-lg px-4 py-2 text-ordem-white-muted focus:outline-none focus:border-ordem-text-muted"
          >
            <option value="all">Todos os Tipos</option>
            {uniqueTypes.map(t => (
                <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-2">
            {filteredAbilities.length === 0 ? (
                <div className="text-center py-12 text-ordem-text-muted italic">
                    Nenhuma habilidade encontrada.
                </div>
            ) : (
                filteredAbilities.map((ability, idx) => (
                    <button 
                        key={`${ability.nome}-${idx}`}
                        onClick={() => onSelect(ability)}
                        className="w-full text-left bg-ordem-ooze/30 border border-ordem-border rounded-lg p-4 hover:bg-ordem-ooze hover:border-ordem-text-muted transition-all group"
                    >
                        <div className="flex justify-between items-start mb-1">
                            <h4 className="font-bold text-ordem-white group-hover:text-white">{ability.nome}</h4>
                            <span className="text-xs font-mono bg-ordem-black/50 px-2 py-0.5 rounded text-ordem-text-muted border border-ordem-border uppercase">
                                {ability.tipo}
                            </span>
                        </div>
                        <p className="text-sm text-ordem-text-secondary line-clamp-2 group-hover:line-clamp-none transition-all">
                            {ability.descricao}
                        </p>
                        {(ability.custo || ability.acao) && (
                            <div className="flex gap-3 mt-2 text-xs font-mono text-ordem-text-muted">
                                {ability.custo && <span>Custo: {ability.custo}</span>}
                                {ability.acao && <span>Ação: {ability.acao}</span>}
                            </div>
                        )}
                    </button>
                ))
            )}
        </div>

      </div>
    </div>
  );
};
