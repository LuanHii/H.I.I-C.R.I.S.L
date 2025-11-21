import React, { useState, useEffect } from 'react';
import { useStoredFichas } from '../../core/storage/useStoredFichas';
import { saveAgentToCloud } from '../../core/firebase/firestore';
import { Personagem, Ameaca } from '../../core/types';
import { StatusBar } from '../StatusBar';
import { ConditionsManager } from '../ConditionsManager';
import { calcularDefesaEfetiva } from '../../logic/combatUtils';
import { ThreatManagerModal } from './ThreatManagerModal';
import { AgentSelectorModal } from './AgentSelectorModal';
import { AgentDetailView } from './AgentDetailView';
import { ThreatCard } from './ThreatCard';

export const SessionManager: React.FC = () => {
  const { fichas, salvar } = useStoredFichas();
  const [rodada, setRodada] = useState(1);
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);

  // State for Modals and Session Data
  const [isThreatModalOpen, setIsThreatModalOpen] = useState(false);
  const [isAgentModalOpen, setIsAgentModalOpen] = useState(false);
  const [activeThreats, setActiveThreats] = useState<{instanceId: string, data: Ameaca, currentHP: number}[]>([]);
  const [activeAgentIds, setActiveAgentIds] = useState<string[]>([]);

  // Initialize active agents
  useEffect(() => {
    if (fichas.length > 0 && activeAgentIds.length === 0) {
        setActiveAgentIds(fichas.map(f => f.id));
    }
  }, [fichas, activeAgentIds.length]);

  // Auto-select first agent if none selected
  useEffect(() => {
    if (!selectedAgentId && activeAgentIds.length > 0) {
        setSelectedAgentId(activeAgentIds[0]);
    }
  }, [activeAgentIds, selectedAgentId]);

  const activeAgents = fichas.filter(f => activeAgentIds.includes(f.id));
  const selectedAgent = activeAgents.find(a => a.id === selectedAgentId);
  const otherAgents = activeAgents.filter(a => a.id !== selectedAgentId);

  const handleAddThreat = (threat: Ameaca) => {
    const newThreat = {
        instanceId: Math.random().toString(36).substr(2, 9),
        data: threat,
        currentHP: threat.vida
    };
    setActiveThreats([...activeThreats, newThreat]);
    setIsThreatModalOpen(false);
  };

  const handleRemoveThreat = (instanceId: string) => {
    setActiveThreats(activeThreats.filter(t => t.instanceId !== instanceId));
  };

  const handleUpdateThreatHP = (instanceId: string, newHP: number) => {
    setActiveThreats(activeThreats.map(t => 
        t.instanceId === instanceId ? { ...t, currentHP: newHP } : t
    ));
  };

  const handleToggleAgent = (id: string) => {
    if (activeAgentIds.includes(id)) {
        setActiveAgentIds(activeAgentIds.filter(aid => aid !== id));
        if (selectedAgentId === id) setSelectedAgentId(null);
    } else {
        setActiveAgentIds([...activeAgentIds, id]);
    }
  };

  const handleUpdateAgent = async (id: string, updated: Personagem) => {
    salvar(updated, id);
    try {
      await saveAgentToCloud(id, updated);
    } catch (error) {
      console.error("Erro ao sincronizar com Firebase:", error);
    }
  };

  const handleShareAgent = async (id: string) => {
    const agentToShare = fichas.find(a => a.id === id);
    if (agentToShare) {
        try {
            // Força o salvamento na nuvem antes de compartilhar
            await saveAgentToCloud(id, agentToShare);
            
            const link = `${window.location.origin}/ficha/${id}`;
            navigator.clipboard.writeText(link).then(() => {
              alert('Ficha sincronizada e Link copiado para a área de transferência!');
            });
        } catch (error) {
            console.error("Erro ao compartilhar:", error);
            alert("Erro ao sincronizar com a nuvem. Verifique sua conexão.");
        }
    }
  };

  return (
    <div className="flex flex-col min-h-full p-6">
      <div className="flex items-center justify-between mb-8 bg-zinc-900/95 p-6 rounded-xl border border-zinc-800 backdrop-blur-md sticky top-0 z-30 shadow-xl transition-all">
        <div>
          <h2 className="text-3xl font-serif text-white tracking-wide">Sessão em Andamento</h2>
          <p className="text-zinc-500 font-mono text-sm mt-1">Gerenciamento tático em tempo real</p>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-4 bg-black/60 px-6 py-3 rounded-lg border border-zinc-800 shadow-inner">
            <span className="text-zinc-400 font-mono uppercase text-xs tracking-widest">Rodada</span>
            <button 
              onClick={() => setRodada(Math.max(1, rodada - 1))}
              className="w-8 h-8 flex items-center justify-center bg-zinc-800 hover:bg-zinc-700 rounded text-zinc-200 transition-colors"
            >
              -
            </button>
            <span className="text-4xl font-mono font-bold text-ordem-red min-w-[2ch] text-center">{rodada}</span>
            <button 
              onClick={() => setRodada(rodada + 1)}
              className="w-8 h-8 flex items-center justify-center bg-zinc-800 hover:bg-zinc-700 rounded text-zinc-200 transition-colors"
            >
              +
            </button>
          </div>
          
          <button 
            onClick={() => setIsAgentModalOpen(true)}
            className="px-6 py-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700 rounded-lg font-mono text-sm transition-all hover:shadow-lg hover:border-zinc-500"
          >
            GERENCIAR GRUPO
          </button>

          <button className="px-6 py-3 bg-ordem-red/10 hover:bg-ordem-red/20 text-ordem-red border border-ordem-red/30 hover:border-ordem-red/60 rounded-lg font-mono text-sm transition-all hover:shadow-[0_0_15px_rgba(220,38,38,0.2)]">
            ENCERRAR CENA
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 flex-1 items-start">
        
        <div className="lg:col-span-3 flex flex-col gap-6 h-full">
            {selectedAgent ? (
                <>
                    <div className="flex justify-end">
                        <button 
                            onClick={() => handleShareAgent(selectedAgent.id)}
                            className="flex items-center gap-2 px-4 py-2 bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-400 border border-indigo-600/50 rounded-lg font-mono text-xs transition-all uppercase tracking-wider"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>
                            Compartilhar Ficha
                        </button>
                    </div>
                    <AgentDetailView 
                        agent={selectedAgent.personagem} 
                        onUpdate={(updated) => handleUpdateAgent(selectedAgent.id, updated)} 
                    />
                </>
            ) : (
                <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-zinc-700 bg-zinc-900/50 rounded-xl p-12 text-zinc-500">
                    <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="mb-4 opacity-50"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" x2="19" y1="8" y2="14"/><line x1="22" x2="16" y1="11" y2="11"/></svg>
                    <p className="text-lg font-mono">Selecione um agente para ver os detalhes</p>
                </div>
            )}
        </div>

        <div className="flex flex-col gap-6 sticky top-32">
          
          <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-6 flex flex-col shadow-xl">
            <div className="flex justify-between items-center mb-6 border-b border-zinc-700 pb-4">
                <h3 className="text-xl font-mono text-zinc-200">Ameaças</h3>
                <button 
                    onClick={() => setIsThreatModalOpen(true)}
                    className="text-xs bg-zinc-800 hover:bg-zinc-700 text-zinc-200 px-3 py-2 rounded border border-zinc-600 transition-colors uppercase font-bold tracking-wider"
                >
                    + Adicionar
                </button>
            </div>
            
            <div className="space-y-4 max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
                {activeThreats.length === 0 ? (
                    <div className="h-32 flex items-center justify-center text-zinc-500 italic text-sm border border-dashed border-zinc-700 rounded-lg bg-zinc-950/30">
                        Nenhuma ameaça.
                    </div>
                ) : (
                    activeThreats.map((threat) => (
                        <ThreatCard 
                            key={threat.instanceId} 
                            threat={threat} 
                            onUpdateHP={handleUpdateThreatHP} 
                            onRemove={handleRemoveThreat} 
                        />
                    ))
                )}
            </div>
          </div>

          <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-6 flex flex-col shadow-xl">
            <h3 className="text-xl font-mono text-zinc-200 mb-6 border-b border-zinc-700 pb-4">Outros Agentes</h3>
            
            <div className="space-y-3 max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
                {otherAgents.length === 0 ? (
                    <div className="text-center text-zinc-500 italic text-sm py-4">
                        {activeAgents.length <= 1 ? "Nenhum outro agente." : "Todos selecionados."}
                    </div>
                ) : (
                    otherAgents.map(({ id, personagem }) => (
                        <button 
                            key={id}
                            onClick={() => setSelectedAgentId(id)}
                            className="w-full text-left bg-zinc-950/50 border border-zinc-700 rounded-lg p-3 hover:bg-zinc-800 hover:border-zinc-500 transition-all group flex items-center gap-3"
                        >
                            <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400 group-hover:text-zinc-200 border border-zinc-600">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                            </div>
                            <div>
                                <h4 className="font-bold text-zinc-200 group-hover:text-white transition-colors">{personagem.nome}</h4>
                                <div className="flex gap-2 text-[10px] font-mono text-zinc-400">
                                    <span>{personagem.classe}</span>
                                    <span>PV {personagem.pv.atual}/{personagem.pv.max}</span>
                                </div>
                            </div>
                        </button>
                    ))
                )}
            </div>
          </div>

        </div>

      </div>

      <ThreatManagerModal 
        isOpen={isThreatModalOpen}
        onClose={() => setIsThreatModalOpen(false)}
        onAddThreat={handleAddThreat}
      />

      <AgentSelectorModal
        isOpen={isAgentModalOpen}
        onClose={() => setIsAgentModalOpen(false)}
        agents={fichas}
        activeAgentIds={activeAgentIds}
        onToggleAgent={handleToggleAgent}
      />
    </div>
  );
};
