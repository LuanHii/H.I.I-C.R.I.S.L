"use client";

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { subscribeToAgent, saveAgentToCloud } from '../../../core/firebase/firestore';
import { Personagem } from '../../../core/types';
import { AgentDetailView } from '../../../components/master/AgentDetailView';

export default function PlayerAgentPage() {
  const params = useParams();
  const id = params.id as string;
  const [agent, setAgent] = useState<Personagem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const unsubscribe = subscribeToAgent(id, (data) => {
      if (data) {
        setAgent(data);
        setLoading(false);
      } else {
        setError('Agente não encontrado. Verifique se o Mestre salvou a ficha na nuvem.');
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [id]);

  const handleUpdate = async (updatedAgent: Personagem) => {
      setAgent(updatedAgent);
      await saveAgentToCloud(id, updatedAgent);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center font-mono">
        <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-ordem-red border-t-transparent rounded-full animate-spin"></div>
            <div className="animate-pulse tracking-widest">CARREGANDO DADOS DA ORDEM...</div>
        </div>
      </div>
    );
  }

  if (error || !agent) {
    return (
      <div className="min-h-screen bg-black text-ordem-red flex flex-col items-center justify-center font-mono p-6 text-center">
        <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="mb-4 opacity-50"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        <h2 className="text-xl font-bold mb-2">ERRO DE CONEXÃO</h2>
        <p className="text-zinc-400 max-w-md">{error || 'Agente não encontrado.'}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 flex items-center justify-between border-b border-zinc-800 pb-4">
            <div>
                <h1 className="text-xl font-serif text-ordem-red tracking-wider">VISUALIZAÇÃO REMOTA</h1>
                <p className="text-xs text-zinc-500 font-mono">Sincronizado em tempo real com o Mestre</p>
            </div>
            <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-xs font-mono text-green-500">CONECTADO</span>
            </div>
        </div>
        
        <AgentDetailView 
            agent={agent} 
            onUpdate={handleUpdate}
            readOnly={true}
        />
      </div>
    </div>
  );
}
