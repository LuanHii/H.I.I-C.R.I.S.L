import React, { useState } from 'react';
import { Personagem, Condicao } from '../core/types';
import { condicoes } from '../data/conditions';

interface ConditionsManagerProps {
  personagem: Personagem;
  onUpdate: (updated: Personagem) => void;
}

export const ConditionsManager: React.FC<ConditionsManagerProps> = ({ personagem, onUpdate }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const activeConditions = personagem.efeitosAtivos || [];

  const handleAddCondition = (condicaoNome: string) => {
    if (!activeConditions.includes(condicaoNome)) {
      const logEntry = {
        timestamp: Date.now(),
        mensagem: `Condição adicionada: ${condicaoNome}`,
        tipo: 'condicao' as const
      };
      const updated = {
        ...personagem,
        efeitosAtivos: [...activeConditions, condicaoNome],
        log: [logEntry, ...(personagem.log || [])].slice(0, 50)
      };
      onUpdate(updated);
    }
    setIsAdding(false);
    setSearchTerm('');
  };

  const handleRemoveCondition = (condicaoNome: string) => {
    const logEntry = {
      timestamp: Date.now(),
      mensagem: `Condição removida: ${condicaoNome}`,
      tipo: 'condicao' as const
    };
    const updated = {
      ...personagem,
      efeitosAtivos: activeConditions.filter(c => c !== condicaoNome),
      log: [logEntry, ...(personagem.log || [])].slice(0, 50)
    };
    onUpdate(updated);
  };

  const filteredConditions = condicoes.filter(c => 
    c.nome.toLowerCase().includes(searchTerm.toLowerCase()) &&
    !activeConditions.includes(c.nome)
  );

  return (
    <div className="bg-ordem-ooze p-4 rounded-lg border border-ordem-border">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold text-zinc-100">Condições Ativas</h3>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="px-3 py-1 bg-red-900/50 hover:bg-red-800 text-red-100 rounded text-sm border border-red-800 transition-colors"
        >
          {isAdding ? 'Cancelar' : '+ Adicionar'}
        </button>
      </div>

      {isAdding && (
        <div className="mb-4 p-3 bg-ordem-black-deep rounded border border-ordem-border">
          <input
            type="text"
            placeholder="Buscar condição..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-ordem-ooze border border-ordem-border-light rounded p-2 text-zinc-100 mb-2 focus:border-red-500 outline-none"
            autoFocus
          />
          <div className="max-h-48 overflow-y-auto space-y-1">
            {filteredConditions.map(cond => (
              <button
                key={cond.nome}
                onClick={() => handleAddCondition(cond.nome)}
                className="w-full text-left px-3 py-2 hover:bg-ordem-ooze rounded flex flex-col group"
              >
                <span className="font-medium text-ordem-white group-hover:text-red-400">{cond.nome}</span>
                <span className="text-xs text-ordem-text-muted truncate">{cond.descricao}</span>
              </button>
            ))}
            {filteredConditions.length === 0 && (
              <p className="text-ordem-text-muted text-sm p-2">Nenhuma condição encontrada.</p>
            )}
          </div>
        </div>
      )}

      <div className="space-y-2">
        {activeConditions.length === 0 ? (
          <p className="text-ordem-text-muted italic text-center py-4">Nenhuma condição ativa.</p>
        ) : (
          activeConditions.map(nome => {
            const condData = condicoes.find(c => c.nome === nome);
            return (
              <div key={nome} className="bg-ordem-black-deep border border-red-900/30 rounded p-3 relative group">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-bold text-red-400">{nome}</h4>
                    <p className="text-sm text-ordem-text-secondary mt-1">{condData?.descricao || 'Descrição não encontrada.'}</p>
                    {condData?.efeito && (
                      <div className="mt-2 text-xs text-ordem-text-muted bg-ordem-ooze/50 p-2 rounded">
                        {condData.efeito.defesa && <div>Defesa: {condData.efeito.defesa > 0 ? '+' : ''}{condData.efeito.defesa}</div>}
                        {condData.efeito.deslocamento && <div>Deslocamento: {condData.efeito.deslocamento === 'zero' ? 'Imóvel' : 'Metade'}</div>}
                        {condData.efeito.acoes && <div>Ações: {condData.efeito.acoes}</div>}
                        {condData.efeito.pericias && (
                          <div>
                            Perícias: {condData.efeito.pericias.penalidadeDados}d ({condData.efeito.pericias.atributos?.join(', ')})
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => handleRemoveCondition(nome)}
                    className="text-ordem-text-muted hover:text-red-500 p-1"
                    title="Remover condição"
                  >
                    ✕
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
