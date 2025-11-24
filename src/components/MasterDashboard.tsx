import React, { useState } from 'react';
import Link from 'next/link';
import { AgentList } from './master/AgentList';
import { MonsterList } from './master/MonsterList';
import { SessionManager } from './master/SessionManager';
import { ItemManager } from './master/ItemManager';

export const MasterDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'sessao' | 'agentes' | 'inventario' | 'ameacas' | 'missoes' | 'regras'>('sessao');

  return (
    <div className="flex flex-col w-full min-h-screen bg-black text-ordem-white">
      <header className="sticky top-0 z-50 h-16 border-b border-gray-800 bg-black/95 backdrop-blur flex items-center px-6 shrink-0 justify-between">
        <div className="flex items-center gap-8">
            <div className="flex flex-col">
                <h1 className="text-xl font-serif text-ordem-red tracking-wider leading-none">MESTRE</h1>
                <span className="text-[10px] text-gray-400 font-mono tracking-[0.2em]">PAINEL DE CONTROLE</span>
            </div>

            <nav className="flex items-center gap-1">
                <button 
                    onClick={() => setActiveTab('sessao')}
                    className={`px-4 py-2 font-mono text-sm border-b-2 transition-colors ${activeTab === 'sessao' ? 'border-ordem-red text-white' : 'border-transparent text-gray-400 hover:text-gray-300'}`}
                >
                    SESSÃO ATUAL
                </button>
                <button 
                    onClick={() => setActiveTab('agentes')}
                    className={`px-4 py-2 font-mono text-sm border-b-2 transition-colors ${activeTab === 'agentes' ? 'border-ordem-red text-white' : 'border-transparent text-gray-400 hover:text-gray-300'}`}
                >
                    AGENTES
                </button>
                <button 
                    onClick={() => setActiveTab('ameacas')}
                    className={`px-4 py-2 font-mono text-sm border-b-2 transition-colors ${activeTab === 'ameacas' ? 'border-ordem-red text-white' : 'border-transparent text-gray-400 hover:text-gray-300'}`}
                >
                    AMEAÇAS
                </button>
                <button 
                    onClick={() => setActiveTab('inventario')}
                    className={`px-4 py-2 font-mono text-sm border-b-2 transition-colors ${activeTab === 'inventario' ? 'border-ordem-red text-white' : 'border-transparent text-gray-400 hover:text-gray-300'}`}
                >
                    INVENTÁRIO
                </button>
            </nav>
        </div>

        <Link href="/" className="text-xs font-mono text-gray-400 hover:text-white transition-colors">
            SAIR
        </Link>
      </header>

      <main className="flex-1 relative overflow-hidden bg-zinc-950">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(30,30,30,0.2)_1px,transparent_1px),linear-gradient(90deg,rgba(30,30,30,0.2)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />
        
        <div className="absolute inset-0 overflow-y-auto custom-scrollbar">
            {activeTab === 'sessao' && <SessionManager />}

            {activeTab === 'agentes' && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-7xl mx-auto p-6">
                    <h2 className="text-2xl font-serif text-white mb-6 border-b border-gray-800 pb-2">Agentes da Ordem</h2>
                    <AgentList />
                </div>
            )}

            {activeTab === 'ameacas' && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-7xl mx-auto h-full flex flex-col p-6">
                    <h2 className="text-2xl font-serif text-white mb-6 border-b border-gray-800 pb-2">Bestiário Paranormal</h2>
                    <div className="flex-1 overflow-hidden">
                        <MonsterList />
                    </div>
                </div>
            )}
            
            {activeTab === 'inventario' && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 h-full">
                    <ItemManager />
                </div>
            )}
            
            {(activeTab === 'missoes' || activeTab === 'regras') && (
                <div className="flex items-center justify-center h-full text-gray-600 font-mono">
                    Módulo em desenvolvimento...
                </div>
            )}
        </div>
      </main>
    </div>
  );
};

