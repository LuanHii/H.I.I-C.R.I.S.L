import React, { useState, useMemo } from 'react';
import { AMEACAS } from '../../data/monsters';
import { Ameaca } from '../../core/types';

interface ThreatManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddThreat: (threat: Ameaca) => void;
}

export const ThreatManagerModal: React.FC<ThreatManagerModalProps> = ({ isOpen, onClose, onAddThreat }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [showCustomOnly, setShowCustomOnly] = useState(false);

  const filteredThreats = useMemo(() => {
    return AMEACAS.filter(threat => {
      const matchesSearch = threat.nome.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = selectedType ? threat.tipo === selectedType : true;

      return matchesSearch && matchesType;
    });
  }, [searchTerm, selectedType]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ordem-black/80 backdrop-blur-sm p-4">
      <div className="bg-ordem-ooze border border-ordem-border-light rounded-lg w-full max-w-5xl h-[80vh] flex flex-col shadow-2xl">

        <div className="flex justify-between items-center p-6 border-b border-ordem-border bg-ordem-black-deep rounded-t-lg">
          <div>
            <h2 className="text-2xl font-serif text-ordem-red tracking-wider">GERENCIADOR DE AMEAÇAS</h2>
            <p className="text-ordem-text-muted font-mono text-sm">Selecione ameaças para adicionar à cena.</p>
          </div>
          <button onClick={onClose} className="text-ordem-text-secondary hover:text-white transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-4 border-b border-ordem-border bg-ordem-ooze/50 flex flex-wrap gap-4 items-center">
          <div className="relative flex-1 min-w-[200px]">
            <input
              type="text"
              placeholder="Buscar ameaça..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-ordem-black-deep border border-ordem-border-light text-ordem-white px-4 py-2 rounded focus:border-ordem-red outline-none font-mono"
            />
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-ordem-text-muted absolute right-3 top-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          <div className="flex gap-2">
            {['Sangue', 'Morte', 'Conhecimento', 'Energia', 'Medo'].map(type => (
              <button
                key={type}
                onClick={() => setSelectedType(selectedType === type ? null : type)}
                className={`px-3 py-1 rounded border text-sm font-mono transition-all
                  ${selectedType === type
                    ? `bg-${type === 'Sangue' ? 'red' : type === 'Morte' ? 'zinc' : type === 'Conhecimento' ? 'yellow' : type === 'Energia' ? 'purple' : 'white'}-900/30 border-${type === 'Sangue' ? 'red' : type === 'Morte' ? 'zinc' : type === 'Conhecimento' ? 'yellow' : type === 'Energia' ? 'purple' : 'white'}-500 text-white`
                    : 'border-ordem-border-light text-ordem-text-secondary hover:border-ordem-text-muted'}`}
              >
                {type.toUpperCase()}
              </button>
            ))}
             <button
                onClick={() => setSelectedType(selectedType === 'Realidade' ? null : 'Realidade')}
                className={`px-3 py-1 rounded border text-sm font-mono transition-all
                  ${selectedType === 'Realidade'
                    ? 'bg-blue-900/30 border-blue-500 text-white'
                    : 'border-ordem-border-light text-ordem-text-secondary hover:border-ordem-text-muted'}`}
              >
                REALIDADE
              </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredThreats.map((threat, index) => (
            <div key={index} className="bg-ordem-black-deep border border-ordem-border rounded p-4 hover:border-ordem-text-muted transition-colors flex flex-col group">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-lg text-ordem-white group-hover:text-ordem-red transition-colors">{threat.nome}</h3>
                <span className="text-xs font-mono bg-ordem-ooze px-2 py-1 rounded text-ordem-text-secondary">VD {threat.vd}</span>
              </div>

              <div className="text-xs text-ordem-text-muted font-mono mb-3 flex gap-2">
                <span className={`
                  ${threat.tipo === 'Sangue' ? 'text-red-500' : ''}
                  ${threat.tipo === 'Morte' ? 'text-ordem-text-secondary' : ''}
                  ${threat.tipo === 'Conhecimento' ? 'text-yellow-500' : ''}
                  ${threat.tipo === 'Energia' ? 'text-purple-500' : ''}
                  ${threat.tipo === 'Medo' ? 'text-white' : ''}
                `}>{threat.tipo.toUpperCase()}</span>
                <span>•</span>
                <span>{threat.tamanho}</span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-sm text-ordem-text-secondary mb-4">
                <div className="bg-ordem-ooze/50 p-1 rounded text-center">
                  <span className="block text-[10px] uppercase text-ordem-text-muted">Vida</span>
                  <span className="font-bold text-ordem-white">{threat.vida}</span>
                </div>
                <div className="bg-ordem-ooze/50 p-1 rounded text-center">
                  <span className="block text-[10px] uppercase text-ordem-text-muted">Defesa</span>
                  <span className="font-bold text-ordem-white">{threat.defesa}</span>
                </div>
              </div>

              <div className="mt-auto pt-3 border-t border-ordem-ooze flex gap-2">
                <button
                  onClick={() => onAddThreat(threat)}
                  className="flex-1 bg-ordem-ooze hover:bg-ordem-red hover:text-white text-ordem-white-muted py-2 rounded text-sm font-mono transition-colors"
                >
                  ADICIONAR
                </button>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};
