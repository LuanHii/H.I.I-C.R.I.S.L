import React, { useEffect, useState } from 'react';
import { AgentList } from './master/AgentList';
import { MonsterList } from './master/MonsterList';
import { ItemManager } from './master/ItemManager';
import { FichasManager } from './master/FichasManager';
import { MestreNavbar } from './master/MestreNavbar';

export const MasterDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'agentes' | 'inventario' | 'ameacas' | 'fichas'>('fichas');

  // Permite navegação por URL: /mestre?tab=agentes|ameacas|inventario
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const tab = new URLSearchParams(window.location.search).get('tab');
    if (tab === 'agentes' || tab === 'inventario' || tab === 'ameacas') setActiveTab(tab);
  }, []);

  const setTab = (tab: 'agentes' | 'inventario' | 'ameacas' | 'fichas') => {
    setActiveTab(tab);
    if (typeof window !== 'undefined') window.history.replaceState({}, '', `/mestre?tab=${tab}`);
  };

  return (
    <div className="flex flex-col w-full min-h-screen bg-black text-ordem-white">
      <MestreNavbar activeTab={activeTab} onTabSelect={setTab} />

      <main className="flex-1 relative overflow-hidden bg-zinc-950">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(30,30,30,0.2)_1px,transparent_1px),linear-gradient(90deg,rgba(30,30,30,0.2)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />
        
        <div className="absolute inset-0 overflow-y-auto custom-scrollbar">
            {activeTab === 'fichas' && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <FichasManager />
              </div>
            )}

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
        </div>
      </main>
    </div>
  );
};

