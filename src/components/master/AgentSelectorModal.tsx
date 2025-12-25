import React from 'react';
import { Personagem } from '../../core/types';


interface AgentSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  agents: { id: string; personagem: Personagem }[];
  activeAgentIds: string[];
  onToggleAgent: (id: string) => void;
}

export const AgentSelectorModal: React.FC<AgentSelectorModalProps> = ({
  isOpen,
  onClose,
  agents,
  activeAgentIds,
  onToggleAgent,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ordem-black/80 backdrop-blur-sm p-4">
      <div className="bg-ordem-black-deep border border-ordem-border rounded-xl w-full max-w-2xl flex flex-col max-h-[80vh] shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        
        <div className="flex items-center justify-between p-4 border-b border-ordem-border bg-ordem-ooze/50 rounded-t-xl">
          <div>
            <h2 className="text-xl font-serif text-zinc-100">Gerenciar Agentes na Cena</h2>
            <p className="text-sm text-ordem-text-muted font-mono">Selecione os agentes que participarão desta sessão.</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-ordem-ooze rounded-lg text-ordem-text-secondary hover:text-white transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 18 12"/></svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {agents.map(({ id, personagem }) => {
              const isActive = activeAgentIds.includes(id);
              return (
                <button
                  key={id}
                  onClick={() => onToggleAgent(id)}
                  className={`
                    flex items-center gap-4 p-3 rounded-lg border transition-all text-left group
                    ${isActive 
                      ? 'bg-ordem-ooze/80 border-ordem-red/50 shadow-[0_0_15px_rgba(220,38,38,0.1)]' 
                      : 'bg-ordem-black-deep border-ordem-border hover:border-ordem-border-light opacity-60 hover:opacity-100'
                    }
                  `}
                >
                  <div className={`
                    w-10 h-10 rounded-full flex items-center justify-center border
                    ${isActive 
                      ? 'bg-ordem-red/20 border-ordem-red text-ordem-red' 
                      : 'bg-ordem-ooze border-ordem-border-light text-ordem-text-muted'
                    }
                  `}>
                    {isActive ? (
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="22" x2="16" y1="11" y2="11"/></svg>
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <h4 className={`font-bold ${isActive ? 'text-zinc-100' : 'text-ordem-text-secondary'}`}>
                      {personagem.nome}
                    </h4>
                    <p className="text-xs text-ordem-text-muted font-mono">
                      {personagem.classe} {personagem.nex}%
                    </p>
                  </div>

                  <div className={`
                    px-2 py-1 rounded text-xs font-mono border
                    ${isActive 
                      ? 'bg-green-900/20 border-green-900/50 text-green-400' 
                      : 'bg-ordem-ooze border-ordem-border text-ordem-text-muted'
                    }
                  `}>
                    {isActive ? 'ATIVO' : 'INATIVO'}
                  </div>
                </button>
              );
            })}
          </div>

          {agents.length === 0 && (
            <div className="text-center py-12 text-ordem-text-muted">
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-4 opacity-20"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              <p>Nenhum agente cadastrado.</p>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-ordem-border bg-ordem-ooze/30 rounded-b-xl flex justify-end">
          <button 
            onClick={onClose}
            className="px-6 py-2 bg-zinc-100 hover:bg-white text-ordem-black-deep font-bold rounded transition-colors"
          >
            Concluir
          </button>
        </div>
      </div>
    </div>
  );
};
