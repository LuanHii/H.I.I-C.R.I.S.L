import React, { useState, useMemo } from 'react';
import { PODERES } from '../../data/character/powers';
import { CLASS_ABILITIES } from '../../data/character/classAbilities';
import { ClasseName, Poder } from '../../core/types';
import { Fita } from './ui/Pecas';
import { CHIP_DO_SELETOR, OpcaoDoSeletor, SeletorModal } from './ui/SeletorModal';

interface AbilitySelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (ability: Poder) => void;
  classe?: ClasseName;
}

export const AbilitySelectorModal: React.FC<AbilitySelectorModalProps> = ({ isOpen, onClose, onSelect, classe }) => {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  const allAbilities = useMemo(() => {
    const classAbilitiesAsPowers: Poder[] = [];

    Object.entries(CLASS_ABILITIES).forEach(([, abilities]) => {
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

  return (
    <SeletorModal
      aberto={isOpen}
      onFechar={onClose}
      rotulo="Poder fora dos marcos"
      titulo="Adicionar poder"
      classe={classe}
      busca={{ valor: search, aoMudar: setSearch, placeholder: 'Buscar poder ou habilidade…' }}
      filtros={(
        <>
          <button type="button" onClick={() => setTypeFilter('all')} className={CHIP_DO_SELETOR(typeFilter === 'all')}>Todos</button>
          {uniqueTypes.map((t) => (
            <button key={t} type="button" onClick={() => setTypeFilter(t)} className={CHIP_DO_SELETOR(typeFilter === t)}>{t}</button>
          ))}
          <span className="ml-auto font-mono text-[11px] text-ordem-text-muted">{filteredAbilities.length}</span>
        </>
      )}
    >
      {filteredAbilities.length === 0 ? (
        <p className="py-8 text-center text-sm italic text-ordem-text-muted">Nenhuma habilidade encontrada.</p>
      ) : (
        <ul className="grid gap-2 sm:grid-cols-2">
          {filteredAbilities.map((ability, idx) => (
            <li key={`${ability.nome}-${idx}`}>
              <OpcaoDoSeletor
                titulo={ability.nome}
                meta={<Fita variante="neutra">{ability.tipo}</Fita>}
                descricao={ability.descricao}
                rodape={(ability.custo || ability.acao) ? (
                  <span className="flex gap-3 font-mono text-[11px] text-ordem-text-muted">
                    {ability.custo && <span>Custo: {ability.custo}</span>}
                    {ability.acao && <span>Ação: {ability.acao}</span>}
                  </span>
                ) : undefined}
                onClick={() => onSelect(ability)}
              />
            </li>
          ))}
        </ul>
      )}
    </SeletorModal>
  );
};
